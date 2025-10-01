# CREATE DISK

By default, Timeplus only created a `default` disk for local storage.

## Syntax
You can create a S3 disk with the following SQL:

```sql
CREATE DISK name disk(
    type='..', --s3 for tiered storage, s3_plain for s3 checkpoint
    endpoint='https://sample-bucket.s3.us-east-2.amazonaws.com/streams/',
    access_key_id='..',
    secret_access_key='..'
)
```

Please refer to [S3 External Table](/s3-sink) for how to connect to the S3 storage. It's not recommended to hardcode the access key and secret access key in the DDL. Instead, users should use environment variables or IAM role to secure these credentials.

You can use the following SQL to list the disks:
```sql
SHOW DISKS;
```
## See also
* [SHOW DISKS](/sql-show-disks) - Show disks
