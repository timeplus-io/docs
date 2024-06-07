# Push data to Timeplus

您可以使用任何语言调用 ingestion REST API 并将数据推送到 Timeplus。

借助Ingest API的最新增强，在许多情况下，您可以通过webhook配置其他系统来将数据直接推送到Timeplus，而无需编写代码。

在本快速入门指南中，您会将 JSON 文档逐个推送到目标流 `foo`。 更多详细信息，请查看 [这个文档](ingest-api) 。

## 第 1 步：创建目标流

Timeplus 提供了许多选项来将数据作为单个文档推送，或批量推送多个文档，亦或者作为灵活的架构或固定架构推送。 为了简单起见，在本教程中，您将把像这样的 JSON 文档发布到一个流中，其中有一个在 `字符串` 类型中被命名为 `raw` 的单列。

```json
{ "key1": "value11", "key2": 12 }
```

首先，登录 Timeplus 控制台，在流页面中，单击 **新的流** 按钮。 将 **流名称** 设置为 `foo`，将 **描述** 留空。 在 **列** 列表中，键入 `raw` 作为名称，键入或选择 `字符串` 作为类型。 然后，单击 **创建** 按钮。

我们要做的是在这个流中添加新的 JSON 文档，稍后您可以通过 Streaming SQL 查询它们，轻松访问 JSON 属性，例如

```sql
select raw:key1 as k1, raw:key2::int as k2 from foo
```

## 第二步：创建API密钥

您需要创建 API 密钥才能访问 Timeplus REST API。 为此，请执行以下操作：

1. 单击右上角用户图标。
2. 选择 **个人设置**
3. 选择第二个选项卡 **API 密钥管理**
4. 单击 **创建 API 密钥** 按钮
5. 设置一个可读的名称并选择到期日期
6. 将 API 密钥安全地保存在您的计算机中。 您不会在控制台中再次检索纯文本密钥。

## 第 3 步：使用 API 密钥向 Timeplus 发送数据

根据哪种工具或编程语言最适合您，您可以通过不同的方式向 Timeplus 发送数据。

ingestion API 的基础端点是 `https://cloud.timeplus.com.cn/WORKSPACE_ID/api/v1beta2/streams/STREAM_NAME/ingest` ::: info

请确保您使用的是 `workspace-id`，而不是 `workspace-name`。 Workspace-id 是一个包含8个字符的随机字符串。 您可以点击以下链接获取：`https://us.timeplus.cloud/<workspace-id>/console`。 Workspace-name 是您在创建工作区时设置的名称。 虽然目前此名称是只读的，但我们将在未来将其设为可编辑的。

:::

### curl

```bash
curl -s -X POST -H "X-Api-Key: your_api_key" \
-H "Content-Type: text/plain" \
https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=raw \
-d '
{"key1": "value11", "key2": 12}
'
```

### Node.js

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

const data = `{"key1": "value11", "key2": 12}`;
const request = https.request(options, (resp) => {});
request.on("error", (error) => {
  console.error(error);
});
request.write(data);
request.end();
```

### Python

```python
import requests

url = "https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest?format=raw"
headers = {
    "X-Api-Key": "your_api_key",
    "Content-Type": "text/plain"
}
data = '''
{"key1": "value11", "key2": 12}
'''

response = requests.post(url, headers=headers, data=data)
print(response.status_code)
print(response.text)
```

### Java

您可以使用内置库或第三方库发出 HTTP 请求。 在这个例子中，我们使用的是 [okhttp](https://square.github.io/okhttp/)。

最新版本已在 [Maven Central](https://search.maven.org/artifact/com.squareup.okhttp3/okhttp/4.10.0/jar) 上发布。

```groovy
implementation("com.squareup.okhttp3:okhttp:4.10.0")
```

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
          {"key1": "value11", "key2": 12}
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
