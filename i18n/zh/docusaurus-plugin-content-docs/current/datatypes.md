# 数据类型

在大多数情况下，您不需要手动创建流或指定列的数据类型。 当您从 Kafka/CSV/等加载数据时，Timeplus 源会自动创建带有适当类型的流/列。

像许多分析系统一样，支持以下常见类型。

| 类别         | 类型     | 示例                                   | 说明                                                                                                                         | 相关函数                                                                                 |
| ---------- | ------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 数字类型       | 整数     | -100                                 | 默认为 4 字节。 您也可以使用 `int`，`smallint`，`bigint`，或甚至 `uint16` 等。                                                                 | [to_int](functions_for_type#to_int)                                                  |
|            | 小数     | 3.14                                 | 十进制（精度，缩放）。 精确度的有效范围是 [1：76]，缩放的有效范围是 [0：精度]。                                                                              | [to_decimal](functions_for_type#to_decimal)                                          |
|            | 浮点数    | -3.1415                              | 默认为 4 字节。 您也可以使用 `float64` 或 `双倍` 的 8 字节。                                                                                  | [to_float](functions_for_type#to_float)                                              |
| 布尔型        | 布尔值    | true                                 | true 或 false。                                                                                                              |                                                                                      |
| 字符串类型      | 字符串    | 'Hello'                              | 字符串任意长度。 您也可以使用 `varchar` 来创建字节大小固定的字符串列，请使用 `fixed_string(positiveInt)`。                                                  | [to_string](functions_for_type#to_string), [etc.](functions_for_text)                |
| 通用唯一标识符    | uuid   | 1f71acbf-59fc-427d-a634-1679b48029a9 | 通用唯一标识符（UUID）是用于标识记录的 16 字节数字。 关于 UUID 的详细信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier)。 | [uuid](functions_for_text#uuid)                                                      |
| IP address | ipv4   | '116.253.40.133'                     | IPv4 addresses. Stored in 4 bytes as uint32.                                                                               | [to_ipv4](functions_for_url#to_ipv4)                                                 |
|            | ipv6   | '2a02:aa08:e000:3100::2'             | IPv6 addresses. Stored in 16 bytes as uint128.                                                                             | [to_ipv6](functions_for_url#to_ipv6)                                                 |
| 日期和时间类型    | 日期     | '2022-05-16'                         | 不包括具体时间                                                                                                                    | [to_date](functions_for_type#to_date), [today](functions_for_datetime#today)         |
|            | 日期时间   | '2022-05-16 11:01:02'                | 以秒为单位                                                                                                                      | [to_time](functions_for_type#to_time), [now](functions_for_datetime#now)             |
|            | 日期时间64 | '2022-05-16 11:01:02.345'            | 以毫秒为单位，与 datetime64（3）相同                                                                                                   | [to_time](functions_for_type#to_time), [now64](functions_for_datetime#now64)         |
| 复合类型       | 数组     | [1,2]                                | 通过数组访问第一个元素[1]                                                                                                             | [length](functions_for_comp#length), [array_concat](functions_for_comp#array_concat) |
|            | 地图     | map_cast('k1','v1','k2','v2')        | 通过地图 ['key1'] 访问 key1                                                                                                      | [map_cast](functions_for_comp#map_cast)                                              |
|            | 元组     | (1,2)                                | 通过 tuple.1 访问第一个元素                                                                                                         | [tuple_cast](functions_for_comp#tuple_cast)                                          |

