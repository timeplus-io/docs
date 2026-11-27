# INSTALLATION GUIDE
## Install Timeplusd on Ubuntu Bare Metal

Install the Timeplusd Linux x86-64 binary, configure the license, and start the server.

| Attribute | Details |
| :--- | :--- |
| **Platform** | Ubuntu Server 22.04 or later (64-bit x86) |
| **Deployment** | Bare-metal server |
| **Audience** | System administrators and platform operators |

---

### 1. Purpose and scope

This guide describes how to install Timeplusd from a Linux x86-64 binary bundle on an Ubuntu bare-metal server, configure or activate a license (via local configuration files or the REST API), and start the server.

The procedure uses the installation layout and commands shown by the Timeplusd installer. It does not cover cluster deployment, firewall configuration, TLS setup, external storage, or production sizing.

### 2. Prerequisites

* An Ubuntu Server 22.04 or later host running on 64-bit x86 hardware.
* A Timeplusd binary bundle built for Linux x86-64.
* The license key text file and the corresponding `.lic` license file supplied for the deployment.
* A user account with `sudo` privileges.
* A maintenance window if installing on a host that already runs Timeplusd or another service using the same ports or data paths.

> **Important:** Use only a binary bundle and license files supplied for your Timeplus deployment. Protect license files as credentials and do not include them in support bundles or source control.

### 3. Prepare the installation bundle

Transfer the Timeplusd Linux x86-64 binary bundle to the Ubuntu server using your organization's approved file-transfer method. Keep the bundle in a directory accessible to the administrator performing the installation.

> **Note:** Use the packaging instructions delivered with your Timeplusd release.

### 4. Install Timeplusd

Run the installer with elevated privileges:

```bash
sudo timeplusd install
```

Follow the interactive prompt to set the password for the default user. Enter the password when prompted and retain it in your organization's approved secrets-management system.

During installation, the installer creates or configures the following resources:

| Resource | Installer behavior / location |
| :--- | :--- |
| **Binary** | `/usr/bin/timeplusd` |
| **Client command** | `/usr/bin/timeplusd-client` (symlink to `timeplusd`) |
| **Service account and group** | `proton:proton` |
| **Main configuration** | `/etc/timeplusd-server/config.yaml` |
| **User configuration** | `/etc/timeplusd-server/users.yaml` and `/etc/timeplusd-server/users.d/` |
| **Configuration overrides** | `/etc/timeplusd-server/config.d/` |
| **Data directory** | `/var/lib/timeplusd` |
| **Log directory** | `/var/log/timeplusd-server` |
| **Runtime/PID directory** | `/var/run/timeplusd-server` |

The installer also creates the `proton` system user and group if they do not already exist, sets resource limits for the `proton` user, creates the configuration and runtime directories, and applies ownership to the relevant paths.

> **Installer output:** A successful installation ends with the message “timeplusd has been successfully installed.” The installer also displays the server start command and client command.

### 5. Configure and activate the license

You can activate the Timeplusd license using either of the following methods:

* **Option A (File-based configuration):** Place the license files on disk and reference their paths in `/etc/timeplusd-server/config.yaml` before starting the server.
* **Option B (REST API activation):** Start the Timeplusd server first (see Section 6) and submit the license files as a JSON payload via the REST API.

#### Option A: Configure the license from local files

##### 5.1 Place the license files

Use the following destination paths, or update the configuration to match the approved paths used in your environment:

```text
/var/lib/timeplusd/license_key
/var/lib/timeplusd/license_file
```

Ensure that the files are readable by the Timeplusd service account and are not readable by unintended users. For the default installation account, the service runs as `proton`. Apply ownership and restrictive permissions according to your organization's security policy.

> **Security:** Do not make license files world-readable. The exact source filenames and transfer commands depend on how the license was delivered.

> **Risk:** Do not leave the license files in a user home directory such as `/home/<user>/Downloads`. Ubuntu 21.04 and later typically creates home directories with mode `750`, so the `proton` service account cannot traverse them. Timeplusd then cannot read the license, even when the file itself is world-readable, and the log reports: `LicenseManager: Failed to load license from disk: what=filesystem error: in last_write_time: Permission denied`.

Copy the license files from the download location to the destination paths above, and give the `proton` service account ownership. Replace the placeholders with the actual file names:

```bash
sudo mkdir -p /var/lib/timeplusd
sudo cp <license_key_file> /var/lib/timeplusd/license_key
sudo cp <license_file>.lic /var/lib/timeplusd/license_file
sudo chown proton:proton /var/lib/timeplusd/license_key /var/lib/timeplusd/license_file
sudo chmod 640 /var/lib/timeplusd/license_key /var/lib/timeplusd/license_file
```

Verify that the service account can reach each file. In the `namei` output, every directory in the path must allow execute (`x`) access for `proton`, and the file itself must be readable:

```bash
namei -l /var/lib/timeplusd/license_key
namei -l /var/lib/timeplusd/license_file
```

##### 5.2 Edit the main configuration

Edit `/etc/timeplusd-server/config.yaml` with administrator privileges. For example, use `sudoedit` so that the configuration does not need to be made writable by all local users:

```bash
sudoedit /etc/timeplusd-server/config.yaml
```

Enable the `license` section and set the paths and values as shown:

```yaml
license:
  # Load license from disk when `key_path` and `file_path` are set.
  key_path: /var/lib/timeplusd/license_key
  file_path: /var/lib/timeplusd/license_file

  # License type (license, aws_marketplace)
  type: license

  # License validation interval
  validation_interval_milliseconds: 14400000
```

Preserve YAML indentation. The validation interval shown above is `14,400,000` milliseconds (4 hours). Use the license type appropriate to the license supplied for your deployment; the example above uses `license`.

#### Option B: Activate the license via REST API

As an alternative to configuring local file paths in `config.yaml`, you can activate the license dynamically by sending a JSON payload to the Timeplusd REST API after starting the server (see Section 6).

##### 5.3 Generate the JSON payload

Run the following Python command to read the license key file and `.lic` file and serialize them into a JSON payload file (`license_payload.json`). Replace the input file paths and `created_by` value as appropriate for your deployment:

```bash
python3 -c '
import json, sys
key, lic = sys.argv[1], sys.argv[2]
print(json.dumps({
 "is_trial": False,
 "created_by": "timeplus",
 "license_key": open(key).read(),
 "license_file": open(lic).read(),
}))' ./license_key.txt ./license.lic > ./license_payload.json
```

> **Security:** Protect `license_payload.json` with restrictive permissions (`chmod 600`) and remove it from disk after activation is complete.

##### 5.4 Submit the license payload via REST API

Ensure the Timeplusd server is running, then send a `POST` request with the JSON payload to the `/proton/v1/licenses` endpoint. `curl` will prompt for the `default` user password configured during installation:

```bash
curl -sS -X POST 'http://localhost:8123/proton/v1/licenses' \
  -u default \
  -H 'Content-Type: application/json' \
  --data-binary @./license_payload.json
```

### 6. Start Timeplusd

After saving the configuration (if using Option A) or prior to running the REST API activation commands (if using Option B), start the server:

```bash
sudo timeplusd start
```

The startup process runs the server under the `proton` service account and uses `/etc/timeplusd-server/config.yaml` as its configuration file. A successful start is indicated by the message:

```text
Server started
```

### 7. Connect with the client

Launch the command-line client using the password set for the `default` user to log in to the Timeplusd console:

```bash
timeplusd-client --password
```

The installer creates `/usr/bin/timeplusd-client` as a symbolic link to `/usr/bin/timeplusd`. Use the authentication details configured during installation when connecting.

### 8. Post-installation checks

Before handing the system over for application use, confirm the following:

* The installer reported that Timeplusd was successfully installed.
* The main configuration file exists at `/etc/timeplusd-server/config.yaml`.
* **(Option A)** The license key and `.lic` files exist at the paths configured under the `license` section, are stored outside user home directories, and are readable by the `proton` service account (verify with `namei -l`).
* The license files are stored outside user home directories and are readable by the `proton` service account (verify with `namei -l`).
* **(Option B)** The REST API license activation call returned a successful response and temporary payload files have been removed.
* The `sudo timeplusd start` command completed and reported “Server started”.
* The `timeplusd-client` command can be launched and an authorized user can authenticate.
* The license validation REST API reports that license validation passed (see the command and note below).

To check license validation, call the REST API on port `3218`. `curl` prompts for the password of the `default` user:

```bash
curl localhost:3218/proton/v1/licenses/validation -u default
```

A successful response reports `Version validation pass`, `CPU validation pass`, and `Usage validation pass`.

> **Note:** Validation runs at the interval set by `validation_interval_milliseconds`, which is `14400000` ms (4 hours) in the example in Section 5.2. The first validation attempt can fail with a timeout, and the result changes only at the next interval. To verify sooner, temporarily set `validation_interval_milliseconds` to a smaller value, such as `60000` (1 minute), in `/etc/timeplusd-server/config.yaml`, restart Timeplusd, and call the API again. Restore the production value afterwards.

### 9. Troubleshooting notes

| Symptom | Checks |
| :--- | :--- |
| **Installer reports an existing `proton` user or group** | This may be expected on a host where the account or group already exists. Confirm that the installer completes and that the account/group ownership is appropriate. |
| **Server does not start after configuration changes** | Review the YAML syntax and indentation, confirm that both license files exist at the configured paths, and check that the `proton` account can read them. |
| **Client cannot authenticate** | Confirm the default-user password entered during installation. The installer output may mention an empty password if no password was configured; do not assume an empty password is appropriate for a secured deployment. |
| **License is not loaded** | Verify the `key_path`, `file_path`, and `type` values (Option A), or re-verify the HTTP status and response from the `/proton/v1/licenses` endpoint (Option B). Confirm file ownership and permissions, and consult the license information supplied by Timeplus if validation continues to fail. |
| **Log shows “LicenseManager: Failed to load license from disk … Permission denied”** | Run `namei -l` on the configured license path and confirm that every directory in the path, not only the file, can be traversed by the `proton` service account. A source location such as `/home/<user>/Downloads` typically fails because the home directory is mode `750`. Move the license files to the destination paths in Section 5.1, set ownership to `proton:proton` and mode `640`, then restart Timeplusd and confirm that the `LicenseManager` error no longer appears. |
| **License validation fails or times out** | The first validation can time out, and validation is retried only at the next interval set by `validation_interval_milliseconds`. Call the validation REST API (Section 8) to see the current result. To avoid waiting for the interval, temporarily shorten it, restart Timeplusd, and check again. If validation still fails, review the `LicenseManager` messages in `/var/log/timeplusd-server` and confirm the `key_path`, `file_path`, and `type` values in the `license` section. |

### 10. Installation layout reference

The default paths created or referenced by the installer are summarized below.

```text
Binary:                 /usr/bin/timeplusd
Client symlink:         /usr/bin/timeplusd-client
Main configuration:     /etc/timeplusd-server/config.yaml
User configuration:     /etc/timeplusd-server/users.yaml
User overrides:         /etc/timeplusd-server/users.d/
Server overrides:       /etc/timeplusd-server/config.d/
Data:                   /var/lib/timeplusd
Logs:                   /var/log/timeplusd-server
Runtime/PID:            /var/run/timeplusd-server
HTTP / REST API ports:  8123, 3218
```

### 11. Scope notes

This guide documents the single-node bare-metal installation flow represented in the supplied source document. It does not define service removal, upgrade, backup and restore, port exposure, firewall rules, TLS certificates, high availability, or systemd unit management. Those procedures should be documented separately using the instructions validated for the specific Timeplusd release.
