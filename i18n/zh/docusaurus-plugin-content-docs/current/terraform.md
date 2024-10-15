# Terraform Provider

HashiCorp Terraform是一个基础设施即代码（IaC: Infrastructure-as-Code）工具，它允许你在可读的配置文件中定义云和本地资源。

新的[Timeplus Terraform Provider](https://registry.terraform.io/providers/timeplus-io/timeplus/latest)允许企业：

- 降低基础架构作为代码管理和通过自动化的[GitOps](https://github.com/readme/featured/defining-gitops)集成部署的复杂性和风险。
- 通过对数据流、Apache Kafka源、物化视图、仪表板、UDF等一致地、版本控制地访问，提高开发人员的自主性和生产力。

借助这个Provider，Timeplus的任何规模的客户都可以安全地加速云中，无论是公共、私有或混合的实时数据分析，并通过代码实现完全自动化的基础设施管理，集成到持续交付工作流程中。



## 为什么不直接使用SQL脚本？

Timeplus的核心是一个批流一体的SQL数据库。 因此，您可能想知道为什么我们为用户开发了这个Terraform Provider，而不是鼓励他们使用一组SQL语句或SQL脚本来创建、更新或删除资源。

简单地说，SQL脚本可以为Timeplus中所有用户提供很好的实时数据分析处理服务，而基于Terraform的工作流会更加适合某些团队。 它们是互补的。

关于我们为什么发布Terraform Provider的更详细的回答：

1. Terraform允许用户以描述的方式管理资源。 作为数据工程师或管理员，您可以在Terraform文件中描述最终状态，而无需处理如何达到该最终状态的复杂性。 如果使用SQL或REST API，用户必须弄清楚是否创建新的资源，或更改现有资源，或删除然后重新创建资源等等。
2. Timeplus提供的不仅仅是流和视图。 例如，很难想象用SQL/dbt脚本定义和更新仪表板定义（JSON格式）。
3. 常规SQL脚本不能为你管理依赖关系。 您必须写一组`CREATE..  IF NOT EXISTS`，或者`DROP .. CREATE ..`。 当您只想对SQL做一个小的更改时，您可能最终需要重新创建每个资源，这可能导致数据丢失或不一致。
4. 数据工程师和平台工程师是Timeplus的主要目标用户。 在现代软件开发过程中，使用分支、代码审查和CICD跟踪版本控制系统中的更改是一个常见的需求。 使用基于Terraform的变更管理程序，工程师可以创建分支，进行代码变更，并要求代码审查。 同时，Terraform可以为代码维护者和审阅者生成部署计划，以便更好地了解除了审查代码更改本身之外，哪些资源将被创建、更新或删除。 如果审阅者对代码更改和部署计划满意，他们就可以批准代码并将更改部署到目标环境中，而无需进行任何猜测。



## 哪些资源可用？

资源是Terraform语言中最重要的元素。 Terraform资源描述一个或多个基础设施对象，例如数据流、数据源、数据下游和长时间运行的物化视图。 您可以在Terraform中管理以下Timeplus资源：

- [数据流](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/stream)：Timeplus流类似于传统SQL数据库中的表。 它们可以是仅追加流、变更日志流或版本流。
- [数据源](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/source)：Timeplus源是在后台运行的进程，用于从特定数据源（如Apache Kafka）收集数据并将其摄取到流中。
- [视图](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/view)：Timeplus视图是预定的查询。 这对于将常用的复杂查询包装为视图很有用。
- [物化视图](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/materialized_view)：Timeplus物化视图是保存数据的特殊视图。 一旦创建，物化视图将在后台持续运行，并不断地将查询结果写入底层存储系统。
- [数据下游](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/sink)：Timeplus的数据下游在后台运行查询，并不断将查询结果发送到目标系统。
- [警报](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/alert)：警报就像数据下游，用于向外部系统发送数据。 不同之处在于警报有两种状态：“触发”和“解决”。
- [仪表板](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/dashboard)：仪表板是在一个网页中组织和安排的一组一个或多个的面板。 它支持多种面板，使构建可视化组件变得容易，并允许你为特定的监视和分析需求创建仪表板。
- [远程UDF](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/remote_function)：Timeplus远程函数是受支持的用户定义函数类型之一。 远程函数允许用户将HTTP webhook注册为可以在查询中调用的函数。
- [JavaScript UDF](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/javascript_function)：Timeplus JavaScript函数是受支持的用户定义函数类型之一。 JavaScript函数允许用户使用JavaScript编程语言执行函数，并在查询中调用。

下面是一个定义流和Kafka源的Terraform脚本示例：

```hcl
resource "timeplus_stream" "example" {
  name = "example"
  column {
    name = "col_1"
    type = "int32"
  }
  column {
    name    = "col_2"
    type    = "datetime64(3)"
    default = "now()"
  }
}

resource "timeplus_source" "kafka_example" {
  name        = "kafka example"
  description = "A source example connects to a locally deployed insecure kafka cluster"
  stream      = timeplus_stream.example.name
  type        = "kafka"
  properties = jsonencode({
    brokers = "127.0.0.1:19092"
    topic   = "some-topic"
    offset  = "latest"
    tls = {
      disable = true
    }
    data_type = "json"
  })
}

```

## 入门开始

现在您已经了解了Timeplus Terraform provider，让我们开始并将其投入使用。

### 先决条件

在开始之前，请确保您具备以下条件：

1. Timeplus云账户。 如果您还没有Timeplus云账户，现在可以[免费创建一个](https://timeplus.com)。
2. Terraform（1.0+）[已安装](https://learn.hashicorp.com/tutorials/terraform/install-cli)。
3. Golang（1.20.0+）[已安装](https://golang.org/doc/install)。

### 创建API密钥

您需要创建一个API密钥来管理没有UI的Timeplus资源。 创建API密钥步骤如下：

1. 单击右上角用户图标。
2. 在下拉菜单中选择“个人设置”。
3. 单击“创建API密钥”按钮。
4. 设置可选的描述并选择截止日期。
5. 将 API 密钥安全地保存在您的计算机中。 您不会在控制台中再次检索纯文本密钥。

### 设置Terraform配置

要使用这个provider，只需将其添加到你的Terraform文件中，例如：

```hcl
terraform {
  required_providers {
    timeplus = {
      source  = "timeplus-io/timeplus"
      version = ">= 0.1.2"
    }
  }
}

provider "timeplus" {
  # the workspace ID can be found in the URL https://us-west-2.timeplus.cloud/<my-workspace-id>
  workspace = "my-workspace-id"
  # API key is required to use the provider
  api_key   = "my-api-key"
}
```

然后，可以开始提供Timeplus资源。 下面是一个流的例子：

```hcl
resource "timeplus_stream" "example" {
    name = "example"
    description = "the example stream from the provider README file"
    column {
      name = "col_1"
      type = "string"
    }
    column {
      name = "col_2"
      type = "int64"
    }
}
```

遵循[Terraform文档](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)来构建、更改和删除资源，例如：

- `terraform init`来下载插件
- `terraform apply`来审查和批准更改
- `terraform destroy`来删除资源
