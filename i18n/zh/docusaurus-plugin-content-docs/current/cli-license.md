# timeplus license

Manage Timeplus Enterprise licenses.

## timeplus license show

Show the current license.

For a newly-installed Timeplus Enterprise, the output can be

```
type       creation                  expiration                entitlements
trial      2024-07-11 12:00:52       2024-08-10 12:00:52
```

## timeplus license import -f [file] -k [key]

Once you get the license key and file from Timeplus team, you can use web console or the CLI to import the license.

例如：

```
timeplus license import -f ~/Downloads/license.lic -k key/eyJ..A==
```
