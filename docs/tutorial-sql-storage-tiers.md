# Storage Tiers

Timeplusd storage volumes allow physical disks to be abstracted from the streams. Any single volume can be composed of an ordered set of disks. Whilst principally allowing multiple block devices to be potentially used for data storage, this abstraction also allows other storage types, including S3. Timeplusd data parts can be moved between volumes and fill rates according to storage policies, thus creating the concept of storage tiers.

Storage tiers unlock hot-cold architectures where the most recent data, which is typically also the most queried, requires only a small amount of space on high-performing storage, e.g., NVMe SSDs. As the data ages, SLAs for query times increase, as does query frequency. This fat tail of data can be stored on slower, less performant storage such as HDD or object storage such as S3.

### Step1: Creating a Disk

To use tiered storage, you first need to create disks. Below is a example to utilize a S3 bucket as a disk:

```SQL
CREATE DISK s3 disk(
    type='s3',
    endpoint='https://sample-bucket.s3.us-east-2.amazonaws.com/streams/',
    access_key_id='your_access_key_id',
    secret_access_key='your_secret_access_key',
    metadata_path='/var/lib/timeplusd/disks/s3/'
)
```

A complete list of settings relevant to this disk declaration can be found [here](s3-external.md#ddl-settings). Note that credentials can be managed here using the same approaches described in Managing credentials, i.e., the use_environment_credentials can be set to true in the above settings block to use IAM roles.

### Step2: Creating a Storage Policy

Once created, this "disk" can be used by a storage volume declared within a policy. For the example below, we assume s3 is our only storage. 

```SQL
CREATE STORAGE POLICY hcs as $$
volumes:
    hot:
        disk: default
    cold:
        disk: d1
moving_factor: 0.1            
$$;
```

Notes: By default, timeplusd will automatically create 'default' disk. This disk is mounted to the local file system in the directory specified by the 'path' parameter in the configuration (the default value is /var/lib/timeplusd). Its initial path is set to /.

#### Storage Policy Settings

#### volume_name (string)
Volume name defined in the storage policy.

#### volume_priority (uint64) 
volume_priority — Defines the priority (order) in which volumes are filled. Lower value means higher priority. The parameter values should be natural numbers and collectively cover the range from 1 to N (lowest priority given) without skipping any numbers.
* If all volumes are tagged, they are prioritized in given order.
* If only some volumes are tagged, those without the tag have the lowest priority, and they are prioritized in the order they are defined in config.
* If no volumes are tagged, their priority is set correspondingly to their order they are declared in configuration.
* Two volumes cannot have the same priority value.

#### disk (string)
Disk names, defined in the storage policy.

#### volume_type (Enum8)
Type of volume. Can have one of the following values:
* JBOD
* SINGLE_DISK
* UNKNOWN

#### disks (array(string))
Disk names, defined in the storage policy.

#### max_data_part_size (uint64) 
he maximum size of a part that can be stored on any of the volume's disks. If the a size of a merged part estimated to be bigger than max_data_part_size_bytes then this part will be written to a next volume. Basically this feature allows to keep new/small parts on a hot (SSD) volume and move them to a cold (HDD) volume when they reach large size. Do not use this setting if your policy has only one volume.

#### move_factor (float64)
when the amount of available space gets lower than this factor, data automatically starts to move on the next volume if any (by default, 0.1). timeplusd sorts existing parts by size from largest to smallest (in descending order) and selects parts with the total size that is sufficient to meet the **move_factor** condition. If the total size of all parts is insufficient, all parts will be moved.

#### perform_ttl_move_on_insert (uint8)
Value of the perform_ttl_move_on_insert setting. — Disables TTL move on data part INSERT. By default if we insert a data part that already expired by the TTL move rule it immediately goes to a volume/disk declared in move rule. This can significantly slowdown insert in case if destination volume/disk is slow (e.g. S3).

#### load_balancing (enum8)
Policy for disk balancing. Can have one of the following values:
* ROUND_ROBIN
* LEAST_USED

### Step3: Creating a Stream

Assuming you have configured your disk to use a bucket with write access, you should be able to create a table such as in the example below and apply the created storage policy:

```SQL
CREATE STREAM default.hcs
(
    `i32` int32,
    `s` string,
    `_tp_time` datetime64(3, 'UTC') DEFAULT now64(3, 'UTC') CODEC(DoubleDelta, LZ4)
)
TTL to_start_of_day(_tp_time) + interval 7 day to volume 'cold'
SETTINGS storage_policy = 'hcs';
```

The above stream will apply the 'hcs' storage policy and using a TTL policy to move data elder than 7 days to volume 'cold' (i.e S3 bucket).
