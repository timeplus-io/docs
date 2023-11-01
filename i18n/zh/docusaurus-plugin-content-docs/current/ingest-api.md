import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Push data to Timeplus via ingest REST API

As a generic solution, you can call the ingestion REST API to push data to Timeplus, with any preferred languages. With the recent enhancements of the ingest API, in many cases, you can configure other systems to push data directly to Timeplus via webhook, without writing code.

Please check https://docs.timeplus.com/rest for the detailed API documentations.

## Create a stream in Timeplus

First you need to create a stream in Timeplus, either using the web UI or via REST API. Columns with proper names and types should be set. In the following section, we assume the stream name is `foo`.

## Set API Key in HTTP Header

Please generate an API Key for a workspace and set the API Key in the HTTP Header, with the name: `X-Api-Key`

:::info

If you would like to leverage a 3rd party system/tool to push data to Timeplus but it doesn't allow custom HTTP Header, then you can use the standard `Authorization` Header, with value `ApiKey $KEY`

:::

## Push data to Timeplus

### Endpoint

The endpoint for real-time data ingestion is `https://us.timeplus.cloud/{workspace-id}/api/v1beta2/streams/{name}/ingest`

:::info

Make sure you are using the `workspace-id`, instead of `workspace-name`. The workspace id is a random string with 8 characters. You can get it from the browser address bar: `https://us.timeplus.cloud/<workspace-id>/console`. The workspace name is a friendly name you set while you create your workspace. Currently this name is read only but we will make it editable in the future.

:::

You need to send `POST` request to this endpoint, e.g. `https://us.timeplus.cloud/ws123456/api/v1beta2/streams/foo/ingest`

### Options

Depending on your use cases, there are many options to push data to Timeplus via REST API. You can set different `Content-Type` in the HTTP Header, and add the `format` query parameter in the URL.

Here are a list of different use cases to push data to Timeplus:

| 应用场景                        | 样本POST请求内容                                                                                                                                                     | Content-Type           | URL                                   | 目标流中的列          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------- | --------------- |
| 1）推送JSON对象。 每个JSON都是一个事件。   | \{"key1": "value11", "key2": "value12", ...}<br/>\{"key1": "value21", "key2": "value22", ...}                                                          | `application/x-ndjson` | ingest?format=streaming               | 多列，例如：key1，key2 |
| 2）推送单个JSON或长文本。 单个事件。       | \{"key1": "value11", "key2": "value12", ...}                                                                                                                  | `text/plain`           | ingest?format=raw                     | 单列，命名为`raw`     |
| 3）推出一批事件。 每行都是一个事件。         | event1<br/>event2                                                                                                                                        | `text/plain`           | ingest?format=lines                   | 单列，命名为`raw`     |
| 4）推送一个带有多个事件的特殊JSON，而无需重复列名 | \{ <br/> "columns": ["key1","key2"],<br/> "data": [ <br/> ["value11","value12"],<br/> ["value21","value22"],<br/> ]<br/>} | `application/json`     | ingest?format=compact 或者直接用无参数的ingest | 多列，例如：key1，key2 |

#### 1) Push JSON objects directly {#option1}

Request samples
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

You can push Newline Delimited JSON (http://ndjson.org/) to the endpoint. Make sure you set the HTTP Header as one of these:

- `application/x-ndjson`
- `application/vnd.timeplus+json;format=streaming`

:::info

If you would like to leverage a 3rd party system/tool to push data to Timeplus but it doesn't allow custom content type, then you can use the standard `application/json`, and send POST request to `/api/v1beta2/streams/$STREAM_NAME/ingest?format=streaming`. This will ensure the Timeplus API server treats the POST data as NDJSON.

:::

The request body is just a stream of JSON objects. e.g.

```json
{"key1": "value11", "key2": "value12", ...}
{"key1": "value21", "key2": "value22", ...}
...
```

Each object does not have to be in a single line. For example:

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

They don’t have to be separated by newline either:

```json
{"key1": "valueA", ...}{"key1": "valueB", ...}{"key1": "valueC", ...,
}...
```

Just make sure all columns in the target stream are specified with proper value in the request body.

#### 2) Push a single JSON or string to a single column stream {#option2}

Request samples
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

It's a common practice to create a stream in Timeplus with a single `string` column, called `raw`. You can put JSON objects in this column then extract values (such as `select raw:key1`), or put the raw log message in this column.

When you set Content-Type header to `text/plain`, and add `format=raw` to the ingestion endpoint, the entire body in the POST request will be put in the `raw` column.

#### 3) Push multiple JSON or text to a single column stream. Each line is an event {#option3}
Request samples
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

When you set Content-Type header to `text/plain`, and add `format=lines` to the ingestion endpoint, each line in the POST body will be put in the `raw` column.

#### 4) Push multiple events in a batch without repeating the columns {#option4}
Request samples
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
The above method should work very well for most system integrations. However, the column names will be repeatedly mentioned in the requested body.

We also provide a more performant solution to only list the column names once.

Same endpoint URL: `https://us.timeplus.cloud/{workspace-id}/api/v1beta2/streams/{name}/ingest`

But you need to set the HTTP Header to one of these:

- `application/json`
- `application/vnd.timeplus+json`
- `application/vnd.timeplus+json;format=compact`

The request body is this format:

```json
{
  "columns": [..],
  "data": [
    [..],
    [..],
  ]
}
```

Note:

- the `columns` is an array of string, with the column names
- the `data` is an array of arrays. Each nested array represents a row of data. The value order must match the exact same order in the `columns`.

For example:

```json
{
  "columns": ["key1", "key2"],
  "data": [
    ["value11", "value12"],
    ["value21", "value22"]
  ]
}
```

You can also use one of our SDKs to ingest data without handling the low level details of REST API.
