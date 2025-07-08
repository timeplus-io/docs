#!/bin/bash

# Retrieve and process S3 file listings to generate download Markdown
TZ=":US/Pacific" aws s3 ls s3://timeplus.io/dist/timeplus_enterprise/ \
  | grep -v -E 'sp-demo|-rc[.-]|-ai' \
  | awk '
BEGIN {
  print "# Package Downloads\n"
  platform_order["linux-amd64"] = "Linux x86_64"
  platform_order["linux-arm64"] = "Linux ARM64"
  platform_order["darwin-amd64"] = "macOS x86_64"
  platform_order["darwin-arm64"] = "macOS ARM64"
}

# Process each line with tar.gz file
/tar\.gz$/ {
  # Extract version and architecture
  filename = $NF
  gsub(/\.tar\.gz$/, "", filename)
  split(filename, parts, "-")

  # Handle preview versions (e.g., v2.9.0-preview.0)
  if (parts[4] ~ /^preview\./) {
    version = parts[3] "-" parts[4]
    arch = parts[5] "-" parts[6]
  } else {
    version = parts[3]
    arch = parts[4] "-" parts[5]
  }

  sub(/^v/, "", version)

  # Store in version map
  version_map[version] = 1
  pkg_map[version, arch] = $NF

  # Process and store latest release date
  split($1, date_parts, "-")
  formatted_date = sprintf("%02d-%02d-%04d", date_parts[2], date_parts[3], date_parts[1])
  date_num = date_parts[1] date_parts[2] date_parts[3]  # YYYYMMDD for comparison

  if (!(version in latest_date) || date_num > latest_date[version]) {
    latest_date[version] = date_num
    release_date[version] = formatted_date
  }

  # Extract major.minor for grouping
  split(version, ver_parts, ".")
  major_minor = ver_parts[1] "." ver_parts[2]

  # Store unique versions per major.minor group
  if (!((major_minor, version) in version_groups)) {
    version_groups[major_minor, version] = 1
    grouped_versions[major_minor] = grouped_versions[major_minor] ? grouped_versions[major_minor] " " version : version
  }
}

END {
  # Sort major.minor groups
  sort_cmd = "printf \"%s\\n\" "
  for (v in grouped_versions) sort_cmd = sort_cmd " \"" v "\""
  sort_cmd = sort_cmd " | sort -t. -k1,1nr -k2,2nr"

  i = 0
  while ((sort_cmd | getline major_minor) > 0) {
    ordered_groups[++i] = major_minor
  }
  close(sort_cmd)

  # Generate output
  for (g=1; g<=i; g++) {
    major_minor = ordered_groups[g]

    minor_anchor = major_minor
    gsub(/\./, "_", minor_anchor)

    printf "## %s {#%s}\n\n", major_minor, minor_anchor

    # Sort patch versions within group
    split(grouped_versions[major_minor], patch_versions, " ")
    sort_cmd = "printf \"%s\\n\" "
    for (v in patch_versions) sort_cmd = sort_cmd " \"" patch_versions[v] "\""
    sort_cmd = sort_cmd " | sort -V -r"

    j = 0
    while ((sort_cmd | getline version) > 0) {
      ordered_versions[++j] = version
    }
    close(sort_cmd)

    # Print each version
    for (k=1; k<=j; k++) {
      version = ordered_versions[k]
      anchor = version
      gsub(/\./, "_", anchor)

      printf "### v%s {#%s}\n", version, anchor
      printf "Released on %s ([Change logs](/enterprise-v%s#%s)).\n\n",
            release_date[version], major_minor, anchor

      printf "* Bare metal installation: "
      link_count = 0
      split("linux-amd64 linux-arm64 darwin-amd64 darwin-arm64", platforms, " ")
      for (m=1; m<=4; m++) {
        arch = platforms[m]
        if ((version, arch) in pkg_map) {
          if (link_count++ > 0) printf " | "
          printf "[%s](https://d.timeplus.com/%s)",
            platform_order[arch], pkg_map[version, arch]
        }
      }
      printf "\n* All-in-one Docker image (not recommended for production): `docker run -p 8000:8000 docker.timeplus.com/timeplus/timeplus-enterprise:%s`\n\n", version
    }
  }
}' > docs/release-downloads.md
