# 通过REST API 将数据推送到 Timeplus

作为通用解决方案，您可以使用任何首选语言调用 ingestion REST API 将数据推送到 Timeplus。 请查看 https://docs.timeplus.com/rest 了解详细的 API 文档。

## 在 Timeplus 中创建一个流

首先，您需要在 Timeplus 中创建一个流，要么使用 web UI ，要么通过 REST API。 应每一列设置适当的名称和类型。 在下一节中，我们假设流名称为 `foo`。

## 向 Timeplus 发送数据

实时数据摄取的API endpoint是 `https://beta.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

你需要向这个端点发送 `个 POST` 请求，例如 `https://beta.timeplus.cloud/ws123/api/v1beta1/streams/foo/ingest`

### 直接推送 JSON 对象

你可以将换行符分隔的 JSON (http://ndjson.org/) 推送到终端节点。 确保将 HTTP 标头设置为以下选项之一：
* `application/x-ndjson`
* `application/vnd.timeplus+json;format=streaming`

请求正文只是一组 JSON 对象。 例如

```json
{"key1": "value11", "key2": "value12", ...}
{"key1": "value21", "key2": "value22", ...}
...
```

每个对象不必在一行中。 例如：
```json
{
  "key1": "value11", 
  "key2": "value12", ...
}
{
  "key1": "value21", 
  "key2": "value22", ...
}
...
```

它们也不必用换行符分隔：
```json
{"key1": "valueA", ...}{"key1": "valueB", ...}{"key1": "valueC", ...,
}...
```

只要确保在请求正文中使用正确的值指定目标流中的所有列即可。

### 在不重复列的情况下推送数据

上述方法应该适用于大多数系统集成。  但是，将在请求的正文中反复提及列名。

我们还提供了一种性能更高的解决方案，只需要发送一次列名。

实时数据摄取的API endpoint是 `https://beta.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

但您需要将 HTTP 头设置为 application/json。

* `application/json`
* `application/vnd.timeplus+json`
* `application/vnd.timeplus+json;format=compact`

请求正文是这样格式的：
```json
{ 
  "columns": [..],
  "data": [ 
    [..],
    [..],
  ]
}
```

备注：
* `columns` 是一个字符串数组，为一系列列名
* `data` 是一个数组，每个元素也是一个数组。 每个嵌套数组代表一行数据。 值顺序必须与 `列`中完全相同的顺序匹配。

例如：
```json
{ 
  "columns": ["key1","key2"],
  "data": [ 
    ["value11","value12"],
    ["value21","value22"],
  ]
}

```

您也可以使用我们的其中一个 SDK 来发送数据，而无需处理 REST API 的细节。