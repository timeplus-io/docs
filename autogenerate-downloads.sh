#!/bin/bash

# Retrieve and process S3 file listings to generate download Markdown
aws s3 ls s3://timeplus.io/dist/timeplus_enterprise/ \
  | grep -v -E 'sp-demo|rc' \
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
  split($NF, parts, "-")
  version = parts[3]
  sub(/^v/, "", version)

  # Get architecture components
  arch = parts[4] "-" parts[5]
  gsub(/\.tar\.gz$/, "", arch)

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
}

END {
  # Collect and sort versions
  sort_cmd = "printf \"%s\\n\" "
  for (v in version_map) sort_cmd = sort_cmd " \"" v "\""
  sort_cmd = sort_cmd " | sort -V -r"

  i = 0
  while ((sort_cmd | getline version) > 0) {
    ordered_versions[++i] = version
  }
  close(sort_cmd)

  # Generate output
  for (i=1; i in ordered_versions; i++) {
    version = ordered_versions[i]
    printf "## v%s\n", version
    printf "Released on %s.\n\n", release_date[version]

    # Build platform links in preferred order
    link_count = 0
    split("linux-amd64 linux-arm64 darwin-amd64 darwin-arm64", platforms, " ")
    for (j=1; j<=4; j++) {
      arch = platforms[j]
      if ((version, arch) in pkg_map) {
        if (link_count++ > 0) printf " | "
        printf "[%s](https://d.timeplus.com/%s)",
          platform_order[arch], pkg_map[version, arch]
      }
    }
    print "\n\n"
  }
}' > docs/release-downloads.md
