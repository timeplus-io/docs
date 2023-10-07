

# 处理 JSON

Various functions are provided to extract values from JSON documents. You can also use the shortcut `<json>::<path>` to extract the string value for specified JSON path, e.g. `raw::b.c` to get value "1" from `{"a":true,"b":{"c":1}}`. Then you can convert it to other data types using `to_int()` or `::int` shortcut.

### json_extract

`json_extract_int(json, key)` 获取指定的 JSON 文档和密钥的整数值。 For example `json_extract_int('{"a":10,"b":3.13}','a')` will get the number `10`.

You can also use the shortcut `col:a::int`.

### json_extract_float

`json_extract _float(json, key)` 获取指定的 JSON 文档和密钥的浮点值。 For example `json_extract_int('{"a":10,"b":3.13}','b')` will get the float value `3.13`.

You can also use the shortcut `col:a::float`.

### json_extract_bool

`json_extract_bool(json, key)` 从指定的 JSON 文档和密钥中获取布尔值。 For example `json_extract_bool('{"a":true}','a')` will get the boolean value `true` or `1`.

You can also use the shortcut `col:a::bool`.

### json_extract_string

`json_extract_string(json, key)`获取指定的 JSON 文档和密钥的字符串值。 例如， `json_extract_string('{"a":true,"b":{"c":1}}','b')` 将获得字符串值 `{"c":1}` 并且您可以继续使用 JSON 函数来提取值。

You can also use the shortcut `col:b` to get the string value, or `col:b.c::int` to get the nested value.

### json_extract_array

`json_has(json, key)` 来检查是否在 JSON 文档中存在指定的密钥。 For example `json_extract_array('{"a": "hello", "b": [-100, 200.0, "hello"]}', 'b')` will get the array value `['-100','200','"hello"']` If the entire JSON document is an array, the 2nd parameter `key` can be omitted to turn the json string as an array, e.g. `json_extract_array(arrayString)`.

You can also use the shortcut `col:b[*]`.

### json_extract_keys

`json_extract_keys(jsonStr)` 来解析 JSON 字符串并提取密钥。 例如： `选择 '{"system_diskio_name":"nvme0n1"}" 作为标签，json_extract_keys(标签)` 将获得一个数组： `[ "system_diskio_name" ]`

### is_valid_json

`is_valid_json(str)` 来检查给定的字符串是否是有效的 JSON 返回 true(1) 或 false(0) 返回 true(1) 或 false(0) 返回 true(1) 或 false(0)

### json_has

`json_has(json, key)` 检查JSON文档中是否存在指定的键。 For example, `json_value('{"a":true,"b":{"c":1}}','$.b.c')` will return the number `1`

### json_value

`json_value(json, path)` 允许您访问嵌套的 JSON 对象。 例如， `json_extract_int('{"a":,"b":1}','a')` 将获得数字 `1`

### json_query

`json_query(json, path)` 允许您访问 JSON 嵌套的 JSON 对象作为JSON 数组或 JSON 对象。 如果值不存在，则返回空字符串。 例如， `json_query('{"a":true,"b":{"c":1}}','$.b.) ')` 将返回一个 1 元素  `[1]` 的数组更复杂的例子。 `json_query('{"records":[{"b":{"c":1}}},{"b":{"c":2}}},{"b":{"c":3}}},','$. ecords[*].b.c')` 将获得 `[1,2,3]`