

# 聚合

### 计数

`count (*)` 获取满足条件的行数，或者用 `count (col)` 获取 `col` 不是 `NULL`的行数。

### count_distinct

`count_distinct(col)` to get the number of unique values for the `col` column. 与 `个计数(独选一列)` 相同

### count_if

`count_if(condition)` 来统计符合 `condition` 的记录数。 例如： `count_if(speed_kmh>80)`

### distinct

`distinct(col)`获取 `col` 列的不同值。

### unique

`unique(<column_name1>[, <column_name2>, ...])`: 计算某一列中（大致的）不同值。

### unique_exact

`unique_exact(<column_name1>[, <column_name2>, ...])`计算某一列中不同值的确切数量。

### unique_exact_if

`unique_exact_if(col,condition)` to apply a filter with `condition` and get the distinct count of `col`, e.g. to get the cars with high speed `unique_exact_if(cid,speed_kmh>80)`

### min

`min(<column_name>)`: 列的最小值。 对于字符串列，比较是词汇排序。

### max

`max(<column_name>)`: 列的最大值。 对于字符串列，比较是词汇排序。

### sum

`sum(<column_name>)`: 列之和。 仅适用于数字。

### avg

`avg(<column_name>)`: 一列的平均值 (sum(column) / count(column)). 仅适用于数字列。 Only works for numeric columns.

### median

`median(<column_name>)` 计算数值数据样本的中值。



### quantile

`quantile(column,level)`计算一个大致的数值数据序列。 e.g. `quantile(a,0.9)`to get the P90 for the column and `quantile(a,0.5)` to get the [median](#median) number

### p90

简写形式的 ` quantile (a,0.9)`

### p95

简写形式的 `quantile(a,0.95)`

### p99

简写形式的 `quantile(a,0.99)`

### top_k

`top_k(<column_name>,K [,true/false])`: 列名中最频繁的 K 项。 返回一个数组。

例如： `top_k(cid, 3)` 可能得到 `[('c01',1200),('c02,800)',('c03',700)]` 如果这3id出现在聚合窗口中最频繁。

如果您不需要事件计数，您可以设置第三个参数的 false，例如： `top_k(cid, 3, false)` 可能得到 `['c01','c02','c03']`

Read more on [Top-N Query Pattern](sql-pattern-topn) page.

### min_k

`min_k(<column_name>,K [,context_column])`: 列名中最小的 K 项。 返回一个数组。 您还可以添加列表，获取同行中值的更多上下文，例如 `min_k(price,3,product_id,last_updated)`  这将返回一个数组，每个元素作为元组，比如 `[(5.12,'c42664'),(5.12,'c42664'),(15.36,'c84068')]`

Read more on [Top-N Query Pattern](sql-pattern-topn) page.

### max_k

`max_k(<column_name>,K[,context_column])`: 列名中最大的 K 项。 您还可以添加列表，获取同一行中更多值的上下文，例如 `max_k(price，3，product_id，last_updated)`

Read more on [Top-N Query Pattern](sql-pattern-topn) page.

### arg_min

`arg_min(argument, value_column)` Gets the value in the `argument` column for a minimal value in the `value_column`. If there are several different values of `argument` for minimal values of `value_column`, it returns the first of these values encountered. 您可以通过 `min_k(value_column,1, argument)[1].2` 实现相同的功能。 但这要容易得多。

### arg_max

`arg_max(argument, value_column)` Gets the value in the `argument` column for a maximum value in the `value_column`. If there are several different values of `argument` for maximum values of `value_column`, it returns the first of these values encountered. 您可以通过 `max_k(value_column,1, argument)[1].2` 实现相同的功能。 但这要容易得多。

### group_array

`group_array(<column_name>)` 来合并特定列作为数组的值。 For example, if there are 3 rows and the values for these columns are "a","b","c". 此函数将生成单行和单列，值 `['a','b','c']`

### moving_sum

`moving_sum(column)` 返回一个数组与指定列的移动和和。 例如， `select moving_sum(a) from(select 1 as a union select 2 as a union select 3 as a)` 将返回[1,3,6]

