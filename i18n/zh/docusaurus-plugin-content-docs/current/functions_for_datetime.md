# 处理日期和时间

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

`to_date(string)` 将日期字符串转换为日期类型，例如 `to_date('1953-11-02')`

### to_datetime

`to_datetime(value)` 将值转换为日期时间类型，例如 `to_datetime(1655265661)` 或 `to_datetime(today())`

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

`format_datetime(time,format,timezone)`

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

计算 `begin` 和 `end` 的差值并在 `unit` 中产生一个数字。 例如： `date_diff('second',window_start,window_end)`

### date_diff_within

`date_diff_within(timegap,time1,time2)`

返回 true 或 false。  此函数只能在 [stream-to-stream join](query-syntax#stream_stream_join) 使用。 检查 `time1` 和 `time2` 之间的差距是否在特定范围内。 例如 `date_diff_within(10s,payment.time,notification.time)` 来检查付款时间和通知时间是否在10秒或更短。

### date_trunc

`date_trunc(funit), value[, timezone])`将日期和时间数据截断到日期的指定部分。 例如， `date_trunc('month',now())` 获取当前月初的日期时间。 可能的单位值为：

* 年
* 季度
* 月
* 天
* 小时
* 分钟
* 秒

### date_add

它支持 `date_add(unit, value, date)` 和快捷解决 `data_add(date,timeExpression)`

*  `date_add(HOUR, 2, now())` 将在 2 小时内获得一个新的日期时间。 `date_add(HOUR, -2, now())` 将得到一个新的日期时间 2 小时后退。
*  `date_add(now(),2h)` 和 `date_add(now(),-2h)` 也工作

### date_sub

它支持 `date_sub(unit, value, date)` 和快捷解决 `data_sub(date,timeExpression)`

*  `date_sub(HOUR, 2, now())` 将获得一个新的日期时间 2 小时
*  `date_sub(now(),2h)`  也工作

### earliest_timestamp

`earest_timestamp()` 返回 `"1970-1-1 00:00:00"`

### earliest_ts

`earliest_ts()` 是 `earliest_timestamp()` 的简写方式