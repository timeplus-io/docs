# Aggregation Functions

### count

`count(*)` to get the row number, or `count(col)` to get the number of rows when `col` is not `NULL`

### count_distinct

`count_distinct(col)` to get the number of unique values for the `col` column. Same as `count(distinct col)`

### count_if

`count_if(condition)` to apply a filter with `condition` and get the number of records. e.g. `count_if(speed_kmh>80)`

### distinct

`distinct(col)`to get the distinct value for the `col` column.

### unique

`unique(<column_name1>[, <column_name2>, ...])`: Calculates the approximate number of different values of the columns.

### unique_exact

`unique_exact(<column_name1>[, <column_name2>, ...])`Calculates the exact number of different values of the columns.

### unique_exact_if

`unique_exact_if(col,condition)` to apply a filter with `condition` and get the distinct count of `col`, e.g. to get the cars with high speed `unique_exact_if(cid,speed_kmh>80)`

### min

`min(<column_name>)`: minimum value of a column. For String column, the comparison is lexicographic order.

### max

`max(<column_name>)`: maximum value of a column. For String column, the comparison is lexicographic order.

### sum

`sum(<column_name>)`: sum of the columns. Only works for numbers.

### avg

`avg(<column_name>)`: average value of a column (sum(column) / count(column)). Only works for numeric columns.

### median

`median(<column_name>)` Calculate median of a numeric data sample.

### quantile

`quantile(column,level)`Calculate an approximate quantile of a numeric data sequence. e.g. `quantile(a,0.9)`to get the P90 for the column and `quantile(a,0.5)` to get the [median](#median) number

### p90

short for `quantile(a,0.9)`

### p95

short for `quantile(a,0.95)`

### p99

short for `quantile(a,0.99)`

### top_k

`top_k(<column_name>,K)`: Top frequent K items in column_name. Return an array.

e.g. `top_k(cid, 3)` may get `["c01","c02","c03"]`

If you need to get the event count, you can set `true` as the 3rd parameter, e.g. `top_k(cid, 3, true)` may get `[("c01",1200,0),("c02",800,0),("c03",700,0)]`. The 3rd element in the tuple is the probability of the error of the calculation, since it is an approximate calculation. 0 means no error. If you want to get the exact top K without approximate calculation, you can use `top_k_exact` function, e.g. `top_k_exact(cid,3)`, which will be slower than `top_k` function.

Read more on [Top-N Query Pattern](/sql-pattern-topn) page.

### min_k

`min_k(<column_name>,K [,context_column])`: The least K items in column_name. Return an array. You can also add a list of columns to get more context of the values in same row, such as `min_k(price,3,product_id,last_updated)` This will return an array with each element as a tuple, such as `[(5.12,'c42664'),(5.12,'c42664'),(15.36,'c84068')]`

Read more on [Top-N Query Pattern](/sql-pattern-topn) page.

### max_k

`max_k(<column_name>,K[,context_column])`: The greatest K items in column_name. You can also add a list of columns to get more context of the values in same row, such as `max_k(price,3,product_id,last_updated)`

Read more on [Top-N Query Pattern](/sql-pattern-topn) page.

### arg_min

`arg_min(argument, value_column)` Gets the value in the `argument` column for a minimal value in the `value_column`. If there are several different values of `argument` for minimal values of `value_column`, it returns the first of these values encountered. You can achieve the same query with `min_k(value_column,1, argument)[1].2 `. But this is much easier.

### arg_max

`arg_max(argument, value_column)` Gets the value in the `argument` column for a maximum value in the `value_column`. If there are several different values of `argument` for maximum values of `value_column`, it returns the first of these values encountered. You can achieve the same query with `max_k(value_column,1, argument)[1].2 `. But this is much easier.

### group_array

`group_array(<column_name>)` to combine the values of the specific column as an array. For example, if there are 3 rows and the values for these columns are "a","b","c". This function will generate a single row and single column with value `['a','b','c']`.

Starting from [Timeplus Enterprise v2.7](/enterprise-v2.7), you can set the second parameter to specify the maximum number of elements in the array. If the number of elements exceeds the specified value, the function will return an array with the first `max_length` elements. For example, `group_array(a, 2)` will return `['a','b']` if the original array is `['a','b','c']`.

### group_array_last

`group_array_last(<column_name>, max_size)` to combine the values of the specific column as an array. For example, if there are 3 rows and the values for these columns are "a","b","c". `group_array_last(col,2)` will generate a single row and single column with value `['b','c']`.

### group_array_sorted

`group_array_sorted(<column_name>)` to combine the values of the specific column as an array, sorted in ascending order. For example, if there are 3 rows and the values for these columns are "c","b","a". This function will generate a single row and single column with value `['a','b','c']`.

This function is available in Timeplus Enterprise v2.8 or later.

### group_array_sample

`group_array_sample(<column_name>, <max_length>)` to combine the values of the specific column as an array, sampled randomly. For example, if there are 3 rows and the values for these columns are "a","b","c". This function will generate a single row and single column with value `['a','b']` with `group_array_sample(col,2)`.

This function is available in Timeplus Enterprise v2.8 or later.

### group_uniq_array

`group_uniq_array(<column_name>)` to combine the values of the specific column as an array, making sure only unique values in it. For example, if there are 3 rows and the values for these columns are "a","a","c". This function will generate a single row and single column with value `['a','c']`.

Starting from [Timeplus Enterprise v2.7](/enterprise-v2.7), you can set the second parameter to specify the maximum number of elements in the array. If the number of elements exceeds the specified value, the function will return an array with the first `max_length` elements. For example, `group_uniq_array(a, 2)` will return `['a','b']` if the original array is `['a','b','c']`.

### group_concat

`group_concat(<column_name>)` to combine the values of the specific column as a string, separated by a comma. For example, if there are 3 rows and the values for these columns are "a","b","c". This function will generate a single row and single column with value `'abc'`. To combine the values of the specific column as a string, separated by a semicolon, use `group_concat(<column_name>, ';')`.

### moving_sum

`moving_sum(column)` returns an array with the moving sum of the specified column. For example, `select moving_sum(a) from(select 1 as a union select 2 as a union select 3 as a)` will return [1,3,6].

### any

`any(column)` Selects the first encountered (non-NULL) value, unless all rows have NULL values in that column. The query can be executed in any order and even in a different order each time, so the result of this function is indeterminate. To get a determinate result, you can use the `min` or `max` function instead of `any`.

### first_value

`first_value(column)` Selects the first encountered value.

### last_value

`last_value(column)` Selects the last encountered value.

### stochastic_linear_regression_state

`stochastic_linear_regression_state(num, target, param1, param2)`

This function implements stochastic linear regression. It supports custom parameters for learning rate, L2 regularization coefficient, mini-batch size and has few methods for updating weights ([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam) (used by default), [simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent), [Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum), [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)). Learn more at [ClickHouse docs](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/stochasticlinearregression).

### stochastic_logistic_regression

`stochastic_logistic_regression(num, num, num, string)`

This function implements stochastic logistic regression. It can be used for binary classification problem, supports the same custom parameters as stochasticLinearRegression and works the same way. Learn more at [ClickHouse docs](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/stochasticlogisticregression).

### largest_triangle_three_buckets

`largest_triangle_three_buckets(x, y, n)` or `lttb(x, y, n)`. `x` is the x coordinate. `y` is the y coordinate. `n` is the number of points in the resulting series.

Applies the [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) algorithm to the input data. The algorithm is used for downsampling time series data for visualization. It is designed to operate on series sorted by x coordinate. It works by dividing the sorted series into buckets and then finding the largest triangle in each bucket. The number of buckets is equal to the number of points in the resulting series. The function will sort data by `x` and then apply the downsampling algorithm to the sorted data.

For example:
```sql
CREATE STREAM test
(
    x float64,
    y float64
) ENGINE = MergeTree order by (y,x);

INSERT INTO test
VALUES (1.0, 10.0),(2.0, 20.0),(3.0, 15.0),(8.0, 60.0),(9.0, 55.0),(10.0, 70.0),(4.0, 30.0),(5.0, 40.0),(6.0, 35.0),(7.0, 50.0);

select largest_triangle_three_buckets(x, y, 0) FROM test;

select largest_triangle_three_buckets(x, y, 1) FROM test;

select largest_triangle_three_buckets(x, y, 2) FROM test;

SELECT largest_triangle_three_buckets(x, y, 4) FROM test;
```

### lttb
Alias for `largest_triangle_three_buckets`.

### avg_time_weighted
`avg_time_weighted(column, time_column)` to calculate the time-weighted average of the column. The time column should be in the format of `datetime`,`datetime64` or `date`.

Optionally, you can add a third parameter to specify an end time for your analysis period. When you omit the third parameter, the calculation excludes the last value. If provided, the end time must match the timestamp column's data type, and the function uses the difference between the last time point and this end time as the weight for the final value.

### median_time_weighted
`median_time_weighted(column, time_column)` to calculate the time-weighted median of the column. The time column should be in the format of `datetime`,`datetime64` or `date`.

This function also takes an optional third parameter to specify an end time for your analysis period.

### histogram
`histogram(column, bin_count)` to calculate the histogram of the column. The bin count should be a positive integer.
