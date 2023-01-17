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

The endpoint for real-time data ingestion is `https://us.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

You need to send `POST` request to this endpoint, e.g. ``https://us.timeplus.cloud/ws123/api/v1beta1/streams/foo/ingest``

### Options

Depending on your use cases, there are many options to push data to Timeplus via REST API:

| Use Cases                                                    | Sample POST body                                             | Content-Type                                                 | URL                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------ |
| Push JSON objects. Each JSON is an event.                    | {"key1": "value11", "key2": "value12", ...}<br/>{"key1": "value21", "key2": "value22", ...} | `application/x-ndjson`  or`application/vnd.timeplus+json;format=streaming` | ingest?format=streaming              |
| Push a single JSON or a long text. Single event.             | {"key1": "value11", "key2": "value12", ...}                  | `text/plain`                                                 | ingest?format=raw                    |
| Push a set of events in a batch. Each line is an event.      | event1<br/>event2                                            | `text/plain`                                                 | ingest?format=lines                  |
| Push a special JSON with mutiple events, without repeating the column name | { <br/>  "columns": ["key1","key2"],<br/>  "data": [ <br/>    ["value11","value12"],<br/>    ["value21","value22"],<br/>  ]<br/>} | `application/json`                                           | ingest?format=compact or just ingest |



### Push JSON objects directly

You can push Newline Delimited JSON (http://ndjson.org/) to the endpoint. Make sure you set the HTTP Header as one of these:
* `application/x-ndjson`
* `application/vnd.timeplus+json;format=streaming`

:::info

If you would like to leverage a 3rd party system/tool to push data to Timeplus but it doesn't allow custom content type, then you can use the standard `application/json`, and send POST request to `/api/v1beta1/streams/$STREAM_NAME/ingest?format=streaming`. This will ensure the Timeplus API server to treat the POST data as NDJSON.

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

### Push data to a single column stream

It's a common pratice to create a stream in Timeplus with a single `string` column, called `raw` You can put JSON objects in this column then extract value, or put the raw log message in this column.

If you set Content-Type header to `text/plain`, then depending on the URL, Timeplus can treat the entire POST message as a single event or each line as an event. In either case, the data will be put in the `raw` column. If you have to create column name differently, please contact us for support.

* If the URL ends with `ingest?format=raw`, then the entire body in the POST request will be put in the `raw` column.
* If the URL ends with `ingest?format=lines`, then each line in the POST body will be put in the `raw` column.

### Push  data  without repeating the columns

The above method should work very well for most system integrations.  However, the column names will be repeatedly mentioned in the requested body.

We also provide a more performant solution to only list the column names once.

Same endpoint URL: `https://us.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

But you need to set the HTTP Header to one of these:

* `application/json`
* `application/vnd.timeplus+json`
* `application/vnd.timeplus+json;format=compact`

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
* the `columns` is an array of string, with the column names
* the `data` is an array of array. Each nested array represents a row of data. The value order must match the exact same order in the `columns`.

For example:
```json
{ 
  "columns": ["key1","key2"],
  "data": [ 
    ["value11","value12"],
    ["value21","value22"],
  ]
}

```

You can also use one of our SDKs to ingest data without handling the low level details of REST API.