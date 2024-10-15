# proton-client

Timeplus Proton provides a native command-line client: `proton-client` to run SQL commands. You can also launch the client via `proton client`.

For detailed usage of the SQL client, please check [timeplusd-client](/timeplusd-client), since the SQL clients in Timeplus Proton and Timeplus Enterprise share the same flags and configurations.

:::tip
However, please use `proton-client` to connect to Timeplus Proton and use `timeplusd-client` to connect to the `timeplusd` in Timeplus Enterprise. Otherwise certain features won't be available and may not work. For example, when you run `proton-client` to connect to a Timeplus Enterprise deployment and try to create a [mutable stream](/mutable-stream), the `proton-client` won't accept the `CREATE MUTABLE STREAM` SQL at the client side.
:::
