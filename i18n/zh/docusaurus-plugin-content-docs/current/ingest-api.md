# 通过REST API 将数据推送到 Timeplus

作为通用解决方案，您可以使用任何首选语言调用 ingestion REST API 将数据推送到 Timeplus。 借助Ingest API的最新增强，在许多情况下，您可以将其他系统配置为通过 webhook 将数据直接推送到 Timeplus，而无需编写代码。

请查看 https://docs.timeplus.com/rest 了解详细的 API 文档。

## 在 Timeplus 中创建一个流

首先，您需要在 Timeplus 中创建一个流，要么使用 web UI ，要么通过 REST API。 应每一列设置适当的名称和类型。 在下一节中，我们假设流名称为 `foo`。

## 在HTTP头发送身份验证令牌

请为工作区生成 API 密钥，并在 HTTP 头中设置 API 密钥，名称为： `X-Api-Key`

:::info

如果您想要利用第三方系统/工具将数据推送到Timeplus，但它不允许自定义内容类型， 然后您可以使用标准 `application/json` 内容类型，并将 POST 请求发送到 `/api/v1beta1/streams/$KEY/ingest?format=streaming`

:::

## 向 Timeplus 发送数据

实时数据摄取的API endpoint是 `https://beta.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

你需要向这个端点发送 `个 POST` 请求，例如 `https://beta.timeplus.cloud/ws123/api/v1beta1/streams/foo/ingest`

### 选项

根据您的用例，有很多方法可以通过 REST API 将数据推送到 Timeplus：

| 应用场景                                                                       | 样本POST请求内容                                                                                                                                                            | Content-Type                                                             | URL                                  |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| 一次推送多个 JSON 对象。 每个 JSON 都是一个事件。                                            | {"key1": "value11", "key2": "value12", ...}<br/>{"key1": "value21", "key2": "value22", ...}                                                                     | `application/x-ndjson` 或`application/vnd.timeplus+json;format=streaming` | ingest?format=streaming              |
| 推送单个 JSON 或长文本。 Single event.                                              | {"key1": "value11", "key2": "value12", ...}                                                                                                                           | `text/plain`                                                             | ingest?format=raw                    |
| Push a set of events in a batch. Each line is an event.                    | event1<br/>event2                                                                                                                                               | `text/plain`                                                             | ingest?format=lines                  |
| Push a special JSON with mutiple events, without repeating the column name | { <br/>  "columns": ["key1","key2"],<br/>  "data": [ <br/>    ["value11","value12"],<br/>    ["value21","value22"],<br/>  ]<br/>} | `application/json`                                                       | ingest?format=compact or just ingest |



### 直接推送 JSON 对象

你可以将换行符分隔的 JSON (http://ndjson.org/) 推送到终端节点。 确保将 HTTP 标头设置为以下选项之一：
* `application/x-ndjson`
* `application/vnd.timeplus+json;format=streaming`

:::info

如果您想要利用第三方系统/工具将数据推送到Timeplus，但它不允许自定义内容类型， 然后您可以使用标准 `application/json` 内容类型，并将 POST 请求发送到 `/api/v1beta1/streams/$STREAM_NAME/ingest?format=streaming`. 这将确保 Timeplus API 服务器将 POST 数据视为 NDJSON。 这将确保 Timeplus API 服务器将 POST 数据视为 NDJSON。

:::

请求正文只是一组 JSON 对象。 例如

```json
{"key1": "value11", "key2": "value12", ...}
{"key1": "value21", "key2": "value22", ...}
...
```

每个对象不必在一行中。 例如：
```json
{"key1": "value11", "key2": "value12", ...}
{"key1": "value21", "key2": "value22", ...}
...
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

### Push data to a single column stream

It's a common pratice to create a stream in Timeplus with a single `string` column, called `raw` You can put JSON objects in this column then extract value, or put the raw log message in this column.

If you set Content-Type header to `text/plain`, then depending on the URL, Timeplus can treat the entire POST message as a single event or each line as an event. In either case, the data will be put in the `raw` column. If you have to create column name differently, please contact us for support.

* If the URL ends with `ingest?format=raw`, then the entire body in the POST request will be put in the `raw` column.
* If the URL ends with `ingest?format=lines`, then each line in the POST body will be put in the `raw` column.

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