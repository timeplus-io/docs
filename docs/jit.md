# Just-In-Time (JIT) Compilation

## Overview

Timeplus can **compile SQL expressions into native machine code** to significantly improve query performance.  
This optimization is especially beneficial for **streaming queries**, where the compiled expressions are reused throughout the entire query lifetime, reducing runtime overhead.

**Example:**

```sql
SELECT ts, key, value AS v, (a + (b * c)) + 5 AS calc 
FROM stream;
```

In the above example, the expression `(a + (b * c)) + 5` can be executed in two ways:

- **Interpreted execution**:
Each operation `(+, *)` is evaluated separately through an expression tree, adding overhead for each computation step.

- **JIT-compiled execution**:
The entire expression is **fused into a single machine instruction sequence**, eliminating interpretation overhead and enabling much faster execution.

![JIT](/img/jit.png)

## Settings

The following settings control Just-In-Time (JIT) compilation behavior.  
You can override them at **query time** using:

```sql
SET <key> = <value>;
```

You can also query the current setting values and their descriptions from the system tables.
```sql
select * from system.settings where name like '%to_compile%';
```

### `min_count_to_compile_expression`

Specifies the **minimum number of times** an identical expression must be executed before it becomes eligible for JIT compilation.

- **Type**: uint64
- **Default**: 3

### `min_count_to_compile_aggregate_expression`

Specifies the **minimum number of identical aggregate expressions** required to trigger JIT compilation.
This setting takes effect only if `compile_aggregate_expressions` is enabled.

- **Type**: uint64
- **Default**: 3

### `min_count_to_compile_sort_description`

Specifies the **number of identical sort descriptions** that must appear before they are JIT-compiled.

- **Type**: uint64
- **Default**: 3

## Metrics 

You can monitor JIT compilation activity by querying the system counters:

```sql
select * from system.events where event like 'Compile%';
```
