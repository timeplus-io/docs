# Data Types

In most cases, you don't need to create streams manually or specify the data type for the columns. Timeplus source will automatically create the streams/columns with proper types when you load data from Kafka/CSV/etc.

Like many analytics systems, the following common types are supported.

| Category                      | Type       | Example                              | Note                                                         | Related functions                                            |
| ----------------------------- | ---------- | ------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Numeric Types                 | integer    | -100                                 | default with 4 bytes. You can also use `int`, `smallint`, `bigint`, or even `uint16` etc. | [to_int](functions_for_type#to_int)                          |
|                               | decimal    | 3.14                                 | decimal(precision, scale). Valid range for precision is [1: 76], valid range for scale is [0: precision] | [to_decimal](functions_for_type#to_decimal)                  |
|                               | float      | -3.1415                              | default with 4 bytes. You can also use `float64` or `double` for 8 bytes | [to_float](functions_for_type#to_float)                      |
| Boolean Type                  | bool       | true                                 | true or false                                                |                                                              |
| String Type                   | string     | 'Hello'                              | strings of an arbitrary length. You can also use `varchar` To create string columns with fixed size in bytes, use `fixed_string(positiveInt)` | [to_string](functions_for_type#to_string), [etc.](functions_for_text) |
| Universally Unique Identifier | uuid       | 1f71acbf-59fc-427d-a634-1679b48029a9 | a universally unique identifier (UUID) is a 16-byte number used to identify records. For detailed information about the UUID, see [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier) | [uuid](functions_for_text#uuid)                              |
| IP address                    | ipv4       | '116.253.40.133'                     | IPv4 addresses. Stored in 4 bytes as uint32.                 | [to_ipv4](functions_for_url#to_ipv4)                         |
|                               | ipv6       | '2a02:aa08:e000:3100::2'             | IPv6 addresses. Stored in 16 bytes as uint128.               | [to_ipv6](functions_for_url#to_ipv6)                         |
| Date and Time Types           | date       | '2022-05-16'                         | without time                                                 | [to_date](functions_for_type#to_date), [today](functions_for_datetime#today) |
|                               | datetime   | '2022-05-16 11:01:02'                | with second                                                  | [to_time](functions_for_type#to_time), [now](functions_for_datetime#now) |
|                               | datetime64 | '2022-05-16 11:01:02.345'            | with millisecond, same as datetime64(3)                      | [to_time](functions_for_type#to_time), [now64](functions_for_datetime#now64) |
| Compound Types                | array      | [1,2]                                | access 1st element via array[1]                              | [length](functions_for_comp#length), [array_concat](functions_for_comp#array_concat) |
|                               | map        | map_cast('k1','v1','k2','v2')        | access key1 via map['key1']                                  | [map_cast](functions_for_comp#map_cast)                      |
|                               | tuple      | (1,2)                                | access 1st element via tuple.1                               | [tuple_cast](functions_for_comp#tuple_cast)                  |

