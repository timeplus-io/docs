# TTL

TTL expression for Append Stream can specify the logic of automatic moving data between disks and volumes, or recompressing parts where all the data has been expired or just discarding the expired data.

Timeplus evalutes TTL against the data in the historical store in background asychronously during background data merge. The frequence can be controlled by **`merge_with_ttl_timeout`** setting.

## TTL Expression

```sql
TTL expr
    [DELETE | RECOMPRESS codec_name1 | TO DISK 'xxx' | TO VOLUME 'xxx'][, DELETE | RECOMPRESS codec_name2 | TO DISK 'aaa' | TO VOLUME 'bbb'] ...
    [WHERE conditions]
```

Type of TTL rule may follow each TTL expression. It affects an action which is to be done once the expression is satisfied (reaches current time):

- **`DELETE`** - delete expired rows (default action);
- **`RECOMPRESS codec_name`** - recompress data part with the `codec_name`;
- **`TO DISK 'aaa'`** - move part to the disk `aaa`;
- **`TO VOLUME 'bbb'`** - move part to the disk `bbb`;

**`DELETE`** action can be used together with **`WHERE`** clause to delete only some of the expired rows based on a filtering condition:

```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

## Alter TTL

```sql
ALTER STREAM <db.stream> MODIFY TTL <expr>;
```

**Example:**
```sql
ALTER STREAM test MODIFY TTL d + INTERVAL 1 DAY;
```

## Trigger Data Delete with Merge

Expired data is removed only during the merge process, which runs asynchronously in the background.

To accelerate this cleanup, you can manually trigger a merge by running the `OPTIMIZE` command. This attempts to start an unscheduled merge of data parts for a stream:

```sql
OPTIMIZE STREAM <db.stream_name>;
```

## Examples

### Delete After Expired 

Creating a stream, where the rows are expired after one month. The expired rows where dates are Mondays are deleted:
```sql
CREATE STREAM stream_with_where
(
    d datetime,
    a int
)
PARTITION BY to_YYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE WHERE to_day_of_week(d) = 1;
```

### Recompress After Expired 

Creating a stream, where expired rows are recompressed:
```sql
CREATE STREAM stream_for_recompression
(
    d datetime,
    key uint64,
    value string
) 
ORDER BY tuple()
PARTITION BY key
TTL d + INTERVAL 1 MONTH RECOMPRESS CODEC(ZSTD(17)), d + INTERVAL 1 YEAR RECOMPRESS CODEC(LZ4HC(10))
SETTINGS 
    min_rows_for_wide_part = 0, 
    min_bytes_for_wide_part = 0;
```

### Move After Expired

```sql
CREATE STREAM stream_for_move
(
    d datetime,
    a int
)
PARTITION BY to_YYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE,
    d + INTERVAL 1 WEEK TO VOLUME 'aaa',
    d + INTERVAL 2 WEEK TO DISK 'bbb';
```
