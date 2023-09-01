# Quickstart with ingestion REST API

You can call the ingestion REST API to push data to Timeplus, with any preferred languages. 

With the recent enhancements of the ingest API, in many cases, you can configure other systems to push data directly to Timeplus via webhook, without writing code.

In this quickstart guide, you will push JSON documents one by one to the targeted stream `foo`. Please check [this document](ingest-api) for more details.

## Step 1: Create the target stream

Timeplus provides many options to push data as a single document or in a batch with multiple documents, or as a flexible schema or fixed schema. For the sake of simplicity, in this tutorial, you will post JSON documents like this to a stream with a single column called `raw` in `string` type.

```json
{"key1": "value11", "key2": 12}
```

First, login in Timeplus Console, in the Streams page, click the **New Stream** button. Set **Stream Name** as `foo`, leaving the **Description** empty. In the **Columns** list, type `raw` as the NAME, type or choose `string` as the TYPE. Then click **Create** button.

What we will do is to add new JSON documents in this stream, and later on you can query them via Streaming SQL with easy access to the JSON attributes, e.g.

```sql
select raw:key1 as k1, raw:key2::int as k2 from foo
```


## Step 2: Create an API Key

You need to create an API key to access Timeplus REST API. To do so:

1. Click on your **avatar** in the top right corner.
2. In the dropdown, click **Personal Settings**.
3. In the API Keys section, click the **Create API Key** button.
4. Enter an optional description for the key, choose an expiration date if needed, and click **Create**.
5. The API key will only be shown to you once - make sure you securely save it right away. You won’t be able to retrieve the key again later in the console. 

## Step 3: Send data to Timeplus with the API key

Depending on which tool or programming language works best for you, you can send data to Timeplus in different ways. 

The base endpoint for the ingestion API is `https://us.timeplus.cloud/WORKSPACE_ID/api/v1beta2/streams/STREAM_NAME/ingest`
:::info

Make sure you are using the `workspace-id`, instead of `workspace-name`. The workspace id is a random string with 8 characters. You can get it from the browser address bar: `https://us.timeplus.cloud/<workspace-id>/console`. The workspace name is a friendly name you set while you create your workspace. Currently this name is read only but we will make it editable in the future.

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

You can use built-in libraries or 3rd party libraries to make HTTP requests. In this example, we are using [okhttp](https://square.github.io/okhttp/).

The latest release is available on [Maven Central](https://search.maven.org/artifact/com.squareup.okhttp3/okhttp/4.10.0/jar).

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
