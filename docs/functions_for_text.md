

# Process Text

### lower

`lower(str)`

Converts ASCII Latin symbols in a string to lowercase.

### upper

`upper(str)`

Converts ASCII Latin symbols in a string to uppercase.

### format

`format(template,args)` Formatting constant pattern with the string listed in the arguments.

For example, `format('{} {}', 'Hello', 'World')`gets `Hello World`

### concat

`concat(str1,str2 [,str3])` Combine 2 or more strings as a single string. For example, `concat('95','%')` to get 95%. You can also use `||` as the shortcut syntax, e.g. `'95' || '%' ` Each parameter in this function needs to be a string. You can use [to_string](/functions_for_type#to_string) function to convert them, for example `to_string(95) || '%'`

### substr

`substr(str,index [,length])` Returns the substring of `str` from `index` (starting from 1). `length` is optional.

### substring

`substring(str,index [,length])` Alias of [substr](#substr).

### starts_with
`starts_with(str,prefix)` Determines whether a string starts with a specified prefix.

### ends_with
`ends_with(str,suffix)` Determines whether a string ends with a specified suffix.

### trim

`trim(string)`

Removes all specified characters from the start or end of a string. By default removes all consecutive occurrences of common whitespace (ASCII character 32) from both ends of a string.

### split_by_string

`split_by_string(sep,string)`

Splits a string into substrings separated by a string. It uses a constant string `sep` of multiple characters as the separator. If the string `sep` is empty, it will split the string `string` into an array of single characters.

For example `split_by_string('b','abcbxby')`will get an array with string `['a','c','x','y']`

### match

`match(string,pattern)` determines whether the string matches the given regular expression. For example, to check whether the text contains a sensitive AWS ARN, you can run `match(text,'arn:aws:kms:us-east-1:\d{12}:key/.{36}')`

### multi_search_any

`multi_search_any(text, array)` determines whether the text contains any of the strings from the given array. For example, to check whether the text contains any sensitive keywords, you can run `multi_search_any(text,['password','token','secret'])`

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

Replaces all occurrences of the pattern.

This can be used to mask data, e.g. to hide the full phone number, you can run `replace_regex('604-123-4567','(\\d{3})-(\\d{3})-(\\d{4})','\\1-***-****')` to get `604-***-****`

### extract

Process plain text with regular expression and extract the content. For example, `extract('key1=value1, key2=value2','key1=(\\w+)')`, this will get “value1”.  If the log lines are put into a single text column, you can create a view with the extracted fields, e.g.

```sql
create view logs as
select extract(value, 'key1=(\\w+)') as key1,
       extract(value, 'key2=(\\w+)') as key2
       from log_stream
```



### extract_all_groups

`extract_all_groups(haystack, pattern)`

Matches all groups of the `haystack` string using the `pattern` regular expression. Returns an array of arrays, where the first array includes keys and the second array includes all values.

```sql
SELECT
 extract_all_groups('v1=111, v2=222, v3=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') as groups
 -- return [ [ "v1", "v2", "v3" ], [ "111", "222", "333" ] ]
```



### extract_all_groups_horizontal

`extract_all_groups_horizontal(haystack, pattern)`

Matches all groups of the `haystack` string using the `pattern` regular expression. Returns an array of arrays, where the first array includes all fragments matching the first group, the second array matching the second group, etc.

```sql
SELECT
 extract_all_groups_horizontal('v1=111, v2=222, v3=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') as groups
 -- [ [ "v1", "111" ], [ "v2", "222" ], [ "v3", "333" ] ]
```

### extract_key_value_pairs

`extract_key_value_pairs(string)`

Extract key value pairs from the string and return a map. For example, `extract_key_value_pairs('name:neymar, age:31 team:psg,nationality:brazil') ` will return a map with keys: name, age, team, ad nationality.

For the advanced usage of the function, please check the [doc](https://clickhouse.com/docs/en/sql-reference/functions/tuple-map-functions#extractkeyvaluepairs).

### grok

`grok(string,pattern)`

Extract value from plan text without using regular expression. e.g. `SELECT grok('My name is Jack. I am 23 years old.','My name is %{DATA:name}. I am %{INT:age} years old.') as m` will get `{"name":"Jack","age":"23"}` as the `m`.

Please note all keys and values in the returned map are in string type. You can convert them to other type, e.g. `(m['age'])::int`. Learn more about the [Grok patterns](/grok).

### coalesce

`coalesce(value1, value2,..)` Checks from left to right whether `NULL` arguments were passed and returns the first non-`NULL` argument. If you get error messages related to Nullable type, e.g. "Nested type array(string) cannot be inside Nullable type", you can use this function to turn the data into non-`NULL` For example `json_extract_array(coalesce(raw:payload, ''))`

### hex

`hex(argument)`Returns a string containing the argument’s hexadecimal representation.` argument` can be any type.

### unhex

`unhex(string)` Performs the opposite operation of [hex](#hex). It interprets each pair of hexadecimal digits (in the argument) as a number and converts it to the byte represented by the number. The return value is a binary string (BLOB).

### uuid

`uuid()` or `uuid(x)` Generates a universally unique identifier (UUID) which is a 16-byte number used to identify records. In order to generate multiple UUID in one row, pass a parameter in each function call, such as `SELECT uuid(1) as a, uuid(2) as b` Otherwise if there is no parameter while calling multiple `uuid` functions in one SQL statement, the same UUID value will be returned.

### base64_encode

`base64_encode(string)` Encodes a string or fixed_string as base64.

For example `base64_encode('hello')` returns `aGVsbG8=`

### base64_decode

`base64_decode(string)` Decode a base64 string to a string.

For example `base64_decode('aGVsbG8=')` returns `hello`

### base58_encode

`base58_encode(string)` Encodes a string or fixed_string as [base58](https://tools.ietf.org/id/draft-msporny-base58-01.html) in the "Bitcoin" alphabet.

For example `base58_encode('hello')` returns `Cn8eVZg`

### base58_decode

`base58_decode(string)` Decode a [base58](https://tools.ietf.org/id/draft-msporny-base58-01.html) string to a string.

For example `base58_decode('Cn8eVZg')` returns `hello`

### format_readable_quantity
`format_readable_quantity(number)` Returns a rounded number with suffix (thousand, million, billion, etc.) as string. For example, `format_readable_quantity(10036)` returns "10.04 thousand".

### format_readable_size
`format_readable_size(number)` Returns a rounded number with suffix (KiB, GiB, etc.) as string. For example, `format_readable_size(10036)` returns "9.80 KiB".
