# OPTIMIZE
Run the following SQL to initiate an unscheduled merge of a mutable stream or a table with MergeTree engine. This will reorganize the data in the stream and optimize the performance of the stream. Note that we generally recommend against using `OPTIMIZE STREAM ... FINAL` as its use case is meant for administration, not for daily operations.

Syntax:
```sql
OPTIMIZE STREAM db.<stream_name> [PARTITION partition | PARTITION ID 'partition_id'] [FINAL | FORCE] [DEDUPLICATE [BY expression]];
```

Note:
* If you specify `FINAL` or `FORCE`, optimization is performed even when all the data is already optimized. The operation is resource intensive, consuming significant CPU and disk I/O.
* If you specify `DEDUPLICATE`, then completely identical rows (unless by-clause is specified) will be deduplicated (all columns are compared), it makes sense only for the MergeTree engine.
* If you specify `DEDUPLICATE BY ..`, then only rows in the specified columns will be deduplicated.

Examples:
```sql
OPTIMIZE STREAM mutable DEDUPLICATE; -- all columns
OPTIMIZE STREAM mutable DEDUPLICATE BY *; -- excludes MATERIALIZED and ALIAS columns
OPTIMIZE STREAM mutable DEDUPLICATE BY colX,colY,colZ;
OPTIMIZE STREAM mutable DEDUPLICATE BY * EXCEPT colX;
OPTIMIZE STREAM mutable DEDUPLICATE BY * EXCEPT (colX, colY);
OPTIMIZE STREAM mutable DEDUPLICATE BY COLUMNS('column-matched-by-regex');
OPTIMIZE STREAM mutable DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT colX;
OPTIMIZE STREAM mutable DEDUPLICATE BY COLUMNS('column-matched-by-regex') EXCEPT (colX, colY);
OPTIMIZE STREAM mutable; -- if the mutable stream has ttl_seconds defined, this SQL command will trigger the process to remove records older than ttl_seconds
```


:::info
`OPTIMIZE` is only available in Timeplus Enterprise v2.7.x or above, and `ttl_seconds` is available in Timeplus Enterprise v2.9.x or above.
:::
