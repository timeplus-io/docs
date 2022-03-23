# Data Types

In most cases, you don't need to create streams manually or specify the data type for the columns. Timeplus source will automatically create the streams/columns with proper types when you load data from Kafka/CSV/etc.

Like many analytics systems, the following common types are supported.

:::info Beta - Data Types

During our beta, we're supporting a limited number of field types. If there's a specific type that's missing, let us know!

:::

| Category            | Type       | Note                                                         | Related functions                                            |
| ------------------- | ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Numeric Types       | integer    | default with 4 bytes. You can also use int, smallint, bigint, or event uint16 etc. | [to_int](functions#to_int)                                   |
|                     | decimal    | decimal(precision, scale). Valid range for precision is [1: 76], valid range for scale is [0: precision] | [to_decimal](functions#to_decimal)                           |
|                     | float      | default with 4 bytes. You can also use float64 or double for 8 bytes | [to_float](functions#to_float)                               |
| Boolean Type        | bool       | true or false                                                |                                                              |
| String Type         | string     | strings of an arbitrary length. Also support `fixed_string(positiveInt)` to set size in bytes | [to_string](functions#to_string), [etc.](functions#process-text) |
| Date and Time Types | date       | without time                                                 | [to_date](functions#to_date), [today](functions#today)       |
|                     | datetime   | with second                                                  | [to_time](functions#to_time), [now](functions#now)           |
|                     | datetime64 | with millisecond, same as datetime64(3)                      | [to_time](functions#to_time), [now64](functions#now64)       |
| Compound Types      | array      | access 1st element via array[1]                              | [length](functions#length), [array_concat](functions#array_concat) |
|                     | map        | access key1 via map['key1']                                  |                                                              |
|                     | tuple      | access 1st element via tuple.1                               |                                                              |

