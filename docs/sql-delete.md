# DELETE

Starting from Timeplus Enterprise 2.7, you can delete data from the mutable streams.

```sql
DELETE FROM mutable_stream_name WHERE condition
```

Note:
* It's recommended to use the primary key(s) in the condition to delete the data efficiently. You can also use the secondary index or other columns in the condition.
* The operation is synchronous and will block until the data is deleted.
