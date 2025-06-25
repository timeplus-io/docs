# MongoDB External Table

Since Timeplus Enterprise [v2.9](/enterprise-v2.9) and v2.8.2, you can send data to and read data from MongoDB collections via the MongoDB External Table.

## CREATE EXTERNAL TABLE

To create an external table for MongoDB, you can run the following DDL SQL:

```sql
CREATE EXTERNAL TABLE [IF NOT EXISTS] name
    (<col_name1> <col_type1>, <col_name2> <col_type2>, ...)
SETTINGS
    type = 'mongodb',
    uri = 'mongodb://user:pwd@host:port/db?options', -- the MongoDB connection URI the external table read/write data from/to
    collection = '' -- the MongoDB collection name
```
For the full list of settings, see the [DDL Settings](#ddl-settings) section.

### Examples

#### Write to Self-Hosting MongoDB
Assuming you have created an index `students` in a deployment of OpenSearch or ElasticSearch, you can create the following external stream to write data to the index.

```sql
CREATE EXTERNAL TABLE mongodb_t1 (
  name string,
  gpa float32,
  grad_year int16
) SETTINGS
type = 'mongodb',
uri = 'mongodb://mongoadmin:mongopasswd@localhost/test?authSource=admin',
collection = 'students'
```

Then you can insert data via a materialized view or just
```sql
INSERT INTO mongodb_t1(name,gpa,grad_year) VALUES('Jonathan Powers',3.85,2025);
```

#### Write to MongoDB Atlas
The MongoDB Atlas by default shows the connection URI in the format `mongodb+srv://<username>:<password>@<cluster-address>/<default-auth-db>`. The `mongodb+srv` protocol is not supported yet. Please use the `mongodb` protocol instead. You can find the connection URI in the MongoDB Atlas UI, and choose C++ driver and 3.1.x as the version. The connection URI will look like this:

```
mongodb://<user>:<db_password>@ac-z64ksma-shard-00-00.v6m8dak.mongodb.net:27017,ac-z64ksma-shard-00-01.v6m8dak.mongodb.net:27017,ac-z64ksma-shard-00-02.v6m8dak.mongodb.net:27017/?ssl=true&replicaSet=atlas-iokbsd-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0
```

```sql
CREATE EXTERNAL TABLE mongodb_t1 (
  name string,
  gpa float32,
  grad_year int16
) SETTINGS
type = 'mongodb',
uri = 'mongodb://user:thepassword@shard1.id.mongodb.net:27017,shard2.id.mongodb.net:27017,shard3.id.mongodb.net:27017/testdb?ssl=true&replicaSet=setname&authSource=admin&retryWrites=true&w=majority&appName=appName',
collection = 'students'
```

#### Read From MongoDB
You can also read data from MongoDB collections via the external table. The following example reads data from the `students` collection in MongoDB.

```sql
SELECT * FROM mongodb_t1
```
You can also filter the data using a `WHERE` clause or apply aggregations on the data. Timeplus will try best to push down the filter and aggregation operations to the MongoDB, so that only the necessary data is transferred from MongoDB to Timeplus.
### DDL Settings

#### type
The type of the external stream. The value must be `mongodb` to send data to MongoDB.

#### uri
The endpoint of the MongoDB service.

#### collection
The name of the MongoDB collection to read/write data from/to.

#### connection_options
MongoDB connection string options as a URL formatted string. e.g. 'authSource=admin&ssl=true'.

#### oid_columns
A comma-separated list of columns that should be treated as oid in the `WHERE` clause. Default to `_id`.

### Query Settings

#### mongodb_throw_on_unsupported_query
By default this setting is `true`. While querying the MongoDB external table with SQL, if the query contains `GROUP BY`, `HAVING` or other aggregations, Timeplus will throw exceptions. Set this to `false` or `0` to disable this behavior, and Timeplus will read full table data from MongoDB and execute the query in Timeplus. For example:
```sql
SELECT name, COUNT(*) AS cnt FROM mongodb_ext_table GROUP BY name HAVING cnt >5 SETTINGS mongodb_throw_on_unsupported_query = false;
```

## DROP EXTERNAL TABLE

```sql
DROP STREAM [IF EXISTS] name
```
