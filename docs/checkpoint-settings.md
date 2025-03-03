# Checkpoint Settings

For materialized views, checkpoint settings control how and where checkpoints are created, as well as whether they are incremental or asynchronous. This can be specified in the `checkpoint_settings` section of the materialized view settings.

```sql
CREATE MATERIALIZED VIEW mv AS
SELECT key, count() FROM test group by key
SETTINGS default_hash_table='hybrid', default_hash_join='hybrid',
checkpoint_settings = 'incremental=true;interval=5';
```

## checkpoint_settings
You can set key-value pairs in `checkpoint_settings`.

### type

**Definition**: Defines which checkpoint type to use.

**Possible Values**:

- `auto`  **(default)** - Automatically determine whether to use `file` or `rocks` checkpoint based on the query’s state type.
- `file` - Native file format
- `rocks` - RocksDB format

### storage_type

**Definition**: Specifies where checkpoints will be stored.

**Possible Values**:

- `auto` **(default)**  - Automatically determine whether to store in `local_file_system` or `nativelog`
- `local_file_system`  - Stored in local file system for a single instance environment
- `nativelog` - Stored in nativelog, and ensure cluster synchronization through raft **(Only valid in clusters)**
- `s3` - Stored in S3, it must be bound to `disk_name`

### async

**Definition**: Determines whether checkpoints are created asynchronously.

**Possible Values**:

- `true` **(default)** - Asynchronous checkpoint replication
- `false`

### incremental

**Definition**: Indicates whether checkpoints are incremental (saving only changes since the last checkpoint) or full.

**Possible Values**:

- `false` **(default)**
- `true`  - Only enabled when using a hybrid hash table (Recommended for large states with low update frequency)

### interval

**Definition**: Specifies the time interval in seconds between checkpoint operations.

**Possible Values**:

- Any integer **(default 0 means use a configured value)**

This is also configurable via the global configuration file.

```yaml
# <config.yaml>
query_state_checkpoint:
    # State checkpoint interval in seconds
    interval: 900
    ...
```

### disk_name

**Definition**: Specifies a disk name, which can be created through sql`create disk {disk_name} ...`, which is used with a shared checkpoint storage (i.e. `S3`)

## checkpoint_interval

In some cases, you may want to adjust the checkpoint interval after the materialized view is created. You can do this by modifying the `checkpoint_settings` parameter in the `ALTER VIEW` statement.
```sql
ALTER VIEW mv MODIFY QUERY SETTINGS checkpoint_settings = 'incremental=true;interval=5';
```
If you don't want to repeat the other key-value pairs in the `checkpoint_settings`, you can use the top-level `checkpoint_interval` parameter, e.g.
```sql
ALTER VIEW mv MODIFY QUERY SETTINGS checkpoint_interval = 5;
```

Set `checkpoint_interval` to a negative integer value to disable checkpointing. Set it to 0 to use the global checkpoint interval. Set it to a positive integer value to specify the checkpoint interval in seconds.

## Examples

For some scenarios with large states and low update frequency:

```sql
CREATE MATERIALIZED VIEW mv AS
SELECT key, count() FROM test group by key
SETTINGS
default_hash_table='hybrid', default_hash_join='hybrid',
checkpoint_settings = 'incremental=true;interval=5';
```

For some scenarios with S3 checkpoint storage:

```sql
--- create a S3 plain disk `diskS3`
CREAET DISK diskS3 disk(
    type='s3_plain',
    endpoint='http://localhost:11111/test/s3/',
    access_key_id='timeplusd',
    secret_access_key='xxxxxxxxxx'
);

CREATE MATERIALIZED VIEW mv AS
SELECT key, count() FROM test group by key
SETTINGS
default_hash_table='hybrid', default_hash_join='hybrid',
checkpoint_settings = 'storage_type=S3;disk_name=diskS3;incremental=true;interval=5';
```
