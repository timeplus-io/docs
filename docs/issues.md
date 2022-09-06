# Known Issues and Limitations

We are currently in early beta. Please be aware of the following known issues and limitations.

## UI

* Only Google Chrome is supported.
* Users in the same workspace will see all query history and saved queries.

## Backend

* `create view` doesn't support `json` type columns. When creating views from streams with `json` type columns, the `json` column cannot be selected as an entire column. Need to select the leaf node of the JSON document in the view definition.