

# 聚合

### 计数

`count (*)` 获取满足条件的行数，或者用 `count (col)` 获取 `col` 不是 `NULL`的行数。

### count_distinct

`count_distant(col)` 获取 `col` 列的特殊值的个数。 与 `count(distinct col)` 相同

### count_if

`count_if(condition)` 来统计符合 `condition` 的记录数。 例如： `count_if(speed_kmh>80)`

### distinct

`distinct(col)` 获取 `col` 列的不同值。

### unique

`unique(<column_name1>[, <column_name2>, ...])`: 计算某一列中（大致的）不同值。

### unique_exact

`unique_exact(<column_name1>[, <column_name2>, ...])` 计算某一列中不同值的确切数量。

### unique_exact_if

`unie_extract_if(col, condition)` 统计符合 `condition` 的 `col` 的不同值个数。 比如要找出超速行驶的车牌号 `unie_extract_if(cid,speed_kmh>80)`

### min

`min(<column_name>)`：列的最小值。 对于字符串列，比较是词汇排序。

### max

`max(<column_name>)`：列的最大值。 对于字符串列，比较是词汇排序。

### sum

`sum(<column_name>)`：列之和。 仅适用于数字。

### avg

`avg(<column_name>)`：一列的平均值 (sum(column) / count(column))。 仅适用于数字列。

### median

`median(<column_name>)` 计算数值数据样本的中值。



### quantile

`quantile(column,level)` 计算一个大致的数值数据序列。 例如： `quantile (a,0.9)` 获取列的 P90 和 `quantile (a,0.5)` 获取 [median](#median) 数字

### p90

简写形式的 `quantile (a,0.9)`

### p95

简写形式的 `quantile(a,0.95)`

### p99

简写形式的 `quantile(a,0.99)`

### top_k

`top_k(<column_name>,K [,true/false])`：列名中最频繁的 K 项。 返回一个数组。

例如： `top_k(cid, 3)` 可能得到 `[('c01',1200),('c02,800)',('c03',700)]` 如果这3id出现在聚合窗口中最频繁。

如果您不需要事件计数，您可以设置第三个参数的 false，例如： `top_k(cid, 3, false)` 可能得到 `['c01','c02','c03']`

在 [Top-N Query Pattern](sql-pattern-topn) 页上阅读更多内容。

### min_k

`min_k(<column_name>,K [,context_column])`：列名中最小的 K 项。 返回一个数组。 您还可以添加列表，获取同行中值的更多上下文，例如 `min_k(price,3,product_id,last_updated)` 这将返回一个数组，每个元素作为元组，比如 `[(5.12,'c42664'),(5.12,'c42664'),(15.36,'c84068')]`

在 [Top-N Query Pattern](sql-pattern-topn) 页上阅读更多内容。

### max_k

`max_k(<column_name>,K[,context_column])`：列名中最大的 K 项。 您还可以添加列表，获取同一行中更多值的上下文，例如 `max_k(price，3，product_id，last_updated)`

在 [Top-N Query Pattern](sql-pattern-topn) 页上阅读更多内容。

### arg_min

`arg_min(argument, value_column)` 获取在 `argument` 列中 `value_column` 最小的值。 如果在 `value_column` 的最小值中有多个对应的不同的值 `argument` ，则返回遇到的第一个值。 您可以通过 `min_k(value_column,1, argument)[1].2` 实现相同的功能。 但这要容易得多。

### arg_max

`arg_max(argument, value_column)` 获取在 `argument` 列中 `value_column` 最大的值。 如果在 `value_column` 的最大值中有多个对应的不同的值 `argument` ，则返回遇到的第一个值。 您可以通过 `max_k(value_column,1, argument)[1].2` 实现相同的功能。 但这要容易得多。

### group_array

`group_array(<column_name>)` 来合并特定列作为数组的值。 例如，如果有三行，并且这些列的值是“a”，“b”，“c”。 此函数将生成单行和单列，值 `['a','b','c']`

### group_uniq_array

`group_uniq_array(<column_name>)` to combine the values of the specific column as an array, making sure only unique values in it. For example, if there are 3 rows and the values for these columns are "a","a","c". This function will generate a single row and single column with value `['a','c']` For example, if there are 3 rows and the values for these columns are "a","a","c". This function will generate a single row and single column with value `['a','c']`

### moving_sum

`moving_sum(column)` 返回一个数组与指定列的移动和和。 例如， `select moving_sum(a) from(select 1 as a union select 2 as a union select 3 as a)` 将返回[1,3,6]

### any

`any(column)` Selects the first encountered (non-NULL) value, unless all rows have NULL values in that column. The query can be executed in any order and even in a different order each time, so the result of this function is indeterminate. To get a determinate result, you can use the `min` or `max` function instead of `any`. The query can be executed in any order and even in a different order each time, so the result of this function is indeterminate. To get a determinate result, you can use the `min` or `max` function instead of `any`.

### last_value

`last_value(column)` Selects the last encountered value.



### stochastic_linear_regression_state

`stochastic_linear_regression_state(num, target, param1, param2)`

This function implements stochastic linear regression. This function implements stochastic linear regression. It supports custom parameters for learning rate, L2 regularization coefficient, mini-batch size and has few methods for updating weights ([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam) (used by default), [simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent), [Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum), [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)). Learn more at [ClickHouse docs](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/stochasticlinearregression). Learn more at [ClickHouse docs](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/stochasticlinearregression).

### stochastic_logistic_regression

`stochastic_logistic_regression(num, num, num, string)`

This function implements stochastic logistic regression. This function implements stochastic logistic regression. It can be used for binary classification problem, supports the same custom parameters as stochasticLinearRegression and works the same way. Learn more at [ClickHouse docs](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/stochasticlogisticregression). Learn more at [ClickHouse docs](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/stochasticlogisticregression).

