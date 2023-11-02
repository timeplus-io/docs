# 随机数据生成

你可以使用以下函数在Timeplus中生成随机数据。

## 数字

### rand

`rand()`或`rand32()`

生成一个随机的uint32数字。

### rand64

`rand64()`

生成一个随机的uint64数字。

## 字符串

### random_printable_ascii

`random_printable_ascii(length)`

生成包含一组ASCII随机字符的字符串。 所有字符均可打印。

### random_string

`random_string(length)`

生成填充随机字节（包括零字节）指定长度的字符串。 不是所有字符都能打印。

### random_fixed_string

`random_fixed_string(length)`

生成填充随机字节（包括零字节）指定长度的二进制字符串。 不是所有字符都能打印。

## Any date type, any logic

Timeplus also provides a `random_in_type` function to generate random value in any data type, with any custom logic.

### random_in_type

This function takes at least 1 parameter, can be 2, can be 3.

Syntax:

`random_in_type(datatype [,max_value] [,generator_lambda])`

When there is only one parameter specific, it generates a random value in that type, such as

* `random_in_type('int')` returns a random int.
* `random_in_type('uint')` returns a random uint(unsigned integer, positive number)
* `random_in_type('string')` returns a random string
* `random_in_type('date')` returns a random date

You can set the 2nd parameter as the max value, as large as UINT64_MAX. Then the function will generate a random value in that type, smaller than the 2nd parameter, such as

* `random_in_type('int',3)` returns a random int, either 0, 1, or 2.
* `random_in_type('date',30)` returns a random date since 1970-01-01, no later than 1970-01-30.

The 2nd parameter can be a lambda function to customize the generation logic, such as

* `random_in_type('int',x -> to_int(2*x))` returns a random int multiply with 2

You can also specify the maximum value and lambda together, such as

* `random_in_type('date32', 3, x -> to_date('2023-9-1') + interval x day)` returns a random date since 2023-09-01, for the first 3 days.