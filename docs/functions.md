# Functions

Timeplus Proton supports ANSI-SQL standard syntax. The following functions are provided for various use cases. Most of the [functions in ClickHouse](https://clickhouse.com/docs/en/sql-reference/functions) are available in Proton, with different naming conventions (for example [array_join](functions_for_comp#array_join) instead of [arrayJoin](https://clickhouse.com/docs/en/sql-reference/functions/array-join)). [New functions are added](functions_for_streaming) for streaming processing. Please contact us if you need more functions.

:::info

Please note, in Proton 1.3.27 or the earlier versions, SQL functions were case-sensitive and always in lower-case. Since 1.3.28, function names are case-insensitive. For example `count`, `COUNT` and `Count` work in the same way. SQL Keywords such as `SELECT` or `FROM` are case-insensitive too. In the rest of the documentation, we use function names in lower case for demonstration. 

:::

[Type Conversion](functions_for_type)

[Arrays, Maps, Tuples](functions_for_comp)

[Process Data and Time](functions_for_datetime)

[Process URL](functions_for_url)

[Process JSON](functions_for_json)

[Process Text](functions_for_text)

[Hash](functions_for_hash)

[Aggregation](functions_for_agg)

[Logic (if, multi_if)](functions_for_logic)

[Math](functions_for_math)

[Financial](functions_for_fin)

[Geo Location](functions_for_geo)

[Streaming Processing](functions_for_streaming)





