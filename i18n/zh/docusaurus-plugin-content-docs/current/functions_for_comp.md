# 数组、地图、元组

### array_cast

`array_cast(element1,element2,..)` 用给定的元素创建一个新的数组。 例如，`array_cast(1,2)` 将得到 `[1,2]` 请注意，元素应该是相同的类型，例如 `array_cast('a','n')`，不是 `array_cast('a',0)`

### length

`length(array)`

获取数组的长度

### array\[index\] {#array_element}

您可以轻松访问数组中的任何元素，只需使用数组名[index]，比如 `topValues[2]`

:::info

第一个元素的索引是1，而不是0。

:::



### index_of

`index_of(arr,x)` 返回在数组`arr` 中的索引 `x`。 第一个元素的索引是1。 返回 0 如果 `x` 不在数组中。

### array_compact

`array_compact(arr)` 从数组中删除连续重复元素，例如 `array_compact([1,1,1,2,2,2,2,3,4,4,5])`返回 [1,2,3,4,5]

### array_concat

`array_concat(array1,array2)` 将两个数组合并成一个。

### array_difference

`array_difference(arr)` 计算相邻数组元素之间的差。 例如：`array_distinct([1,1,2,3,3,1])` 返回 [1,2,3]，而 `array_compact([1,1,2,3,3,1])` 返回 [1,2,3,1]

### array_distinct

`array_zip(arr1,arr2,.. arrN)` 将来自不同数组的元素分组到一个新的元组数组。 例如：`array_zip([1,2,3],['a','b','c'])` returns [(1,'a'),(2,'b'),(3,'c')]



### array_flatten

`array_flatten(array1, array2,..)` 将数组转换为平坦数组。 例如： `array_flatten([[[1]], [[2], [3]])` 返回 [1,2,3]

### array_string_concat

`array_string_concat(arr[, separator])` 用分隔符连接数组中列出的值的字符串表示形式。 `separator` 是一个可选的参数：一个常量字符串，默认设置为空字符串。

例如， `array_string_concat([1,2,3],'-')` 获取一个字符串 `1-2-3`

### array_join

`array_join(an_array)` 这是一个特殊的函数。 `group_array(col)` 将多行的列值分组为一行中的单个值。 `array_join` 正好相反：它可以将一个数组值的一行转换为多行。

例如， `select array_join([10,20]) as v, 'text' as t` 将获得 2 行

| v  | t    |
| -- | ---- |
| 10 | text |
| 20 | text |

### array_pop_back

`array_pop_back(array)` 从数组中移除最后一个项目。 例如： `array_pop_back([1,2,3])` 返回 [1,2]

### array_pop_front

`array_pop_front(array)` 从数组中移除第一个项目。 例如： `array_pop_front([1,2,3])` 返回 [2,3]

### array_push_back

`array_push_back(array, value)` 将数值作为最后一个项目添加到数组。 例如： `array_push_back([1,2,3],4)` 返回 [1,2,3,4]

### array_push_front

`array_push_front(array, value)` 将数值作为第一个项目添加值添加到数组。 例如： `array_push_front([1,2,3],4)` 返回 [4,1,2,3]



### array_product

`array_product(array)` 将数组中的元素相乘。 例如： `array_product([2,3,4])` 返回 24 （2x 3 x 4）



### array_resize

`array_resize(array,size [,extender])` 更改数组的长度。 如果 `size` 小于当前数组的长度，则数组将被截断。 否则，将创建一个具有指定大小的新数组，用指定的 `extender` 来填充值。 例如：`array_resize([3,4],1)` 返回 [3]。 `array_resize([3,4],4,5)` 返回 [3,4,5,5]



### array_reverse

`array_reverse(arr)` 返回一个数组与原数组的反向顺序，例如 `array_reverse([1,2,3])` 返回 [3,2,1]



### array_slice

`array_slice(arr, offset [,length])` 返回数组的分割。 如果没有指定 `length`，则分割到数组的末尾，例如 `array_slice([1,2,3,4,5,],2)` 返回 [2,3,4,5]。 如果 `offset` 大于数组长度，则返回一个空数组 []。 如果 `length` 被视为新数组的长度，例如： `array_slice([1,2,3,4,4,5],2,3)` 返回 [2,3,4]



### array_uniq

`array_uniq(arr)` 返回数组中唯一的数值，例如： `array_uniq([1,1,2,3])` 返回 3



### array_zip

`array_difference(arr)` 计算相邻数组元素之间的差。 返回一个数组，其中第一个元素将为0，第二个元素是 `a[1] - a[0]` 两者的差值。 例如 `array_difference([1,2,3,5])` 返回 [0,1,1,2]

### array_all

`array_all([func,] array)` 返回 1(true) 或 0(false) 如果数组中的所有元素都符合条件。 例如， `array_all([1,2])` 返回 1, 而 `array_all([0,0])` 返回 0。 您可以将 lambda 函数传递给它作为自定义条件检查的第一个参数， 例如 `array_exists(x->x%2==0,[2,3,4])` 检查数组中是否有任何元素。 它返回 1。

### array_avg

`array_avg([func,] array)` 返回数组中的平均值。 例如：`array_avg([2,6])` 返回 4。 您可以将lambda函数作为第一个参数传递给它，在计算平均值之前应用于每个元素，例如 `array_avg(x->x*x,[2,6])` 获得2*2 和 6\*6的总和，也就是20。

### array_count

`array_count([func,] array)` 返回符合条件数组中的元素数量。 默认情况下，检查值是否为 0。 例如： `array_count([0,0,1,2])` 返回 2。 您可以在 lambda 函数中传递一个 lambda 函数作为计算计数前应用于每个元素的第一个参数， 例如 `array_count(x->x>1,[1,2])` 获取大于1的数字，它返回 1。

### array_cum_sum

`array_cum_sum([func, ]array)` 返回源数组中部分元素的数组(运行总和)。 例如： `array_cum_sum([1,1,1,1])` 返回 [1,2,3]。 您可以在 lambda 函数中作为第一个参数，在计算移动总和之前应用于每个元素， 例如 `array_cum_sum(x->x*x,[1,2])` 获得[1,5]

### array_exists

`array_exists([func,] array)` 返回 1(true) 或 0(Alse) 如果数组中的任何元素符合条件。 例如， `array_exists([0,1,2])` 返回 1, and `array_exists([0,0])` 返回 0。 您可以将 lambda 函数传递给它作为自定义条件检查的第一个参数， 例如 `array_exists(x->x%2==0,[2,3,4])` 检查数组中是否有任何元素。 它返回 1。 要检查所有元素是否符合条件，请使用 `array_all`

### array_filter

`array_exists([func,] array)` 返回一个仅包含与指定函数的条件匹配的元素的数组。 例如： `array_filter(x->x%2==0, [1,2,3,4])` 返回 [2,4]

### array_first

`array_first(func, array)` 返回符合指定函数条件的第一个元素。 例如： `array_first(x->x%2==0, [1,2,3,4])` 返回 2。

### array_first_index

`array_first_index(func, array)` 返回与指定函数的条件匹配的第一个元素。 例如：`array_first_index(x->x%2==0, [1,2,3,4])` 返回 2。

### array_last

`array_last(func, array)` 返回与指定函数的条件匹配的最后一个元素。 例如： `array_last(x->x%2==0, [1,2,3,4])` 返回 4。  如果没有找到，返回 0。

### array_last_index

`array_last_index(ffunc, 数组)` 返回匹配指定函数条件的最后一个元素的索引。 例如： `array_last_index(x->x%2==0, [1,2,3,4])` 返回 4。 如果没有找到，返回 0。

### array_map

`array_map(func, array)` 将函数应用于数组中的每个元素并返回一个新数组。 例如：`array_map(x->x*x,[1,2])` 返回 [1,4]

### array_max

`array_max(func, array)` 将函数应用于数组中的每个元素，然后返回最大值。 `array_max(x->x*x,[1,2])` 返回 4

### array_min

`array_min(函数, 数组)` 将函数应用于数组中的每个元素，然后返回最小值。 `array_min(x->x*x,[1,2])` 返回 1

### array_sort

`array_sort(func, array)` 按升序对数组元素进行排序。 例如： `array_sort([3,2,5,4])` 返回 [2,3,4,5]。 您可以将 lambda 函数作为第一个参数传递给它，以便在排序之前应用该函数，例如：`array_sort(x->-x,[3,2,5,4])` 返回 [5,4,3,2]



### array_sum

`array_sum([func,] array)` 返回数组中的总值。 例如： `array_sum([2,6])` 返回 8。 你可以将lambda函数作为第一个参数传递给它，在计算和之前应用于每个元素，例如 `array_sum(x->x*x,[2,6])` 获得2*2 和 6\*6的总和，也就是40。

### array_fold
`array_fold(lambda_function, arr1, arr2, ..., accumulator)` applies a lambda function to one or more equally-sized arrays and collects the result in an accumulator.

For example, `array_fold(acc, x -> acc + (x * 2), [1, 2, 3, 4], to_int64(3))` will initialize the accumulator `acc` as value 3, then for each element in the `[1, 2, 3, 4]` array, assign it to `x` and accumlate them together with `x*2`. So the end result is 3+1*2+2*2+3*2+4*2=23.

Make sure the return type of lambda function must be the same as the accumulator type.

### map\[key\] {#map-key}

您可以轻松访问 map 中的任何元素，只需使用 map[keyName]，例如 `kv['key1']`

### map_cast

`map_cast(array1, array2)` 使用来自 `array1` 的键和来自 `array2` 的值生成一个 map（这两个数组的大小应该相同）。 例如：`map_cast(['k1','k2'],[91,95])` 会获得 `{'k1':91,'k2':95}`

或者，您可以使用 `map_cast(key1,value1,key2,value2...)`

自 Proton v1.4.2 起，添加了一个新的 [extract_key_value_pairs](functions_for_text#extract_key_value_pairs) 函数，用于将键值对从字符串提取到地图。

### tuple_cast

`tuple_cast (item1, item2)` 生成一个包含这 2 个元素的元组。 您也可以使用快捷语法：`(item1, item2)` 直接创建元组。

### untuple

`untuple (a_tuple)` 显示元组中的元素。

The names of the result columns are implementation-specific and subject to change. Do not assume specific column names after `untuple`. 不要在 `untuple`之后假设特定的列名。



### 元组元素

`元组元素（a_tuple，索引，[，default_value]）` 或 `元组元素（a_tuple，名称，[，default_value]）`

一个允许从元组中获取列的函数。

If the second argument is a number `index`, it is the column index, starting from 1. If the second argument is a string `name`, it represents the name of the element. Besides, we can provide the third optional argument, such that when index out of bounds or no element exist for the name, the default value returned instead of throwing an exception. The second and third arguments, if provided, must be constants. There is no cost to execute the function. 如果第二个参数是字符串 `name`，则它表示元素的名称。 此外，我们可以提供第三个可选参数，这样，当索引超出边界或名称不存在元素时，将返回默认值而不是引发异常。 第二个和第三个参数（如果提供）必须是常量。 执行该函数没有成本。

该函数实现了运算符 `x.index` 和 `x.name`。

### dict_get

`dict_get ('dict_name'、attr_names、id_expr)`

从字典中检索值。

### dict_get_or_default

`dict_get_or_default（'dict_name'、attr_names、id_expr、default_value）`

从字典中检索值。 Retrieves values from a dictionary. If not found, return the default value.

### 列

实际上不适用于数组、地图或元组。

`columns (regexp)` 动态列选择（也称为 COLUMNS 表达式）允许您将结果中的某些列与 [re2](https://en.wikipedia.org/wiki/RE2_(software)) 正则表达式进行匹配

[了解更多。](https://clickhouse.com/docs/en/sql-reference/statements/select#dynamic-column-selection)

### 适用

实际上不适用于数组、地图或元组。

`select <expr> apply ( <func> )` 允许你为查询的外表表达式返回的每一行调用一些函数。

例如， `select * apply (sum)..`

[了解更多。](https://clickhouse.com/docs/en/sql-reference/statements/select#apply)
