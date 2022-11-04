# 内置示例数据快速开始

Timeplus提供了一个内置的数据源，用于为一些典型的使用情况生成流量数据。

## 创建数据源

登录 TimePlus 云。 如果您有超过1个工作区，请选择工作区。 转到 **SOURCES** 页面并单击 **尝试我们的样本数据集** 右上角的按钮。 您将创建第一个 [来源](glossary#source)。

![尝试示例数据集](/img/sampledata.png)

默认情况下， **iot_data** 模板将被使用。 您可以选择一个源名称，例如 `iot`。 **源描述** 是可选的。 向下滚动。 离开 **默认启用名称** 创建一个流，并指定 [流](glossary#stream) 名称，例如 `iot`

![IOT 示例数据集配置](/img/sampledata_cfg.png)

点击 **下一个**。 您将预览样本数据。 请随时点击 **下一个** 按钮。 可选，您可以点击TIME列附近的图像按钮并启用 **设置为 TIMESTAMP COLUMN** 选项。 ([为什么你需要设置一个时间戳列？](glossary#timestamp-column))

![IOT 示例数据集配置](/img/sampledata_ts.png)

点击 **下一个** 按钮。 您将检查源配置。 点击 **创建源按钮**

![IOT 示例数据集确认](/img/sampledata_confirm.png)

消息将显示成功创建。

![IOT 示例数据集确认](/img/sampledata_ok.png)

## 探索流数据 {#step4}

打开 QUERY 页面。 您将在查询编辑器下看到新创建的流。 点击名称(例如 `iot`)

![单击iot流](/img/sampledata_click_iot.png)

The query will be generated automatically: `SELECT * FROM iot` Click the RUN QUERY button (or press Ctrl+Enter) to run the query.

![运行查询](/img/sampledata_click_run_bn.png)

串流 SQL 将不断在UI 中显示最新结果。

![运行查询](/img/sampledata_click_query_live.png)

您可以切换到VISUALIZATION 选项卡来查看数据的流式图。

![运行查询](/img/sampledata_click_viz.png)