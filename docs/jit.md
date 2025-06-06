# Just-In-Time (JIT) compilation

Starting from Timeplus Enterprise 2.9, the JIT compilation is enabled by default. For example, if you need to run the following SQL multiple times:
```sql
select ts, key, value as v, 1+2*v*v+3*v*v*v as calc from stream
```
Timeplus will compile the complex SQL expression to machine code to improve the runtime performance. For more technical details of the implementation, please check the [blog](https://maksimkita.com/blog/jit_in_clickhouse.html).

## Settings
The following settings can be overridden in the query time using `SET key=value`. You can also query the current value and description via
```sql
select * from system.settings where name like '%to_compile%';
```

### min_count_to_compile_expression
Minimum count of executing same expression before it is get compiled.

`uint64` type. Default to 3.

### min_count_to_compile_aggregate_expression
The minimum number of identical aggregate expressions to start JIT-compilation. Works only if the compile_aggregate_expressions setting is enabled.

`uint64` type. Default to 3.

### min_count_to_compile_sort_description
The number of identical sort descriptions before they are JIT-compiled.

`uint64` type. Default to 3.

## Monitoring
You can run the following query to check the counts of JIT events:
```sql
select * from system.events where event like 'Compile%';
```
