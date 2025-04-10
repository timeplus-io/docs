# timeplus-connect (Python)

`timeplus-connect` is the recommended Python library to connect to Timeplus Proton and Timeplus Enterprise. It's a  high performance database driver for connecting Timeplus to Python, Pandas, and Superset
* Pandas DataFrames
* Numpy Arrays
* PyArrow Tables
* Superset Connector
* SQLAlchemy 1.3 and 1.4 (limited feature set)

Timeplus Connect currently uses the Timeplus HTTP interface for maximum compatibility, defaulting to 8123.

The source code and latest releases are available on [GitHub](https://github.com/timeplus-io/timeplus-connect).

## Installation

```bash
pip install timeplus-connect
```
Timeplus Connect requires Python 3.9 or higher.

## SQLAlchemy Implementation
Timeplus Connect incorporates a minimal SQLAlchemy implementation (without any ORM features) for compatibility with Superset. It has only been tested against SQLAlchemy versions 1.3.x and 1.4.x, and is unlikely to work with more complex SQLAlchemy applications.

When creating a SQLAlchemy Data Source, use a SqlAlchemy DSN in the form `timeplus://{username}:{password}@{host}:{port}`, such as `timeplus://default:password@localhost:8123`.

```python
engine = sqlalchemy.create_engine("timeplus://default:@localhost:8123")
```

## Superset Connectivity
Timeplus Connect is fully integrated with Apache Superset.

When creating a Superset Data Source, use a SqlAlchemy DSN in the form `timeplus://{username}:{password}@{host}:{port}`, such as `timeplus://default:password@localhost:8123`.
