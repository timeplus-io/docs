import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 通过REST API将数据推送到Timeplus

作为通用的解决方案，您可以使用任何语言调用ingestion REST API并将数据推送到Timeplus。 借助Ingest API的最新增强，在许多情况下，您可以通过webhook配置其他系统来将数据直接推送到Timeplus，而无需编写代码。

请查看 https://docs.timeplus.com/rest 了解详细的API文档。

## 在Timeplus中创建一个流

首先，您需要使用Web UI或REST API在Timeplus中创建一个流。 您需要设置具有正确名称和类型的列。 在下一节中，我们假设流名称为 `foo`。

## 在HTTP标头中设置身份验证令牌

接下来，您需要为工作区设置API密钥，并在 HTTP标头中将API密钥的名称设置为`X-Api-Key`。

:::注意

如果您想要利用第三方系统/工具将数据推送到Timeplus，但它不允许自定义HTTP标头的话，您可以使用值为`ApiKey $KEY`的标准`Authorization`标头。

:::

## 向Timeplus发送数据

### 终端

实时数据推送的 API 是 `https://us.timeplus.cloud/{workspace-id}/api/v1beta2/streams/{name}/ingest`

:::注意

请确保您使用的是`workspace-id`，而不是`workspace-name`。 Workspace-id是一个包含 8 个字符的随机字符串。 您可以点击以下链接获取：`https://us.timeplus.cloud/<workspace-id>/console`。 Workspace-name是您在创建工作区时设置的名称。 虽然目前此名称是只读的，但我们将在未来将其设为可编辑的。

:::

您需要发送 `POST` 请求到 URL`https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest`

### 选项

根据用例，通过REST API将数据推送到Timeplus中有许多选项。 您可以在HTTP标头中设置不同的`Content-Type`，并在URL中添加`format`查询参数。

这里是将数据推送到Timeplus的不同用例列表：

| 应用场景                        | 样本POST请求内容                                                                                                                                                   | Content-Type           | URL                                   | 目标流中的列          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------- | --------------- |
| 1）推送JSON对象。 每个JSON都是一个事件。   | {"key1": "value11", "key2": "value12", ...}<br/>{"key1": "value21", "key2": "value22", ...}                                                            | `application/x-ndjson` | ingest?format=streaming               | 多列，例如：key1，key2 |
| 2）推送单个JSON或长文本。 单个事件。       | {"key1": "value11", "key2": "value12", ...}                                                                                                                  | `text/plain`           | ingest?format=raw                     | 单列，命名为`raw`     |
| 3）推出一批事件。 每行都是一个事件。         | event1<br/>event2                                                                                                                                      | `text/plain`           | ingest?format=lines                   | 单列，命名为`raw`     |
| 4）推送一个带有多个事件的特殊JSON，而无需重复列名 | { <br/> "columns": ["key1","key2"],<br/> "data": [ <br/> ["value11","value12"],<br/> ["value21","value22"],<br/> ]<br/>} | `application/json`     | ingest?format=compact 或者直接用无参数的ingest | 多列，例如：key1，key2 |

#### 1）直接推送 JSON 对象 {#option1}

请求例子
<Tabs defaultValue="curl">
<TabItem value="js" label="Node.js" default>

```js
const https = require("https");
const options = {
  hostname: "us.timeplus.cloud",
  path: "/ws123456/api/v1beta2/streams/foo/ingest?format=streaming",
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
https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=streaming \
-d '
{"key1": "value11", "key2": "value12"}
{"key1": "value21", "key2": "value22"}
'
```

  </TabItem>
  <TabItem value="py" label="Python">

```python
import requests

url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=streaming"
headers = {
    "X-Api-Key": "your_api_key",
    "Content-Type": "application/x-ndjson"
}
data = '''
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

        String url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=streaming";
        MediaType mediaType = MediaType.parse("application/x-ndjson");
        String data = """
          {"key1": "value11", "key2": "value12"}
          {"key1": "value21", "key2": "value22"}
          """;
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

您可以将换行符分隔的JSON (http://ndjson.org/) 推送到终端节点。 确保将 HTTP 标头设置为以下选项之一：

- `application/x-ndjson`
- `application/vnd.timeplus+json;format=streaming`

:::注意

如果您想利用第三方系统/工具将数据推送到Timeplus中，但它不允许自定义内容类型时，您可以使用标准的`application/json`，并将POST请求发送到`/api/v1beta2/streams/$STREAM_NAME/ingest?format=streaming`。 这可以确保 Timeplus 的 API 服务器将 POST 数据视为 NDJSON。

:::

请求正文只是一组JSON对象。 例如

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

只需确保目标流中的所有列都在请求中指定了正确的值。

#### 2）推送单个JSON或单个字符串列的流 {#option2}

请求例子
<Tabs defaultValue="curl">
<TabItem value="js" label="Node.js" default>

```js
const https = require("https");
const options = {
  hostname: "us.timeplus.cloud",
  path: "/ws123456/api/v1beta2/streams/foo/ingest?format=raw",
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
https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=raw \
-d '
{"key1": "value11", "key2": "value12"}
'
```

  </TabItem>
  <TabItem value="py" label="Python">

```python
import requests

url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=raw"
headers = {
    "X-Api-Key": "your_api_key",
    "Content-Type": "text/plain"
}
data = '''
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

        String url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=raw";
        MediaType mediaType = MediaType.parse("text/plain");
        String data = """ 
          {"key1": "value11", "key2": "value12"} 
          """;
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

在 Timeplus 中创建具有单个 `string` 列的直播是一种常见的做法，称为 `raw`。 您可以将 JSON 对象放在此列中，然后提取值（例如 `select raw: key1`），或者将原始日志消息放入此列中。

当您将Content-Type标头设置为`text/plain`，并将`format=raw`添加到URL时，整个POST请求将被放入`raw`列中。

#### 3）将多个 JSON 或文本推送到单个列流。 每一行都是一个事件 {#option3}
请求例子
<Tabs defaultValue="curl">
<TabItem value="js" label="Node.js" default>

```js
const https = require("https");
const options = {
  hostname: "us.timeplus.cloud",
  path: "/ws123456/api/v1beta2/streams/foo/ingest?format=lines",
  method: "POST",
  headers: {
    "Content-Type": "text/plain",
    "X-Api-Key": "<your_api_key>",
  },
};

const data = `{"key1": "value11", "key2": "value12"}
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
-H "Content-Type: text/plain" \
https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=lines \
-d '{"key1": "value11", "key2": "value12"}
{"key1": "value21", "key2": "value22"}
'
```

  </TabItem>
  <TabItem value="py" label="Python">

```python
import requests

url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=lines"
headers = {
    "X-Api-Key": "your_api_key",
    "Content-Type": "text/plain"
}
data = '''{"key1": "value11", "key2": "value12"}
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

        String url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=lines";
        MediaType mediaType = MediaType.parse("text/plain");
        String data = """
          {"key1": "value11", "key2": "value12"}
          {"key1": "value21", "key2": "value22"}
""";
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

当你将 Content-Type 标头设置为`text/plain`，并将 `format=lines` 添加到摄取终端时，POST 请求中的每一行都将被放入 `raw` 列中。

#### 4）批量推送多个不重复列的事件 {#option4}
请求例子
<Tabs defaultValue="curl">
<TabItem value="js" label="Node.js" default>

```js
const https = require("https");
const options = {
  hostname: "us.timeplus.cloud",
  path: "/ws123456/api/v1beta2/streams/foo/ingest",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "<your_api_key>",
  },
};

const data = `
{
  "columns": ["key1","key2"],
  "data": [
    ["value11","value12"],
    ["value21","value22"],
  ]
}
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
-H "Content-Type: application/json" \
https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest \
-d '
{
  "columns": ["key1","key2"],
  "data": [
    ["value11","value12"],
    ["value21","value22"],
  ]
}
'
```

  </TabItem>
  <TabItem value="py" label="Python">

```python
import requests

url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest"
headers = {
    "X-Api-Key": "your_api_key",
    "Content-Type": "application/json"
}
data = '''
{
  "columns": ["key1","key2"],
  "data": [
    ["value11","value12"],
    ["value21","value22"],
  ]
}
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

        String url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest";
        MediaType mediaType = MediaType.parse("text/plain");
        String data = """
{
  "columns": ["key1","key2"],
  "data": [
    ["value11","value12"],
    ["value21","value22"],
  ]
}
          """;
        RequestBody body = RequestBody.create(mediaType, data);

        Request request = new Request.Builder()
                .url(url)
                .header("X-Api-Key", "your_api_key")
                .header("Content-Type", "application/json")
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
上述方法应该适用于大多数系统集成。 但是，列名会在请求的主体中反复提到。

因此，我们还提供了一个性能更高的解决方案，只需要发送一次列名。

相同的API 地址：`https://us.timeplus.cloud/{workspace-id}/api/v1beta2/streams/{name}/ingest`

但您需要将HTTP标头设置为以下其中一个：

- `application/json`
- `application/vnd.timeplus+json`
- `application/vnd.timeplus+json;format=compact`

请求正文是这样的格式：

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

- `columns` 是一个字符串数组，带有一些列列名
- `data` 是数组的一个数组。 每个嵌套数组代表一行数据。 值的顺序必须与`columns`中的顺序完全相同。

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

当然，您还可以使用我们的其中一个SDK来摄取数据，这样就无需处理 REST API的底层细节了。
