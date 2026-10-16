# Dictionary Access in JavaScript UDF

Starting from [Timeplus Enterprise 2.8](/enterprise-v2.8), JavaScript UDFs and UDAFs can read and write [dictionaries](/dictionary) through a set of built-in global functions:

| Function | Description |
| -------- | ----------- |
| [getValue](#getvalue) | Look up a single key and return its attributes as a JavaScript object |
| [setValue](#setvalue) | Insert or update a single key-value pair |
| [batchGetValues](#batchgetvalues) | Look up many keys in one call |
| [batchSetValues](#batchsetvalues) | Insert or update many key-value pairs in one call |

These functions are available in every JavaScript UDF or UDAF — no import or registration is needed. They allow a UDF to keep durable, shared state across invocations, across queries, and even across restarts, since the data lives in a stream instead of in-memory UDF state. Typical use cases include stateful stream processing, lookup-and-update enrichment, and sharing reference data between multiple UDFs or queries.

## Prerequisites {#prerequisites}

The dictionary must meet two requirements:

1. **Layout**: [DIRECT](/dictionary#direct) for a single numeric key, or [COMPLEX_KEY_DIRECT](/dictionary#complex_key_direct) for string or composite keys. Other layouts (HASHED, CACHE, etc.) are not supported by these functions.
2. **Source**: a stream in the local Timeplus service, via `SOURCE(TIMEPLUS(...))`. A [mutable stream](/mutable-stream) is strongly recommended, because `setValue` and `batchSetValues` write rows into the source stream, and the primary key of the mutable stream gives the writes UPSERT semantics.

With the DIRECT layout, every read goes straight to the source stream, so a `getValue` right after a `setValue` returns the latest value.

### Setup example {#setup}

Create a mutable stream as the storage, then a direct dictionary on top of it:

```sql
-- Storage: a mutable stream keyed by device_id
CREATE MUTABLE STREAM device_state_storage (
    device_id uint64,
    status string,
    error_count int32,
    last_seen datetime64(3)
) PRIMARY KEY (device_id);

-- Dictionary: DIRECT layout, single numeric key
CREATE DICTIONARY device_state_dict (
    device_id uint64,
    status string,
    error_count int32,
    last_seen datetime64(3)
)
PRIMARY KEY device_id
SOURCE(TIMEPLUS(DB 'default' STREAM 'device_state_storage' USER 'admin' PASSWORD 'changeme'))
LAYOUT(DIRECT);
```

For string or composite keys, use `COMPLEX_KEY_DIRECT`:

```sql
CREATE MUTABLE STREAM user_session_storage (
    user_id string,
    region string,
    login_count int32,
    last_login datetime64(3)
) PRIMARY KEY (user_id, region);

CREATE DICTIONARY user_session_dict (
    user_id string,
    region string,
    login_count int32,
    last_login datetime64(3)
)
PRIMARY KEY (user_id, region)
SOURCE(TIMEPLUS(DB 'default' STREAM 'user_session_storage' USER 'admin' PASSWORD 'changeme'))
LAYOUT(COMPLEX_KEY_DIRECT);
```

## Keys and values in JavaScript {#keys-values}

**Keys**:
* For a DIRECT dictionary (simple key), pass a number, or a string that represents a number: `1001` or `"1001"`.
* For a COMPLEX_KEY_DIRECT dictionary, pass an object with one property per key column: `{user_id: 'u42', region: 'us-west'}`.

**Values** are plain JavaScript objects whose property names match the dictionary attribute columns. You don't need to include the key columns in the value object — Timeplus fills them in from the key automatically. For datetime columns, you can pass either a JavaScript `Date` object or a string such as `'2025-06-01 10:00:00.000'`.

Attributes you omit are written as type defaults — `0` for numeric columns, empty string for string columns, epoch for datetime columns. Note that `DEFAULT` expressions declared on the stream or dictionary columns are **not** applied by these functions, so write complete value objects whenever possible.

## getValue

Look up one key and return its attributes.

```javascript
getValue(dict_name, key [, columns])
```

**Arguments**:
* `dict_name` (string) — dictionary name, e.g. `'device_state_dict'` or `'mydb.device_state_dict'`.
* `key` — a number (simple key) or an object (complex key).
* `columns` (optional, array of strings) — the columns to return. When omitted, all key columns and attributes are returned.

**Returns**: an object with the requested key columns and attributes. Throws a JavaScript exception on failure (e.g. the dictionary does not exist or has an unsupported layout).

For a key that is **not** in the dictionary, the return value depends on the [`javascript_udf_getvalue_null_on_missing_key`](#missing-keys) setting: by default you get an object filled with type defaults; with the setting enabled you get `null`.

```javascript
// Simple key
let state = getValue('device_state_dict', 1001);
// => {device_id: 1001, status: 'active', error_count: 2, last_seen: ...}

// Complex key
let session = getValue('user_session_dict', {user_id: 'u42', region: 'us-west'});
// => {user_id: 'u42', region: 'us-west', login_count: 7, last_login: ...}

// Column projection: only fetch the columns you need
let status = getValue('device_state_dict', 1001, ['status']);
// => {status: 'active'}

// Key not found (default): a default-filled object, NOT null
let miss = getValue('device_state_dict', 9999);
// => {device_id: 0, status: '', error_count: 0, last_seen: 1970-01-01T00:00:00.000Z}
```

:::caution
By default a missing key does **not** return `null`. Read [Missing keys](#missing-keys) before you write `if (row === null)`.
:::

## setValue

Insert or update one key-value pair. The row is written to the dictionary's source stream; with a mutable stream this is an UPSERT on the primary key.

```javascript
setValue(dict_name, key, value)
```

**Arguments**:
* `dict_name` (string) — dictionary name.
* `key` — a number (simple key) or an object (complex key).
* `value` (object) — attribute names and values. Omitted attributes are written as type defaults (`0`, empty string).

**Returns**: `true` if the write succeeded, `false` otherwise. Throws a JavaScript exception on invalid arguments (e.g. a complex-key dictionary given a non-object key, or a missing key field).

```javascript
// Simple key: insert or update
setValue('device_state_dict', 1001, {
    status: 'active',
    error_count: 0,
    last_seen: '2025-06-01 10:00:00.000'
});

// Datetime columns also accept JavaScript Date objects
setValue('device_state_dict', 1002, {
    status: 'idle',
    error_count: 0,
    last_seen: new Date()
});

// Complex key
setValue('user_session_dict', {user_id: 'u42', region: 'us-west'}, {
    login_count: 8,
    last_login: '2025-06-01 10:00:00.000'
});
```

## batchGetValues

Look up many keys in one call. Much faster than calling `getValue` in a loop, since all keys are resolved in a single dictionary query.

```javascript
batchGetValues(dict_name, keys [, columns])
```

**Arguments**:
* `dict_name` (string) — dictionary name.
* `keys` (array) — numbers for a simple key, or objects for a complex key.
* `columns` (optional, array of strings) — the columns to return.

**Returns**: an array with the same length as `keys`, positionally aligned with it — `results[i]` always belongs to `keys[i]`. Each element is an object; missing keys follow the same rule as `getValue` (default-filled object, or `null` when [`javascript_udf_getvalue_null_on_missing_key`](#missing-keys) is enabled).

```javascript
let keys = [1001, 1002, 1003];   // say 1002 does not exist
let results = batchGetValues('device_state_dict', keys);
// default          => [{device_id: 1001, ...}, {device_id: 0, ...}, {device_id: 1003, ...}]
// with the setting => [{device_id: 1001, ...}, null,                {device_id: 1003, ...}]

for (let i = 0; i < keys.length; i++) {
    // works under both modes
    let known = results[i] !== null && results[i].device_id === keys[i];
    console.log(`device ${keys[i]}: ${known ? results[i].status : 'not found'}`);
}

// Complex keys
let sessions = batchGetValues('user_session_dict', [
    {user_id: 'u42', region: 'us-west'},
    {user_id: 'u43', region: 'eu-central'}
]);
```

## batchSetValues

Insert or update many key-value pairs in one call. All rows are written to the source stream in a single insert block, which is significantly faster than calling `setValue` in a loop.

```javascript
batchSetValues(dict_name, keys, values)
```

**Arguments**:
* `dict_name` (string) — dictionary name.
* `keys` (array) — numbers for a simple key, or objects for a complex key.
* `values` (array of objects) — must have the same length as `keys`; `values[i]` is the value for `keys[i]`.

**Returns**: `true` if the write succeeded, `false` otherwise. Throws a JavaScript exception if the two arrays have different lengths or a key is invalid.

```javascript
batchSetValues('device_state_dict',
    [2001, 2002, 2003],
    [
        {status: 'active', error_count: 0, last_seen: '2025-06-01 12:00:00.000'},
        {status: 'error',  error_count: 5, last_seen: '2025-06-01 12:01:00.000'},
        {status: 'idle',   error_count: 0, last_seen: '2025-06-01 12:02:00.000'}
    ]);

// Complex keys
batchSetValues('user_session_dict',
    [
        {user_id: 'u42', region: 'us-west'},
        {user_id: 'u43', region: 'eu-central'}
    ],
    [
        {login_count: 8, last_login: '2025-06-01 12:00:00.000'},
        {login_count: 1, last_login: '2025-06-01 12:01:00.000'}
    ]);
```

## Missing keys {#missing-keys}

A DIRECT-layout lookup asks the dictionary for defaults when a key is absent, so by default `getValue` and `batchGetValues` hand back a **default-filled object** rather than `null`: `0` for numeric columns, `''` for string columns, epoch for datetime columns — including the key columns themselves.

This is the historical contract and remains the default so that existing UDFs keep working. To get `null` for missing keys instead, enable the `javascript_udf_getvalue_null_on_missing_key` setting on the query:

```sql
SELECT device_lookup(device_id) FROM device_events
SETTINGS javascript_udf_getvalue_null_on_missing_key = 1;
```

The two modes side by side, for a dictionary holding keys `1`, `2`, `3`:

| Call | Default | `javascript_udf_getvalue_null_on_missing_key=1` |
| ---- | ------- | ----------------------------------------------- |
| `getValue(d, 2)` | `{id: 2, name: 'two', score: 20}` | `{id: 2, name: 'two', score: 20}` |
| `getValue(d, 999)` | `{id: 0, name: '', score: 0}` | `null` |
| `batchGetValues(d, [1, 999, 2])` | `[{...score: 10}, {...score: 0}, {...score: 20}]` | `[{...score: 10}, null, {...score: 20}]` |

### Writing code that works under both modes {#missing-keys-portable}

Compare the returned key column(s) against the key you asked for. For a key that was really found, the key columns always echo the lookup key:

```javascript
function found(row, key) {
    return row !== null && row.device_id === key;
}

let res = getValue('device_state_dict', 9999);
found(res, 9999);   // => false under both modes

// For complex keys, compare every key column
let sess = getValue('user_session_dict', {user_id: 'ghost', region: 'nowhere'});
let exists = sess !== null && sess.user_id === 'ghost' && sess.region === 'nowhere';  // => false
```

This requires the key columns to be part of the result, so either omit the `columns` argument or include the key column(s) in it. Alternatively, design your storage so that every key is written before it is read (write-through), which avoids missing keys entirely.

### Older builds {#earlier-builds}

The `javascript_udf_getvalue_null_on_missing_key` setting, the positional alignment guarantee of `batchGetValues`, and by-name column projection all landed in **Timeplus Enterprise 3.3.1**. The missing-key handling of `getValue` / `batchGetValues` was also backported to the 2.8 line in [2.8.19](/enterprise-v2.8#2_8_19) (timeplusd 2.8.45), so 2.8.19 and later behave as described above. On earlier builds:

* `getValue` always returns the default-filled object for a missing key; there is no way to get `null`.
* `batchGetValues` returns `null` for the missing key itself, but entries **after** it in the result array can be shifted and carry another row's values.
* The `columns` argument must list the key column(s) first (e.g. `['device_id', 'status']`); projecting attributes alone returns mislabeled values.

The `found(row, key)` pattern above is the portable way to handle misses across all builds.

## End-to-end example: track device errors across events {#example}

This UDF processes a stream of device events and keeps a durable error counter per device in the dictionary. The counter survives query restarts, and other queries or UDFs can read the same state.

Using the `device_state_storage` stream and `device_state_dict` dictionary [created above](#setup):

```sql
CREATE OR REPLACE FUNCTION track_device_errors(device_id uint64, event string)
RETURNS int32
LANGUAGE JAVASCRIPT AS $$
function track_device_errors(device_ids, events) {
    const DICT = 'device_state_dict';

    // Read the persisted state once for the distinct devices in this block
    const distinct = [...new Set(device_ids)];
    const states = batchGetValues(DICT, distinct);

    // Seed local counters. The key comparison treats an unknown device as 0
    // under both missing-key modes (see "Missing keys" above).
    const counters = {};
    for (let i = 0; i < distinct.length; i++) {
        const known = states[i] !== null && states[i].device_id === distinct[i];
        counters[distinct[i]] = known ? states[i].error_count : 0;
    }

    // Process events, accumulating locally so repeated devices in the
    // same block are counted correctly
    const results = [];
    const lastEvent = {};
    for (let i = 0; i < device_ids.length; i++) {
        const id = device_ids[i];
        if (events[i] === 'error') {
            counters[id]++;
        } else if (events[i] === 'ok') {
            counters[id] = 0; // recover: reset the counter
        }
        lastEvent[id] = events[i];
        results.push(counters[id]);
    }

    // Write the final state of each device back in one batch
    const values = distinct.map(id => ({
        status: lastEvent[id] === 'error' ? 'error' : 'active',
        error_count: counters[id],
        last_seen: new Date()
    }));
    batchSetValues(DICT, distinct, values);

    return results;
}
$$;
```

Note that the function reads the persisted state once per block and accumulates in a local map, so a device that appears multiple times in the same block is counted correctly, and each device is written back exactly once.

Use it in a streaming query to alert on devices with too many consecutive errors:

```sql
SELECT device_id, consecutive_errors
FROM (
    SELECT device_id, track_device_errors(device_id, event) AS consecutive_errors
    FROM device_events
)
WHERE consecutive_errors >= 5;
```

:::warning
Filter on the UDF result from a subquery, as shown above. If you reference the alias directly in the same `SELECT`'s `WHERE` clause (`SELECT track_device_errors(...) AS c FROM device_events WHERE c >= 5`), the UDF expression is evaluated twice — once for the filter and once for the projection — so a stateful UDF would update the dictionary twice per event.
:::

Because the state lives in the `device_state_storage` mutable stream, you can inspect it with plain SQL at any time:

```sql
SELECT * FROM table(device_state_storage) WHERE error_count > 0;
```

## Notes and limitations {#notes}

* **Only DIRECT and COMPLEX_KEY_DIRECT layouts** are supported, and the dictionary source must be a stream in the local Timeplus service.
* **Reads are always fresh.** The DIRECT layout queries the source stream on every lookup, so a read right after a write returns the new value.
* **Writes are inserts into the source stream.** Use a mutable stream so that writing an existing key updates it instead of appending a duplicate. Deleting individual keys through these functions is not supported.
* **Simple keys must be numeric.** A DIRECT dictionary key must be convertible to `uint64`; both `1001` and `"1001"` are accepted. Use COMPLEX_KEY_DIRECT for string keys.
* **Write complete value objects.** Omitted attributes are stored as type defaults (`0`, empty string) — column `DEFAULT` expressions are not applied.
* **Validate lookup results.** A missing key returns a default-filled object unless `javascript_udf_getvalue_null_on_missing_key` is enabled, so `row === null` alone is not a reliable existence check. Compare the returned key columns against the requested key. See [Missing keys](#missing-keys).
* **Prefer batch functions in hot paths.** A JavaScript UDF receives a block of rows per invocation; one `batchGetValues`/`batchSetValues` per block is much cheaper than a `getValue`/`setValue` per row.
* **Error handling.** All functions throw JavaScript exceptions on failure. Wrap calls in `try`/`catch` if you want the UDF to continue on errors, and use `console.log` to write diagnostics to the server log (see [Debug Tips](/js-udf#debug-tips)).
* **Schema changes require recreating the stream.** If you need to add columns to the storage stream, recreate the stream and dictionary rather than using `ALTER STREAM ... ADD COLUMN`.
* There is also a global `getCardinality(dict_name)` function, but for DIRECT-layout dictionaries it returns `0`, since direct dictionaries hold no data in memory.

## See also

* [JavaScript UDF](/js-udf) — develop scalar and aggregate functions in JavaScript
* [CREATE DICTIONARY](/dictionary) — dictionary sources and layouts
* [Mutable Streams](/mutable-stream) — key-value storage with UPSERT semantics
