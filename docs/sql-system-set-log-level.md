# SYSTEM SET LOG LEVEL

This feature is available in Timeplus Enterprise v2.8.2 or above. Not available in Timeplus Proton.

Example:
```sql
-- Setting global log level to information
SYSTEM SET LOG LEVEL information;

-- Setting DiskLocal logger to debug
SYSTEM SET LOG LEVEL debug FOR 'DiskLocal';

-- Setting DNSResolver logger to trace
SYSTEM SET LOG LEVEL trace FOR 'DNSResolver';

-- Setting MemoryTracker logger to warning
SYSTEM SET LOG LEVEL warning FOR 'MemoryTracker';
```

You don't need to restart the server to apply the changes. The log level will be applied immediately across all the nodes in the cluster.

## Log Levels
The following log levels are supported:
- critical
- debug
- error
- fatal
- information
- none
- notice
- test
- trace
- warning
