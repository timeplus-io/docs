# Process Date and Time

### year

`year(date)` returns the year, for example `year(today())` will return the current year.

### quarter

`quarter(date)` returns the quarter, for example `quarter(today())` will be `1` if it's currently in Q1.

### month

`month(date)` returns the month, for example `month(today())` will be `2` if it's currently Feb.

### day

`day(date)` returns the day in the month.

### day_of_year

`day_of_year(date)` returns the number of the day of the year (1-365, or 1-366 in a leap year).

### day_of_week

`day_of_week(date)` returns the day of the week. eg. Monday is 1, Sunday is 7.

### hour

`hour(datetime)` returns the hour of the datetime.

### minute

`minute(datetime)` returns the minute of the datetime.

### second

`second(datetime)` returns the second of the datetime.

### to_unix_timestamp

Returns the UNIX timestamp of the datetime, a number in `uint32`

For example `to_unix_timestamp(now())` returns `1644272032`

### to_unix_timestamp64_milli

Returns the UNIX timestamp with millisecond of the datetime64, a number in `int64`

For example `to_unix_timestamp64_milli(now64())` returns `1712982826540`

### to_unix_timestamp64_micro

Returns the UNIX timestamp with microsecond of the datetime64, a number in `int64`

For example `to_unix_timestamp64_micro(now64(9))` returns `1712982905267202`

### to_unix_timestamp64_nano

Returns the UNIX timestamp with nanosecond of the datetime64, a number in `int64`

For example `to_unix_timestamp64_nano(now64(9))` returns `1712983042242306000`

### to_start_of_year

`to_start_of_year(date)` rounds down a date or date with time to the first day of the year. Returns the date.

### to_start_of_quarter

`to_start_of_quarter(date)` rounds down a date or date with time to the first day of the quarter. Returns the date.

### to_start_of_month

`to_start_of_month(date)` rounds down a date or date with time to the first day of the month. Returns the date.

### to_start_of_week

`to_start_of_week(date)` rounds down a date or date with time to the first day of the week. Returns the date.

### to_start_of_day

`to_start_of_day(date)` rounds down a date with time to the start of the day.

### to_start_of_hour

`to_start_of_hour(datetime)` rounds down a date or date with time to the start of the hour.

### to_start_of_minute

`to_start_of_minute(datetime)` rounds down a date or date with time to the start of the minute.

### to_start_of_second

`to_start_of_second(datetime64)` rounds down a date or date with time to the start of the second.

Unlike other `to_start_of_` functions, this function expects a datetime with millisecond, such as `to_start_of_second(now64())`

### to_date

`to_date(string)` converts a date string to a date type, e.g. `to_date('1953-11-02')`

It can parse string `2023-09-19 05:31:34` but not `2023-09-19T05:31:34Z`. Please use [to_time](#to_time) function.

### to_datetime

`to_datetime(value)` converts the value to a datetime type, e.g. `to_datetime(1655265661)` or `to_datetime(today())`

It can parse string `2023-09-19 05:31:34` but not `2023-09-19T05:31:34Z`. Please use [to_time](#to_time) function.

### to_time

Please refer to [to_time](functions_for_type#to_time)

### today

`today()` returns the current date.

### to_YYYYMM

`to_YYYYMM(date)` returns a number. For example `to_YYYYMM(today())` will return the number `202202`

### to_YYYYMMDD

`to_YYYYMMDD(date)` returns a number.

### to_YYYYMMDDhhmmss

`to_YYYYMMDDhhmmss(date)` returns a number.

### to_timezone

`to_timezone(datetime_in_a_timezone,target_timezone)` converts the datetime from one timezone to the other.

For the full list of possible timezones, please check "TZ database name" column in [the wikipedia page](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). For the most common timezones, please check [to_time](#to_time)

For example,

```sql
SELECT
  to_time('2022-05-16', 'America/New_York') AS t1, to_timezone(t1, 'UTC') AS t2
```

Output:

| t1                      | t2                      |
| ----------------------- | ----------------------- |
| 2022-05-16 00:00:00.000 | 2022-05-16 04:00:00.000 |

### format_datetime

`format_datetime(time,format,timezone)` formats the datetime as a string. The 3rd argument is optional. The following placeholders are supported

| Placeholder | Description                                        | Output String |
| ----------- | -------------------------------------------------- | ------------- |
| %Y          | Year with 4 digits                                 | 2022          |
| %y          | Year with 2 digits                                 | 22            |
| %m          | Month with 2 digits                                | 01            |
| %d          | Day with 2 digits                                  | 02            |
| %F          | short YYYY-MM-DD date, equivalent to %Y-%m-%d      | 2022-01-02    |
| %D          | short MM/DD/YY date, equivalent to %m/%d/%y        | 01/02/22      |
| %H          | Hour with 2 digits (00-23)                         | 13            |
| %M          | Minute with 2 digits (00-59)                       | 44            |
| %S          | Second with 2 digits (00-59)                       | 44            |
| %w          | Weekday as a decimal number with Sunday as 0 (0-6) | 1             |

### parse_datetime

Coverts a string to a datetime. This function is the opposite operation of function [format_datetime](#format_datetime).

`parse_datetime(str, format [,timezone])`. For example `select parse_datetime('2021-01-04+23:00:00', '%Y-%m-%d+%H:%i:%s')` returns '2021-01-04 23:00:00'.

### parse_datetime_in_joda_syntax

Similar to [parse_datetime](#parse_datetime), except that the format string is in [Joda](https://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html) instead of MySQL syntax.

`parse_datetime_in_joda_syntax(str, format [,timezone])`. For example `select parse_datetime_in_joda_syntax('2023-02-24 14:53:31', 'yyyy-MM-dd HH:mm:ss')` returns '2023-02-24 14:53:31'.

### date_diff

`date_diff(unit,begin,end)` calculates the difference between `begin` and `end` and produce a number in `unit`. For example `date_diff('second',window_start,window_end)`

Supported unit:

- us: for microseconds. 1 second = 1,000,000 us
- ms: for milliseconds. 1 second = 1,000 ms
- s: for seconds
- m: for minutes
- h: for hours
- d: for days

### date_diff_within

`date_diff_within(timegap,time1, time2)` returns true or false. This function only works in [stream-to-stream join](query-syntax#stream_stream_join). Check whether the gap between `time1` and `time2` are within the specific range. For example `date_diff_within(10s,payment.time,notification.time)` to check whether the payment time and notification time are within 10 seconds or less.

### date_trunc

`date_trunc(unit, value[, timezone])` truncates date and time data to the specified part of date. For example, `date_trunc('month',now())` returns the datetime at the beginning of the current month. Possible unit values are:

- year
- quarter
- month
- day
- hour
- minute
- second

### date_add

It supports both `date_add(unit, value, date)` and a shortcut solution `data_add(date,timeExpression)`

- `date_add(HOUR, 2, now())` will get a new datetime in 2 hours, while `date_add(HOUR, -2, now())` will get a new datetime 2 hours back.
- `date_add(now(),2h)` and `date_add(now(),-2h)` also work

### date_sub

It supports both `date_sub(unit, value, date)` and a shortcut solution `data_sub(date,timeExpression)`

- `date_sub(HOUR, 2, now())` will get a new datetime 2 hours back
- `date_sub(now(),2h)` also work

### earliest_timestamp

`earliest_timestamp()` returns `"1970-1-1 00:00:00"`

### earliest_ts

`earliest_ts()` is a shortcut for `earliest_timestamp()`
