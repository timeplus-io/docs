# Named Collection

You can create **Named Collection** to group shared configuration settings into a single reusable object. This simplifies your DDL statements and enhances security by masking sensitive information when users execute `SHOW CREATE STREAM`.

## Key Benefits

- **Reusability**: Define connection parameters once and apply them to multiple external streams or external tables.
- **Security**: Credentials stored within a named collection are hidden from standard `SHOW CREATE` outputs.
- **Maintainability**: Update credentials in one place rather than modifying every individual stream or table DDL.

## Syntax

### Create Named Collection

Create named collection `collection1`

```sql
CREATE NAMED COLLECTION [IF NOT EXISTS] collection1
AS key1='value1' OVERRIDABLE,
   key2='value2' NOT OVERRIDABLE,
   key3='value3'
```

In the above example:
* `key1` can always be overridden.
* `key2` can never be overridden.
* `key3` can be overridden or not depending on the value of `allow_named_collection_override_by_default`.

### Alter Named Collection

Change or add the keys `key1` and `key3` of the collection `collection2` (this will not change the value of the overridable flag for those keys):

```sql
ALTER NAMED COLLECTION collection2
SET key1='new_value1', key3='value3'
```

Remove the key `key2` from `collection2`:

```sql
ALTER NAMED COLLECTION collection2
DELETE key2
```

:::note

Altering named collection will not refresh the external streams / tables which use the named collection in their settings. The change will apply after Timeplus restart.

There is also no setting validation as performed in stream creation. Setting invalid key/value pairs will succeed. However, the corresponding streams will fail on next startup due to the wrong configuration.

:::

### Show Named Collections

Users with SELECT permission on `system.named_collection` can query all the named collections with their name, key/values and creation query.

```sql
SELECT * FROM system.named_collection
```

### Drop Named Collection

```sql
DROP NAMED COLLECTION collection3
```

:::note

There is no dependency check when dropping a named collection. The external streams referencing the named collection will become invalid after named collection is dropped.

:::

## Supported Usage

Named collections can be used in:
1. External stream DDL settings
2. External table DDL settings
3. Input DDL settings
4. Disk creation arguments.

For external stream / external table / input, named collection can specify any setting value other than `type`.

When you use a named collection, you can still specify additional settings in the DDL. The settings in the DDL will override or supplement the settings from the named collection.

## Examples

### Kafka Connection

Define a named collection with Kafka connection and security settings:

```sql
CREATE NAMED COLLECTION kafka_nc AS
    brokers='127.0.0.1:9092',
    skip_ssl_cert_check='true',
    security_protocol='SASL_PLAINTEXT',
    sasl_mechanism='SCRAM-SHA-256',
    username='admin_user',
    password='admin',
    topic='mytopic';
```

Then create an external stream referencing the collection and override `topic`:

```sql
CREATE EXTERNAL STREAM kafka_stream(raw string)
SETTINGS
    type='kafka',
    named_collection='kafka_nc',
    topic='anothertopic';  -- this overrides the topic in 'kafka_nc'
```

### MySQL external table Connection

Define a named collection for MySQL connection:

```sql
CREATE NAMED COLLECTION mysql_config AS
    address='localhost:3306',
    user='root',
    password='secret123',
    database='production';
```

Create an external table referencing the collection:

```sql
CREATE EXTERNAL TABLE mysql_orders
SETTINGS
    type='mysql',
    table='orders',
    named_collection='mysql_config';
```

### HEC Input

Define a named collection for HEC input listening address.

```sql
CREATE NAMED COLLECTION hec_input_config AS
    listen_host='127.0.0.1',
    tcp_port='8888';
```

Create an input referencing the collection:

```sql
CREATE INPUT hec_input 
SETTINGS type='splunk-hec', named_collection='hec_input_config';
```

### S3 Disk

Define a named collection for S3 disk.

```sql
CREATE NAMED COLLECTION s3_config AS
    type='s3' NOT OVERRIDABLE,
    endpoint='https://sample-bucket.s3.us-east-2.amazonaws.com/streams/',
    access_key_id='my_key_id',
    secret_access_key='my_secret_access_key';
```

Create a S3 disk.

```sql
CREATE DISK s3_disk1 disk(named_collection=s3_config);
```
