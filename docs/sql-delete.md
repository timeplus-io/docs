# DELETE

Starting from Timeplus Enterprise 2.7, you can delete data from the streams.

```sql
DELETE FROM stream_name WHERE condition
```

Note:
* If you delete from a mutable stream, it's recommended to use the primary key(s) in the condition to delete the data efficiently. You can also use the secondary index or other columns in the condition. The operation is synchronous and will block until the data is deleted.
* If you delete from a normal stream, the operation is asynchronous and will return immediately. The data will be deleted in the background.
