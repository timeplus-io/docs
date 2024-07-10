# Random Data Generation

You can use the following functions to generate random data in Timeplus.

## Numbers

### rand

`rand()` or `rand32()`

Generates a random uint32 number.

### rand64

`rand64()`

Generates a random uint64 number.

### rand_uniform

`rand_uniform(min, max)`

Generates a random `float64` drawn uniformly from interval [min, max].

### rand_normal

`rand_normal(mean, variance)`

Generates a random `float64` drawn uniformly from a [normal distribution])(https://en.wikipedia.org/wiki/Normal_distribution).

### rand_log_normal

`rand_log_normal(mean, variance)`

Generates a random `float64` drawn uniformly from a [log-normal distribution])(https://en.wikipedia.org/wiki/Log-normal_distribution).

## Strings

### random_printable_ascii

`random_printable_ascii(length)`

Generates a string with a random set of ASCII characters. All characters are printable.

### random_string

`random_string(length)`

Generates a string of the specified length filled with random bytes (including zero bytes). Not all characters may be printable.

### random_fixed_string

`random_fixed_string(length)`

Generates a binary string of the specified length filled with random bytes (including zero bytes). Not all characters may be printable.

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
* `random_in_type('decimal32(3)')` returns a random decimal
* `random_in_type('uuid')` returns a random uuid
* `random_in_type('ipv4')` returns a random ipv4
* `random_in_type('ipv6')` returns a random ipv6

You can set the 2nd parameter as the max value, as large as UINT64_MAX. Then the function will generate a random value in that type, smaller than the 2nd parameter, such as

* `random_in_type('int',3)` returns a random int, either 0, 1, or 2.
* `random_in_type('date',30)` returns a random date since 1970-01-01, no later than 1970-01-30.

The 2nd parameter can be a lambda function to customize the generation logic, such as

* `random_in_type('int',x -> to_int(2*x))` returns a random int multiply with 2

You can also specify the maximum value and lambda together, such as

* `random_in_type('date32', 3, x -> to_date('2023-9-1') + interval x day)` returns a random date since 2023-09-01, for the first 3 days.

## Generate multiple rows
You can combine random functions with `numbers` table function to generate data with multiple columns and multiple rows.

### numbers

`numbers(N)` – Returns a table with the single `number` column (uint64) that contains integers from 0 to N-1.
`numbers(N, M)` - Returns a table with the single `number` column (uint64) that contains integers from N to (N + M - 1).

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

Examples:

``` sql
-- Generate a sequence of dates from 2010-01-01 to 2010-12-31
select to_date('2010-01-01') + number as d FROM numbers(365);
```
