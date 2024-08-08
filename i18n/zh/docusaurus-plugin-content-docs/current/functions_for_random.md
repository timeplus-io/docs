# 随机数据生成

你可以使用以下函数在Timeplus中生成随机数据。

## 数字

### rand

`rand()`或`rand32()`

生成一个随机的uint32数字。

### rand64

`rand64()`

生成一个随机的uint64数字。

### rand_uniform

`rand_uniform(min, max)`

Generates a random `float64` drawn uniformly from interval [min, max].

### rand_normal

`rand_normal(mean, variance)`

Generates a random `float64` drawn uniformly from a [normal distribution])(https://en.wikipedia.org/wiki/Normal_distribution).

### rand_log_normal

`rand_log_normal(mean, variance)`

Generates a random `float64` drawn uniformly from a [log-normal distribution])(https://en.wikipedia.org/wiki/Log-normal_distribution).

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

## 任何日期类型，任何逻辑

Timeplus还提供了`random_in_type`函数，用于使用任何自定义逻辑生成任何数据类型的随机值。

### random_in_type

此函数至少需要1个参数，可以是 2，可以是 3。

语法：

`random_in_type(datatype [,max_value] [,generator_lambda])`

当只有一个特定参数时，它会生成该类型的随机值，例如：

* `random_in_type('int')`返回一个随机整数。
* `random_in_type ('uint')`返回一个随机的uint（无符号整数，正数）。
* `random_in_type('string')`返回一个随机的字符串。
* `random_in_type('date')`返回一个随机日期。
* `random_in_type ('decimal32 (3) ')` 返回随机十进制
* `random_in_type ('uuid')` 返回一个随机的 uuid
* `random_in_type ('ipv4')` 返回随机的 ipv4
* `random_in_type ('ipv6')` 返回随机 ipv6

你可以将第二个参数设置为最大值，可以和UINT64_MAX一样大。 然后，该函数将生成该类型的随机值，该值小于第二个参数，例如：

* `random_in_type('int',3)`返回一个随机整数，可以是0，1，2。
* `random_in_type('date',30)`返回一个随机日期，日期区间在1970-01-01至1970-01-30。

第二个参数可以是用于自定义生成逻辑的lambda 函数，例如：

* `random_in_type('int',x -> to_int(2*x))`返回一个随机整数并乘以2。

你也可以同时指定最大值和lambda ，例如：

* `random_in_type('date32', 3, x -> to_date('2023-9-1') + interval x day)`返回自2023-09-01以来的前3天的随机日期。

## Generate multiple rows
You can combine random functions with `numbers` table function to generate data with multiple columns and multiple rows.

### numbers

`numbers(N)` – Returns a table with the single `number` column (uint64) that contains integers from 0 to N-1. `numbers(N, M)` - Returns a table with the single `number` column (uint64) that contains integers from N to (N + M - 1).

Similar to the `system.numbers` table, it can be used for testing and generating successive values, `numbers(N, M)` more efficient than `system.numbers`.

The following queries are equivalent:

``` sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

And the following queries are equivalent:

``` sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
```

示例：

``` sql
-- Generate a sequence of dates from 2010-01-01 to 2010-12-31
select to_date('2010-01-01') + number as d FROM numbers(365);
```
