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

    # Iterate through preferred platform order
    split("linux-amd64 linux-arm64 darwin-amd64 darwin-arm64", platforms)
    for (p in platforms) {
      arch = platforms[p]
      if ((version, arch) in pkg_map) {
        printf "- [%s](https://d.timeplus.com/timeplus_enterprise/%s)\n",
          platform_order[arch], pkg_map[version, arch]
      }
    }
    print "\n"
  }
}'
