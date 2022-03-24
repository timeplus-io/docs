# Configure the stream generator

Please check Load [sample streaming data](ingestion#load-sample-streaming-data) for the overview of this data source.

## Sample configuration

Here is a sample of stream generator configuraion json:

```json
{
                "batch_size": 1,
                "interval": 200,
                "fields": [
                    {
                        "name": "number",
                        "type": "int",
                        "limit": [
                            0,
                            10
                        ]
                    },
                    {
                        "name": "_time",
                        "type": "timestamp",
                        "timestamp_format": "2006-01-02 15:04:05.000"
                    }
                ]
            }
```

The usage of each attribute:

| Field Name       | Description                                                  | Sample Value |
| ---------------- | ------------------------------------------------------------ | ------------ |
| `batch_size`     | how many batched to be generated for each iteration          | `2`          |
| `interval`       | the interval between each iteration in millisecond           | `1000`       |
| `interval_delta` | a random delta for the interval of each iteration            | `300`        |
| `count`          | how many events to be generated, if `0` is set, there is no limits for the events | `1000`       |
| `fields`         | a list of fields definition                                  |              |



For  `fields`, the following attributes are supported:



| Field Name            | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `name`                | name of the field                                            |
| `type`                | what types of data to be generated, support `timestamp`, `string`, `int`, `float`, `bool`, `map`, `array`, `generate`, `regex` |
| `range`               | optional for string, int and float, which is list of value that can be generated |
| `limit`               | optional for int and float, a list with two values that specify the min/max of the generated data |
| `timestamp_format`    | optional for timestamp type, following golang time string format rules |
| `timestamp_delay_min` | minimal delay for timestamp in ms                            |
| `timestamp_delay_max` | maximal delay for timestamp in ms                            |
| `rule`                | a generation rule in case the `type` is `generate` or `regex` |

## Timestamp

By default, the timestamp will be generated as a int which is the unit timestamp that is the time in ms since 1970.1.1.
if `timestamp_format` is specified, it will be generated as a string using this `format`.  Refer to [this document](https://www.geeksforgeeks.org/time-formatting-in-golang/) for details.

## Regex Rule

In case the field type is set as `regex`, the generated data will be based on the regular expression specified in `rule` fields.

## Generator Rule

In case the field type is set as `generator`, the generated data will be based on the generation rule of [gofakeit](https://github.com/brianvoe/gofakeit), refer to [rule](https://pkg.go.dev/github.com/brianvoe/gofakeit/v6#example-Faker.Generate)