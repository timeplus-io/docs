# Checkpoint Settings

This guide explains how to configure checkpoint settings for materialized views. These settings control how and where checkpoints are created, as well as whether they are incremental or asynchronous.

---

## type

**Definition** 

    Defines which checkpoint type to use.

**Possible Values**  

- `auto`  **(default)** - Automatically determine whether to use `file` or `rocks` checkpoint based on the query’s state type.
- `file` - Native file format

---

## storage_type

**Definition**  

    Specifies where checkpoints will be stored.

**Possible Values**  

- `auto` **(default)**  - Automatically determine whether to store in `local_file_system` or `nativelog`
- `local_file_system`  - Stored in local file system for a single instance environment
- `nativelog` - Stored in nativelog, and ensure cluster synchronization through raft **(Only valid in clusters)**
- `s3` - Stored in S3, it must be bound to `disk_name`

---

## async

**Definition**  

    Determines whether checkpoints are created asynchronously.

**Possible Values**  

- `true` **(default)** - Asynchronous checkpoint replication
- `false`

---

## incremental

**Definition** 

    Indicates whether checkpoints are incremental (saving only changes since the last checkpoint) or full.

**Possible Values**  

- `false` **(default)**
- `true`  - Only enabled when using a hybrid hash table (Recommended for large states with low update frequency)

---

## interval `configurable`

**Definition**

    Specifies the time interval in seconds between checkpoint operations.

**Possible Value**  

- Any integer **(default 0 means use a configured value)**

**Configurable**

```yaml
# <config.yaml>
query_state_checkpoint:
    # State checkpoint interval in seconds
    interval: 900
    ...
```

---

## disk_name

**Definition**

    Specifies a disk name, which can be created through sql`create disk {disk_name} ...`, which is used with a shared checkpoint storage (i.e. `S3`)

---

## Examples

- **For some scenarios with large states and low update frequency**

```sql
CREATE MATERIALIZED VIEW mv AS
SELECT key, count() FROM test group by key
SETTINGS
default_hash_table='hybrid', default_hash_join='hybrid',
checkpoint_settings = 'incremental=true;interval=5';
```

- **For some scenarios with S3 checkpoint storage**

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



## Standlone Setting `checkpoint_interval`

There is a standlone setting `checkpoint_interval` to be provided  (similar as above `interval` ) for materialized view:

- < 0 : disable checkpointing 

- = 0 : default interval (use specified `checkpoint_settings='interval=xxx'` or configured `interval`)

- \> 0 : checkpoint interval in seconds.



> NOTE: supports to use `alter view {mv} modify query settings checkpoint_interval=xxx` to update the interval in real time


