# timeplus backup

Create a Timeplus Enterprise backup file.

## timeplus backup

Open a terminal window and change directory to the `timeplus/bin` folder, and run `timeplus backup` without extra parameters, it will back up all data and configuration files and create a `timeplus.bak` in the bin folder.

You can also customize the file name with `-f` or `--backup-file` flag. If your working directory is not the bin folder, you can also specify the Timeplus Enterprise base folder via `-d` or `--timeplus-home` flag.

## See Also

[timeplus restore](/cli-restore)
