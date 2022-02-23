---
sidebar_position: 2
---
# Data Types

The following field types are supported.

:::info Beta - Data Types

During our beta, we're supporting a limited number of field types. If there's a specific type that's missing, let us know!

:::

| Category            | Type                               | Description                                                  |
| ------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Numeric Types       | Decimal(precision, scale)          | valid range for precision is [1: 76], valid range for scale is [0: precision] |
|                     | Float32/64                         |                                                              |
|                     | Int8/16/32/64/128/256              |                                                              |
|                     | UInt8/16/32/64/128/256             |                                                              |
| Boolean Type        | Boolean                            |                                                              |
| Date and Time Types | Date                               |                                                              |
|                     | DateTime                           |                                                              |
|                     | DateTime64(precision, [time_zone]) |                                                              |
| String Types        | String                             |                                                              |
|                     | FixedString(N)                     |                                                              |
|                     | UUID                               |                                                              |
| Compound Type       | Array(T)                           |                                                              |
|                     | Map                                |                                                              |