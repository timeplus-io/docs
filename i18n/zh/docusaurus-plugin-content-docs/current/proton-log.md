# 读取日志文件

您可以将 Proton 用作轻量级的高性能工具进行日志分析。 请查看 [博客](https://www.timeplus.com/post/log-stream-analysis) 了解更多详情。

:::info

请注意，此功能处于技术预览版。 更多设置有待添加/调整。

:::

## 语法

使用日志类型创建外部流来监控日志文件，例如

```sql
创建外部流 proton_log (
  原始字符串
)
设置
type='log'，
   log_files='proton-server.log'，
   log_dir='/var/log/proton-server'，
   timestamp_regex='^ (\ d{4}\.\ d{2}\。\ d{2} \ d{2}:\ d{2}:\ d{2}\。\ d+) ',
   row_delimiter=' (\ d{4}\.\ d{2}\。\ d{2} \ d{2}:\ d{2}:\ d{2}\。\ d+)\ [\ d+\]\ {'
```

必需的设置：

- log_files
- log_dir
- timestamp_regex
- 行分隔符。 正则表达式中预计只有 1 个捕获组。
