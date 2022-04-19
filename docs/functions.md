# Functions

The following functions are supported in the SQL-like Timeplus query language. Please contact us if you need more functions.

## Type Conversion

### to_time

`to_time(time_string [, default_time_zone] [,defaultValue])` to convert the string to a DateTime64 value

For example `to_time('1/2/22')` or `to_time('1/2/22','America/New_York')`

### to_int

`to_int(string)` Convert it to an integer. 

### to_float

`to_float(string)` Convert it to a float number, e.g. `to_float('3.1415926')`

### to_decimal

`to_decimal(number_or_string, scale)`

For example `to_decimal('3.1415926',2)` to get 3.14

### to_string

Convert any data type to a string, so that you can do other string operations, such as [concat](#concat)


### cast

Convert an input value to the specified data type. Three syntax variants are supported:

* `cast(x, T)`
* `cast(x as t)`
* `x::t`

While

- x — A value to convert. May be of any type.
- T — The name of the target data type. String.
- t — The target data type

For example

```sql
select
    cast('1', 'integer'),
    cast('1' as integer),
    cast(3.1415, 'decimal(3, 2)'),
    json_extract_string('{"a":"001"}','a')::integer
```



## Access Compound Type

### length

`length(array)`

### array_concat

`array_concat(array1,array2)`

### array\[index\] {#array_element}

You can easily access any element in the array, just using arrayName[index], such as `topValues[2]` 

:::info

The first element's index is 1, instead of 0.

:::

### array_string_concat

`array_string_concat(arr[, separator])` Concatenates string representations of values listed in the array with the separator. `separator` is an optional parameter: a constant string, set to an empty string by default.

For example `array_string_concat([1,2,3],'-')` to get a string `1-2-3`

### map\[key\] {#map-key}

You can easily access any element in the map, just using mapName[keyName], such as `kv['key1']` 

### map

Create a map with a series of key and value. For example `select map('key1','a','key2','b') as m, m['key1']`

### map_cast

`map_cast(array1, array2)` to generate a map with keys from `array1` and values from `array2` (these 2 arraies should be with same size). For example `map_cast(['k1','k2'],[91,95])` will get `{'k1':91,'k2':95} ` 

Alternatively, you can use `map_cast(key1,value1,key2,value2..)`

## Process Date and Time

### year

Get current year, for example `year(today())` will be `2022`.

### quarter

Get current quarter, for example `quarter(today())` will be `1` if it's in Q1.

### month

Get current month, for example `month(today())` will be `2` if it's Feb.

### day

Get the current day in the month.

### weekday

Get the current day in the week. Monday is 1. Sunday is 7.

### hour

### minute

### second

### to_unix_timestamp

For example `to_unix_timestamp(now())` gets `1644272032`

### to_start_of_year

### to_start_of_quarter



### to_start_of_month

### to_start_of_day

### to_start_of_hour

### to_start_of_minute

### to_start_of_second

Unlike other `to_start_of_` functions, this function expects a datetime with millisecond, such as `to_start_of_second(now64())`

### to_date

`to_date(string)` convert a date string to a datetime type, e.g. `to_date('1953-11-02')`

### today

`today()`

### to_YYYYMM

`to_YYYYMM(date)`

Get a number. For example `to_YYYYMM(today())` will get the number `202202`

### to_YYYYMMDD

`to_YYYYMMDD(date)`

Get a number.

### to_YYYYMMDDhhmmss

`to_YYYYMMDDhhmmss(date)`

Get a number.

### format_datetime

`format_datetime(time,format,timezone)`

Format the datetime as a string. The 3rd argument is optional. The following placeholders are supported

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



### date_diff

`date_diff(unit,begin,end)`

Calculate the difference between `begin` and `end` and produce a number in `unit`. For example `date_diff('second',window_start,window_end)`



### date_trunc

`date_trunc(unit, value[, timezone])`Truncates date and time data to the specified part of date. For example, `date_trunc('month',now())` to get the datetime at the beginning of the current month. Possible unit values are:

* year
* quarter
* month
* day
* hour
* minute
* second

### date_add

It supports both `date_add(unit, value, date)` and a shortcut solution `data_add(date,timeExpression)`

*  `date_add(HOUR, 2, now())` will get a new DateTime in 2 hours, while `date_add(HOUR, -2, now())` will get a new DateTime 2 hours back.
* `date_add(now(),2h)` and `date_add(now(),-2h)` also work

### date_sub

It supports both `date_sub(unit, value, date)` and a shortcut solution `data_sub(date,timeExpression)`

*  `date_sub(HOUR, 2, now())` will get a new DateTime 2 hours back
* `date_sub(now(),2h)`  also work

## Process JSON

### json_extract_int

`json_extract_int(json, key)` to get the integer value from the specified JSON document and key. For example `json_extract_int('{"a":10,"b":3.13}','a')` will get the number `10`

### json_extract_float

`json_extract_float(json, key)` to get the float value from the specified JSON document and key. For example `json_extract_int('{"a":10,"b":3.13}','b')` will get the float value `3.13`

### json_extract_bool

`json_extract_bool(json, key)` to get the boolean value from the specified JSON document and key. For example `json_extract_bool('{"a":true}','a')` will get the boolean value `true` or `1`

### json_extract_string

`json_extract_string(json, key)`to get the string value from the specified JSON document and key. For example ` json_extract_string('{"a":true,"b":{"c":1}}','b')` will get the string value `{"c":1} ` and you can keep applying JSON functions to extract the values.

### json_extract_array

`json_extract_array(json, key)`to get the array value from the specified JSON document and key. For example ` json_extract_array('{"a": "hello", "b": [-100, 200.0, "hello"]}', 'b')` will get the array value `['-100','200','"hello"'] `

### json_has

`json_has(json, key)` to check whether specified key exists in the JSON document. For example `json_has('{"a":10,"b":20}','c')`returns 0(false).

### json_value

`json_value(json, path)` allows you to access the nested JSON objects. For example, `json_value('{"a":true,"b":{"c":1}}','$.b.c')` will return the number `1`

### json_query

`json_query(json, path)` allows you to access the nested JSON objects as JSON array or JSON object. If the value doesn't exist, an empty string will be returned. For example, `json_query('{"a":true,"b":{"c":1}}','$.b.c')` will return an array with 1 element  `[1]` In a more complex example, `json_query('{"records":[{"b":{"c":1}},{"b":{"c":2}},{"b":{"c":3}}]}','$.records[*].b.c')` will get `[1,2,3]`

## Process text

### lower

`lower(str)`

### upper

`upper(str)`

### format

`format(template,args)` For example, `format('{} {}', 'Hello', 'World')`gets `Hello World`

### concat

`concat(str1,str2 [,str3])` Combine 2 or more strings as a single string. For example, `concat('95','%')` to get 95%. Each parameter in this function need to be a string. You can use [to_string](#to_string) function to convert them, for example `concat(to_string(95),'%')`

### substr

`substr(str,idx1,idx2)`

### trim

`trim(string)`

### split_by_string

`split_by_string(sep,string)`  For example `split_by_string('b','abcbxby')`will get an array with string `['a','c','x','y']`

### match

`match(string,pattern)` determine whether the string matches the given regular expression. For example, to check whether the text contains a sensitive AWS ARN, you can run `match(text,'arn:aws:kms:us-east-1:\d{12}:key/.{36}')`

### multi_search_any

`multi_search_any(text, array)` determine whether the text contains any of string from the given array. For example, to check whether the text contains any sensitive keywords, you can run `multi_search_any(text,['password','token','secret'])`

### replace_one

`replace_one(string,pattern,replacement)`

Replace `pattern` with the 3rd argument `replacement` in `string`.

For example `replace_one('abca','a','z')` will get `zbca`

### replace

`replace(string,pattern,replacement)`

Replace `pattern` with the 3rd argument `replacement` in `string`.

For example `replace('aabc','a','z')` will get `zzbc`

### replace_regex

`replace_regex(string,pattern,replacement)`

This can be used to mask data, e.g. to hide the full phone number, you can run `replace_regex('604-123-4567','(\\d{3})-(\\d{3})-(\\d{4})','\\1-***-****')` to get `604-***-****`

### extract

Process plain text with regular expression and extract the content. For example, `extract('key1=value1, key2=value2','key1=(\\w+)')`, this will get “value1”.  If the log lines are put into a single text column, you can create a view with the extracted fields, e.g. 

```sql
create view logs as 
select extract(value, 'key1=(\\w+)') as key1,
       extract(value, 'key2=(\\w+)') as key2 
       from log_stream
```



## Logic

### if

`if(condition,yesValue,noValue)`

For example `if(1=2,'a','b')` will get `b`

### multi_if

`multi_if(condition1, then1, condition2, then2.. ,else)` An easier way to write if/self or case/when

## Aggregation

### count

`count(*)` to get the row number, or `count(col)` to get the number of rows when `col` is not `NULL`

### count_distinct

`count_distinct(col)` to get the number of unique value for the `col` column. Same as `count(distinct col)`

### distinct

`distinct(col)`to get the distinct value for the `col` column.

### unique_exact

`unique_exact(<column_name1>[, <column_name2>, ...])`Calculates the exact number of different values of the columns.

### unique

`unique(<column_name1>[, <column_name2>, ...])`: Calculates the approximate number of different values of the columns.

### min

`min(<column_name>)`: minimum value of a column. For String column, the comparison is lexicographic order. 

### max

`max(<column_name>)`: maximum value of a column. For String column, the comparison is lexicographic order.

### sum

`sum(<column_name>)`: sum of the columns. Only works for numerics.

### avg

`avg(<column_name>)`: average value of a column (sum(column) / count(column)). Only works for numeric column.

### median

Calculate median of a numeric data sample.

### top_k

`top_k(<column_name>,K [,true/false])`: Top frequent K items in column_name. Return an array.

e.g. `top_k(cid, 3)` may get `[('c01',1200),('c02,800)',('c03',700)]` if these 3 ids appear most frequently in the aggregation window.

If you don't need the event count, you can set false for the 3rd parameter, e.g. `top_k(cid, 3, false)` may get `['c01','c02','c03']` 

### min_k

`min_k(<column_name>,K [,context_column])`: The least K items in column_name. Return an array. You can also add a list of columns to get more context of the values in same row, such as `min_k(price,3,product_id,last_updated)`  This will return an array with each element as a tuple, such as `[(5.12,'c42664'),(5.12,'c42664'),(15.36,'c84068')]`

### max_k

`max_k(<column_name>,K[,context_column])`: The greatest K items in column_name. You can also add a list of columns to get more context of the values in same row, such as `max_k(price,3,product_id,last_updated)` 

### group_array

`group_array(<column_name>)` to combine the values of the specific column as an array. For example, if there are 3 rows and the values for this columns are "a","b","c". This function will generate a single row and single column with value `['a','b','c']`



## Streaming processing

### table

`table(stream)` turns the unbounded data stream as a bounded table, and query its historical data. For example, you may load the clickstream data from a Kafka topic into the `clicks` stream in Timeplus. By default, if you run `SELECT .. FROM clicks ..` This is a streaming query with unbounded data. The query will keep sending you new results whenever it's available. If you only need to analyze the past data, you can put the stream into the `table` function. Taking a `count` as an example:

* running `select count(*) from clicks` will show latest count every 2 seconds and never ends, until the query is cancelled by the user
* running `select count(*) from table(clicks)` will return immediately with the row count for the historical data for this data stream.

You can create views such as `create view histrical_view as select * from table(stream_name)`, if you want to query the data in the table mode more than once. This may work well for static data, such as lookup information(city names and their zip code).

Learn more about [Non-streaming queries](history).

### tumble

`tumble(stream [,timeCol], windowSize)`

Create a tumble window view for the data stream, for example `tumble(iot,5s)` will create windows for every 5 seconds for the data stream `iot` . The SQL must end with `group by ` with either `window_start` or `window_end` or both.

### hop

`hop(stream [,timeCol], step, windowSize)`
Create a hopping window view for the data stream, for example `hop(iot,1s,5s)` will create windows for every 5 seconds for the data stream `iot` and moving the window forwards every second. The SQL must end with `group by ` with either `window_start` or `window_end` or both.

### session

`session(stream [,timeCol], idle, keyByCol [,otherKeyByCol])`

Create dynamic windows based on the activities in the data stream. You need specify at least one `keyByCol`. If Timeplus keeps getting new events for the specific id within the `idle` time, those events will be included in the same session window. By default, the max length of the session window is 5 times of the idle time. For example, if the car keeps sending data when it's moving and stops sending data when it's parked or waiting for the traffic light, `session(car_live_data, 1m, cid)` will create session windows for each car with 1 minute idle time. Meaning if the car is not moved within one minute, the window will be closed and a new session window will be created for future events. If the car keeps moving for more than 5 minutes, different windows will be created (every 5 minutes), so that as analysts, you can get near real-time results, without waiting too long for the car to be stopped.

### lag

`lag(<column_name> [, <offset=1>[, <default_value>])`: Work for both streaming query and historical query. If you omit the `offset` the last row will be compared.

### latest

`latest(<column_name>)` get the latest value for specific column, working with streaming aggregation with group by.

### earliest

`earliest(<column_name>)` get the earliest value for specific column, working with streaming aggregation with group by.

### now

`now()`

Show the current date time, such as 2022-01-28 05:08:16

If the now() is used in a streaming query, no matter `SELECT` or `WHERE` or `tumble/hop` window, it will reflect the current time when the row is projected.

### now64

Similar to `now()` but with extra millisecond information, such as 2022-01-28 05:08:22.680

It can be also used in streaming query to show latest datetime with millisecond.

