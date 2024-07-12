# timeplus diag
Run diagnostics of Timeplus Enterprise services.

This command can be ran when the Timeplus Enterprise services are running or stopped. It will geneate a file in the "logs" folder with ".diag" as the file extension and "timeplus_" as the prefix, followed by the datetime.

When you contact Timeplus support team, pleaes run this command and compress the entire logs folder with current logs and the diag file, and send the compressed file to support team. This will help the support engineers better understand how Timeplus Enterprise is deployed.

## diag file
The diag file, such as "timeplus/logs/timeplus_20240712100051.diag", is a JSON document without sensitive customer data. The key content of the diag file is:
* versions for Timeplus Enterprise services.
* cpu/memory/os information for the node.
* how the Timeplus Enterprise cluster is setup.
* schema for Timeplus streams, views, or external tables. No sample data will be captured in the diag file.
* license information.

```json
{
  "version": {
    "Version": "2.4.1",
    "Timeplusd": {
      "Version": "2.3.6"
    },
    "Appserver": {
      "Version": "1.4.36"
    },
    "Connector": {
      "Version": "1.5.3"
    },
    "Web": {
      "Version": "1.4.21"
    },
    "Cli": {
      "Version": "1.0.12"
    }
  },
  "host": {
    "hostname": "abc.local",
    "uptime": 1988377,
    "bootTime": 1718761274,
    "procs": 654,
    "os": "darwin",
    "platform": "darwin",
    "platformFamily": "Standalone Workstation",
    "platformVersion": "14.5",
    "kernelVersion": "23.5.0",
    "kernelArch": "arm64",
    "virtualizationSystem": "",
    "virtualizationRole": "",
    "hostId": ".."
  },
  "cpu": [
    {
      "cpu": 0,
      "vendorId": "",
      "family": "0",
      "model": "0",
      "stepping": 0,
      "physicalId": "",
      "coreId": "",
      "cores": 10,
      "modelName": "Apple M2 Pro",
      "mhz": 0,
      "cacheSize": 0,
      "flags": null,
      "microcode": ""
    }
  ],
  "memory": {
    "total": 34359738368,
    "available": 8964079616,
    "used": 25395658752,
    "usedPercent": 73.91109466552734,
    "free": 40484864,
    "active": 8978055168,
    "inactive": 8923594752,
    "wired": 3743367168,
    "laundry": 0,
    "buffers": 0,
    "cached": 0,
    "writeBack": 0,
    "dirty": 0,
    "writeBackTmp": 0,
    "shared": 0,
    "slab": 0,
    "sreclaimable": 0,
    "sunreclaim": 0,
    "pageTables": 0,
    "swapCached": 0,
    "commitLimit": 0,
    "committedAS": 0,
    "highTotal": 0,
    "highFree": 0,
    "lowTotal": 0,
    "lowFree": 0,
    "swapTotal": 0,
    "swapFree": 0,
    "mapped": 0,
    "vmallocTotal": 0,
    "vmallocUsed": 0,
    "vmallocChunk": 0,
    "hugePagesTotal": 0,
    "hugePagesFree": 0,
    "hugePagesRsvd": 0,
    "hugePagesSurp": 0,
    "hugePageSize": 0,
    "anonHugePages": 0
  },
  "cluster": [
    {
      "advertised_host": "abc.local",
      "attrs": "",
      "boot_timestamp": "2024-07-12T09:56:39.632+08:00",
      "cluster_id": "timeplusd_cluster_exp",
      "data_tcp_listen_host": "0.0.0.0",
      "data_tcp_port": 8465,
      "disk_free_mb": 108493,
      "disk_total_mb": 948584,
      "free_memory_mb": 0,
      "http_port": 3218,
      "listen_host": "0.0.0.0",
      "locality": "region=us-east-1,datacenter=us-east-1a",
      "meta_tcp_listen_host": "0.0.0.0",
      "meta_tcp_port": 8464,
      "node_epoch": 6,
      "node_id": 1,
      "node_roles": "Metadata,Data",
      "node_state": "Online",
      "node_uuid": "..",
      "postgresql_tcp_port": 5432,
      "table_tcp_port": 7587,
      "tcp_port": 8463,
      "timestamp": "2024-07-12T09:56:39.635+08:00",
      "total_cpus": 10,
      "total_memory_mb": 32768,
      "total_mvs": 0,
      "total_shards": 0
    }
  ],
  "entities": {
    "u1": "\nCREATE STREAM ..",
    "u2": "\nCREATE STREAM .."
  },
  "license": [
    {
      "created_by": "admin",
      "expiry": "2024-08-10T12:00:52.347Z",
      "is_trial": true,
      "issued": "2024-07-11T12:00:52.347Z"
    }
  ]
}
```
