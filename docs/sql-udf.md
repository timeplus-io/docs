# SQL UDF

SQL UDFs are simple yet powerful extensions to SQL on Timeplus. You can create common SQL snippets as SQL UDFs and reuse them in your queries. They provide a layer of abstraction to make your queries more readable and modularized. Unlike UDFs that are written in other programming languages, SQL UDFs are stateless and have the best performance, powered by Timeplus C++ engine.

Create a SQL UDF from a lambda SQL expression. The expression must consist of function parameters, constants, operators, or other function calls.

```sql
CREATE FUNCTION name AS (parameter0, ...) -> expression
```

A function can have an arbitrary number of parameters.

There are a few restrictions:

* The name of a function must be unique among user defined and system functions.
* Recursive functions are not allowed.
* All variables used by a function must be specified in its parameter list.
* If any restriction is violated then an exception is raised.

## Examples

### SQL UDFs as constants

Let's start with a simple example. You can define a SQL UDF that returns a constant value, so that you can avoid using literals in your queries.

```sql
CREATE FUNCTION red AS () -> 'FF0000';
```

Let's use the function:
```sql
SELECT red();
-- returns FF0000
```

### SQL UDF encapsulating a complex expression

You can also define a SQL UDF that encapsulates a complex expression, so that you don't have to copy-paste some lengthy expressions over and over again in multiple SQL queries.

```sql
CREATE OR REPLACE FUNCTION color_hex AS (r, g, b) -> '#'||hex(r)||hex(g)||hex(b);

-- SELECT color_hex(12,120,200) returns #0C78C8
```

Notes:
* You can overwrite the definition of a SQL UDF by using `CREATE OR REPLACE FUNCTION`.
* The parameters of a SQL UDF can be of any type, including complex types like arrays and maps.
* Running `SELECT color_hex(12,120,200)` is equivalent to running `SELECT '#'||hex(12)||hex(120)||hex(200)`.
* In the function body, you can call any built-in functions, other SQL UDFs, or remote/JavaScript UDFs.
