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

-- Install several packages at once from inline requirements text (3.1.2+)
SYSTEM INSTALL PYTHON PACKAGE REQUIREMENTS 'requests==2.32.3
pydantic>=2.0
# comments and blank lines are ignored
httpx';

-- Install from a private mirror instead of PyPI (3.1.2+)
SYSTEM INSTALL PYTHON PACKAGE 'internal-lib==1.4.0'
    INDEX_URL 'https://mirror.example.com/simple';

-- Fall back to PyPI for anything the private mirror does not carry
SYSTEM INSTALL PYTHON PACKAGE REQUIREMENTS 'internal-lib==1.4.0
requests==2.32.3'
    INDEX_URL 'https://mirror.example.com/simple'
    EXTRA_INDEX_URL 'https://pypi.org/simple';

-- List installed packages (returns: package_name, version)
SYSTEM LIST PYTHON PACKAGES;

-- Uninstall
SYSTEM UNINSTALL PYTHON PACKAGE 'requests';
```

:::info Clean environment since 3.3.1
Timeplus Enterprise 3.3.1 upgraded the embedded interpreter to **Python 3.14 free-threaded** and stopped bundling third-party packages — only the standard library, `pip` and `truststore` ship with the product. Everything your UDFs import must be installed with the commands on this page (or declared via [`python_requirements`](#declarative)). See [Python UDF](/py-udf#upgrade_314) for the upgrade steps.
:::

## Installing from requirements text {#requirements}

Available since **Timeplus Enterprise 3.1.2**.

`SYSTEM INSTALL PYTHON PACKAGE REQUIREMENTS '<text>'` takes the contents of a `requirements.txt` as a single string literal and installs every line in one cluster-wide task. Rules:

- One package specification per line, using the same PEP 440 syntax as the single-package form. Blank lines and `#` comments are skipped.
- **pip options are rejected.** Any line starting with `-` (`-r nested.txt`, `--index-url ...`, `-e .`) fails with `Requirements line '...' is not supported. Please pass index options via API fields instead` — use the `INDEX_URL` / `EXTRA_INDEX_URL` clauses below.
- The text must contain at least one package specification, and is capped at 1024 effective lines.
- `REQUIREMENTS` cannot be combined with a package-name literal — `SYSTEM INSTALL PYTHON PACKAGE REQUIREMENTS 'requests' '2.0'` is a syntax error.
- The whole batch is tracked as a **single** row in `system.python_package_tasks`, with `package_name` set to the literal `requirements.txt` rather than to any individual package:
  ```sql
  SELECT status, error_code, error_message
  FROM system.python_package_tasks
  WHERE package_name = 'requirements.txt' AND operation = 'install'
  ORDER BY created_at DESC
  LIMIT 1;
  ```

## Private package indexes {#index-url}

Available since **Timeplus Enterprise 3.1.2**. Both clauses work with either install form, and may be combined:

- **INDEX_URL '\<url\>'** — replaces the default index, mapping to pip's `--index-url`. At most one.
- **EXTRA_INDEX_URL '\<url\>'** — an additional index consulted after the primary one, mapping to pip's `--extra-index-url`. Repeat the clause to pass several.

Only `http://` and `https://` URLs are accepted; anything else is rejected up front with `Invalid --index-url value '...'. Only http(s) URLs are supported`, before any node runs pip. Credentials embedded in the URL (`https://user:token@mirror.example.com/simple`) are passed through to pip as-is, but the statement is distributed across the cluster and recorded in `system.query_log` like any other query — prefer a mirror that authenticates by network location, or configure the index once in [`python_requirements`](#declarative) rather than repeating the secret in every statement.

These clauses apply to the statement only; they are not remembered for later installs.

## Behavior
- Scope: Cluster-wide installation/uninstallation using the UDF runtime’s Python environment (Python 3.14 since 3.3.1, Python 3.10 before that).
- Permissions: Requires `SYSTEM RELOAD CONFIG` privilege.
- Versioning: Accepts PEP 440 specifiers in the first literal (e.g., `>=`, `==`, `~=`). When using the second literal, provide the exact version string.
- Install location: Uses pip’s user install under the embedded interpreter; no system-level Python changes.
- Async operations: Install/uninstall run asynchronously. Track progress via `system.python_package_tasks`.
- Wheel compatibility: The 3.3.1+ interpreter is `cp314t`, so a package needs a free-threaded (or pure-Python) wheel; otherwise pip builds it from source and needs a toolchain on the node.
- Durability: Packages installed this way live in the node’s local user site-packages. On a node without a persistent volume they are lost on reschedule — use [`python_requirements`](#declarative) for those.

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

## Declarative alternative: `python_requirements` {#declarative}

Since Timeplus Enterprise 3.3.1 you can declare packages in a `requirements.txt` on S3 and have every node reconcile against it, instead of issuing `SYSTEM INSTALL` per node. This is the recommended approach for clusters and for ephemeral compute nodes, where locally installed packages do not survive a reschedule.

```yaml
# timeplusd.yaml
python_requirements:
    url: https://my-bucket.s3.us-west-2.amazonaws.com/proton/requirements.txt
    poll_interval_sec: 300   # re-check for changes; 0 = startup only
```

Each node fetches the file on startup and then every `poll_interval_sec`, installing anything missing — so edits roll out without a restart. The reconcile only *installs*: removing a line does not uninstall the package, use `SYSTEM UNINSTALL PYTHON PACKAGE` for that. Pin exact versions so all nodes converge. Full options are documented in [Python UDF](/py-udf#python_requirements).

## Compatibility
- Proton/Enterprise 3.0+: Use these SQL commands. This is the only supported method in 3.0+.
- Enterprise 3.1.2+: `REQUIREMENTS`, `INDEX_URL` and `EXTRA_INDEX_URL` clauses. A statement using any of them is dispatched to the cluster with a newer request format, so every node must be on 3.1.2 or later.
- Enterprise 3.3.1+: The embedded runtime is Python 3.14 free-threaded and ships no third-party packages; `python_requirements` is available as a declarative alternative.
- Enterprise 2.x: Use REST API or `timeplusd python -m pip` (see /py-udf#install_lib). These legacy methods are not supported on 3.0+.
