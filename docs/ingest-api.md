# Push data to Timeplus via ingest REST API

As a generic solution, you can call the ingestion REST API to push data to Timeplus, with any preferred languages. Please check https://docs.timeplus.com/rest for the detailed API documentations.

## Create a stream in Timeplus

First you need to create a stream in Timeplus, either using the web UI or via REST API. Columns with proper names and types should be set. In the following section, we assume the stream name is `foo`.

## Push data to Timeplus

The endpoint for real-time data ingestion is `https://beta.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

You need to send `POST` request to this endpoint, e.g. ``https://beta.timeplus.cloud/ws123/api/v1beta1/streams/foo/ingest``

### Push JSON objects directly

You can push Newline Delimited JSON (http://ndjson.org/) to the endpoint. Make sure you set the HTTP Header as one of the following:
* application/x-ndjson
* application/vnd.timeplus+json;format=streaming

The request body is just a stream of JSON objects. e.g.
```json
{"key": "value11", "key2": "value12", ...}
{"key": "value21", "key2": "value22", ...}
...
```

Each object does not have to be in a single line. For example:
```json
{
  "key": "value11", 
  "key2": "value12", ...
}
{
  "key": "value21", 
  "key2": "value22", ...
}
...
```

They don’t have to be separated by newline either:
```json
{"key": "value", ...}{"key": "value", ...}{"key": "value", ...,
}...
```

Just make sure all columns in the target stream are specified with proper value in the request body.

### Push  data  without repeating the columns

The above method should work very well for most system integrations.  However, the column names will be repeatedly mentioned in the requested body.

We also provide a more performant solution to only list the column names once.

Same endpoint URL: `https://beta.timeplus.cloud/{workspace-id}/api/v1beta1/streams/{name}/ingest`

But you need to set the HTTP Header to `application/json`.

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