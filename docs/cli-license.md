# timeplus license
Manage Timeplus Enterprise licenses.

## timeplus license show{#show}
Show the current license.

For a newly-installed Timeplus Enterprise, the output can be
```
type       creation                  expiration                entitlements
trial      2024-07-11 12:00:52       2024-08-10 12:00:52
```

For a paid license, the output can be
```
type       creation                  expiration                entitlements
paid       2024-06-28 00:56:40       2024-08-31 00:00:00       CPU Cores 16|Usage 500GB|Version 2
```

## timeplus license import -f [file] -k [key] {#import}
Once you get the license key and file from Timeplus team, you can use web console or the CLI to import the license.

For example:
```
timeplus license import -f ~/Downloads/license.lic -k key/eyJ..A==
```

## timeplus license id {#id}
:::info
This is only available in timeplusd 2.3.31 or above.
:::
Show the unique id for license generation and validation. After you start the single-node or cluster of Timeplus Enterprise, run this command to get the unique ID. Share this id to your account manager to acquire a license.
```
timeplus license id
```
