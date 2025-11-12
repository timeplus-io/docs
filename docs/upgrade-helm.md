import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Upgrade Guide for Kubernetes Deployment

We recommend always using the latest stable version of Timeplus Enterprise.

This guide provides general upgrade instructions and version-specific notes for Helm-based Kubernetes deployments.

## General Guidelines

:::warning
Do **not** upgrade across multiple major Helm chart versions in one step.
:::

The Timeplus Helm chart follows [Semantic Versioning](https://semver.org/). Always upgrade **one major chart version at a time**, even if breaking changes do not appear to affect your environment.

---

### 1. Check for Breaking Changes or Manual Actions

Each **major chart version** usually corresponds to a new **major Timeplus Enterprise version**.

If you are upgrading within the same major version, you can safely run `helm upgrade`. Otherwise, check the following:

1. Review the [Timeplus Enterprise Release Notes](/release-notes) to confirm whether the target version supports in-place upgrades (i.e., reusing current data and configuration). For example, versions [2.3](/enterprise-v2.3) and [2.4](/enterprise-v2.4) are incompatible and require migration tools.
2. Review the **version-specific upgrade guide** for the Helm chart. You may need to modify your `values.yaml` accordingly before upgrading.

---

### 2. Review the Differences Between Versions

Before upgrading, it is **strongly recommended** to compare the rendered Helm templates for both the current and target versions. This helps detect potential configuration or spec changes early.

```bash
helm -n $NS template -f values.yaml $RELEASE timeplus/timeplus-enterprise --version <<CURRENT_VERSION>> > old.template.yaml
helm -n $NS template -f new_values.yaml $RELEASE timeplus/timeplus-enterprise --version <<NEW_VERSION>> > new.template.yaml
````

Then, use a diff tool to compare `old.template.yaml` and `new.template.yaml`.


:::info
Pay close attention to any changes under the `timeplusd` **StatefulSet**.
Most StatefulSet fields are immutable. If any immutable fields have changed, you must delete the StatefulSet manually before running `helm upgrade`.
See [Update Immutable Fields of the StatefulSet](#statefulset) for details.
:::


---

### 3. Run the Upgrade

Once you confirm the upgrade path is safe:

```bash
# Upgrade to the latest version
helm repo update
helm -n $NS upgrade $RELEASE timeplus/timeplus-enterprise

# Or specify a version explicitly
helm search repo timeplus -l
helm -n $NS upgrade $RELEASE timeplus/timeplus-enterprise --version va.b.c
```

---

### 4. Update Immutable Fields of the StatefulSet {#statefulset}

If `helm upgrade` fails with an error such as:

```
Forbidden: updates to StatefulSet spec for fields other than ...
```

This indicates that one or more immutable fields have changed.
To proceed:

1. **Check PVC retention policy:**

   ```bash
   kubectl -n $NS get sts timeplusd -o=jsonpath='{.spec.persistentVolumeClaimRetentionPolicy}'
   ```

   Ensure both `whenDeleted` and `whenScaled` are set to `Retain`.
   This preserves the PVCs even after deleting the StatefulSet.

2. Delete the StatefulSet:

   ```bash
   kubectl -n $NS delete sts timeplusd
   ```

3. Wait for all `timeplusd-<index>` pods to terminate.

4. Re-run `helm upgrade`.
   The new StatefulSet will attach automatically to existing PVCs.

---

## Upgrade from v7 to v10

The `kv_service` component has been **removed** in Timeplus Enterprise 3.0.
Before upgrading, ensure you have completed the migration described in the [v6 to v7 section](#upgrade-from-v6-to-v7).

---

## Upgrade from v6 to v7

By default, the v7 chart uses the new **mutable stream-based KV store**.

If you **do not** plan to migrate, simply run `helm upgrade` to update the chart.

If you **do plan** to migrate, follow these steps:

1. Modify `values.yaml` to enable the Timeplus CLI and disable both the connector and appserver:

   ```yaml
   timeplusCli:
     enabled: true
   timeplusConnector:
     enabled: false
   timeplusAppserver:
     enabled: false
   ```

2. Upgrade using the v7 chart:

   ```bash
   helm -n $NS upgrade $RELEASE timeplus/timeplus-enterprise --version v7.x.x
   ```

3. Verify pod status:

   ```bash
   kubectl -n $NS get pods
   ```

   Ensure:

   * `timeplusd` pods are upgraded to version **2.8.x**
   * `timeplus-appserver` and `timeplus-connector` pods are **terminated**
   * `timeplus-cli` pod is **running**

4. Access the CLI pod:

   ```bash
   kubectl -n $NS exec timeplus-cli -it -- /bin/bash
   ```

5. Run the migration:

   ```bash
   ./bin/timeplus migrate kv --host timeplusd-0.timeplusd-svc.<namespace>.svc.cluster.local -p <password>
   ```

   Replace:

   * `<namespace>` with your deployment namespace
   * `<password>` with the admin password (`timeplusd@t+` by default)

6. Wait until migration completes successfully.
   If you encounter errors, contact **Timeplus Support**.

7. Revert the changes in step 1 and run `helm upgrade` again to restore normal operation.

---

## Upgrade from v5 to v6

1. Several built-in users (`neutron`, `pgadmin`, `system`, `default`) were removed.
   If you need them, add them manually under `timeplusd.extraUsers`:

   ```yaml
   timeplusd:
     extraUsers:
       users:
         default:
           password: ""
           networks:
             - ip: "::/0"
           profile: default
           quota: default
           allow_databases:
             - database: default
           default_database: default
   ```

2. Ingress configuration has been split into independent settings for Appserver and Timeplusd.

   | Old Key                     | New Key                                                  |
   | --------------------------- | -------------------------------------------------------- |
   | `timeplusd.ingress.enabled` | `ingress.timeplusd.enabled`                              |
   | `ingress.enabled`           | `ingress.timeplusd.enabled`, `ingress.appserver.enabled` |
   | `ingress.domain`            | `ingress.timeplusd.domain`, `ingress.appserver.domain`   |

---

## Using `subPath`

Before Helm chart **v6.0.15** (Timeplus Enterprise **v2.7.8**), PVs used by the `timeplusd` StatefulSet did not specify `subPath`.
This can cause:

1. Folder conflicts between `/var/lib/timeplusd/nativelog` and `/var/lib/timeplusd/metastore`.
2. Issues when enabling [`readOnlyRootFilesystem`](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/).

Since **v6.0.15**, you can configure `subPath` for each mount to avoid these issues.
To upgrade an existing cluster, follow these steps:

1. Run `show databases` in the Web Console or CLI to list all databases. You’ll need this for step 6.

2. Enable `sleep` mode in `values.yaml`:

   ```yaml
   timeplusd:
     sleep: true
   ```

   Then run `helm upgrade`.

3. Verify the pod is sleeping:

   ```bash
   kubectl -n $NS get pod timeplusd-0 -o=jsonpath='{.spec.containers[0].command}'
   ```

   The output should be `["bash","-c","sleep 36000"]`.

4. Access the pod and inspect `/var/lib/timeplusd/metastore`:

   ```bash
   kubectl -n $NS exec timeplusd-0 -it -- /bin/bash
   ls -l /var/lib/timeplusd/metastore
   ```

5. Confirm expected directories (`kv`, `log`, `raft`, per-database folders, etc.).

6. Run the migration script (edit database names accordingly):

   ```bash
   cd /var/lib/timeplusd/metastore/

   mkdir nativelog
   mkdir metastore

   mv kv metastore/
   mv log metastore/

   # -------- EDIT -----------
   declare -a dbs=("raft" "neutron" "system" "default")
   # ----- END OF EDIT -------

   for db in "${dbs[@]}"; do
     mv $db nativelog/
   done

   cd /var/lib/timeplusd
   mkdir history
   shopt -s extglob
   mv !(history) history
   ```

7. Verify new folder structure:

   * `/var/lib/timeplusd/metastore` contains `metastore` and `nativelog`
   * `/var/lib/timeplusd/metastore/metastore` contains `kv` and `log`
   * `/var/lib/timeplusd/metastore/nativelog` contains `raft` and databases
   * `/var/lib/timeplusd` contains `history`, `metastore`, `nativelog`

8. Repeat for each `timeplusd` pod (`timeplusd-1`, `timeplusd-2`, ...).

9. Update `values.yaml` to configure `subPath` and disable sleep mode:

   ```yaml
   timeplusd:
     sleep: false
     storage:
       log:
         subPath: ./log
       stream:
         nativelogSubPath: ./nativelog
         metastoreSubPath: ./metastore
       history:
         subPath: ./history
   ```

10. Run `helm upgrade` again to apply changes.
    Once pods restart, the migration is complete.
