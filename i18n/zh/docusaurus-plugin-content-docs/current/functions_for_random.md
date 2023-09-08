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

## Fixed Values

### random_from

`random_from(array)`

Choose one of the values from the array, such as `random_from([1,2,3])` or `random_from(['A','B','C'])`