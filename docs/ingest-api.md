# Push data to Timeplus via ingest REST API

As a generic solution, you can call the ingestion REST API to push data to Timeplus, with any preferred languages. Please check https://docs.timeplus.com/rest for the detailed API documentations.

## Create a stream in Timeplus

First you need to create a stream in Timeplus, either using the web UI or via REST API. Columns with proper names and types should be set. In the following section, we assume the stream name is `foo`.

## Set API Key in HTTP Header

Please generate an API Key for a workspace and set the API Key in the HTTP Header, with the name: `X-Api-Key`

:::info

If you would like to leverage a 3rd party system/tool to push data to Timeplus but it doesn't allow custom HTTP Header, then you can use the standard `Authorization` Header, with value `ApiKey $KEY`

:::

## Push data to Timeplus

The endpoint for real-time data ingestion is `https://beta.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

You need to send `POST` request to this endpoint, e.g. ``https://beta.timeplus.cloud/ws123/api/v1beta1/streams/foo/ingest``

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

### Push  data  without repeating the columns

The above method should work very well for most system integrations.  However, the column names will be repeatedly mentioned in the requested body.

We also provide a more performant solution to only list the column names once.

Same endpoint URL: `https://beta.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

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