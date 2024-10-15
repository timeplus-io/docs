

# Type Conversion

### to_time

`to_time(time_string [, default_time_zone] [,defaultValue])` to convert the string to a datetime64 value

For example `to_time('1/2/22')` or `to_time('1/2/22','America/New_York')`

Some of the common time zones are:

* `UTC`: same as `GMT`(Greenwich Mean Time)
* `EST`: US Eastern Time
* `MST`: US Mountain Time
* `PST8PDT`: US Pacific Time
* `America/New_York`: same as `EST`
* `America/Los_Angeles`: same as `PST8PDT`
* `America/Vancouver`: same as `PST8PDT`
* `Asia/Shanghai`: same as `PRC`

For the full list of possible time zones, please check the "TZ database name" column in [the wikipedia page](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

You can also convert the time between time zones via [to_timezone](/functions_for_datetime#to_timezone)

It can parse string `2023-09-19 05:31:34` or `2023-09-19T05:31:34Z`.

This function is the alias to `parse_datetime_best_effort`.

### to_int

`to_int(string)` Convert a string to an integer.

### to_float

`to_float(string)` Convert a string to a float number, e.g. `to_float('3.1415926')`

### to_decimal

`to_decimal(number_or_string, scale)`

For example `to_decimal('3.1415926',2)` to get 3.14

### to_string

Convert any data type to a string, so that you can do other string operations, such as [concat](/functions_for_text#concat)

### to_bool

Convert the value to a `bool` type. e.g. `select to_bool(1), to_bool(true),to_bool(True),to_bool('true')` all return `true`. Please note you cannot run `to_bool('True')`


### cast

Convert an input value to the specified data type. Three syntax variants are supported:

* `cast(x, T)`
* `cast(x as t)`
* `x::t`

While

- x — A value to convert. Can be of any type.
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

### to_type_name

`to_type_name(x)` to show the type name of the argument `x`. This is mainly for troubleshooting purposes to understand the date type for a  function call.
