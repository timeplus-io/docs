# Dictionaries

Functions for working with dictionaries.

:::info
For dictionaries created with [DDL queries](/sql-create-dictionary), the dict_name parameter must be fully specified, like database.dict_name. Otherwise, the current database is used.
:::

### dict_get
`dict_get(dict_name, attr_names, id_expr)` returns the value(s) from the dictionary.

For example `dict_get('taxi_zone_dictionary', 'Borough', 132)`.

Arguments:
* `dict_name` - the name of the dictionary. If the dictionary is in a different database, you must specify the database name.
* `attr_names` - the name of the attribute(s) to return. If multiple attributes are specified as a tuple, the function returns a tuple. For example `dict_get('taxi_zone_dictionary', ('Borough', 'Zone'), 132)` returns a named tuple, such as `('Queens','JFK Airport')`.
* `id_expr` - the key value to look up in the dictionary. If you define the dictionary with a composite key, you can pass a tuple.

Timeplus returns the value in the same type as the specified dictionary attribute. For example, 'Borough' column is a string, so the function returns a string. If the key is not found, the function returns an empty string.

### dict_get_or_default
`dict_get_or_default(dict_name, attr_names, id_expr, default_value)` returns the value(s) from the dictionary. The only difference from `dict_get` is that if the key is not found, the function returns the default value.

The `default_value` should be of the same type as the dictionary attribute. If it's not, Timeplus will try to convert it to the attribute type.

For example:
```sql
SELECT dict_get_or_default('taxi_zone_dictionary', 'Borough', 1320,'Unknown');
-- returns 'Unknown'

SELECT dict_get_or_default('taxi_zone_dictionary', 'Borough', 1320,-1) as v, to_type_name(v);
-- returns "-1" as a string
```

### dict_get_or_null
`dict_get_or_null(dict_name, attr_names, id_expr)` returns the value(s) from the dictionary. The only difference from `dict_get` is that if the key is not found, the function returns `null`, instead of an empty string or 0, depending on the attribute type.

For example:
```sql
SELECT dict_get_or_null('taxi_zone_dictionary', 'Borough', 1320);
-- returns 'Unknown'

SELECT dict_get_or_null('taxi_zone_dictionary', 'Borough', 1320) as v, to_type_name(v);
-- returns `null` and `nullable(string)`
```

### dict_has
`dict_has(dict_name, id_expr)` returns `1` if the key exists in the dictionary, otherwise `0`.
