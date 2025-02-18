# Terraform Provider

HashiCorp Terraform is an Infrastructure as Code tool that lets you define both cloud and on-prem resources in human-readable configuration files.

The [Timeplus Terraform Provider](https://registry.terraform.io/providers/timeplus-io/timeplus/latest) allows businesses to:

- Reduce complexity and risk with infrastructure managed as code and deployed through automated [GitOps](https://github.com/readme/featured/defining-gitops) integration.
- Increase developer autonomy and productivity with consistent, version-controlled access to data streams, Apache Kafka sources, materialized views, dashboards, UDF, and more.

With this Provider, Timeplus customers at any scale can safely accelerate data streaming initiatives in the cloud (public, private, or hybrid) with infrastructure management that is fully automated through code and integrated within continuous delivery workflows.

:::info
Starting from v0.1.6, the Terraform Provider works for both Timeplus Enterprise self-hosting and Timeplus Cloud.
:::


## Why not just SQL script?

At its core, Timeplus is a SQL database that works well for both streaming and batch/OLAP. So you may wonder why we developed this Terraform Provider for our users, instead of encouraging them to use a set of SQL statements, or SQL script, to create, update, or delete resources.

The short answer is that SQL script works well for Timeplus, while a Terraform-based workflow can work well for certain teams. They are complementary to each other.

A longer answer for why we built this Terraform Provider:

1. Terraform allows users to manage resources in a declarative way. As a data engineer or administrator, you describe the end state in the Terraform file, without handling the complexities of how to reach that end state. If using SQL or REST API instead, users have to figure out whether to create new resources, or change existing resources, or delete then recreate resources, etc.
2. Timeplus provides more than just streams and views. For example, it's hard to imagine defining and updating dashboard definitions (which is in JSON format) with SQL/dbt scripts.
3. Regular SQL scripts don't manage the dependencies for you. You have to write a set of `CREATE.. IF NOT EXISTS`, or `DROP .. CREATE ..`. When you just want to make a small change to your SQL, you may end up recreating every resource and that can lead to data loss or inconsistency.
4. Data engineers and platform engineers are the main target users for Timeplus. In the modern software development process, it’s a common requirement to track changes in version control systems, with branching, code review, and CICD. With the Terraform-based change management process, engineers can create a branch, make code changes, and ask for code review. At the same time, Terraform can generate the deployment plan for the code maintainer and reviewer to better understand which resources will be created, updated, or deleted, in addition to reviewing the code change itself. If the reviewer is okay with the code change and deployment plan, they can approve the code and deploy the exact change to the target environment, without any guess work.



## Which resources are available?

Resources are the most important element in the Terraform language. A Terraform resource describes one or more infrastructure objects, such as streams, sources, sinks and long-running materialized views. You can manage the following Timeplus resources in Terraform:

- [Streams](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/stream): Timeplus streams are similar to tables in the traditional SQL databases. Timeplus streams can be append-only, changelog or versioned streams.
- [Sources](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/source): Timeplus sources are processes run in background to collect data from specific data sources (such as Apache Kafka) and ingest them into streams.
- [Views](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/view): Timeplus views are named queries. It is useful for wrapping a commonly used complex query as a view.
- [Materialized Views](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/materialized_view): Timeplus materialized views are special views that persist its data. Once created, a materialized view will keep running in the background and continuously writes the query results to the underlying storage system.
- [Sinks](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/sink): Timeplus sinks run queries in background and send query results to the target system continuously.
- [Alerts](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/alert): Alerts are like sinks, they are used to send data to external systems. How alerts are different is that alerts have two statuses: 'triggered' and 'resolved'.
- [Dashboards](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/dashboard): A dashboard is a set of one or more panels organized and arranged in one web page. A variety of panels are supported to make it easy to construct the visualization components so that you can create the dashboards for specific monitoring and analytics needs.
- [Remote UDF](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/remote_function): Timeplus remote functions are one of the supported user defined function types. Remote functions allow users to register a HTTP webhook as a function which can be called in queries.
- [JavaScript UDF](https://registry.terraform.io/providers/timeplus-io/timeplus/latest/docs/resources/javascript_function): Timeplus JavaScript functions are one of the supported user defined function types. JavaScript functions allow users to implement functions with the javascript programming language, and be called in queries.

An example of Terraform script to define a stream and a Kafka source is

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

## Getting started

Now that you’ve learned a bit about the Timeplus Terraform provider, let’s get started and put it to work.

### Prerequisites

You’ll need these prerequisites to follow along:

1. A Timeplus Enterprise self-hosting deployment or a Timeplus Cloud account.
2. Terraform (1.0+) [installed](https://learn.hashicorp.com/tutorials/terraform/install-cli).
3. Golang (1.20.0+) [installed](https://golang.org/doc/install).

### Create an API Key

For Timeplus Cloud users, please create an API Key per [the guide](/apikey). For self-hosting deployments, create a user with password and required permissions.

### Set up Terraform configuration

To use the provider, simply add it to your terraform file, for example:

```hcl
terraform {
  required_providers {
    timeplus = {
      source  = "timeplus-io/timeplus"
      version = ">= 0.1.6"
    }
  }
}

provider "timeplus" {
  # for self-hosting Timeplus Enterprise, you can use local or default as workspace.
  workspace = "default"

  # for self-hosting Timeplus Enterprise, the endpoint is the URL of the Timeplus Enterprise web console
  endpoint = "http://localhost:8000"
  username  = "aUser"
  password  = "thePassword"
  # for Timeplus Cloud, create the API key
  api_key   = "my-api-key"
}
```

Then you can start provisioning Timeplus resources, and below is an example of stream:

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

Follow the [Terraform documentations](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli) to build, change and destroy resources, e.g.

- `terraform init` to download the plugin
- `terraform apply` to review and approve the changes
- `terraform destroy` to delete the resources
