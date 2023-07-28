

# 处理 URL

### 协议

`protocol(url)` 从 URL 中提取协议。

例如 `protocol('https://docs.timeplus.com/functions')` 将返回字符串 `https`

### 域名

`domain(url)` 从 URL 中提取域。

例如 `domain('https://docs.timeplus.com/functions')` 将返回字符串 `docs.timeplus.com`

### 端口

`port(url)` 从 URL 中提取端口。 如果 URL 中缺少端口，则返回 0。

例如 `port('https://docs.timeplus.com/functions')` 将返回整数 0

### 路径

`path (url)` 从 URL 中提取路径，不含查询字符串或片段。

例如 `path('https://docs.timeplus.com/functions')` 将返回字符串 `/functions`

### 所有路径

`path_all (url)` 从 URL 中提取路径，包括查询字符串或片段。

例如 `path_full('https://docs.timeplus.com/functions_for_logic#if')` 将返回字符串 `/functions_for_logic#if`

### 片段

`fragment(url)` 从 URL 中提取片段。 如果没有片段，则返回一个空字符串。

例如 `fragment('https://docs.timeplus.com/functions_for_logic#if')` 将返回字符串 `if`

### 查询字符串

`query_string (url)` 从 URL 中提取查询字符串。 如果没有查询字符串，则返回一个空字符串。

例如 `query_string('https://a.com?k=v&key=value')` 将返回字符串 `k=v&key=value`

### decode_url_component

`decode_url_component(url)` 返回解码的 URL。

### encode_url_component

`encode_url_component(url)` 返回编码的 URL。