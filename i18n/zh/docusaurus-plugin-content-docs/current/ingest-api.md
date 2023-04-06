import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

### Endpoint

实时数据推送的API endpoint是 `https://cloud.timeplus.com.cn/{workspace-id}/api/v1beta1/streams/{name}/ingest`

:::info

Make sure you are using the `workspace-id`, instead of `workspace-name`. The workspace id is a random string with 8 characters. You can get it from the browser address bar: `https://us.timeplus.cloud/<workspace-id>/console`. The workspace name is a friendly name you set while you create your workspace. Currently this name is readonly but we will make it editable in the future.

:::

You need to send `POST` request to this endpoint, e.g. `https://us.timeplus.cloud/ws123456/api/v1beta1/streams/foo/ingest`

### 选项

Depending on your use cases, there are many options to push data to Timeplus via REST API. You can set different `Content-Type` in the HTTP Header, and add the `format` query parameter in the URL.

Here are a list of different use cases to push data to Timeplus:

| 应用场景                                                                          | 样本POST请求内容                                                                                                                                                   | Content-Type           | URL                                    | Columns in the target stream      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------- | --------------------------------- |
| 1) Push JSON objects. 每个 JSON 都是一个事件。                                         | {"key1": "value11", "key2": "value12", ...}<br/>{"key1": "value21", "key2": "value22", ...}                                                            | `application/x-ndjson` | ingest?format=streaming                | multiple columns, e.g. key1, key2 |
| 2) Push a single JSON or a long text. 单个事件                                    | {"key1": "value11", "key2": "value12", ...}                                                                                                                  | `text/plain`           | ingest?format=raw                      | single column, named `raw`        |
| 3) Push a batch of events. 每行都是一个事件。                                          | event1<br/>event2                                                                                                                                      | `text/plain`           | ingest?format=lines                    | single column, named `raw`        |
| 4) Push a special JSON with mutiple events, without repeating the column name | { <br/> "columns": ["key1","key2"],<br/> "data": [ <br/> ["value11","value12"],<br/> ["value21","value22"],<br/> ]<br/>} | `application/json`     | ingest?format=compact 或者直接用无参数的 ingest | multiple columns, e.g. key1, key2 |

#### 1) Push JSON objects directly {#option1}

Request samples
<Tabs defaultValue="curl">
<TabItem value="js" label="Node.js" default>

```js
const https = require("https");
const options = {
  hostname: "us.timeplus.cloud",
  path: "/ws123456/api/v1beta1/streams/foo/ingest?format=streaming",
  method: "POST",
  headers: {
    "Content-Type": "application/x-ndjson",
    "X-Api-Key": "<your_api_key>",
  },
};

const data = `
{"key1": "value11", "key2": "value12"}
{"key1": "value21", "key2": "value22"}
`;
const request = https.request(options, (resp) => {});
request.on("error", (error) => {
  console.error(error);
});
request.write(data);
request.end();
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -s -X POST -H "X-Api-Key: your_api_key" \
-H "Content-Type: application/x-ndjson" \
https://us.timeplus.cloud/ws123456/api/v1beta1/streams/foo/ingest?format=streaming \
-d '
{"key1": "value11", "key2": "value12"}
{"key1": "value21", "key2": "value22"}
'
```

  </TabItem>
  <TabItem value="py" label="Python">

```python
import requests

url = "https://us.timeplus.cloud/ws123456/api/v1beta1/streams/foo/ingest?format=streaming"
headers = {
    "X-Api-Key": "your_api_key",
    "Content-Type": "application/x-ndjson"
}
data = '''\
{"key1": "value11", "key2": "value12"}
{"key1": "value21", "key2": "value22"}
'''

response = requests.post(url, headers=headers, data=data)

print(response.status_code)
print(response.text)
```

  </TabItem>
  <TabItem value="java" label="Java">

```java
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;

public class Example {
    public static void main(String[] args) throws IOException {
        OkHttpClient client = new OkHttpClient();

        String url = "https://us.timeplus.cloud/ws123456/api/v1beta1/streams/foo/ingest?format=streaming";
        MediaType mediaType = MediaType.parse("application/x-ndjson");
        String data = "{\"key1\": \"value11\", \"key2\": \"value12\"}\n{\"key1\": \"value21\", \"key2\": \"value22\"}";
        RequestBody body = RequestBody.create(mediaType, data);

        Request request = new Request.Builder()
                .url(url)
                .header("X-Api-Key", "your_api_key")
                .header("Content-Type", "application/x-ndjson")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println(response.code());
            System.out.println(response.body().string());
        }
    }
}
```

  </TabItem>
</Tabs>

你可以将换行符分隔的 JSON (http://ndjson.org/) 推送到终端节点。 确保将 HTTP 标头设置为以下选项之一：

- `application/x-ndjson`
- `application/vnd.timeplus+json;format=streaming`

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

#### 2) Push a single JSON or string to a single column stream {#option2}

Request samples
<Tabs defaultValue="curl">
<TabItem value="js" label="Node.js" default>

```js
const https = require("https");
const options = {
  hostname: "us.timeplus.cloud",
  path: "/ws123456/api/v1beta1/streams/foo/ingest?format=raw",
  method: "POST",
  headers: {
    "Content-Type": "text/plain",
    "X-Api-Key": "<your_api_key>",
  },
};

const data = `{"key1": "value11", "key2": "value12"}`;
const request = https.request(options, (resp) => {});
request.on("error", (error) => {
  console.error(error);
});
request.write(data);
request.end();
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -s -X POST -H "X-Api-Key: your_api_key" \
-H "Content-Type: text/plain" \
https://us.timeplus.cloud/ws123456/api/v1beta1/streams/foo/ingest?format=raw \
-d '
{"key1": "value11", "key2": "value12"}
'
```

  </TabItem>
  <TabItem value="py" label="Python">

```python
import requests

url = "https://us.timeplus.cloud/ws123456/api/v1beta1/streams/foo/ingest?format=raw"
headers = {
    "X-Api-Key": "your_api_key",
    "Content-Type": "text/plain"
}
data = '''\
{"key1": "value11", "key2": "value12"}
'''

response = requests.post(url, headers=headers, data=data)

print(response.status_code)
print(response.text)
```

  </TabItem>
  <TabItem value="java" label="Java">

```java
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;

public class Example {
    public static void main(String[] args) throws IOException {
        OkHttpClient client = new OkHttpClient();

        String url = "https://us.timeplus.cloud/ws123456/api/v1beta1/streams/foo/ingest?format=raw";
        MediaType mediaType = MediaType.parse("text/plain");
        String data = "{\"key1\": \"value11\", \"key2\": \"value12\"}";
        RequestBody body = RequestBody.create(mediaType, data);

        Request request = new Request.Builder()
                .url(url)
                .header("X-Api-Key", "your_api_key")
                .header("Content-Type", "text/plain")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println(response.code());
            System.out.println(response.body().string());
        }
    }
}
```

  </TabItem>
</Tabs>

It's a common pratice to create a stream in Timeplus with a single `string` column, called `raw` You can put JSON objects in this column then extract value (such as `select raw:key1`), or put the raw log message in this column.

When you set Content-Type header to `text/plain`, and add `format=raw` to the ingestion endpoint, the entire body in the POST request will be put in the `raw` column.

#### 3) Push multiple JSON or text to a single column stream. Each line is an event {#option3}

When you set Content-Type header to `text/plain`, and add `format=lines` to the ingestion endpoint, the each line in the POST body will be put in the `raw` column.

#### 4) Push multiple events in a batch without repeating the columns {#option4}

上述方法应该适用于大多数系统集成。 但是，将在请求的正文中反复提及列名。

我们还提供了一种性能更高的解决方案，只需要发送一次列名。

相同的网址： `https://cloud.timeplus.com.cn/{workspace-id}/api/v1beta1/streams/{name}/ingest`

但您需要将 HTTP 头设置为 application/json。

- `application/json`
- `application/vnd.timeplus+json`
- `application/vnd.timeplus+json;format=compact`

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

- `columns` 是一个字符串数组，为一系列列名
- `data` 是一个数组，每个元素也是一个数组。 每个嵌套数组代表一行数据。 值顺序必须与 `列`中完全相同的顺序匹配。

例如：

```json
{
  "columns": ["key1", "key2"],
  "data": [
    ["value11", "value12"],
    ["value21", "value22"]
  ]
}
```

您也可以使用我们的其中一个 SDK 来发送数据，而无需处理 REST API 的细节。
