# Protobuf/Avro 架构

Timeplus 支持以 [Protobuf](https://protobuf.dev/) 或 [Avro](https://avro.apache.org) 格式读取或写入消息。 本文档介绍如何在没有架构注册表的情况下处理数据。 如果您的 Kafka 主题是否与架构注册表关联，请查看 [此页面]（Proton架构注册表）。

## 创建架构 {#create}

如果没有架构注册表，则需要使用 SQL 定义 Protobuf 或 Avro 架构。

### Protobuf

```sql
创建或替换格式架构 schema_name 为 '
              语法 = “proto3”；

              消息 searchRequest {
                字符串查询 = 1；
                int32 page_number = 2；
                int32 results_per_page = 3；
              }
              '类型 Protobuf
```

然后在为 Kafka 创建外部流时参考这个架构：

```sql
创建外部流 stream_name (
         查询字符串，
         page_number int32，
         results_per_page int32)
设置类型='kafka'，
         brokers='pkc-1234.us-west-2.aws.confluent.cloud: 9092'，
         topic='topic_name'，
         security_protocol='sasl_SSL'，
         username='..',
         密码='..',
         data_format='protobufSingle',
         format_schema='schema_name: searchrequest'
```

请注意：

1. 如果你想确保每条 Kafka 消息只有一条 Protobuf 消息，请将 data_format 设置为 protobufSingle。 如果你将其设置为 Protobuf，那么在一条 Kafka 消息中可能会有多条 Protobuf 消息。
2. `format_schema`设置包含两部分：注册的架构名称（在本示例中：架构名称）和消息类型（在本示例中：SearchRequest）。 用分号将它们组合在一起。
3. 你可以使用这个外部流在目标 Kafka/Confluent 主题中读取或写入 Protobuf 消息。
4. 有关更高级的用例，请查看 [复杂架构示例](#complex)。

### Avro

自 Proton 1.5.10 起可用。

```sql
创建或替换格式架构 schema_name 为 '{
                “命名空间”：“example.avro”，
                “类型”：“记录”，
                “名称”：“用户”，
                “字段”：[
                  {“名称”：“名称”，“类型”：“字符串”}，
                  {“名称”：“favorite_number”，“类型”：[“int”，“null”]}，
                  {“名称”：“favorite_color”，“类型”：[“字符串”，“空”]}
                ]
              }
              'TYPE Avro;
```

然后在为 Kafka 创建外部流时参考这个架构：

```sql
创建外部流 stream_name（
         名称字符串，
         favorite_number 可为空（int32），
         favorite_color 可为空（字符串））
设置类型='kafka'，
         brokers='pkc-1234.us-west-2.aws.confluent.cloud.cloud: 9092'，
         topic='topic_name'，
         security_protocol='sasl_SSL'，
         用户名='..',
         密码='..',
         data_format='avro',
         format_schema='schema_name'
```

## 列出架构

List schemas in the current Timeplus deployment:

```sql
显示格式架构
```

## 显示架构的详细信息

```sql
显示创建格式架构 schema_name
```

## 删除架构

```sql
删除格式架构 <IF EXISTS> schema_name;
```

## 复杂 Protobuf 架构的示例 {#protobuf_complex}

### 嵌套架构

```sql
创建格式架构 simple_nested AS '
语法 = “proto3"；

消息名称 {
 字符串第一 = 1；
 字符串最后 = 2；
}

消息 Person {
 字符串电子邮件 = 1；
 姓名 = 2；
 int32 年龄 = 3；
 map<string, int32> skills = 4;
}
'TYPE Protobuf
```

```sql
创建外部流人物（
  电子邮件字符串、
  name_first 字符串、
  name.last 字符串、
  技能地图（字符串，int32）、
  年龄 int32
)
设置 type='kafka'... data_format='protobufSingle'，
         format_schema='simple_nested: person'
```

请注意：

1. `Person`是顶级消息类型。 它指的是 “名称” 消息类型。
2. 使用 `name`作为前缀作为列名。 使用\ _ 或。 将前缀与嵌套字段名称连接起来。
3. 当你创建外部流来读取 Protobuf 消息时，你不必定义所有可能的列。 只有您定义的列才会被读取。 跳过其他列/字段。

### 枚举

假设在你的 Protobuf 定义中，有一个枚举类型：

```protobuf
枚举级别 {
  levelOne = 0；
  levelTwo = 1；
}
```

你可以在 Proton 中使用枚举类型，例如

```sql
创建外部流... (
  ..
  level enum8 ('levelOne'=0, 'levelTwo'=1)，
  ..
)
```

### 重复

假设在你的 Protobuf 定义中，有一种重复的类型：

```protobuf
重复的字符串状态
```

你可以在 Proton 中使用数组类型，例如

```sql
创建外部流... (
  ..
  状态数组（字符串），
  ..
)
```

### 重复和嵌套 {#repeat_nested}

比如说，在你的 Protobuf 定义中，有一个自定义类型的字段，而且还重复了这个字段：

```protobuf
syntax = “proto3"；
message DataComponent {
  可选字符串消息 = 1；
  消息参数 {
    message keyValue {
      可选字符串名称 = 1；
      可选字符串值 = 2；
    }
    重复的 keyValue 参数 = 1；
  }
  可选参数参数 = 2;
}
```

你可以在 Proton 中使用元组类型，例如

```sql
创建外部流... (
    消息字符串，
    参数元组（参数嵌套（名称字符串，值字符串））
)
```

流数据将显示为：

```sql
从 stream_name 中选择 *；
```

| 消息    | 参数                                                                                                                                                                                                                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 第 0 号 | ([('key_1', 'value_1'), ('key_2', 'value_2'), ('key_3', 'value_3')]) |

### 包裹

假设在你的 Protobuf 定义中，有一个软件包：

```protobuf
软件包演示；
消息 stockRecord {
..
}
```

如果 Protobuf 定义类型中只有 1 个软件包，则不必包含软件包名称。 例如：

```sql
创建外部流... (
  ..
)
设置... format_schema= “schema_name: stockRecord”
```

如果有多个软件包，则可以在软件包中使用完全限定名称，例如

```sql
创建外部流... (
  ..
)
设置... format_schema= “schema_name: demo.stockRecord”
```

### 导入架构

如果你使用 [创建格式架构](#create) 来注册格式架构，比如 `schema_name`，你可以创建另一个架构并导入这个架构：

```sql
创建格式架构 import_example 为 '
import “schema_name.proto”；
消息 Test {
 必填字符串 ID = 1；
 可选级别 theLevel = 2；
}
'TYPE Protobuf
```

请务必添加 `.proto` 作为后缀。

## Avro 数据类型映射 {#avro_types}

下表显示了支持的 Avro 数据类型以及它们如何与 INSERT 和 SELECT 查询中的 Timeplus 数据类型相匹配。

| Avro 数据类型                     | Timeplus 数据类型                                            |
| ----------------------------- | -------------------------------------------------------- |
| 整数                            | int8, int16, int32, uint8, uint16, uint32                |
| 长                             | int64，uint64                                             |
| 浮点数                           | float32                                                  |
| 双重的                           | float64                                                  |
| 字节，字符串                        | 字符串                                                      |
| 固定 (N)     | fixed_string (N) |
| 枚举                            | enum8，enum16                                             |
| 数组 (T)     | 数组 (T)                                |
| 地图 (k, v)  | 地图 (k, v)                             |
| 联盟（空值，T）                      | 可为空 (T)                               |
| 空的                            | 可为空（什么都没有）                                               |
| int（日期）                       | 日期，日期32                                                  |
| 长（时间戳毫秒）                      | datetime64 (3)                        |
| 长（时间戳微秒）                      | datetime64 (6)                        |
| 字节（十进制）                       | datetime64 (N)                        |
| 整数                            | ipv4                                                     |
| 已修复 (16)   | ipv6                                                     |
| 字节（十进制）                       | 十进制（P、S）                                                 |
| 字符串 (uuid) | uuid                                                     |
| 已修复 (16)   | int128，uint128                                           |
| 已修复 (32)   | int256，uint256                                           |
| 记录                            | 元组                                                       |
