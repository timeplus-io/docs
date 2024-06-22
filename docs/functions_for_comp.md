# Arrays, Maps, Tuples

### array_cast

`array_cast(element1,element2,..)` create a new array with the given elements, e.g. `array_cast(1,2)` will get `[1,2]` Please note, the elements should be in the same type, such as `array_cast('a','n')`, not `array_cast('a',0)`

### length

`length(array)`

Get the length of the array.

### array\[index\] {#array_element}

You can easily access any element in the array, just using arrayName[index], such as `topValues[2]`

:::info

The first element's index is 1, instead of 0.

:::



### index_of

`index_of(arr,x)` returns the index of `x` in the array `arr`. The first element's index is 1. Return 0 if `x` is not in the array.

###  array_compact

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

`array_push_back(array, value)` adds the value to the array as the last item. e.g. `array_push_back([1,2,3],4)` returns [1,2,3,4]

### array_push_front

`array_push_front(array, value)` adds the value to the array as the first item. e.g. `array_push_front([1,2,3],4)` returns [4,1,2,3]



### array_product

`array_product(array)` multiplies elements in the array. e.g. `array_product([2,3,4])` returns 24 (2 x 3 x 4)



### array_resize

`array_resize(array, size [,extender])` changes the length of the array. If `size`is smaller than the current length of the array, the array is truncated. Otherwise, a new array with the specified size is created, filling value with the specified `extender`. e.g. `array_resize([3,4],1)` returns [3]. `array_resize([3,4],4,5)`returns [3,4,5,5]



### array_reverse

`array_reverse(arr)` returns an array with the reversed order of the original array, e.g. `array_reverse([1,2,3])` returns [3,2,1]



### array_slice

`array_slice(arr, offset [,length])` returns a slice of the array. If `length` is not specified, then slice to the end of the array, e.g. `array_slice([1,2,3,4,5],2)` returns [2,3,4,5]. If `offset` is greater than the array length, it returns an empty array []. If `length` is specified, this is the length of the new array, e.g. `array_slice([1,2,3,4,5],2,3)` returns [2,3,4]



### array_uniq

`array_uniq(arr)` returns the number of unique values in the array, e.g. `array_uniq([1,1,2,3])` returns 3



### array_zip

`array_zip(arr1,arr2,.. arrN)` group elements from different arrays to a new array of tuples. e.g. `array_zip([1,2,3],['a','b','c'])` returns [(1,'a'),(2,'b'),(3,'c')]

### array_all

`array_all([func,] array)` returns 1(true) or 0(false) if all elements in the array meets the condition. For example, `array_all([1,2])` return 1, and `array_all([0,0])`return 0. You can pass a lambda function to it as the first argument to customize the condition check, such as `array_all(x->x%2==0,[2,4,6])` to check whether each element in the array is even. It returns 1.

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

`array_last(func, array)` returns the last element that matches the condition of the specified function. e.g. `array_last(x->x%2==0, [1,2,3,4])`returns 4.  If nothing is found, it returns 0.

### array_last_index

`array_last_index(func, array)` returns the index of the last element that matches the condition of the specified function. e.g. `array_last_index(x->x%2==0, [1,2,3,4])`returns 4. If nothing is found, it returns 0.

### array_map

`array_map(func, array)` applies the function to every element in the array and returns a new array. e.g. `array_map(x->x*x,[1,2])`returns [1,4]

### array_max

`array_max(func, array)` apply the function to every element in the array and then returns the maximum value e.g. `array_max(x->x*x,[1,2])`returns 4

### array_min

`array_min(func, array)` apply the function to every element in the array and then returns the minimum value e.g. `array_min(x->x*x,[1,2])`returns 1

### array_sort

`array_sort(func, array)` sorts the array elements in ascending order. e.g. `array_sort([3,2,5,4])` returns [2,3,4,5]. You can pass a lambda function to it as the first argument to apply the function before the sort, e.g. `array_sort(x->-x,[3,2,5,4])`returns [5,4,3,2]



### array_sum

`array_sum([func,] array)` returns the sum value in the array. For example, `array_sum([2,6])` return 8. You can pass a lambda function to it as the first argument to apply on each element before calculating the sum, such as `array_sum(x->x*x,[2,6])` to get the sum for 2*2 and 6\*6, which is 40.

### array_fold
`array_fold(lambda_function, arr1, arr2, ..., accumulator)` applies a lambda function to one or more equally-sized arrays and collects the result in an accumulator.

For example, `array_fold(acc, x -> acc + (x * 2), [1, 2, 3, 4], to_int64(3))` will initialize the accumulator `acc` as value 3, then for each element in the `[1, 2, 3, 4]` array, assign it to `x` and accumlate them together with `x*2`. So the end result is 3+1*2+2*2+3*2+4*2=23.

Make sure the return type of lambda function must be the same as the accumulator type.

### map\[key\] {#map-key}

You can easily access any element in the map, just using mapName[keyName], such as `kv['key1']`

### map_cast

`map_cast(array1, array2)` to generate a map with keys from `array1` and values from `array2` (these 2 arrays should be the same size). For example `map_cast(['k1','k2'],[91,95])` will get `{'k1':91,'k2':95} `

Alternatively, you can use `map_cast(key1,value1,key2,value2..)`

Since Proton v1.4.2, a new [extract_key_value_pairs](functions_for_text#extract_key_value_pairs) function is added to extract key value pairs from a string to a map.

### tuple_cast

`tuple_cast(item1,item2)` to generate a tuple with these 2 elements. You can also use the shortcut syntax: `(item1,item2)` to create the tuple directly.

### untuple

`untuple(a_tuple)` show elements in the tuple.

The names of the result columns are implementation-specific and subject to change. Do not assume specific column names after `untuple`.



### tuple_element

`tuple_element(a_tuple, index, [, default_value])` or `tuple_element(a_tuple, name, [, default_value])`

A function that allows getting a column from a tuple.

If the second argument is a number `index`, it is the column index, starting from 1. If the second argument is a string `name`, it represents the name of the element. Besides, we can provide the third optional argument, such that when index out of bounds or no element exist for the name, the default value returned instead of throwing an exception. The second and third arguments, if provided, must be constants. There is no cost to execute the function.

The function implements operators `x.index` and `x.name`.

### dict_get

`dict_get('dict_name', attr_names, id_expr)`

Retrieves values from a dictionary.

### dict_get_or_default

`dict_get_or_default('dict_name', attr_names, id_expr,default_value)`

Retrieves values from a dictionary. If not found, return the default value.

### columns

Not really for arrays, maps, or tuples.

`columns(regexp)` Dynamic column selection (also known as a COLUMNS expression) allows you to match some columns in a result with a [re2](https://en.wikipedia.org/wiki/RE2_(software)) regular expression

[Learn more.](https://clickhouse.com/docs/en/sql-reference/statements/select#dynamic-column-selection)

### apply

Not really for arrays, maps, or tuples.

`select <expr> apply( <func> ) ` Allows you to invoke some function for each row returned by an outer table expression of a query.

For example, `select * apply(sum) ..`

[Learn more.](https://clickhouse.com/docs/en/sql-reference/statements/select#apply)
