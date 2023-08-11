# 处理日期和时间

### year

`year(date)` returns the year, for example `year(today())` will return the current year.

### quarter

`quarter(date)` returns the quarter, for example `quarter(today())` will be `1` if it's currently in Q1.

### month

`month(date)` returns the month, for example `month(today())` will be `2` if it's currently Feb.

### day

`day(date)` returns the day in the month.

### weekday

`weekday(date)` returns the day of the week. eg. Monday is 1, Sunday is 7.

### day_of_year

`day_of_year(date)` returns the number of the day of the year (1-365, or 1-366 in a leap year).

### hour

`hour(datetime)` returns the hour of the datetime.

### minute

`minute(datetime)` returns the minute of the datetime.

### second

`second(datetime)` returns the second of the datetime.

### to_unix_timestamp

Returns the UNIX timestamp of the datetime, a number in `uint32`

For example `to_unix_timestamp(now())` returns `1644272032`

### to_start_of_year

`to_start_of_year(date)` rounds down a date or date with time to the first day of the year. 返回日期。

### to_start_of_quarter

`to_start_of_quarter(date)` rounds down a date or date with time to the first day of the quarter. 返回日期。

### to_start_of_month

`to_start_of_month(date)` rounds down a date or date with time to the first day of the month. 返回日期。

### to_start_of_day

`to_start_of_day(date)` rounds down a date with time to the start of the day.

### to_start_of_hour

`to_start_of_hour(datetime)` rounds down a date or date with time to the start of the hour.

### to_start_of_minute

`to_start_of_minute(datetime)` rounds down a date or date with time to the start of the minute.

### to_start_of_second

`to_start_of_second(datetime64)` rounds down a date or date with time to the start of the second.

不同于其他 `to_start_of_` 函数，这个函数需要一个有毫秒的日期时间，例如 `to_start_of_second(now64())`

### to_date

`to_date(string)` converts a date string to a date type, e.g. `to_date('1953-11-02')`

### to_datetime

`to_datetime(value)` converts the value to a datetime type, e.g. `to_datetime(1655265661)` or `to_datetime(today())`

### today

`today()` returns the current date.

### to_YYYYMM

`to_YYYYMM(date)` returns a number. For example `to_YYYYMM(today())` will return the number `202202`

### to_YYYYMMDD

`to_YYYYMMDD(date)` returns a number.

### to_YYYMMDDhmmss

`to_YYYYMMDDhhmmss(date)` returns a number.

### to_timezone

`to_timezone(datetime_in_a_timezone,target_timezone)` converts the datetime from one timezone to the other.

For the full list of possible timezones, please check "TZ database name" column in [the wikipedia page](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). For the most common timezones, please check [to_time](#to_time)

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

`format_datetime(time,format,timezone)` formats the datetime as a string. 第三个参数是可选的。 支持以下占位符

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

`date_diff(unit,begin,end)` calculates the difference between `begin` and `end` and produce a number in `unit`. 例如： `date_diff('second',window_start,window_end)`

Supported unit:

* us: for microseconds. 1 second = 1,000,000 us
* ms: for milliseconds. 1 second = 1,000 ms
* s: for seconds
* m: for minutes
* h: for hours
* d: for days

### date_diff_within

`date_diff_within(timegap,time1, time2)` returns true or false.  此函数只能在 [stream-to-stream join](query-syntax#stream_stream_join) 使用。 检查 `time1` 和 `time2` 之间的差距是否在特定范围内。 例如 `date_diff_within(10s,payment.time,notification.time)` 来检查付款时间和通知时间是否在10秒或更短。

### date_trunc

`date_trunc(unit, value[, timezone])` truncates date and time data to the specified part of date. For example, `date_trunc('month',now())` returns the datetime at the beginning of the current month. 可能的单位值为：

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

`earliest_ts()` is a shortcut for `earliest_timestamp()`
