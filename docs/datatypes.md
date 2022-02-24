# Data Types

In most cases, you don't need to create streams manually or specify the data type for the columns. Timeplus source will automatically create the streams/columns with proper types when you load data from Kafka/CSV/etc.

Like many analytics systems, the following common types are supported.

:::info Beta - Data Types

During our beta, we're supporting a limited number of field types. If there's a specific type that's missing, let us know!

:::

| Category            | Type       | Note                            | Related functions                                            |
| ------------------- | ---------- | ------------------------------- | ------------------------------------------------------------ |
| Numeric Types       | Integer    | default with 4 bytes            | [to_int](functions#to_int)                                   |
|                     | Decimal    | default with 4 bytes            | [to_decimal](functions#to_decimal)                           |
|                     | Float      | default with 4 bytes            | [to_float](functions#to_float)                               |
| String Type         | String     | strings of an arbitrary length  | [to_string](functions#to_string), [etc.](functions#process-text) |
| Date and Time Types | Date       | without time                    | [to_date](functions#to_date), [today](functions#today)       |
|                     | DateTime   | with second                     | [to_time](functions#to_time), [now](functions#now)           |
|                     | DateTime64 | with millisecond                | [to_time](functions#to_time), [now64](functions#now64)       |
| Compound Types      | Array      | access 1st element via array[1] | [length](functions#length), [array_concat](functions#array_concat) |
|                     | Map        | access key1 via map['key1']     |                                                              |
|                     | Tuple      | access 1st element via tuple.1  |                                                              |

<!--

| Category            | Type                               | Description                                                  |
| ------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Numeric Types       | Decimal(precision, scale)          | valid range for precision is [1: 76], valid range for scale is [0: precision] |
|                     | Float32/64                         |                                                              |
|                     | Int8/16/32/64/128/256              |                                                              |
|                     | UInt8/16/32/64/128/256             |                                                              |
| Boolean Type        | Boolean                            |                                                              |
| Date and Time Types | Date                               |                                                              |
|                     | DateTime                           |                                                              |
|                     | DateTime64(precision, [time_zone]) |                                                              |
| String Types        | String                             |                                                              |
|                     | FixedString(N)                     |                                                              |
|                     | UUID                               |                                                              |
| Compound Types      | Array(T)                           |                                                              |
|                     | Map                                |                                                              |
|                     | Tuple                              |                                                              |

-->