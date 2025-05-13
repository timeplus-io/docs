# Process JSON

<iframe width="560" height="315" src="https://www.youtube.com/embed/dTKr1-B5clg?si=c_WKLu3knUVaj53R" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

Various functions are provided to extract values from JSON documents. You can also use the shortcut `<json>::<path>` to extract the string value for specified JSON path, e.g. `raw::b.c` to get value "1" from `{"a":true,"b":{"c":1}}`. Then you can convert it to other data types using `to_int()` or `::int` shortcut.

### json_extract_int

`json_extract_int(json, key)` to get the integer value from the specified JSON document and key. For example `json_extract_int('{"a":10,"b":3.13}','a')` will get the number `10`.

You can also use the shortcut `col:a::int`.

### json_extract_float

`json_extract_float(json, key)` to get the float value from the specified JSON document and key. For example `json_extract_int('{"a":10,"b":3.13}','b')` will get the float value `3.13`.

You can also use the shortcut `col:a::float`.

### json_extract_bool

`json_extract_bool(json, key)` to get the boolean value from the specified JSON document and key. For example `json_extract_bool('{"a":true}','a')` will get the boolean value `true` or `1`.

You can also use the shortcut `col:a::bool`.

### json_extract_string

`json_extract_string(json, key)`to get the string value from the specified JSON document and key. For example ` json_extract_string('{"a":true,"b":{"c":1}}','b')` will get the string value `{"c":1} ` and you can keep applying JSON functions to extract the values.

You can also use the shortcut `col:b` to get the string value, or `col:b.c::int` to get the nested value.

### json_extract_array

`json_extract_array(json, key)`to get the array value from the specified JSON document and key. For example ` json_extract_array('{"a": "hello", "b": [-100, 200.0, "hello"]}', 'b')` will get the array value `['-100','200','"hello"'] ` If the entire JSON document is an array, the 2nd parameter `key` can be omitted to turn the json string as an array, e.g. `json_extract_array(arrayString)`.

You can also use the shortcut `col:b[*]`.

### json_extract_keys

`json_extract_keys(jsonStr)` to parse the JSON string and extract the keys. e.g. `select '{"system_diskio_name":"nvme0n1"}' as tags,json_extract_keys(tags)` will get an array: ` [ "system_diskio_name" ]`

### is_valid_json

`is_valid_json(str)` to check whether the given string is a valid JSON or not. Return true(1) or false(0)

### json_has

`json_has(json, key)` to check whether a specified key exists in the JSON document. For example `json_has('{"a":10,"b":20}','c')`returns 0(false).

### json_value

`json_value(json, path)` allows you to access the nested JSON objects. For example, `json_value('{"a":true,"b":{"c":1}}','$.b.c')` will return the number `1`

### json_query

`json_query(json, path)` allows you to access the nested JSON objects as JSON array or JSON object. If the value doesn't exist, an empty string will be returned. For example, `json_query('{"a":true,"b":{"c":1}}','$.b.c')` will return an array with 1 element  `[1]` In a more complex example, `json_query('{"records":[{"b":{"c":1}},{"b":{"c":2}},{"b":{"c":3}}]}','$.records[*].b.c')` will get `[1,2,3]`

### json_encode
This function is available since Timeplus Enterprise v2.9.

This takes one or more parameters and return a json string. You can also turn all column values in the row as a json string via `json_encode(*)`.

### json_cast
This function is available since Timeplus Enterprise v2.9.

This takes one or more parameters and return a json object. You can also turn all column values in the row as a json object via `json_cast(*)`.
