# 本地JavaScript自定义函数

除了 [远程 UDF](remote-udf)之外，Timeplus 还支持在数据库引擎中运行基于 JavaScript 的 UDF。 您可以使用现代 JavaScript（由 [V8](https://v8.dev/)提供支持）开发用户定义的标量函数 (UDF) 或用户定义的聚合函数 (UDAF)。 无需为 UDF 部署额外的服务器/服务。 将来将支持更多语言。

:::info

The JavaScript-based UDF can run in both Timeplus and Proton local deployments. 它在数据库引擎中“本地”运行。 它在数据库引擎中“本地”运行。 这并不意味着此功能仅适用于本地部署。

:::

## 注册 JS UDF {#register}

1. 从左侧导航菜单中打开 “UDF”，然后单击 “注册新功能” 按钮。
2. 指定函数名称，例如 `second_max`。 确保名称不会与内置函数或其他 UDF 冲突。 描述（可选）
3. 为输入参数和返回值选择数据类型。
4. 选择“JavaScript”作为 UDF 类型。
5. 指定该函数是否用于聚合。
6. 输入 UDF 的 JavaScript 代码。 （我们将进一步解释如何编写代码。）
7. 单击 **创建** 按钮注册该函数。

### 参数

与远程 UDF 不同，注册 JS UDF 时参数名称无关紧要。 请确保您的参数列表与您的 JavaScript 函数中的输入参数列表匹配。

输入数据采用 Timeplus 数据类型。 它们将被转换为 JavaScript 数据类型。

| Timeplus 数据类型                            | JavaScript 数据类型 |
| ---------------------------------------- | --------------- |
| int8/16/32/64, uint8/16/32/64,float32/64 | number          |
| 布尔值                                      | boolean         |
| fixed_string/string                      | 字符串             |
| date/date32/datetime/datetime64          | Date  (毫秒为精度)   |
| array(Type)                              | Array           |

### 返回值

JavaScript UDF 可以返回以下数据类型，它们将被转换回指定的 Timeplus 数据类型。 支持的返回类型与参数类型类似。 唯一的区别是，如果您以 `object` 的形式返回一个复杂的数据结构，它将在 Timeplus 中被转换为一个命名的 `tuple`。

| JavaScript 数据类型 | Timeplus 数据类型                            |
| --------------- | ---------------------------------------- |
| number          | int8/16/32/64, uint8/16/32/64,float32/64 |
| boolean         | 布尔值                                      |
| 字符串             | fixed_string/string                      |
| Date  (毫秒为精度)   | date/date32/datetime/datetime64          |
| Array           | array(Type)                              |
| object          | 元组                                       |

## 开发标量函数 {#udf}

标量函数是每次调用返回一个值的函数；在大多数情况下，您可以将其视为每行返回一个值。 这与 [聚合函数](#udaf) 不同，它返回每行组的一个值。



### 带有 1 个参数的标量函数 {#scalar1}

例如，您想检查用户是否在其个人资料中设置了工作电子邮件。 虽然这在普通 SQL 中是可以实现的，但如果你能创建 UDF 来提高 SQL 的可读性，那就更好了，例如

```SQL
SELECT * FROM user_clicks where is_work_email(email)
```

您可以使用以下代码定义一个新函数 `is_work_email` ，其中一个输入类型 `string` 并返回 `bool`。

```javascript
function is_work_email(values){
  return values.map(email=>email.endsWith("@gmail.com"));
}
```

备注：

1. 第一行定义了一个与 UDF 名称完全相同的函数。 参数的数量应与您在 UDF 表单中指定的数量相匹配。
2. 请注意，输入实际上是一个 JavaScript 列表。 为了提高性能，Timeplus 将通过将参数组合在一起来减少函数调用的次数。 你需要返回一个与输入长度完全相同的列表。
3. `values.map(..)` 创建一个新的数组，其结果是在调用数组中的每个元素上调用一个提供的函数([doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map))。
4. `email=>email.endSwith (” @gmail .com”)` 是通过检查电子邮件是否以 “@gmail .com” 结尾来返回 `bool` 的快捷方式。 你可以添加更复杂的逻辑，也可以写入多行并以 `return ..`返回结果。

### 带有 2 个参数的标量函数 {#scalar2}

让我们通过定义一个不被视为与工作相关的电子邮件域名列表来增强前面的示例。 例如

```sql
SELECT * FROM user_clicks where email_not_in(email,'gmail.com,icloud.com,live.com')
```

与上一个教程类似，您创建了一个名为 `email_not_in`的新函数。 这次你指定两个 `string`类型的参数。 注意：目前 JS UDF 不支持复杂的数据类型，例如 `array(string)`。

以下代码实现了这个新函数：

```javascript
function email_not_in(emails,lists){
  let list=lists[0].split(','); // convert string to array(string)
  return emails.map(email=>{
    for(let i=0;i<list.length;i++){
      if(email.endsWith('@'+list[i]))
        return false; // if the email ends with any of the domain, return false, otherwise continue
    }                
    return true; // no match, return true confirming the email is in none of the provided domains
  });
}
```

### 没有参数的标量函数 {#scalar0}

目前，我们不支持没有参数的 JS UDF。 作为一种解决方法，你可以定义一个参数，例如

```SQL
SELECT *, magic_number(1) FROM user_clicks
```

`magic_number` 需要一个 `int` 参数。

```javascript
function magic_number(values){
  return values.map(v=>42)
}
```

在这种情况下，无论指定什么参数，该函数都将返回 `42` 。

## 定义一个新的聚集函数 {#udaf}

聚合函数为每组行返回一个值。 注册 UDF 时，请务必打开该选项以表明这是聚合函数。 与标量函数相比，生命周期要复杂一些。

### 3 required and 3 optional functions {#udaf-lifecycle}

比如我们希望获得一组数据中的第二个最大值。

| 顺序 | 函数               | 是否必需？ | 描述                                           | 示例                                                                                                                                    |
| -- | ---------------- | ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | merge(str)       | 是     | 初始化状态。                                       | function()\{<br />this.max=-1.0;<br />this.sec_max=-1.0;<br />}                                                    |
| 2  | process(args..)  | 是     | 该函数的主要逻辑                                     | function(values)\{<br />values.map(..)<br />}                                                                            |
| 3  | finalize()       | 是     | 返回最终的聚合结果                                    | function()\{<br />return this.sec_max<br />}                                                                             |
| 4  | serialize()      | 否     | 将 JS 内部状态序列化为字符串，这样 Timeplus 就可以持续进行故障转移/恢复。 | function()\{<br />return JSON.stringify(\{'max':this.max,'sec_max':this.sec_max})<br />}                              |
| 5  | deserialize(str) | 否     | 与serialize()相反。 读取字符串并转换回 JS 内部状态。           | function(str)\{<br />let s=JSON.parse(str);<br />this.max=s['max'];<br />this.sec_max=s['sec_max'];<br />} |
| 6  | merge(str)       | 否     | 将两个状态合并为一个。 用于多分片处理。                         | function(str)\{<br />let s=JSON.parse(str);<br />if..else..}                                                             |



### Example: get second largest number {#udaf-example}

此 JS UDAF 的完整源代码是

```javascript
{
    initialize: function() {
        this.max = -1.0;
        this.sec_max = -1.0;
    },

    process: function(values) {
        for (let i = 0; i < values.length; i++) {
            this._update(values[i]);
        }
    },

    _update: function(value) {
        if (value > this.max) {
            this.sec_max = this.max;
            this.max = value;
        } else if (value > this.sec_max) {
            this.sec_max = value;
        }
    },

    finalize: function() {
        return this.sec_max
    },

    serialize: function() {
        return JSON.stringify({
            'max': this.max,
            'sec_max': this.sec_max
        });
    },

    deserialize: function(state_str) {
        let s = JSON.parse(state_str);
        this.max = s['max'];
        this.sec_max = s['sec_max']
    },

    merge: function(state_str) {
        let s = JSON.parse(state_str);
        this._update(s['max']);
        this._update(s['sec_max']);
    }
};
```

To register this function, steps are different in Timeplus Cloud and Proton:

* With Timeplus UI: choose JavaScript as UDF type, make sure to turn on 'is aggregation'. 将函数名称设置为 `second_max` （您无需在 JS 代码中重复函数名称）。 将函数名称设置为 `second_max` （您无需在 JS 代码中重复函数名称）。 在 `float` 类型中添加一个参数，并将返回类型也设置为 `float` 。 Please note, unlike JavaScript scalar function, you need to put all functions under an object `{}`. 你可以定义内部私有函数，只要名称不会与 JavaScript 或 UDF 生命周期中的原生函数冲突。 你可以定义内部私有函数，只要名称不会与 JavaScript 或 UDF 生命周期中的原生函数冲突。
* With SQL in Proton Client: check the example at [here](proton-create-udf#create-aggregate-function).

### Advanced Example for Complex Event Processing {#adv_udaf}

User-Defined Aggregation Function can be used for Complex Event Processing (CEP). Here is an example to count the number of failed login attempts for the same user. If there are more than 5 failed logins, create an alert message. If there is a successful login, reset the counter. Assuming the stream name is `logins` , with timestamp, user, login_status_code, this SQL can continuously monitor the login attempts:

```sql
SELECT window_start, user, login_fail_event(login_status_code) 
FROM hop(logins, 1m, 1h) GROUP BY window_start, user
```

The UDAF is registered in this way:

```sql
CREATE AGGREGATE FUNCTION login_fail_event(msg string) 
RETURNS string LANGUAGE JAVASCRIPT AS $$
{
  has_customized_emit: true,

  initialize: function() {
      this.failed = 0; //internal state, number of login failures
      this.result = [];
  },

  process: function (events) {
      for (let i = 0; i < events.length; i++) {
          if (events[i]=="failed") {
              this.failed = this.failed + 1;
          }
          else if (events[i]=="ok") {
              this.failed = 0; //reset to 0 if there is login_ok before 5 login_fail
          }

          if (this.failed >= 5) {
              this.result.push("alert"); //we can also attach a timestamp
              this.failed = 0; //reset to 0 there are 5 login_fail
          }
      }
      return this.result.length; //show the number of alerts for the users
  },

  finalize: function () {
      var old_result = this.result;
      this.initialize();
      return old_result;
  },

  serialize: function() {
      let s = {
          'failed': this.failed
      };
      return JSON.stringify(s);
  },

  deserialize: function (state_str) {
      let s = JSON.parse(state_str);
      this.failed = s['failed'];
  },

  merge: function(state_str) {
      let s = JSON.parse(state_str);
      this.failed = this.failed + s['failed'];
  }
}
$$;
```

There is an advanced setting `has_customized_emit`. When this is set to `true`: When this is set to `true`:

* `initialize()` is called to prepare a clean state for each function invocation.
* Proton partitions the data according to `group by` keys and feeds the partitioned data to the JavaScript UDAF. `process(..)` is called to run the customized aggregation logic. If the return value of `process(..)` is 0, no result will be emitted. If a none-zero value is returned by `process(..)`, then `finalize()` function will be called to get the aggregation result.  Proton will emit the results immediately. `finalize()` function should also reset its state for next aggregation and emit. `process(..)` is called to run the customized aggregation logic. If the return value of `process(..)` is 0, no result will be emitted. If a none-zero value is returned by `process(..)`, then `finalize()` function will be called to get the aggregation result.  Proton will emit the results immediately. `finalize()` function should also reset its state for next aggregation and emit.

Caveats:

1. One streaming SQL supports up to 1 UDAF with `has_customized_emit=true`
2. If there are 1 million unique key, there will be 1 million UDAF invocations and each of them handles its own partitioned data.
3. If one key has aggregation results to emit, but other keys don't have, then Proton only emit results for that key.

This is an advanced feature. This is an advanced feature. Please contact us or discuss your use case in [Community Slack](https://timeplus.com/slack) with us.



## 备注

* 将来我们将提供更好的测试工具。
* 自定义 JavaScript 代码在装有 V8 引擎的沙箱中运行。 它不会影响其他工作空间。

