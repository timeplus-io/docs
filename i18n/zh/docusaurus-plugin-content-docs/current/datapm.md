# 通过 datapm 从文件和数据库加载数据

Data Package Manager（datapm）是一个 [开源](https://github.com/big-armor/datapm) 数据发布平台，供私人和公共使用。 datapm 命令行工具可以无缝地在系统之间移动数据，而且易于重复。 开箱即用的 datapm 命令行工具附带了 Timeplus 的一个特殊数据下游。  您可以将数据从 CSV/S3 导入 Timeplus，也可以从常用数据库加载数据。

## 数据源
可以使用 datapm 将以下数据源加载到 Timeplus 中：
* 本地文件系统中的文件
* 互联网上的文件（HTTP/HTTPS）
* 亚马逊 S3 中的文件
* PostgreSQL
* MySQL
* MariaDB
* Amazon Redshift
* Google Big Query
* 比特币数据（币安、Coinbase、FTX、Gemini、Kraken）
* Twitter 数据
* 维基百科变化

## 文件格式
支持以下文件格式：
* CSV
* Excel
* XML
* JSON
* Avro

## 压缩包格式
支持以下存档格式：
* GZip
* BZip2
* Zip
* Tar

## 说明

您可以查看 [这篇博客](https://www.timeplus.com/post/real-time-twitter-marketing) ，了解如何使用 datapm 将实时推特数据加载到 Timeplus。

### 下载并安装 datapm

从 https://github.com/big-armor/datapm/releases 下载适用于您的操作系统的最新 datapm 命令行工具。

安装工具

### 运行 datapm
打开终端窗口并运行 `datapm`
```
? What action would you like to take? ? What action would you like to take? ›
❯   Fetch data
    Search for data
    Create new package and publish
    Publish existing package
    Update a package's stats
    Edit a package's descriptions
    Log into a registry
    Log out of a registry
    Add or Update a data repository
    Remove a data repository
```

按回车键

#### 获取数据
```
✔ What action would you like to take? › Fetch data

Source Selection
? Source package or connector name? ✔ What action would you like to take? › Fetch data

Source Selection
? Source package or connector name? ✔ What action would you like to take? › Fetch data

Source Selection
? Source package or connector name? ›
❯   Big Query
    Binance
    Coinbase
    Event Source
    FTX
    Gemini
    Google Sheets
    HTTP
    Kraken
    Local File
    PostgreSQL
    Redshift
❯   Twitter
```

使用向上或向下键选择数据源，然后按回车键进行确认。

例如，如果您选择 `本地文件`
```
Finding Stream Sets
? File path? ›
```

输入本地文件的文件路径（例如CSV或zip）。 您也可以将文件拖动到终端窗口。

datapm 将从本地文件系统或远程系统加载内容，并询问您是更改列名还是删除某些列。

#### 向 Timeplus 发送数据
配置数据源后，选择数据下游：
```
Sink Connector
? Sink Connector? Sink Connector
? Sink Connector? Sink Connector
? Sink Connector? Sink Connector
? Sink Connector? ›
❯   Big Query
    Console (Standard Out)
    Decodable
    Kafka
    Local File
    MongoDB
    MySQL
    PostgreSQL
    Redshift
    Timeplus
```

按向下键选择 Timeplus 然后按回车键。
```
Timeplus Connection
? Repository? ›
❯   New Repository
```

默认情况下，还没有 Timeplus 的存储库。 按回车键创建一个。
```
✔ Repository? › New Repository
? Base URL? › https://us.timeplus.cloud/workspace-id
```
为您的 Timeplus 工作空间设置基本 URL，确保它包含 `https` 或 `http` 以及 WorkspaceID，URL 末端不含 `/`，例如 `https://us.timeplus.cloud/d335214`

按回车键
```
Timeplus Connection
? Repository? ›
❯   New Repository ✔ Repository? › New Repository
? Base URL? › https://us.timeplus.cloud/workspace-id Timeplus Connection
? Repository? ›
❯   New Repository ✔ Repository? › New Repository
? Base URL? › https://beta.timeplus.cloud/workspace-id … https://us.timeplus.cloud/d335214
✔ Connection successful

Timeplus Credentials
? API Key? › API Key? › 
```

您需要设置 API 密钥。 您可以从 Web 控制台获取一个。 (访问BASE_URL/console/settings/apiKey，或在左上角选择“个人设置”，然后切换到“API密钥管理”，然后点击“创建 API 密钥”按钮)。

:::info
datapm 将保存配置，包括 Timeplus baseUrl 和 API 密钥。 下次，您可以选择那些缓存的存储库和密钥。
:::

```
✔ API Key? … ✔ API Key? … ✔ API Key? … ************************************************************
✔ Authentication succeeded

Timeplus Configuration
? Stream for ... records? › Stream for ... records? › Stream for ... records? › 
```
下一步，在 Timeplus 中选择一个数据流名称，然后按回车键。
```
Timeplus Configuration
✔ Stream for appsumo records? Timeplus Configuration
✔ Stream for appsumo records? Timeplus Configuration
✔ Stream for appsumo records? Timeplus Configuration
✔ Stream for appsumo records? … local_tmp-package_0_1
✔ Created Timeplus Stream local_tmp-package_0_1

Checking State of abc
✔ New records may be available

Reading appsumo
✔ Success
✔ Finished writing 499 records
```

datapm 会将数据上传到 Timeplus。 您可以检查 Timeplus 云来检查流。
