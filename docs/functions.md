# Functions

The following functions are supported in the SQL-like Timeplus query language. Please contact us if you need more functions.

## Type Conversion

### to_time

`to_time(time_string [, default_time_zone] [,defaultValue])` to convert the string to a datetime64 value

For example `to_time('1/2/22')` or `to_time('1/2/22','America/New_York')`

For the full list of possible timezones, please check "TZ database name" column in [the wikipedia page](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

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



## Access Compound Type {#arrays}

### array_cast

`array_cast(element1,element2,..)` create a new array with the given elements, e.g. `array_cast(1,2)` will get `[1,2]` Please note, the elements should be in the same type, such as `array_cast('a','n')`, not `array_cast('a',0)`

### length

`length(array)`

### array\[index\] {#array_element}

You can easily access any element in the array, just using arrayName[index], such as `topValues[2]` 

:::info

The first element's index is 1, instead of 0.

:::



### array_compact

`array_compact(arr)` Removes consecutive duplicate elements from an array, e.g. `array_compact([1,1,2,2,2,3,4,4,5])`returns [1,2,3,4,5]

### array_concat

`array_concat(array1,array2)` Concatenates two arrays into one.

### array_difference

`array_difference(arr)` calculates the difference between adjacent array elements. Returns an array where the first element will be 0, the second is the difference between `a[1] - a[0]`, etc.  e.g. `array_difference([1,2,3,5])`returns [0,1,1,2]

### array_distinct

`array_distinct(arr)` returns an array containing the distinct elements only. e.g. `array_distinct([1,1,2,3,3,1])`return [1,2,3], while `array_compact([1,1,2,3,3,1])`returns [1,2,3,1]



### array_flatten

`array_flatten(array1, array2,..)`Converts an array of arrays to a flat array. e.g. `array_flatten([[[1]], [[2], [3]]])` returns [1,2,3]

### array_string_concat

`array_string_concat(arr[, separator])` Concatenates string representations of values listed in the array with the separator. `separator` is an optional parameter: a constant string, set to an empty string by default.

For example `array_string_concat([1,2,3],'-')` to get a string `1-2-3`

### array_join

`array_join(an_array)` This is a special function. `group_array(col)` to group the column value from multiple rows to a single value in a row. `array_join` does the opposite: it can convert one row with an array value to multiple rows.

For example `select array_join([10,20]) as v, 'text' as t` will get 2 rows

| v    | t    |
| ---- | ---- |
| 10   | text |
| 20   | text |

### array_pop_back

`array_pop_back(array)` removes the last item from the array. e.g. `array_pop_back([1,2,3])` returns [1,2]

### array_pop_front

`array_pop_front(array)` removes the first item from the array. e.g. `array_pop_front([1,2,3])` returns [2,3]

### array_push_back

`array_push_back(array, value)` add the value to the array as the last item. e.g. `array_push_back([1,2,3],4)` returns [1,2,3,4]

### array_push_front

`array_push_front(array, value)` add the value to the array as the first item. e.g. `array_push_front([1,2,3],4)` returns [4,1,2,3]



### array_product

`array_product(array)` multiplies elements in the array. e.g. `array_product([2,3,4])` returns 24 (2 x 3 x 4)



### array_resize

`array_resize(array, size [,extender])` changes the length of the array. If `size`is smaller than the current length of the array, the array is truncated. Otherwise, a new array with the specified size is created, filling value with the specified `extender`. e.g. `array_resize([3,4],1)` returns [3]. `array_resize([3,4],4,5)`returns [3,4,5,5]



### array_reverse

`array_reverse(arr)` returns an array with the reversed order of the original array, e.g. `array_reverse([1,2,3])` returns [3,2,1]



### array_slice

`array_slice(arr, offset [,length])` returns a slice of the array. If `length` is not specified, then slice to the end of the array, e.g. `array_slice([1,2,3,4,5],2)` returns [2,3,4,5]. If `offset` is greater than the array lenghth, returns an empty array []. If `length` is specfied, this is the lenght of new array, e.g. `array_slice([1,2,3,4,5],2,3)` returns [2,3,4]



### array_uniq

`array_uniq(arr)` returns the number of unique values in the array, e.g. `array_uniq([1,1,2,3])` returns 3



### array_zip

`array_zip(arr1,arr2,.. arrN)` group elements from different arreries to a new array into tuples. e.g. `array_zip([1,2,3],['a','b','c'])` returns [(1,'a'),(2,'b'),(3,'c')]

### array_all

`array_all([func,] array)` returns 1(true) or 0(false) if all elements in the array meet the condition. For example, `array_all([1,2])` return 1, and `array_all([0,0])`return 0. You can pass a lambda function to it as the first argument to customize the condition check, such as `array_all(x->x%2==0,[2,4,6])` to check whether each element in the array is even. It returns 1.

### array_avg

`array_avg([func,] array)` returns the average value in the array. For example, `array_avg([2,6])` return 4. You can pass a lambda function to it as the first argument to apply on each element before calculating the average, such as `array_avg(x->x*x,[2,6])` to get the average for 2*2 and 6\*6, which is 20.

### array_count

`array_count([func,] array)` returns the number of elements in the array meeting the condition. By default, check whether the value is not 0. e.g. `array_count([0,0,1,2])` returns 2. You can pass a lambda function to it as the first argument to apply on each element before calculating the count, such as `array_count(x->x>1,[1,2])` to get the number of numbers which is greater than 1, it returns 1.

### array_cum_sum

`array_cum_sum([func,] array)` returns an array of partial sums of elements in the source array (a running sum). e.g. `array_cum_sum([1,1,1])` returns [1,2,3]. You can pass a lambda function to it as the first argument to apply on each element before calculating the moving sum, such as `array_cum_sum(x->x*x,[1,2])` to get [1,5]

### array_exists

`array_exists([func,] array)` returns 1(true) or 0(false) if any element in the array meet the condition. For example, `array_exists([0,1,2])` return 1, and `array_exists([0,0])`return 0. You can pass a lambda function to it as the first argument to customize the condition check, such as `array_exists(x->x%2==0,[2,3,4])` to check whether any element in the array is even. It returns 1. To check whether all elements meet the condition, use `array_all`

### array_filter

`array_filter(func, array)` returns an array containing only the element that matches the condition of the specified function. e.g. `array_filter(x->x%2==0, [1,2,3,4])`returns [2,4]

### array_first

`array_first(func, array)` returns the first element that matches the condition of the specified function. e.g. `array_first(x->x%2==0, [1,2,3,4])`returns 2.

### array_first_index

`array_first_index(func, array)` returns the index of the first element that matches the condition of the specified function. e.g. `array_first_index(x->x%2==0, [1,2,3,4])`returns 2.

### array_last

`array_last(func, array)` returns the last element that matches the condition of the specified function. e.g. `array_last(x->x%2==0, [1,2,3,4])`returns 4.  If nothing found, return 0.

### array_last_index

`array_last_index(func, array)` returns the index of the last element that matches the condition of the specified function. e.g. `array_last_index(x->x%2==0, [1,2,3,4])`returns 4. If nothing found, return 0.

### array_map

`array_map(func, array)` apply the function to every element in the array and returns a new array. e.g. `array_map(x->x*x,[1,2])`returns [1,4]

### array_max

`array_max(func, array)` apply the function to every element in the array and then returns the maximum value e.g. `array_max(x->x*x,[1,2])`returns 4

### array_min

`array_min(func, array)` apply the function to every element in the array and then returns the minimum value e.g. `array_min(x->x*x,[1,2])`returns 1

### array_sort

`array_sort(func, array)` sorts the array elements in asecending order. e.g. `array_sort([3,2,5,4])` returns [2,3,4,5]. You can pass a lambda function to it as the first argument to apply the function before the sort, e.g. `array_sort(x->-x,[3,2,5,4])`returns [5,4,3,2]



### array_sum

`array_sum([func,] array)` returns the sum value in the array. For example, `array_sum([2,6])` return 8. You can pass a lambda function to it as the first argument to apply on each element before calculating the sum, such as `array_sum(x->x*x,[2,6])` to get the sum for 2*2 and 6\*6, which is 40.



### map\[key\] {#map-key}

You can easily access any element in the map, just using mapName[keyName], such as `kv['key1']` 

### map_cast

`map_cast(array1, array2)` to generate a map with keys from `array1` and values from `array2` (these 2 arrays should be with same size). For example `map_cast(['k1','k2'],[91,95])` will get `{'k1':91,'k2':95} ` 

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

### to_timezone

`to_timezone(datetime_in_a_timezone,target_timezone)` Convert the datetime from one timezone to the other.

For the full list of possible timezones, please check "TZ database name" column in [the wikipedia page](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

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

### date_diff_within

`date_diff_within(timegap,time1, time2)`

Return true or false.  This function only works in [stream-to-stream join](query-syntax#stream_stream_join). Check whether the gap between `time1` and `time2` are within the specific range. For example `date_diff_within(10s,payment.time,notification.time)` to check whether the payment time and notification time are within 10 seconds or less.

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

*  `date_add(HOUR, 2, now())` will get a new datetime in 2 hours, while `date_add(HOUR, -2, now())` will get a new datetime 2 hours back.
* `date_add(now(),2h)` and `date_add(now(),-2h)` also work

### date_sub

It supports both `date_sub(unit, value, date)` and a shortcut solution `data_sub(date,timeExpression)`

*  `date_sub(HOUR, 2, now())` will get a new datetime 2 hours back
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

### is_valid_json

`is_valid_json(str)` to check whether the given string is a valid JSON or not. Return true(1) or false(0)

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



### quantile

`quantile(column,level)`Calculate an approximate quantile of a numeric data sequence. e.g. `quantile(a,0.9)`to get the P90 for the column and `quantile(a,0.5)` to get the [median](functions#median) number

### p90

short for `quantile(a,0.9)`

### p95

short for `quantile(a,0.95)`

### p99

short for `quantile(a,0.99)`

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

### moving_sum

`moving_sum(column)` returns an array with the moving sum of the specified column. For example, `select moving_sum(a) from(select 1 as a union select 2 as a union select 3 as a)` will return [1,3,6]



## Math

### abs

`abs(value)` returns the absolute value of the number. If the a<0, then return -a.

### e

`e()` returns a `float` number that is close to the number `e`



### pi

`pi()` returns a `float` number that is close to the number `π`



### exp

`exp(x)` returns a `float` number that is close to the exponent of the argument `x`



### log

`log(x)`  returns a `float` number that is close to the natural logarithm of the argument `x`



### exp2

`exp2(x)` returns a `float` number that is close to 2 to the power of `x`



### log2

`log2(x)` returns a `float` number that is close to the binary logarithm of the argument `x`



### exp10

`exp10(x)` returns a `float` number that is close to 10 to the power of `x`



### log10

`log10(x)` returns a `float` number that is close to the decimal logarithm of the argument `x`



### sqrt

`sqrt(x) `returns a `float` number that is close to the square root of the argument `x`



### cbrt

`cbrt(x)` returns a `float` number that is close to the cubic root of the argument `x`

<!--

### lgamma

`lgamma(x)` the logarithm of the gamma function



### tgamma

`tgamma(x)`the gamma function

-->

### sin

`sin(x)` the sine



### cos

`cos(x)` the cosine



### tan

`tan(x)` the tangent



### asin

`asin(x)` the arc sine



### acos

`acos(x)` the arc cosine

### atan

`atan(x)` the arc tangent



### pow

`pow(x,y)` returns a `float` number that is close to  `x` to the power of `y`



### power

`power(x,y)`  returns a `float` number that is close to  `x` to the power of `y`



### sign

`sign(x)` returns the sign of the number `x`. If x<0, return -1. If x>0, return 1. Otherwise, return 0.



### degrees

`degrees(x)` converts the input value in radians to degrees. E.g. `degress(3.14)` returns 180.

### radians

`radians(x)` converts the input value in degrees to radians . E.g. `radians(180)` returns 3.14.

## Financial

### xirr

Calculates the internal rate of return of an investment based on a specified series of potentially irregularly spaced cash flows.

`xirr(cashflow_column,date_column [, rate_guess])`

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

### dedup

`dedup(stream, column1 [,otherColumns..] [,limit])`

Apply the deduplication at the given data stream with the specified column(s). The last parameter `limit` is optional which is `100000` by default. It limits the max unique keys maintained in the query engine. If the limit reaches, the system will recycle the earliest keys to maintain this limit.

You can cascade this table function like `tumble(dedup(table(....` and so far the wrapping order must in this sequence : tumble/hop/session -> dedup -> table.

### lag

`lag(<column_name> [, <offset=1>][, <default_value>])`: Work for both streaming query and historical query. If you omit the `offset` the last row will be compared. E.g.

`lag(total)` to get the value of `total` from the last row. `lag(total, 12)` to get the value from 12 rows ago. `lag(total, 12, 0)` to use 0 as the default value if the specified row is not available.

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

### emit_version

`emit_version()` to show an auto-increasing number for each emit of streaming query result. It only works with streaming aggregation, not tail or filter. 

For example, if you run `select emit_version(),count(*) from car_live_data` the query will emit results every 2 seconds and the first result will be with emit_version=0, the second result with emit_version=1. This function is particularly helpful when there are multiple rows in each emit result. For example, you can run a tumble window aggregation with a group by. All results from the same aggregation window will be in the same emit_version. You can then show a chart with all rows in the same aggregation window.

