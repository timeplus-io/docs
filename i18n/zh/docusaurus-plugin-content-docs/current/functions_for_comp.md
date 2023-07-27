# Arrays, Maps, Tuples

### array_cast

`map_cast(array1, array2)` 用 `array1`作为map的key，用 `array2` 作为value来组成一个新的map(这2个数组应该长度相同). 例如， `map_cast(['k1','k2'],[91,95])` 将得到 `{'k1':91,'k2':95}`

### length

`length(array)`

获取数组的长度

### array\[index\] {#array_element}

您可以轻松访问数组中的任何元素，只需使用数组名[index]，比如 `顶部值[2]`

:::info

第一个元素的索引是1，而不是0。

:::



### index_of

`array_difference(arr)` 计算相邻数组元素之间的差异。 返回第一个元素将为0的数组 第二个是 `a[1] - a[0]`之间的差异。 例如： `array_diffce([1,2,3,5])`返回 [0,1,2]

### array_compact

`array_compact(arr)` 从数组中删除连续重复元素，例如 `array_compact([1,1,1,2,2,2,2,3,4,4,5])`返回 [1,2,3,4,5]

### array_concat

`array_concat(数组1,数组2)` 将两个数组合并成一个。

### array_difference

`array_distinct(arr)` 返回一个仅包含不同元素的数组。 例如： `array_distinct([1,1,1,2,3,3,1,1)]`return [1,2,3], 而 `array_compact([1,1,2,3,1,1)`return [1,2,3,1]

### array_distinct

`array_filter(func, 数组)` 返回一个仅包含符合指定函数条件的元素的数组。 例如： `array_filter(x->x%2==0, [1,2,3,4])`返回 [2,4]



### array_flatten

`数组array_flatten(数组1, 数组2,...)`将数组转换为平坦数组。 例如： `array_flatten([[[1]], [[2], [3]])` 返回 [1,2,3]

### array_string_concat

`array_string_concat([，分隔符])` 与分隔符连接数组中列出的值的字符串表示. `分隔符` 是一个可选的参数：一个常量字符串，默认设置为空字符串。 `分隔符` 是一个可选的参数：一个常量字符串，默认设置为空字符串。

例如， `array_string_concat([1,2,3],'-')` 获取一个字符串 `1-2-3`

### array_join

`array_join(an_array)` 这是一个特殊的函数。 `group_array(col)` 来将列值从多行分组到一行中的单个值。 `array_join` 正好相反：它可以将一个数组值的行转换为多行。

例如， `select array_join([10,20]) as v, 'text' as t` 将获得2 行

| v  | t    |
| -- | ---- |
| 10 | text |
| 20 | text |

### array_pop_back

`array_pop_back(数组)` 从数组中移除最后一个项目。 例如： `array_pop_back([1,2,3])` 返回 [1,2]

### array_pop_front

`array_pop_front(数组)` 从数组中移除第一个项目。 例如： `array_pop_front([1,2,3])` 返回 [2,3]

### array_push_back

`array_push_back(数组，值)` 将数值作为最后一个项目添加到数组。 例如： `array_pup_back([1,2,3],4)` 返回 [1,2,3,4]

### array_push_front

`array_push_front(数组，值)` 将数值作为第一个项添加值添加到数组。 例如： `array_push_front([1,2,3],4)` 返回 [4,1,2,3]



### array_product

`array_product(数组)` 乘数组中的元素。 例如： `array_product([2,3,4])` 返回 24 (2x 3 x 4)



### array_resize

`array_resize(array,size [,extender])` 更改数组的长度。 如果 `size` 小于当前数组的长度，则数组将被截断。 如果 `size` 小于当前数组的长度，则数组将被截断. 否则，将创建一个具有指定大小的新数组，用指定的 `extender` 填充值。 例如：`array_resize([3,4],1)` 返回 [3]。 `array_resize([3,4],4,5)` 返回 [3,4,5,5]



### array_reverse

`array_reverse(arr)` 返回一个数组与原数组的反向顺序，例如 `array_reverse([1,2,3])` 返回 [3,2,1]



### array_slice

`array_slice(arr, offset [,length])` 返回数组的分割。 如果没有指定 `length`，则分割到数组的末尾，例如 `array_slice([1,2,3,4,5,],2)` 返回 [2,3,4,5]。 如果 `offset` 大于数组长度，则返回一个空数组 []。 如果 `length` 被视为新数组的长度，例如： `array_slice([1,2,3,4,4,5],2,3)` 返回 [2,3,4]



### array_uniq

`array_uniq(arr)` 返回数组中唯一的数值，例如： `array_uniq([1,1,2,3])` 返回 3



### array_zip

`array_zip(arr1,arr2,.. arrN)` 将来自不同数组的元素分组到一个新的元组数组。 例如：`array_zip([1,2,3],['a','b','c'])` returns [(1,'a'),(2,'b'),(3,'c')]

### array_all

`array_all([func,] array)` 返回 1(true) 或 0(false) 如果数组中的所有元素都符合条件。 例如， `array_all([1,2])` 返回 1, 而 `array_all([0,0])`返回 0。 您可以将 lambda 函数传递给它作为自定义条件检查的第一个参数， 例如 `array_exists(x->x%2==0,[2,3,4])` 检查数组中是否有任何元素。 它返回 1。

### array_avg

`array_cum_sum([func, ]array)` 返回源数组中部分元素的数组(运行总和)。 例如：`array_avg([2,6])` 返回 4。 您可以将lambda函数作为第一个参数传递给它，在计算平均值之前应用于每个元素，例如 `array_avg(x->x*x,[2,6])` 获得2*2 和 6\*6的总和，这是20。

### array_count

`array_count([func, ]数组)` 返回符合条件数组中的元素数量。 默认情况下，检查值是否为 0。 例如： `array_count([0,0,1,2])` 返回 2。 您可以在 lambda 函数中传递一个 lambda 函数作为计算计数前应用于每个元素的第一个参数， 例如 `array_count(x->x>1,[1,2])` 获取大于1的数字，它返回 1。

### array_cum_sum

`array_cum_sum([func, ]array)` 返回源数组中部分元素的数组(运行总和)。 例如： `array_cum_sum([1,1,1,1])` 返回 [1,2,3]。 您可以在 lambda 函数中作为第一个参数，在计算移动总和之前应用于每个元素， 例如 `array_cum_sum(x->x*x,[1,2])` 获得[1,5]

### array_exists

`array_exists([func, ]数组)` 返回 1(true) 或 0(Alse) 如果数组中的任何元素符合条件。 例如， `array_exists([0,1,2])` return 1, and `array_exists([0,0])`return 0。 您可以将 lambda 函数传递给它作为自定义条件检查的第一个参数， 例如 `array_exists(x->x%2==0,[2,3,4])` 检查数组中是否有任何元素。 它返回 1。 要检查所有元素是否符合条件，请使用 `array_all`

### array_filter

`array_first_index(func, 数组)` 返回与指定函数条件匹配的第一个元素的索引。 例如： `array_first_index(x->x%2==0, [1,2,3,4])`返回 2。

### array_first

`array_first(函数, 数组)` 返回符合指定函数条件的第一个元素。 例如： `array_first(x->x%2==0, [1,2,3,4])`返回 2。

### array_first_index

`array_map(函数, 数组)` 将函数应用于数组中的每个元素，并返回一个新数组。 例如： `array_map(x->x*x,[1,2])`返回 [1,4]

### array_last

`array_last(func, 数组)` 返回符合指定函数条件的最后一个元素。 例如： `array_last(x->x%2==0, [1,2,3,4])`返回 4。  If nothing is found, it returns 0.

### array_last_index

`array_last_index(ffunc, 数组)` 返回匹配指定函数条件的最后一个元素的索引。 例如： `array_last_index(x->x%2==0, [1,2,3,4])`返回 4。 If nothing is found, it returns 0.

### array_map

`array_map(func, array)` applies the function to every element in the array and returns a new array. 如果 `x` 不在数组中，返回 0。

### array_max

`array_max(func, 数组)` 将函数应用于数组中的每个元素，然后返回最大值。 。 `array_max(x->x*x,[1,2])`返回 4

### array_min

`array_min(函数, 数组)` 将函数应用于数组中的每个元素，然后返回最小值 e。 。 `array_min(x->x*x,[1,2])`返回 1

### array_sort

`array_sort(func, array)` sorts the array elements in ascending order. 例如： `array_sort([3,2,5,4])` 返回 [2,3,4,5]。 你可以将 lambda 函数传递给它作为第一个参数在排序前应用函数。 。 `array_sort(x->-x,[3,2,5,4])`返回 [5,4,3,2]



### array_sum

`array_sum([func, ]数组)` 返回数组中的总值。 例如， `array_sum([2,6])` return 8。 您可以在 lambda 函数中传递一个 lambda 函数作为计算总和之前应用于每个元素的第一个参数。 例如 `array_sum(x->x*x,[2,6])` 获得2*2 和 6\*6的总和，这是40。



### map\[key\] {#map-key}

您可以轻松访问map中的任何元素，只需使用map[keyName], 例如 `kv['key1']`

### map_cast

`map_cast(array1, array2)` to generate a map with keys from `array1` and values from `array2` (these 2 arrays should be the same size). 例如 `array_cast('a','n')`, not `array_cast('a',0')`

或者，您可以使用 `map_cast(key1,value1,key2,value2...)`

### tuple_cast

`tuple_cast (item1, item2)` 生成一个包含这 2 个元素的元组。 你也可以使用快捷语法： `(item1, item2)` 直接创建元组。