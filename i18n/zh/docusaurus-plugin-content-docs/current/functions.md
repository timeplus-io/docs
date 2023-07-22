# 函数

Timeplus 支持 ANSI-SQL 标准语法。 以下功能适用于各种使用案例。 如果您需要更多功能，请联系我们。

:::info

Please note, functions in Timeplus are case-sensitive and always in lower-case. For example, you can run `SELECT count(*) FROM car_live_data` but not `SELECT COUNT(*) FROM car_live_data` Keywords such as `SELECT` or `FROM` are case-insensitive.

:::

## 类型转换 {#proc_type}

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

将值转换为 `bool` 类型。 例如：`select to_bool(1), to_bool(true),to_bool(True),to_bool('true')` all return `true`. 请注意，您不能运行 `to_bool('True')` 请注意，您不能运行 `to_bool('True')` 请注意，您不能运行 `to_bool('True')`


### cast

将输入值转换为指定的数据类型。 支持三个语法变体：

* `cast(x, T)`
* `cast(x as t)`
* `x:t`

说明：

- x - 一个要转换的值。 Can be of any type.
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

## 访问复合类型 {#arrays}

### array_cast

`map_cast(array1, array2)` 用 `array1`作为map的key，用 `array2` 作为value来组成一个新的map(这2个数组应该长度相同). 例如， `map_cast(['k1','k2'],[91,95])` 将得到 `{'k1':91,'k2':95}`

### length

`length(array)`

获取数组的长度

### array\[index\] {#array_element}

您可以轻松访问数组中的任何元素，只需使用数组名[index]，比如 `顶部值[2]`

:::info

第一个元素的索引是1，而不是0。

:::



### index_of

`array_difference(arr)` 计算相邻数组元素之间的差异。 返回第一个元素将为0的数组 第二个是 `a[1] - a[0]`之间的差异。 例如： `array_diffce([1,2,3,5])`返回 [0,1,2]

### array_compact

`array_compact(arr)` 从数组中删除连续重复元素，例如 `array_compact([1,1,1,2,2,2,2,3,4,4,5])`返回 [1,2,3,4,5]

### array_concat

`array_concat(数组1,数组2)` 将两个数组合并成一个。

### array_difference

`array_distinct(arr)` 返回一个仅包含不同元素的数组。 例如： `array_distinct([1,1,1,2,3,3,1,1)]`return [1,2,3], 而 `array_compact([1,1,2,3,1,1)`return [1,2,3,1]

### array_distinct

`array_filter(func, 数组)` 返回一个仅包含符合指定函数条件的元素的数组。 例如： `array_filter(x->x%2==0, [1,2,3,4])`返回 [2,4]



### array_flatten

`数组array_flatten(数组1, 数组2,...)`将数组转换为平坦数组。 例如： `array_flatten([[[1]], [[2], [3]])` 返回 [1,2,3]

### array_string_concat

`array_string_concat([，分隔符])` 与分隔符连接数组中列出的值的字符串表示. `分隔符` 是一个可选的参数：一个常量字符串，默认设置为空字符串。 `分隔符` 是一个可选的参数：一个常量字符串，默认设置为空字符串。

例如， `array_string_concat([1,2,3],'-')` 获取一个字符串 `1-2-3`

### array_join

`array_join(an_array)` 这是一个特殊的函数。 `group_array(col)` 来将列值从多行分组到一行中的单个值。 `array_join` 正好相反：它可以将一个数组值的行转换为多行。

例如， `select array_join([10,20]) as v, 'text' as t` 将获得2 行

| v  | t    |
| -- | ---- |
| 10 | text |
| 20 | text |

### array_pop_back

`array_pop_back(数组)` 从数组中移除最后一个项目。 例如： `array_pop_back([1,2,3])` 返回 [1,2]

### array_pop_front

`array_pop_front(数组)` 从数组中移除第一个项目。 例如： `array_pop_front([1,2,3])` 返回 [2,3]

### array_push_back

`array_push_back(数组，值)` 将数值作为最后一个项目添加到数组。 例如： `array_pup_back([1,2,3],4)` 返回 [1,2,3,4]

### array_push_front

`array_push_front(数组，值)` 将数值作为第一个项添加值添加到数组。 例如： `array_push_front([1,2,3],4)` 返回 [4,1,2,3]



### array_product

`array_product(数组)` 乘数组中的元素。 例如： `array_product([2,3,4])` 返回 24 (2x 3 x 4)



### array_resize

`array_resize(array,size [,extender])` 更改数组的长度。 如果 `size` 小于当前数组的长度，则数组将被截断。 如果 `size` 小于当前数组的长度，则数组将被截断. 否则，将创建一个具有指定大小的新数组，用指定的 `extender` 填充值。 例如：`array_resize([3,4],1)` 返回 [3]。 `array_resize([3,4],4,5)` 返回 [3,4,5,5]



### array_reverse

`array_reverse(arr)` 返回一个数组与原数组的反向顺序，例如 `array_reverse([1,2,3])` 返回 [3,2,1]



### array_slice

`array_slice(arr, offset [,length])` 返回数组的分割。 如果没有指定 `length`，则分割到数组的末尾，例如 `array_slice([1,2,3,4,5,],2)` 返回 [2,3,4,5]。 如果 `offset` 大于数组长度，则返回一个空数组 []。 如果 `length` 被视为新数组的长度，例如： `array_slice([1,2,3,4,4,5],2,3)` 返回 [2,3,4]



### array_uniq

`array_uniq(arr)` 返回数组中唯一的数值，例如： `array_uniq([1,1,2,3])` 返回 3



### array_zip

`array_zip(arr1,arr2,.. arrN)` 将来自不同数组的元素分组到一个新的元组数组。 例如：`array_zip([1,2,3],['a','b','c'])` returns [(1,'a'),(2,'b'),(3,'c')]

### array_all

`array_all([func,] array)` 返回 1(true) 或 0(false) 如果数组中的所有元素都符合条件。 例如， `array_all([1,2])` 返回 1, 而 `array_all([0,0])`返回 0。 您可以将 lambda 函数传递给它作为自定义条件检查的第一个参数， 例如 `array_exists(x->x%2==0,[2,3,4])` 检查数组中是否有任何元素。 它返回 1。

### array_avg

`array_cum_sum([func, ]array)` 返回源数组中部分元素的数组(运行总和)。 例如：`array_avg([2,6])` 返回 4。 您可以将lambda函数作为第一个参数传递给它，在计算平均值之前应用于每个元素，例如 `array_avg(x->x*x,[2,6])` 获得2*2 和 6\*6的总和，这是20。

### array_count

`array_count([func, ]数组)` 返回符合条件数组中的元素数量。 默认情况下，检查值是否为 0。 例如： `array_count([0,0,1,2])` 返回 2。 您可以在 lambda 函数中传递一个 lambda 函数作为计算计数前应用于每个元素的第一个参数， 例如 `array_count(x->x>1,[1,2])` 获取大于1的数字，它返回 1。

### array_cum_sum

`array_cum_sum([func, ]array)` 返回源数组中部分元素的数组(运行总和)。 例如： `array_cum_sum([1,1,1,1])` 返回 [1,2,3]。 您可以在 lambda 函数中作为第一个参数，在计算移动总和之前应用于每个元素， 例如 `array_cum_sum(x->x*x,[1,2])` 获得[1,5]

### array_exists

`array_exists([func, ]数组)` 返回 1(true) 或 0(Alse) 如果数组中的任何元素符合条件。 例如， `array_exists([0,1,2])` return 1, and `array_exists([0,0])`return 0。 您可以将 lambda 函数传递给它作为自定义条件检查的第一个参数， 例如 `array_exists(x->x%2==0,[2,3,4])` 检查数组中是否有任何元素。 它返回 1。 要检查所有元素是否符合条件，请使用 `array_all`

### array_filter

`array_first_index(func, 数组)` 返回与指定函数条件匹配的第一个元素的索引。 例如： `array_first_index(x->x%2==0, [1,2,3,4])`返回 2。

### array_first

`array_first(函数, 数组)` 返回符合指定函数条件的第一个元素。 例如： `array_first(x->x%2==0, [1,2,3,4])`返回 2。

### array_first_index

`array_map(函数, 数组)` 将函数应用于数组中的每个元素，并返回一个新数组。 例如： `array_map(x->x*x,[1,2])`返回 [1,4]

### array_last

`array_last(func, 数组)` 返回符合指定函数条件的最后一个元素。 例如： `array_last(x->x%2==0, [1,2,3,4])`返回 4。  If nothing is found, it returns 0.

### array_last_index

`array_last_index(ffunc, 数组)` 返回匹配指定函数条件的最后一个元素的索引。 例如： `array_last_index(x->x%2==0, [1,2,3,4])`返回 4。 If nothing is found, it returns 0.

### array_map

`array_map(func, array)` applies the function to every element in the array and returns a new array. 如果 `x` 不在数组中，返回 0。

### array_max

`array_max(func, 数组)` 将函数应用于数组中的每个元素，然后返回最大值。 。 `array_max(x->x*x,[1,2])`返回 4

### array_min

`array_min(函数, 数组)` 将函数应用于数组中的每个元素，然后返回最小值 e。 。 `array_min(x->x*x,[1,2])`返回 1

### array_sort

`array_sort(func, array)` sorts the array elements in ascending order. 例如： `array_sort([3,2,5,4])` 返回 [2,3,4,5]。 你可以将 lambda 函数传递给它作为第一个参数在排序前应用函数。 。 `array_sort(x->-x,[3,2,5,4])`返回 [5,4,3,2]



### array_sum

`array_sum([func, ]数组)` 返回数组中的总值。 例如， `array_sum([2,6])` return 8。 您可以在 lambda 函数中传递一个 lambda 函数作为计算总和之前应用于每个元素的第一个参数。 例如 `array_sum(x->x*x,[2,6])` 获得2*2 和 6\*6的总和，这是40。



### map\[key\] {#map-key}

您可以轻松访问map中的任何元素，只需使用map[keyName], 例如 `kv['key1']`

### map_cast

`map_cast(array1, array2)` to generate a map with keys from `array1` and values from `array2` (these 2 arrays should be the same size). 例如 `array_cast('a','n')`, not `array_cast('a',0')`

或者，您可以使用 `map_cast(key1,value1,key2,value2...)`

### tuple_cast

`tuple_cast (item1, item2)` 生成一个包含这 2 个元素的元组。 你也可以使用快捷语法： `(item1, item2)` 直接创建元组。

## 处理日期和时间 {#proc_datetime}

### year

使用 `year(date)` 来获取当前年份，例如 `year(today())` 将是 `2022`。

### quarter

使用 `quarter(date)` 获取当前季度，例如 `quarter(today())` 将是 `1`，如果现在是Q1的话。

### month

使用 `month(date)` 获取月份，例如 `month(today())` 将会是 `2`，如果现在是二月的话。

### day

使用 `day(date)` 来获取当月的日期。

### weekday

使用 `weekday(date)` 来获取周中的某一天。 星期一是1。 星期日是7。

### day_of_year

使用 `day_of_year(date)` 来获取这一天在该年中的天数 (1-366)。

### hour

`hour(datetime)`

获取日期时间的小时数。

### minute

`minute(datetime)`

获取日期时间的分钟数。

### second

`second(datetime)`

获取日期时间的秒数。

### to_unix_timestamp

获取日期时间的 UNIX 时间戳。 在 `uint32` 中返回一个数字

例如， `to_unix_timestamp(now())` 获得 `1644272032`

### to_start_of_year

`to_start_of_year(date)`

将日期或带有时间的日期舍入到一年中的第一天。 返回日期。

### to_start_of_quarter

`to_start_of_quarter(date)`

将日期或带有时间的日期舍入到一年中的第一季度。 返回日期。

### to_start_of_month

`to_start_of_month(date)`

将日期或带有时间的日期舍入到一年中的第一个月。 返回日期。

### to_start_of_day

`to_start_of_day(date)`

将日期舍入到一天开始的时间。

### to_start_of_hour

`to_start_of_hour(datetime)`

将日期或带时间的日期舍入到最开始的小时。

### to_start_of_minute

`to_start_of_minute(datetime)`

将日期或带时间的日期舍入到最开始的分钟。

### to_start_of_second

`to_start_of_second(datetime64)`

将日期或带时间的日期舍入到最开始的秒。

不同于其他 `to_start_of_` 函数，这个函数需要一个有毫秒的日期时间，例如 `to_start_of_second(now64())`

### to_date

`to_date(字符串)` 将日期字符串转换为日期类型，例如 `to_date('1953-11-02')`

### to_datetime

`to_datetime(值)` 将值转换为日期时间类型，例如 `to_datetime(1655265661)` 或 `to_datetime(todayy(today))`

### today

`today()`

返回当前日期。

### to_YYYYMM

`to_YYYYMM(date)`

获取一个数字。 例如， `to_YYYYMM(today))` 将获得数字 `20202`

### to_YYYYMMDD

`to_YYYYMMDD(date)`

获取一个数字。

### to_YYYMMDDhmmss

`to_YYYMMDDhmss(date)`

获取一个数字。

### to_timezone

`to_timezone(datectime_in_a_timezone,target_timezone)` 将日期时间从一个时区转换到另一个时区。

对于可能的时区的完整列表，请检查 [维基百科页面](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 中的“TZ 数据库名称”栏。 对于常见的时区，请检查 [to _time](#to_time)

例如，

```sql
SELECT
  to_time('2022-05-16', 'America/New_York') AS t1, to_timezone(t1, 'UTC') AS t2
```

输出：

| t1                      | t2                      |
| ----------------------- | ----------------------- |
| 2022-05-16 00:00:00.000 | 2022-05-16 04:00:00.000 |



### format_datetime

`格式_datetime(时间,格式,时区)`

将日期时间格式化为字符串。 第三个参数是可选的。 支持以下占位符

| 占位符 | 描述                            | 输出字符串      |
| --- | ----------------------------- | ---------- |
| %Y  | 四位数年份                         | 2022       |
| %y  | 2位数年份                         | 22         |
| %m  | 月份带2位数字                       | 01         |
| %d  | 含2位数字的日                       | 02         |
| %F  | 短的 YYYY-MM-DD 日期，相当于 %Y-%m-%d | 2022-01-02 |
| %D  | MM/DD/YY 短日期，相当于 %m/%d/%y     | 01/02/22   |
| %H  | 小时带有2位数字 (00-23)              | 13         |
| %M  | 2位数分钟(00-59)                  | 44         |
| %S  | 2位数秒(00-59)                   | 44         |
| %w  | 周日为小数点，周日为0(0-6)              | 1          |



### date_diff

`date_diff(unit,begin,end)`

计算 `begin` 和 `end` 的差值并在 `unit` 中产生一个数字。例如： `date_diff('second',window_start,window_end)</0> 例如： <code>date_diff('second',window_start,window_end)</0> 例如： <code>date_diff('second',window_start,window_end)`

### date_diff_within

`date_diff_within(timegap,time1,time2)`

返回 true 或 false。  此函数只能在 [流到流加入](query-syntax#stream_stream_join) 时使用。 检查 `time1` and `time2` 之间的差距是否在特定范围内。 例如， `date_diff_within(10s,payment.time,notification.time)` 来检查付款时间和通知时间是否在10秒或更短。

### date_trunc

`date_trunc(funit), value[, timezone])`将日期和时间数据截断到日期的指定部分。 例如， `date_trunc('month',now())` 获取当前月初的日期时间。 可能的单位值为：

* year
* quarter
* month
* day
* hour
* minute
* second

### date_add

它支持 `date_add(单位, 值, 日期)` 和快捷解决 `data_add(date,timeExpression)`

*  `date_add(HOUR, 2, now())` 将在 2 小时内获得一个新的日期时间。 `date_add(HOUR, -2, now())` 将得到一个新的日期时间2 小时后退。
* `date_add(now)、2h)` 和 `date_add(now)、2h)` 也工作

### date_sub

它支持 `date_sub(单位, 值, 日期)` 和快捷解决 `data_sub(date,timeExpression)`

*  `date_sub(HOUR, 2, now())` 将获得一个新的日期时间 2 小时
* `date_sub(now)2h)`  也工作

### earliest_timestamp

`earest_timestamp()` 返回 `"1970-1-1 00:00:00"`

### earliest_ts

`earliest_ts()` 是 `earliest_timestamp()`的简写方式

## 处理 JSON {#proc_json}

### json_extract

`json_extract_int(json, key)` 获取指定的 JSON 文档和密钥的整数值。 例如， `json_extract_int('{"a":10,"b":3.13}','a')` 将获得数字 `10`

### json_extract_float

`json_extract _float(json, key)` 获取指定的 JSON 文档和密钥的浮点值。 例如， `json_extract_int('{"a":10,"b":3.13}','b')` 将获得浮点数 `3.13`

### json_extract_bool

`json_extract_bool(json, key)` 从指定的 JSON 文档和密钥中获取布尔值。 例如， `json_extract_bool('{"a":true}','a')` 将获得布尔值 `true` 或 `1`

### json_extract_string

`json_extract_string(json, key)`获取指定的 JSON 文档和密钥的字符串值。 例如， `json_extract_string('{"a":true,"b":{"c":1}}','b')` 将获得字符串值 `{"c":1}` 并且您可以继续使用 JSON 函数来提取值。

### json_extract_array

`json_has(json, key)` 来检查是否在 JSON 文档中存在指定的密钥。 例如 `json_has('{"a":10,"b":20}','c')`返回 0(false)。

### json_extract_keys

`json_extract_keys(jsonStr)` to parse the JSON string and extract the keys. 例如： `选择 '{"system_diskio_name":"nvme0n1"}" 作为标签，json_extract_keys(标签)` 将获得一个数组： `[ "system_diskio_name" ]`

### is_valid_json

`is_valid_json(str)` 来检查给定的字符串是否是有效的 JSON 返回 true(1) 或 false(0) 返回 true(1) 或 false(0) 返回 true(1) 或 false(0)

### json_has

`json_has(json, key)` to check whether a specified key exists in the JSON document. For example, `json_value('{"a":true,"b":{"c":1}}','$.b.c')` will return the number `1`

### json_value

`json_value(json, path)` 允许您访问嵌套的 JSON 对象。 例如， `json_extract_int('{"a":,"b":1}','a')` 将获得数字 `1`

### json_query

`json_query(json, path)` 允许您访问 JSON 嵌套的 JSON 对象作为JSON 数组或 JSON 对象。 如果值不存在，则返回空字符串。 例如， `json_query('{"a":true,"b":{"c":1}}','$.b.) ')` 将返回一个 1 元素  `[1]` 的数组更复杂的例子。 `json_query('{"records":[{"b":{"c":1}}},{"b":{"c":2}}},{"b":{"c":3}}},','$. ecords[*].b.c')` 将获得 `[1,2,3]`

## 处理文本 {#proc_text}

### lower

`小(字符串)`

将字符串中的 ASCII 拉丁符号转换为小写。

### upper

`上级(字符串)`

将字符串中的 ASCII 拉丁符号转换为大写。

### format

`format(template,args)` 使用参数中列出的字符串格式化常量模式。

例如：`format('{} {}', 'Hello', 'World')` 获得 `Hello World`

### concat

`concat(str1,str2 [,str3])` 将2 或更多字符串合并为单个字符串。 例如， `concat('95','%')` 以获得95%。 You can also use `||` as the shortcut syntax, e.g. `'95' || '%'` Each parameter in this function needs to be a string. 您可以使用 [to_string](#to_string) 函数来转换他们，例如 `到_string(95)|| '%'`

### substr

`substr(str,index [,length])` 返回 `str` 从 `index` 开始的子串(第一个字符的index是1)。 `length` 是可选的。

### trim

`修剪(字符串)`

删除字符串开头或结尾的所有指定字符。 默认情况下，删除字符串两端连续出现的所有常用空格（ASCII 字符 32）。

### split_by_string

`split_by_string(sep,string)`

用字符串分隔一个字符串到子字符串。 它使用由多个字符组成的常量字符串 `sep` 作为分隔符。 如果字符串 `sep` 为空，它会将字符串 `字符串` 拆分为单个字符的数组。

例如： `split_by_string('b','abcbxby')` 将会获得一个包涵字符串 `['a','c','x','y']` 的数组。

### match

`match(string,pattern)` determines whether the string matches the given regular expression. 例如，要检查文本是否包含一个敏感的 AWS ARN，您可以运行 `匹配(text,'arn:aws:kms:us-east-1:\d{12}:key/.{36}')`

### multi_search

`multi_search_any(text, array)` determines whether the text contains any of the strings from the given array. 例如，要检查文本是否包含任何敏感关键词，您可以运行 `multi_search_any(text,['password','token','secret'])`

### replace_one

`替换 (string,pattern,replacement)`

将 `模式` 替换为第三个参数 `替换` `字符串`

例如， `replace_one('abca','a','z')` 将得到 `zbca`

### replace

`替换 (string,pattern,replacement)`

将 `模式` 替换为第三个参数 `替换` `字符串`

例如 `替换 ('aabc','a','z')` 将得到 `zzbc`

### replace_regex

`replace_regex(string,pattern,replacement)`

替换所有出现的模式。

这可以用来掩盖数据，例如： 要隐藏完整的电话号码，您可以运行 `replace_regex('604-123-4567' (\\d{3})-(\\d{3})-(\\d{4})','\\1-***-******')` 获得 `604-***-****`

### extract

用正则表达式处理纯文本并提取内容。 例如， `extract('key1=value1, key2=value2','key1=(\\w+)')`, 这将得到“value1”。  如果日志行放入一个单一的文本列，您可以用提取的字段创建一个视图，例如：

```sql
将视图日志创建为 
从log_stream中选择 'key1=(\\w+)' 作为key1,
       extract(value, 'key2=(\\w+)' 作为key2
```



### extract_all_groups

`extract_all_groups(haystack, pattern)`

使用 `模式` 正则表达式匹配所有组 `haystack` 字符串。 返回数组，其中第一个数组包含键值，第二个数组包含所有值。

```sql
SELECT 
 extract_all_groups('v1=111, v2=222, v3=333', '("[^"+"|\\w+)=("[^"]+"|\\w+)=分组
 -- 返回 [ [ "v1", "v2", "v3" ], [ "111", "222", "333" ]
```



### extract_all_groups_horizontal

`extract_all_groups_水平(haystack, pattern)`

使用 `模式` 正则表达式匹配所有组 `haystack` 字符串。 返回数组，其中第一个数组包括与第一组匹配的所有片段，第二个数组匹配第二组等。

```sql
SELECT 
 extract_all_groups('v1=111, v2=222, v3=333', '("[^"+"|\\w+)=("[^"]+"|\\w+)=
 -- [ "v1", "111" ], [ "v2", "222" ], [ "v3", "333" ]
```



### grok

`grok(string,pattern)`

在不使用正则表达式的情况下从计划文本中提取值。 例如： `SELECT grok('我的名字是杰克) 我在23年前。 I am 23 years old.','My name is %{DATA:name}. 我是 %{INT:age} 年前。 ') 因为m` 将得到 `{"name":"Jack","age":"23"}` 作为 `m`

Please note all keys and values in the returned map are in string type. 您可以将它们转换为其他类型，例如 `(m['age'])：int`

### coalesce

`coalesce(value1, value2,..)` Checks from left to right whether `NULL` arguments were passed and returns the first non-`NULL` argument. 如果您获得了与Nullable类型相关的错误信息，例如： “嵌套类型数组(字符串) 不能在Nullable类型内”， 您可以使用此函数将数据转换为非-`NULL` 例如： `json_extract_array(coalesce(raw:payload, ')`

### hex

`hex(argument)` 返回包含参数十六进制表示形式的字符串。`argument` 可以是任何类型。



## Unique identifier {#proc_uuid}

### uuid

`uuid()` or `uuid(x)` Generates a universally unique identifier (UUID) which is a 16-byte number used to identify records. 为了在一行中生成多个UUID, 在每个函数调用中传递一个参数, 例如 `SELECT uuid(1) as a, uuid(2) 为 b` ，否则如果在调用多个 `uuid 时没有参数` 函数在一个 SQL 语句中 将返回相同的 UUID 值。

## 逻辑值

### if

`if(condition,yesValue,noValue)`

控制条件分支。

例如， `if(1=2,'a','b')` 将得到 `b`

### multi_if

`multi_if(condition1, then1, condition2, then2.. ,else)` 一种比 if/self 或 case/when 更简单的写法。

## 聚合

### count

`count (*)` 获取满足条件的行数，或者用 `count (col)` 获取 `col` 不是 `NULL`的行数。

### count_distinct

`count_distinct(col)` to get the number of unique values for the `col` column. 与 `个计数(独选一列)` 相同

### count_if

`count_if(condition)` 来统计符合 `condition` 的记录数。 例如： `count_if(speed_kmh>80)`

### distinct

`distinct(col)`获取 `col` 列的不同值。

### unique

`unique(<column_name1>[, <column_name2>, ...])`: 计算某一列中（大致的）不同值。

### unique_exact

`unique_exact(<column_name1>[, <column_name2>, ...])`计算某一列中不同值的确切数量。

### unique_exact_if

`unique_exact_if(col,condition)` to apply a filter with `condition` and get the distinct count of `col`, e.g. to get the cars with high speed `unique_exact_if(cid,speed_kmh>80)`

### min

`min(<column_name>)`: 列的最小值。 对于字符串列，比较是词汇排序。

### max

`max(<column_name>)`: 列的最大值。 对于字符串列，比较是词汇排序。

### sum

`sum(<column_name>)`: 列之和。 仅适用于数字。

### avg

`avg(<column_name>)`: 一列的平均值 (sum(column) / count(column)). 仅适用于数字列。 Only works for numeric columns.

### median

`median(<column_name>)` 计算数值数据样本的中值。



### quantile

`quantile(column,level)`计算一个大致的数值数据序列。 例如： ` quantile (a,0.9)`获取列的 P90 和 ` quantile (a,0.5)` 获取 [中位](functions#median) 数字

### p90

简写形式的 ` quantile (a,0.9)`

### p95

简写形式的 `quantile(a,0.95)`

### p99

简写形式的 `quantile(a,0.99)`

### top_k

`top_k(<column_name>,K [,true/false])`: 列名中最频繁的 K 项。 返回一个数组。

例如： `top_k(cid, 3)` 可能得到 `[('c01',1200),('c02,800)',('c03',700)]` 如果这3id出现在聚合窗口中最频繁。

如果您不需要事件计数，您可以设置第三个参数的 false，例如： `top_k(cid, 3, false)` 可能得到 `['c01','c02','c03']`

Read more on [Top-N Query Pattern](sql-pattern-topn) page.

### min_k

`min_k(<column_name>,K [,context_column])`: 列名中最小的 K 项。 返回一个数组。 您还可以添加列表，获取同行中值的更多上下文，例如 `min_k(price,3,product_id,last_updated)`  这将返回一个数组，每个元素作为元组，比如 `[(5.12,'c42664'),(5.12,'c42664'),(15.36,'c84068')]`

Read more on [Top-N Query Pattern](sql-pattern-topn) page.

### max_k

`max_k(<column_name>,K[,context_column])`: 列名中最大的 K 项。 您还可以添加列表，获取同一行中更多值的上下文，例如 `max_k(price，3，product_id，last_updated)`

Read more on [Top-N Query Pattern](sql-pattern-topn) page.

### arg_min

`arg_min(argument, value_column)` Gets the value in the `argument` column for a minimal value in the `value_column`. If there are several different values of `argument` for minimal values of `value_column`, it returns the first of these values encountered. 您可以通过 `min_k(value_column,1, argument)[1].2` 实现相同的功能。 但这要容易得多。

### arg_max

`arg_max(argument, value_column)` Gets the value in the `argument` column for a maximum value in the `value_column`. If there are several different values of `argument` for maximum values of `value_column`, it returns the first of these values encountered. 您可以通过 `max_k(value_column,1, argument)[1].2` 实现相同的功能。 但这要容易得多。

### group_array

`group_array(<column_name>)` 来合并特定列作为数组的值。 For example, if there are 3 rows and the values for these columns are "a","b","c". 此函数将生成单行和单列，值 `['a','b','c']`

### moving_sum

`moving_sum(column)` 返回一个数组与指定列的移动和和。 例如， `select moving_sum(a) from(select 1 as a union select 2 as a union select 3 as a)` 将返回[1,3,6]



## 数学

### abs

`abs(value)` 返回数字的绝对值。 如果一个<，则返回 -a。



### round

`round(x [,N])` 向一定数量的小数位点投射一个值。

* 如果遗漏了 `N` ，我们认为N 为 0，函数将值轮到附近的整数，e。 。 `round(3.14)`作为 3
* 如果 `N`>0，函数将值转到小数点的右边，例如 `round(3.14-1)` 转为3.1
* 如果 `N` <0，则函数将值放回小数点左边。 例如： `round(314.15-2)` as 300

### e

`e()` 返回一个 `浮点` 数字接近数字 `e`。



### pi

`pi()` 返回一个 `浮点` 靠近数字 `π`。



### exp

`exp(x)` 返回一个 `浮点` 接近实参指数的数 `x`。

### exp2

`exp2(x)` 返回一个 `浮点` 接近2的次幂的数 `x`。

### exp10

`exp10(x)` 返回一个 `浮点` 接近10的次幂的数 `x`。



### log

`log(x)`  返回一个 `浮点` 与实参的自然对数接近的数 `x`。

### log2

`log2(x)` 返回一个 `浮点` 与参数的二进制对数接近的数 `x`。

### log10

`log10(x)` 返回一个 `浮点` 接近实参的十进制对数的数 `x`。



### sqrt

`sqrt(x)`返回一个 `浮点` 接近实参平方根的数 `x`。



### cbrt

`cbrt(x)` 返回一个 `浮点` 接近实参的立方根的数 `x`。


### lgamma

`lgamma(x)` 伽玛函数的对数。



### tgamma

`tgamma(x)`伽玛函数


### sin

`sin(x)` 个正弦值


### cos

`cos(x)` 余osine



### tan

`tan(x)` 切线



### asin

`asin(x)` 弧正体



### acos

`acos(x)` arc cosine

### atan

`atan(x)` 弧切点



### pow

`pow(x,y)` 返回一个 `浮点` 靠近  `x` 靠近 `y` 的数字



### power

`power(x,y)`  返回 `浮点` 靠近  `x` 靠近 `y`



### sign

`sign(x)` 返回数字 `x` 的签名。 如果x<0, 返回 -1。 如果x>0, 返回 1。 否则，返回0。



### degrees

`degrees(x)` 将以弧度为单位的输入值转换为度。 E.g. `圆形(3.14)`作为 3

### radians

`radians(x)` 将以度为单位的输入值转换为弧度。 E.g. `圆形(3.14)`作为 3

### is_finite

`is_finite(x)` return 1 when the value `x` is not infinite and not a NaN, otherwise return 0.

### is_infinite

`is _infinite(x)` to return 1 while the value `x` is 无限，否则返回 0。

### nan

`is_nan(x)` 返回如果 `x` 为 not-a-Number(NAN)，否则返回 0。



## 函数的对数

哈希函数可用于元素的确定性伪随机洗牌。

### md5

`md5(string)` 从字符串计算 MD5 并返回结果字节集为 `fixed_string(16)`。  如果您想获得与 md5sum 实用程序输出相同的结果，请使用 `lower(hex(md5(s)))`。

### md4

`md4(string)` 从字符串中计算MD4并将结果字节集返回为 `fixed_string(16)`。



## 财务

### xirr

根据特定的一系列可能不定期的现金流量计算投资的内部回报率。

`xirr(cashflow_column,date_column [,rate_guess])`



## 地理位置 {#proc_geo}

### point_in_polygon

检查点是否属于多边形。 `point_in_polygon((x,y),[(a,b),(c,d)...)` 例如： `SELECT point_in_polygon(3,3)。 , [(6, 0), (0), (8, 4), (5, 8), (0, 2)]) AS` 返回 `` 自点起(3, )是在定义的多边形中。



### geo_distance

计算 WGS-84 椭圆上的距离。 `geo_distance(lon1,lat1,lon2,lat2)`

## 流处理 {#streaming}

### table

`table(stream)` 将无界限的数据流转换为一个有界限的表格，并查询其历史数据。 例如，您可以在 Timeplus 中将 Kafka topic中的点击流数据加载到 `clicks` 流。 默认情况下，如果您运行 `SELECT... 默认情况下，如果您运行 <code>SELECT... FROM clicks ..` 这是一个带有无边界数据的流式查询。 默认情况下，如果您运行 `SELECT... FROM clicks ..` 这是一个带有无边界数据的流式查询。 查询将随时向您发送新结果。 如果您只需要分析过去的数据，您可以将流放到 `table` 函数中。 使用 `count` 作为示例：

* running `select count(*) from clicks` will show latest count every 2 seconds and never ends, until the query is canceled by the user
* 运行 `select count(*) from table(clicks)` 将立即返回此数据流的历史数据行数。

您可以创建视图，如 `create view histrical_view as select * from table(stream_name)`, 如果您想要多次查询表模式中的数据。 对于静态数据，例如查找信息(城市名称及其邮政编码)，这种方法可能很有效。

了解更多关于 [非流式查询](history) 的信息。

### tumble

`tumble(stream [,timeCol], windowSize)`

为数据流创建一个tumble窗口视图，例如 `tumble(iot,5s)` 将创建每5秒数据流 `iot` 的窗口。 SQL 必须以 `group by` 结尾，然后使用 `window_start` 或 `window_end` 或两者兼有。

### hop

`hop(stream [,timeCol], step, windowSize)` Create a hopping window view for the data stream, for example `hop(iot,1s,5s)` will create windows for every 5 seconds for the data stream `iot` and move the windows forward every second. SQL 必须以 `group by` 结尾，然后使用 `window_start` 或 `window_end` 或两者兼有。

### session

`session(stream [,timeCol], idle, [maxLength,] [startCondition,endCondition] )`

基于数据流中的活动创建动态窗口。

参数：

* `stream` 数据流、视图或 [CTE](glossary#cte)/子查询
* `timeCol` 可选，默认情况下是 `__tp_time` (记录的事件时间)
* `idle` 事件将被自动分割为2个会话窗口
* `maxLength` 会话窗口最大长度。 可选的。 默认值是 `idle`的 5 倍
* `[startCondition, endCondition]`可选. 开始和结束条件 如果指定的话，会话窗口将在满足 `startCondition`时开始，并将在 `endCondition` 得到满足时关闭。 您可以使用 `[expression1, expression2]`表示开始和结束事件将包含在会话中。 或 `(expression1，expression2]` 表示结束事件将包括但不包括起始事件。

例如，如果车辆在移动时一直在发送数据，停靠时停止发送数据或等待交通灯

* `session(car_live_data, 1m) partition by cid` 将为每辆车创建会话窗口，空闲时间为1分钟。 表示汽车未在一分钟内移动， 窗口将被关闭，并将为未来事件创建一个新的会话窗口。 如果车辆移动时间超过5分钟，将创建不同的窗户(每5分钟)， 这样作为分析员，你就可以获得接近实时的结果，而不必等待太长时间才能停车。
* `session(car_live_data, 1m, [speed>50,speed<50)) partition by cid` 创建会话窗口以检测汽车正在加速的情况。 将包括速度超过50的第一次活动。 和速度小于50的最后一个事件将不会被包含在会话窗口中。
* `session(access_log, 5m, [action='login',action='logout']) partition by uid` 创建会话窗口时用户登录系统并退出登录。 如果在5分钟内没有活动，窗口将自动关闭。

### dedup

`dedup(stream, column1 [,otherColumns..] [liveInSecond,limit]) [liveInSecond,limit]) [liveInSecond,limit])`

在给定的数据流中使用指定的列 (s) 应用反复性。 `liveInSecond` specifies how long the keys will be kept in the memory/state. 默认永远存在。 But if you only want to avoid duplicating within a certain time period, say 2 minutes, you can set `120s`, e.g. `dedup(subquery,myId,120s)`

最后一个参数 `限制` 是可选的，默认是 `100 000`。 它限制在查询引擎中最大唯一密钥。 如果达到限制，系统将回收最早的密钥以保持这一限制。

您可以将此表函数级，例如 `tumble(table...)` 并且到目前为止，包装顺序必须在这个序列中：tumble/hop/session -> dep-> 表。

### lag

`lag(<column_name> [, <offset=1>] [, <default_value>])`: 同时用于流式查询和历史查询。 如果您省略了 `offset` ，最后一行将被比较。 例如：

`lag(总计)` 以获得最后一行的 `总计` 的值。 `lag(总计, 12)` 以获得12行前的值。 `lag(total, 0)` 如果指定行不可用则使用0作为默认值。



### lags

`lags(<column_name>, begin_offset, end_offset [, <default_value>])` similar to `lag` function but can get a list of values. 例如: `lags(total,1,3)` 将返回一个数组, 最后1, 最后2和最后3个值。

### latest

`latest(<column_name>)` gets the latest value for a specific column, working with streaming aggregation with group by.

### earliest

`earliest(<column_name>)` gets the earliest value for a specific column, working with streaming aggregation with group by.

### now

`now()`

显示当前日期时间，例如2022-01-28 05:08:16

当now()用在流式SQL,无论是 `SELECT` 或 `WHERE` 或 `tumble/hop` 窗口, 他想反应运行时的时间。

### now64

类似于 `now ()` 但有额外毫秒信息，例如2022-01-28 05:08:22.680

It can be also used in streaming queries to show the latest datetime with milliseconds.

### emit_version

`emit_version()` 以显示流查询结果的每个发射的自动增加数字。 它只适用于流聚合，而不是尾部或过滤器。

例如，如果运行 `select emit_version(),count(*) from car_live_data` 查询将每2秒发布结果，而第一个结果将是emit_version=0。 emit_version=1的第二个结果。 当每个发射结果中有多行时，此函数特别有用。 例如，您可以运行一个tumble窗口聚集时加group by。 相同聚合窗口的所有结果将在相同的 emit_version。 然后您可以在同一聚合窗口中显示所有行的图表。

