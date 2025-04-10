# Query Kafka with SQL using marimo Python Notebook

This tutorial demonstrates how to query Apache Kafka with SQL using Timeplus Proton and marimo notebooks. You'll learn how to set up a lightweight environment to process and visualize streaming data from Kafka without complex infrastructure requirements.

## Key Highlights of This Approach

- **Lightweight Setup**: No Docker, JVM, or complex Python dependencies
- **Real Data**: Processing real-time GitHub events from Kafka
- **Efficient Processing**: Processing millions of Kafka messages without local storage
- **Interactive Visualization**: Charts update automatically and support interactive filtering

## Quick Start

Run the following commands to set up the environment:

```bash
curl https://astral.sh/uv/install.sh | sh
curl https://install.timeplus.com/oss | sh
./proton server&
uvx marimo run --sandbox https://raw.githubusercontent.com/timeplus-io/proton/refs/heads/develop/examples/marimo/github.py
```

These commands will:
1. Download uv (a Rust-based Python manager)
2. Download Timeplus Proton (an OSS streaming database in C++)
3. Run a marimo notebook with all dependencies auto-installed

## Detailed Setup and Tutorial Steps

### Step 1: Introduction to marimo

[marimo](https://marimo.io) is a modern Python notebook that offers several advantages over traditional Jupyter notebooks:

- Pure Python code (no .ipynb JSON)
- Git-friendly format
- Integrated dependency management with uv

The first part of the [github.py](https://github.com/timeplus-io/proton/blob/develop/examples/marimo/github.py) notebook declares its dependencies:

```python
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "altair==5.5.0",
#     "marimo",
#     "polars[pyarrow]==1.26.0",
#     "sqlalchemy==2.0.40",
#     "sqlglot==26.12.1",
#     "timeplus-connect==0.8.16",
# ]
# ///
```

When you run `uvx marimo run --sandbox github.py`, uv will check and download Python 3.13, create a new Python virtual environment, and install all required dependencies.

### Step 2: Start the Timeplus Proton Server

To connect to Kafka, you'll first need to run Timeplus Proton:

```bash
curl https://install.timeplus.com/oss | sh
./proton server
```

This downloads the single binary of Timeplus Proton to your current folder and starts the server.

To connect to Timeplus Proton in the marimo notebook, you can use the web UI or write Python code:

```python
engine = sqlalchemy.create_engine("timeplus://default:@localhost:8123")
```

### Step 3: Connect to Kafka

To query a Kafka topic using SQL, create an external stream in Timeplus Proton:

```sql
CREATE EXTERNAL STREAM IF NOT EXISTS github_events(
    actor string,
    created_at string,
    id string,
    payload string,
    repo string,
    type string
)
SETTINGS type='kafka',
    brokers='{kafka_broker}',
    topic='github_events',
    security_protocol='SASL_SSL',
    sasl_mechanism='SCRAM-SHA-256',
    username='readonly',
    password='{kafka_pwd}',
    skip_ssl_cert_check=true,
    data_format='JSONEachRow',
    one_message_per_row=true
```

Notes:
- Replace `{kafka_broker}` and `{kafka_pwd}` with your actual Kafka broker address and password
- The Kafka topic contains live GitHub events data in JSON format
- If you have too many columns or variable schema, you can create a stream with a single string column and parse the JSON at query time

### Step 4: Run Your First SQL Query Against Kafka

Let's count all messages in the Kafka topic:

```sql
SELECT count() FROM github_events
```

This query is optimized by Timeplus to check the offset difference between the first and last Kafka message, providing a fast count without scanning all data.

### Step 5: Visualize Data with marimo

To visualize the count result in marimo, update the output variable of the SQL cell to `cntdf` and create a stat widget:

```python
mo.stat(cntdf["count()"][0])
```

### Step 6: Implement Auto-Refresh

To automatically refresh the count, add a refresh widget:

```python
cnt_refresh = mo.ui.refresh(options=["1s","2s"], default_interval="1s")
cnt_refresh
```

Then modify your SQL to reference this refresh widget:

```sql
-- {cnt_refresh.value}
SELECT count() FROM github_events
```

By adding the comment that references `cnt_refresh.value`, the SQL query will re-run whenever the refresh state changes.

To show the delta between counts:

```python
# Create a state to track the last count
last_count = mo.state(0)

# Calculate the delta
def update_count(current):
    delta = current - last_count.value
    last_count.set(current)
    return delta

# Display with delta as caption
mo.stat(
    cntdf["count()"][0],
    caption=f"Δ {'+'if update_count(cntdf['count()'][0]) >= 0 else ''}{update_count(cntdf['count()'][0])}"
)
```

### Step 7: Create Interactive Charts

Let's create interactive charts to visualize GitHub event data:

1. Query for top event types:

```sql
-- {refresh.value}
with cte as(SELECT top_k(type,10,true) as a FROM github_events limit 1 SETTINGS seek_to='-{range.value}m')
select a.1 as type, a.2 as cnt from cte array join a
```

2. Query for top repositories by event type:

```sql
-- {refresh.value}
with cte as(SELECT top_k(repo,10,true) as a FROM github_events {typeWhere} limit 1 SETTINGS seek_to='-{range.value}m')
select a.1 as repo, a.2 as cnt from cte array join a
```

3. Handle selections to filter the bar chart based on pie chart clicks:

```python
_type=' '
if chart_types.selections.get("select_point"):
    _array=chart_types.selections["select_point"].get("type",None)
    if _array:
        _type=f"WHERE type='{_array[0]}'"
typeWhere=_type
```

4. Create the charts using Altair:

```python
chart_types = mo.ui.altair_chart(
    alt.Chart(df_type, height=150, width=150)
    .mark_arc()
    .encode(theta="cnt", color="type"),
    legend_selection=False
)

chart_repos = mo.ui.altair_chart(
    alt.Chart(df_hotrepo, height=200)
    .mark_bar()
    .encode(x='cnt',
            y=alt.Y('repo',sort=alt.EncodingSortField(field='cnt',order='descending')),)
)
```

5. Arrange elements in a layout:

```python
mo.vstack([
    mo.hstack([range, refresh]),
    mo.hstack([chart_types, chart_repos], widths=[0,1])
])
```

## Advanced Features Applied

- **Time-Based Filtering**: Use `seek_to='-{range.value}m'` to analyze data from a specific time window
- **Optimized Aggregations**: Use [top_k](/functions_for_agg#top_k) for efficient ranking operations
- **Interactive Filtering**: Link charts for dynamic data exploration

## Conclusion

This tutorial demonstrates how to query and visualize Kafka data using SQL with Timeplus Proton and marimo notebooks. The approach provides a lightweight, SQL-native way to work with streaming data without the overhead of traditional big data systems.

For more information and examples, visit the [Timeplus GitHub repository](https://github.com/timeplus-io/proton/tree/develop/examples/marimo).
