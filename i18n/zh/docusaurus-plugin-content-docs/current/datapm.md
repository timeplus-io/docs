# Load data from files and databases via datapm

Data Package Manager (datapm) is an [open source](https://github.com/big-armor/datapm) data publishing platform for private and public use. The datapm command line tool makes moving data between systems seamless and easily repeatable. A special sink for Timeplus is shipped with the datapm command line tool out-of-box.  You can import data from CSV/S3 to Timeplus, as well as load data from common databases.

## Data Sources
The following data sources can be loaded into Timeplus with datapm:
* Files in the local file system
* Files on the internet (HTTP/HTTPS)
* Files in Amazon S3
* PostgreSQL
* MySQL
* MariaDB
* Amazon Redshift
* Google Big Query
* Bitcoin data (Binance, Coinbase, FTX, Gemini, Kraken)
* Twitter data
* Wikipedia changes

## File Formats
The following file formats are supported:
* CSV
* Excel
* XML
* JSON
* Avro

## Archive Formats
The following archive formats are supported:
* GZip
* BZip2
* Zip
* Tar

## Instructions

You may check the [blog]( https://www.timeplus.com/post/real-time-twitter-marketing) for how to use datapm to load real-time twitter data into Timeplus.

### Download and Install datapm

Download the latest datapm command line tool for your OS from https://github.com/big-armor/datapm/releases.

Install the tool.

### Run datapm
Open a terminal window and run `datapm`
```
? What action would you like to take? ›
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

Press Enter key.

#### Fetch data
```
✔ What action would you like to take? › Fetch data

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

Use UP or DOWN key to choose the data source and press Enter to confirm. 

For example, if you choose `Local File`
```
Finding Stream Sets
? File path? ›
```

Type the file path for the local file (e.g. CSV, or a zip). You may also drag the file to the terminal window.

Datapm will load the content from a local file system or remote system and ask you whether to change the column names or remove some columns.

#### Send data to Timeplus
Once you have configured the data source, choose a sink:
```
Sink Connector
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

Press DOWN key to choose Timeplus then press Enter key.
```
Timeplus Connection
? Repository? ›
❯   New Repository
```

By default, there is no repository for Timeplus yet. Press Enter to create one.
```
✔ Repository? › New Repository
? Base URL? › https://us.timeplus.cloud/workspace-id
```
Set the base URL for your Timeplus workspace, making sure it includes `https` or `http`, as well as the workspaceID, without the ending `/`, e.g. `https://us.timeplus.cloud/d335214`

Press Enter.
```
Timeplus Connection
✔ Repository? › New Repository
✔ Base URL? … https://us.timeplus.cloud/d335214
✔ Connection successful

Timeplus Credentials
? API Key? › 
```

您需要设置 API 密钥。 您可以从 Web 控制台获取一个。 (访问BASE_URL/console/settings/apiKey，或在左上角选择“个人设置”，然后切换到“API密钥管理”，然后点击“创建 API 密钥”按钮)。

:::info
datapm 将保存配置，包括 Timeplus baseUrl 和 API 密钥。 下次，您可以选择那些缓存的存储库和密钥。
:::

```
✔ API Key? … ************************************************************
✔ Authentication succeeded

Timeplus Configuration
? Stream for ... records? › 
```
Next step, choose a stream name in Timeplus and press Enter.
```
Timeplus Configuration
✔ Stream for appsumo records? … local_tmp-package_0_1
✔ Created Timeplus Stream local_tmp-package_0_1

Checking State of abc
✔ New records may be available

Reading appsumo
✔ Success
✔ Finished writing 499 records
```

datapm 会将数据上传到 Timeplus。 您可以检查 Timeplus 云来检查流。
