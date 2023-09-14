# Random Data Generation

You can use the following functions to generate random data in Timeplus.

## Numbers

### rand

`rand()` or `rand32()`

Generates a random uint32 number.

### rand64

`rand64()`

Generates a random uint64 number.

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

Timeplus also provides a `unique_random` function to generate random value in any data type, with any custom logic.

### unique_random

This function takes at least 1 parameter, can be 2, can be 3.

Syntax:

`unique_random(datatype [,max_value] [,generator_lambda])`

When there is only one parameter specific, it generates a random value in that type, such as

* `unique_random('int')` returns a random int.
* `unique_random('uint')` returns a random uint(unsigned integer, positive number)
* `unique_random('string')` returns a random string
* `unique_random('date')` returns a random date

You can set the 2nd parameter as the max value, as large as UINT64_MAX. Then the function will generate a random value in that type, smaller than the 2nd parameter, such as

* `unique_random('int',3)` returns a random int, either 0, 1, or 2.
* `unique_random('date',30)` returns a random date since 1970-01-01, no later than 1970-01-30.

The 2nd parameter can be a lambda function to customize the generation logic, such as

* `unique_random('int',x -> to_int(2*x))` returns a random int multiply with 2

You can also specify the maximum value and lambda together, such as

* `unique_random('date32', 3, x -> to_date('2023-9-1') + interval x day)` returns a random date since 2023-09-01, for the first 3 days.