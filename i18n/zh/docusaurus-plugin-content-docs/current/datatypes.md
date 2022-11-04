# 数据类型

在大多数情况下，您不需要手动创建流或指定列的数据类型。 当您从 Kafka/CSV/等加载数据时，Timeplus源会自动创建带有适当类型的流/列。

像许多分析系统一样，支持以下常见类型。

:::info Beta - 数据类型

在我们的测试中，我们支持数量有限的字段类型。 如果有特定类型丢失，请告诉我们！

:::

| 类别           | 类型         | 示例                                   | 说明                                                                                                                           | 相关函数                                                               |
| ------------ | ---------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 数字类型         | integer    | -100                                 | 默认为 4 字节。 您也可以使用 `int`, `smallint`, `big`, 或甚至 `uint16` 等。                                                                   | [to_int](functions#to_int)                                         |
|              | decimal    | 3.14                                 | 十进制(精度，缩放)。 精确度的有效范围是[1：76]，尺寸的有效范围是[0：精度]                                                                                   | [to_decimal](functions#to_decimal)                                 |
|              | float      | -3.1415                              | 默认为 4 字节。 您也可以使用 `float64` 或 `双倍` 的 8 字节                                                                                     | [to_float](functions#to_float)                                     |
| Boolean Type | bool       | true                                 | true 或 false                                                                                                                 |                                                                    |
| 字符串类型        | string     | "Hello"                              | 字符串任意长度。 您也可以使用 `varchar` 来创建大小固定的字符串列，请使用 `fixed_string(positiveInt)`                                                       | [to_string](functions#to_string), [等。](functions#process-text)     |
| 通用唯一标识符      | uuid       | 1f71acbf-59fc-427d-a634-1679b48029a9 | 一个普遍唯一的标识符 (UUID) 是一个用于识别记录的16字节编号。 关于UUID的详细信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier) | [uuid](functions#uuid)                                             |
| JSON 类型      | json       | {"a":1}                              | 提供内置的 JSON 支持的实验性新类型 使用更好的查询性能比较保存JSON为 `字符串` 并在查询时间提取值。 适合于同一方案的 JSON 文档。 通过 `column.a` 访问值(而不是 `column:a` 查询时间的 JSON 提取)   |                                                                    |
| 日期和时间类型      | date       | '2022-05-16'                         | 没有时间                                                                                                                         | [to_date](functions#to_date), [today](functions#today)             |
|              | datetime   | '2022-05-16 11:01:02'                | 以秒                                                                                                                           | [to _time](functions#to_time), [now](functions#now)                |
|              | datetime64 | '2022-05-16 11:01:02.345'            | 以毫秒为单位, 与 datetime64(3) 相同                                                                                                   | [to _time](functions#to_time), [now 64](functions#now64)           |
| 复合类型         | array      | [1,2]                                | 通过数组访问第一个元素[1]                                                                                                               | [length](functions#length), [array_concat](functions#array_concat) |
|              | map        | map_cast('k1','v1','k2','v2')        | 通过 map['key1'] 访问密钥                                                                                                          | [map_cast](functions#map_cast)                                     |
|              | tuple      | (1,2)                                | 通过 tiple1 访问第一个元素                                                                                                            |                                                                    |

