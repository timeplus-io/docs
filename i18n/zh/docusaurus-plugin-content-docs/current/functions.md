# 函数

Timeplus Proton supports ANSI-SQL standard syntax. 以下功能适用于各种使用案例。 Most of the [functions in ClickHouse](https://clickhouse.com/docs/en/sql-reference/functions) are available in Proton, with different naming conventions (for example [array_join](functions_for_comp#array_join) instead of [arrayJoin](https://clickhouse.com/docs/en/sql-reference/functions/array-join)). [New functions are added](functions_for_streaming) for streaming processing. 如果您需要更多功能，请联系我们。

:::info

Please note, in Proton 1.3.27 or the earlier versions, SQL functions were case-sensitive and always in lower-case. Since 1.3.28, function names are case-insensitive. For example `count`, `COUNT` and `Count` work in the same way. SQL Keywords such as `SELECT` or `FROM` are case-insensitive too. In the rest of the documentation, we use function names in lower case for demonstration.

:::

[类型转换](functions_for_type)

[数组、地图、元组](functions_for_comp)

[处理日期和时间](functions_for_datetime)

[处理 URL](functions_for_url)

[处理 JSON](functions_for_json)

[处理文本](functions_for_text)

[哈希](functions_for_hash)

[聚合](functions_for_agg)

[逻辑（if, multi_if）](functions_for_logic)

[数学](functions_for_math)

[财务](functions_for_fin)

[地理位置](functions_for_geo)

[流处理](functions_for_streaming)





