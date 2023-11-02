

# 处理 JSON

为了从JSON文件中取值，我们提供了很多函数。 你也可以使用快捷方式`<json>::<path>`来提取指定JSON路径的字符串值，例如：使用`raw:: b.c`从`{"a”: true，"b”: {"c”: 1}}`中获取值 “1”。 然后，你可以使用快捷方式`to_int()`或`::int`将其转换为其他数据类型。

### json_extract

`json_extract_int(json, key)` 获取指定的 JSON 文档和密钥的整数值。 例如：`json_extract_int('{"a":10,"b":3.13}','a')`将获得数字 `10`。

你也可以使用快捷方式`col:a::int`。

### json_extract_float

`json_extract _float(json, key)` 获取指定的 JSON 文档和密钥的浮点值。 例如：`json_extract_int('{"a":10,"b":3.13}','b')`将获得浮点数`3.13`。

你也可以使用快捷方式`col:a::float`。

### json_extract_bool

`json_extract_bool(json, key)` 从指定的 JSON 文档和密钥中获取布尔值。 例如：`json_extract_bool('{"a":true}','a')`将获得布尔值 `true`或`1`。

你也可以使用快捷方式`col:a::bool`。

### json_extract_string

`json_extract_string(json, key)`获取指定的 JSON 文档和密钥的字符串值。 例如， `json_extract_string('{"a":true,"b":{"c":1}}','b')` 将获得字符串值 `{"c":1}` 并且您可以继续使用 JSON 函数来提取值。

你也可以使用快捷方式`col:b`来获取字符串值，或使用`col:b.c::int`来获取嵌套值。

### json_extract_array

`json_has(json, key)` 来检查是否在 JSON 文档中存在指定的密钥。 例如：`json_extract_array('{"a": "hello", "b": [-100, 200.0, "hello"]}', 'b')` 将获得数组值`['-100','200','"hello"']`。如果整个JSON文档是一个数组，则第二个参数`key` 可以省略以将JSON字符串转换为数组，例如：`json_extract_array(arrayString)`。

你也可以使用快捷方式`col:b[*]`。

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