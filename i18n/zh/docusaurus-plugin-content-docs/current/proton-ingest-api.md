# Ingest REST API

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

You can run `INSERT INTO [stream](column1, column2) VALUES (..)` SQL to insert data to Proton. You can also call the ingestion REST API to push data to Proton, with any preferred languages. This may work better for integration Proton with other systems or live data source (such as IoT sensors).

## 先决条件

### Expose port 3218 from Proton container

The Proton ingest REST API is on port 3218 by default. Please start the proton container with the 3218 port exposed. 例如：

```shell
docker run -d -p 3218:3218 --pull always --name proton ghcr.io/timeplus-io/proton:latest 
```



### Create a stream in Proton

You need to create a stream in Timeplus via [CREATE STREAM](proton-create-stream). 您需要设置具有正确名称和类型的列。

First run the SQL client

```shell
docker exec -it proton proton-client
```

Then run the following SQL to create the stream.

```sql
CREATE STREAM foo(id int, name string)
```

## 向Timeplus发送数据

The endpoint for real-time data ingestion is `http://localhost:3218/proton/v1/ingest/streams/{stream_name}`. HTTP method is `POST`.

**Request samples:**
<Tabs defaultValue="curl">
<TabItem value="js" label="Node.js" default>

```js
const http = require("http");
const options = {
  hostname: "localhost",
  path: "/proton/v1/ingest/streams/foo",
  method: "POST"
};

const data = `
{
  "columns": ["id","name"],
  "data": [
    [1,"hello"],
    [2,"world"]
  ]
}
`;
const request = http.request(options, (resp) => {});
request.on("error", (error) => {
  console.error(error);
});
request.write(data);
request.end();
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -s -X POST http://localhost:3218/proton/v1/ingest/streams/foo \
-d '{
  "columns": ["id","name"],
  "data": [
    [1,"hello"],
    [2,"world"]
  ]
}
'
```

  </TabItem>
  <TabItem value="py" label="Python">

```python
import requests

url = "http://localhost:3218/proton/v1/ingest/streams/foo"
headers = {
    "Content-Type": "application/json"
}
data = '''
{
  "columns": ["id","name"],
  "data": [
    [1,"hello"],
    [2,"world"]
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

        String url = "http://localhost:3218/proton/v1/ingest/streams/foo";
        MediaType mediaType = MediaType.parse("application/json");
        String data = """
{
  "columns": ["id","name"],
  "data": [
    [1,"hello"],
    [2,"world"]
  ]
}
          """;
        RequestBody body = RequestBody.create(mediaType, data);

        Request request = new Request.Builder()
                .url(url)
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

请求正文是这样的格式：

```json
{
  "columns": [..],
  "data": [
    [..],
    [..]
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
