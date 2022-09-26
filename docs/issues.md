# Known Issues and Limitations

We are currently in early beta. Please be aware of the following known issues and limitations.

## UI

* You can use mobile browser to sign up for Timeplus Cloud. But only Google Chrome desktop browser is supported to use the Timeplus Console. 
* Users in the same workspace will see all activity history and definitions, such as views, sinks, dashboards.

## Backend

* When you define a stream or a materialized view, you should avoid using `window_start` and `window_end` as the column names. This will conflict with the dynamic column names `window_start` and `window_end` for `tumble`, `hop`, `session` windows. You can create alias while creating materialized views, e.g. `select window_start as windowStart, window_end as windowEnd, count(*) as cnt from tumble(stream,10s) group by window_start, window_end`
* `create view` doesn't support `json` type columns. When creating views from streams with `json` type columns, the `json` column cannot be selected as an entire column. Need to select the leaf node of the JSON document in the view definition.