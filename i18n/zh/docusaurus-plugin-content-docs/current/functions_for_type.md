

# 类型转换

### to_time

`to_time(time_string [, default_time_zone] [,defaultValue])` 来将字符串转换为datetime64 值

例如： `to_time('1/22')` or `to_time('1/2/22','America/New_York')`

一些常见的时区是：

* `UTC`: 等效于 `GMT`(格林威治平均时间)
* `EST`: 美国东部时间
* `MST`: 美国山区时间
* `PST8PDT`: 美国太平洋时间
* `America/New_York`: 等同于 `EST`
* `America/Los_Angeles`: 等同于 `PST8PDT`
* `America/Vancouver`: 等同于 `PST8PDT`
* `Asia/Shanghi`: 等同于 `PRC`

对于可能的时区的完整列表，请检查 [维基百科页面](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 中的“TZ 数据库名称”栏。

您也可以通过 [to_timezone](#to_timezone) 转换时区

It can parse string `2023-09-19 05:31:34` or `2023-09-19T05:31:34Z`.

This function is the alias to `parse_datetime_best_effort`.

### to_int

`to_int(string)` 将其转换为整数。

### to_float

`to_float(string)` 将其转换为一个浮点数，例如：`to_float('3.1415926')`

### to_decimal

`to_decimal(number_or_string, scale)`

例如， `to_decimal('3.1415926',2)` 以获得3.14

### to_string

将任何数据类型转换为字符串，以便您可以执行其他字符串操作，如 [concat](#concat)

### to_bool

将值转换为 `bool` 类型。 例如：`select to_bool(1), to_bool(true),to_bool(True),to_bool('true')` all return `true`. 请注意，您不能运行 `to_bool('True')` 请注意，您不能运行 `to_bool('True')` 请注意，您不能运行 `to_bool('True')` 请注意，您不能运行 `to_bool('True')`


### cast

将输入值转换为指定的数据类型。 支持三个语法变体：

* `cast(x, T)`
* `cast(x as t)`
* `x:t`

说明：

- x - 一个要转换的值。 可以是任何类型。
- T——目标数据类型的名称。 字符串。
- t - 目标数据类型

例如：

```sql
select
    cast('1', 'integer'),
    cast('1' as integer),
    cast(3.1415, 'decimal(3, 2)'),
    json_extract_string('{"a":"001"}','a')::integer
```

### to_type_name

`to_type_name(x)` 来显示参数的类型名称 `x` 这主要是为了排除故障以了解函数调用的日期类型。 这主要是为了进行故障排除，以便了解函数调用的日期类型。