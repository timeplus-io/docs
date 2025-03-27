# Logic

### if

`if(condition,yesValue,noValue)`

Controls conditional branching.

For example `if(1=2,'a','b')` will get `b`

### multi_if

`multi_if(condition1, then1, condition2, then2.. ,else)` An easier way to write if/self or case/when.

### case_with_expression
`case_with_expression(expression, condition1, value1, condition2, value2, ..., default_value)`

Timeplus supports `CASE WHEN .. THEN .. ELSE .. END` operator. It is used to evaluate a series of conditions and return a value based on the first condition that evaluates to true.

Timeplus supports two forms:
- `CASE WHEN .. THEN .. ELSE .. END`
- `CASE .. WHEN .. THEN .. ELSE .. END`

For example:
```sql
-- common form in other SQL databases
SELECT number,
CASE
    WHEN number % 2 = 0 THEN number + 1
    WHEN number % 2 = 1 THEN number * 10
    ELSE number
END AS result
FROM ..

-- the other form is optimized for constant value
-- this will be translated to case_with_expression(number, 0, 100, 1, 200, 0)
SELECT number,
CASE number
    WHEN 0 THEN 100
    WHEN 1 THEN 200
    ELSE 0
END AS result
FROM ..
```

### sleep
`sleep(seconds)`

Not necessary as a logic function, but it is a function that can be used to pause the execution for a specified number of seconds.

For example `select sleep(2)` will pause the execution for 2 seconds.
