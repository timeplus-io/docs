# timeplus-connect (Python)

`timeplus-connect` is the recommended Python library to connect to Timeplus Proton and Timeplus Enterprise. It's a high performance database driver for connecting Timeplus to Python, Pandas, and Superset
* Pandas DataFrames
* Numpy Arrays
* PyArrow Tables
* Superset Connector
* SQLAlchemy 1.3 and 1.4 (limited feature set)

Timeplus Connect currently uses the Timeplus HTTP interface for maximum compatibility, defaulting to 8123 (batch query). You can also use 3218 port for [streaming queries](#streaming-query).

The source code and latest releases are available on [GitHub](https://github.com/timeplus-io/timeplus-connect).

## Installation

```bash
pip install timeplus-connect
```
Timeplus Connect requires Python 3.9 or higher.

## Streaming Query
The SQLAlchemy or DBAPI don't support streaming queries. You can use the low level HTTP client interface to perform streaming queries.

```python
client=timeplus_connect.get_client(
        host="timeplus_host",
        port=3218, # make sure to use 3218 port for streaming query
        username="timeplus", # for Timeplus Proton, username=default, and password is an empty string
        password=os.environ.get("PWD"),
    )
with client.query_arrow_stream('select ..') as _stream:
    for _batch in _stream:
        _batch.to_pandas()
```

## SQLAlchemy Implementation
Timeplus Connect incorporates a minimal SQLAlchemy implementation (without any ORM features) for compatibility with Superset. It has only been tested against SQLAlchemy versions 1.3.x and 1.4.x, and is unlikely to work with more complex SQLAlchemy applications.

When creating a SQLAlchemy Data Source, use a SqlAlchemy DSN in the form `timeplus://{username}:{password}@{host}:{port}`, such as `timeplus://default:password@localhost:8123`.

```python
engine = sqlalchemy.create_engine("timeplus://default:@localhost:8123")
```

## Superset Connectivity
Timeplus Connect is fully integrated with Apache Superset.

When creating a Superset Data Source, use a SqlAlchemy DSN in the form `timeplus://{username}:{password}@{host}:{port}`, such as `timeplus://default:password@localhost:8123`.
