# 远程 UDF

将 webhook 注册为 UDF。 你可以使用任何编程语言/框架来开发/部署 webhook。 一个不错的起点是使用 AWS Lambda。

## IP 查找示例

让我们从一个例子开始。 这是信息技术管理员或商业分析员将客户端IP地址转换为城市或国家的常见用例。 然后获得每个城市或国家的游客总数。

这可以用纯的 SQL 大致可行，带有大量正则表达式或案例/分支。 即使如此，城市/国家也不会十分准确，因为在这种静态分析中可能会有一些边缘情况没有得到很好的考虑。

幸运的是，有许多在线服务(如 [ipinfo)。 o](https://ipinfo.io)将IP地址变成城市/国家，即使有丰富的详细信息，例如地址或互联网提供者。 下面是Timeplus中UDF(ip_lookup)的示例：

```sql
select ip_lookup(ip) as data, data:country, data:timezone from test_udf
```

## 使用 AWS Lambda 构建UDF

在这个示例中， `ip_searchup` 函数被构建为“远程 UDF”，实际上是由 AWS Lambda 函数驱动的。 我选择 Node.js，但你也可以使用其他支持的语言，如Python、Ruby、Go、Java等构建它。

这里是 Lambda 函数的完整源代码：

```javascript
const https = require('https');

exports.handler = async (event) => {
    if(event.body===undefined){
        return {statusCode: 200,body:'no body in the request'}
    }
    let body = JSON.parse(event.body)
    let ip=body.ip||body.arg0 //ip is an array of string

    const promise = new Promise(function(resolve, reject) {
        const dataString = JSON.stringify(ip);
        const options = {
          hostname: 'ipinfo.io',
          path: '/batch',
          headers: {
              'Authorization': `Bearer ${process.env.TOKEN}`,
              'Content-Type': 'application/json',
              'Content-Length': dataString.length,
            },
          method: 'POST'
        };
        const req = https.request(options, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                let batchMap = JSON.parse(data);
                let rows =[] //return an array of results to Timeplus
                for(var i=0;i<ip.length;i++){
                    let info=batchMap[ip[i]]
                    if(info===undefined){
                        info={};
                    }
                    rows.push(JSON.stringify(info))
                }
                const response = {
                    statusCode: 200,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({result:rows})
                };
                resolve(response);
            });
        }).on("error", (err) => {
            reject(Error(err))
        });
        req.write(dataString);
        req.end();
    })
    return promise
};
```

代码是直截了当的。 以下几个说明：

1. You can call the UDF for more than 1 row, such as `select my_udf(col) from my_stream`. To improve the efficiency, Timeplus will send batch requests to the remote UDF, e.g. `my_udf([input1, input2, input3])`and the return value is an array too `[return1, return2, return3]`
2. The input data is wrapped in a JSON document `{"ip":["ip1","ip2","ip3"]}`
3. 我们直接调用了 [ipinfo.io](https://ipinfo.io) 的REST API，用的是在Lambda环境变量里定义的API token
4. 来自 ipinfo.io REST API 的响应将会放入一个 JSON 文档 {“result”：[..]} 作为Lambda输出发送 作为Lambda输出发送 作为Lambda输出发送
5. 由于Lambda函数在Timeplus服务器之外运行，对第三方函数库没有任何限制。 在此示例中，我们正在使用内置的 node.js “https” 库。 为了更加复杂的数据处理，人们可以自由地包括更复杂的图书馆，如机器学习。

一旦你部署了 Lambda 函数，你可以生成一个可公开访问的 URL，然后在 Timeplus Web 控制台注册该函数。

## 注册UDF

只有Timeplus工作区管理员才能注册新的UDF。 Open "UDFs" from the navigation menu on the left, and click the 'Register New Function' button. Choose "Remote" as the UDF type.

Set a name for the function and specify the arguments and return data type. Set the webhook URL(e.g. Lambda URL) in the form. 您可以选择在 HTTP 头中启用额外的验证密钥/值，保护端点以避免未经授权的访问。

### Arguments

The data transferring between Timeplus and Remote UDF endpoint is `JSONColumns` format. For example, if a remote UDF has two arguments, one `feature` argument is of type `array(float32)` and the other `model` argument is of type `string`, below is the data transferring to UDF endpoint in `JSONColumns` format:

```json
{
  "features": [
   [66, 66],[72, 72]
  ],
  "model": [
    "line1",
    "line2"
  ]
}
```

The following data types in Timeplus are supported as Remote UDF arguments:

| Timeplus 数据类型              | Payload in UDF HTTP Request                 |
| -------------------------- | ------------------------------------------- |
| array(TYPE)                | {"argument_name":[array1,arrary2]}          |
| bool                       | {"argument_name":[true,false]}              |
| date, datetime, datetime64 | {"argument_name":[dateString1,dateString2]} |
| float, float64, integer    | {"argument_name":[number1,number2]}         |
| string                     | {"argument_name":[string1,string2]}         |



### Returned value

The remote UDF endpoint should return the text representation of a JSON document:

```json
{
  "result":[result1, result2]
}
```

Timeplus will take each element of the result array and convert back to Timeplus data type. The supported return type are similar to argument types. The only difference is that if you return a complex data structure as a JSON, it will be converted to a `tuple` in Timeplus.

| UDF HTTP Response                    | Timeplus 数据类型              |
| ------------------------------------ | -------------------------- |
| {"result":[array1,arrary2]}          | array(TYPE)                |
| {"result":[true,false]}              | bool                       |
| {"result":[dateString1,dateString2]} | date, datetime, datetime64 |
| {"result":[number1,number2]}         | float, float64, integer    |
| {"result":[string1,string2]}         | string                     |
| {"result":[json1,json2]}             | tuple                      |



## 构建UDF的其他方式

您还可以使用您自己的微服务或长期运行的应用程序服务来构建远程UDF，以便更好地控制硬件资源。 或获得更好的性能或低延迟 “远程UDF”是我们的Timeplus客户扩展内置功能能力的推荐解决方案。 不给我们的云服务带来潜在的安全风险。 对于在部署前有很强需要的大型客户。 我们还建立了一个“本地UDF”模式，它允许TimePlus调用本地程序来处理数据。



## UDF 的最佳实践

用户定义的函数打开了在Timeplus内用完整的编程能力处理和分析数据的新可能性。 在构建和使用用户定义函数时还有一些其他因素需要考虑：

1. 对于Timeplus Cloud客户，它强烈建议为UDF启用身份验证。 例如，当您注册函数时，您可以将密钥设置为“密码”，并将其设置为随机字值。 在向远程的 UDF 端点提出请求时，Timplus将在HTTP 头中设置它。 在您的端点代码中，请务必检查HTTP头中的键值对是否匹配Timeplus中的设置。 如果没有，返回错误代码以拒绝UDF 请求。
2. 但是，呼叫单个UDF可能只需要100毫秒或更少。 如果你调用一个百万行的 UDF ，这可能会减慢整个查询速度。 它建议先汇总数据，然后用较少的请求来调用 UDF 。 。 `SELECT ip_lookup(ip):city as city, sum(cnt) FROM (SELECT ip, count(*) as cnt FROM access_log GROUP BY ip) GROUP BY city` 而不是 `SELECT ip_lookup(ip):city, count(*) as cnt FROM access_log GROUP BY city`
3. 目前UDF Timeplus系统不是为了汇总而设计的。 对于用户定义的聚合函数 (UDAF)，请使用基于 [的 JavaScript 的本地 UDF](js-udf) 。
4. 为了提高性能，Timeplus自动向UDF 端点发送批量请求。 例如，如果在一次SQL执行中有1000个请求给UDF 框架可发送10项请求，每项100项请求供投入。 这就是为什么在示例代码中，我会将 `ip` 作为一个数组处理，并且返回另一个数组的值。 请确保返回的值匹配输入。
5. 正确添加日志到您的 UDF 代码会极大地帮助疑难解答/调整函数代码。
6. 只有Timeplus工作区管理员可以注册新的用户定义功能，而工作区的所有成员都可以使用UDF。
7. 请确保UDF 名称与同一工作区的 [内置函数](functions) 或其他UDF 不冲突。


