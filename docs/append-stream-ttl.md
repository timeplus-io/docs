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

### Hold Lone Parts Before a Move {#ttl_move_grace_seconds}

When a `TO VOLUME` / `TO DISK` rule targets a volume that is excluded from merges (`prefer_not_to_merge: true`, typically a cold S3 tier, see [Tier Storage](/append-stream-tiered-storage)), Timeplus first tries to merge the expired parts so that fewer, larger parts are uploaded. A freshly written part that has no merge partner yet would still be moved right away, which for steady small-batch ingestion into an already-expired time range produces many small parts on the cold volume.

The stream setting **`ttl_move_grace_seconds`** makes such a lone part wait on the current volume for a merge partner before the TTL move takes it.

| | |
| :--- | :--- |
| Type | `uint64`, seconds |
| Default | `3600` in Timeplus Enterprise 3.3.4 (`300` in 3.4.1). Not available in 3.3.3 and earlier |
| `0` | Disables the hold: lone parts move as soon as they are eligible |

- A part is held only while its age (since it was written or last merged) is below the grace time. Older lone parts move as before.
- Parts that do have a merge partner keep waiting for the merge, without this time limit.
- The hold does not apply when merges are disabled (`SYSTEM STOP MERGES`, `max_parts_to_merge_at_once` below 2, or `max_bytes_to_merge_at_max_space_in_pool = 0`) or when the policy has no volume that is excluded from merges. In those cases parts move immediately.
- If the source volume runs low on space (see `move_factor` in [Tier Storage](/append-stream-tiered-storage)), held parts are still moved.
- `perform_ttl_move_on_insert` (enabled by default) moves an inserted part that is already expired to its destination at insert time, before the hold can apply. Set it to `0` on the cold volume if you want freshly inserted expired parts to be held.

The setting can be given when the stream is created and changed later:

```sql
CREATE STREAM stream_for_move
(
    d datetime,
    a int
)
PARTITION BY to_YYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 DAY TO VOLUME 'cold'
SETTINGS storage_policy = 'hcs', ttl_move_grace_seconds = 600;

ALTER STREAM stream_for_move MODIFY SETTING ttl_move_grace_seconds = 0;
```
