# SYSTEM PYTHON PACKAGES

Manage Python UDF dependencies from SQL in Proton/Timeplus Enterprise 3.0+.

## Examples
```sql
-- Install latest
SYSTEM INSTALL PYTHON PACKAGE 'requests';

-- Install with version specifiers (PEP 440)
SYSTEM INSTALL PYTHON PACKAGE 'requests>2.0';
SYSTEM INSTALL PYTHON PACKAGE 'requests==2.32.3';

-- Alternative form with separate version literal
SYSTEM INSTALL PYTHON PACKAGE 'requests' '2.32.3';

-- List installed packages (returns: package_name, version)
SYSTEM LIST PYTHON PACKAGES;

-- Uninstall
SYSTEM UNINSTALL PYTHON PACKAGE 'requests';
```

## Behavior
- Scope: Cluster-wide installation/uninstallation using the UDF runtime’s Python 3.10 environment.
- Permissions: Requires `SYSTEM RELOAD CONFIG` privilege.
- Versioning: Accepts PEP 440 specifiers in the first literal (e.g., `>=`, `==`, `~=`). When using the second literal, provide the exact version string.
- Install location: Uses pip’s user install under the embedded interpreter; no system-level Python changes.
- Async operations: Install/uninstall run asynchronously. Track progress via `system.python_package_tasks`.

Monitor status
```sql
SELECT status, error_code, error_message
FROM system.python_package_tasks
WHERE package_name = 'requests' AND operation = 'install'
ORDER BY created_at DESC
LIMIT 1;
```

List installed packages
```sql
SYSTEM LIST PYTHON PACKAGES; -- columns: package_name, version
```

Granting permissions
```sql
-- Built-in users in official images (e.g., default, proton) typically have it already.
GRANT SYSTEM RELOAD CONFIG ON *.* TO gen;
```

## Compatibility
- Proton/Enterprise 3.0+: Use these SQL commands. This is the only supported method in 3.0+.
- Enterprise 2.x: Use REST API or `timeplusd python -m pip` (see /py-udf#install_lib). These legacy methods are not supported on 3.0+.
