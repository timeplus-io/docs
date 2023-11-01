# Remote UDF

Register a webhook as the UDF. You may use any programming language/framework to develop/deploy the webhook. A good starting point is using AWS Lambda. 

## IP Lookup Example

Let’s start with an example. It’s a common use case for IT admin or business analysts to turn a client IP address into a city or country, then get the total number of visitors per city or country. 

This might be roughly doable with pure SQL, with a lot of regular expressions or case/when branches. Even so, the city/country won’t be very accurate, since there could be some edge cases that won’t be well-covered in such a static analysis.

Luckily, there are many online services (e.g. [ipinfo.io](https://ipinfo.io)) to turn IP addresses into cities/countries, even with enriched details such as addresses or internet providers.
Here is an example of an UDF(ip_lookup) in Timeplus:

```sql
select ip_lookup(ip) as data, data:country, data:timezone from test_udf
```

## Build the UDF with AWS Lambda

In this example, the `ip_lookup` function is built as a “Remote UDF”, actually powered by a AWS Lambda function. I chose Node.js but you can also build it with other supported languages such as Python, Ruby, Go, Java, etc. 

Here is the full source code for the Lambda function:

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

The code is straightforward. A few notes:

1. 您可以调用UDF多于 1 行，如 `select my_udf(col) from my_stream`。 为了提高效率，Timeplus 会向远程 UDF 发送批量请求，例如 `my_udf([input1, input2, input3])` 返回值也是一个数组 `[return1, return2, return3]`
2. 输入的数据被包装在 JSON 文档 `{"ip":["ip1","ip2","ip3"]}`
3. 我们直接调用了 [ipinfo.io](https://ipinfo.io) 的REST API，用的是在Lambda环境变量里定义的API token
4. 来自 ipinfo.io REST API 的响应将会放入一个 JSON 文档\{“结果”：[..]} 作为Lambda输出发送
5. 由于Lambda函数在Timeplus服务器之外运行，对第三方函数库没有任何限制。 在此示例中，我们正在使用内置的 node.js “https” 库。 为了更加复杂的数据处理，人们可以自由地包括更复杂的图书馆，如机器学习。

Once you have deployed the Lambda function, you can generate a publicly accessible URL, then register the function in Timeplus Web Console.

## Register the UDF

Only Timeplus workspace administrators can register new UDF. Open "UDFs" from the navigation menu on the left, and click the 'Register New Function' button. Choose "Remote" as the UDF type.

Set a name for the function and specify the arguments and return data type. Set the webhook URL(e.g. Lambda URL) in the form. You can choose to enable extra authentication key/value in the HTTP header, securing the endpoint to avoid unauthorized access.

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

| Timeplus 数据类型           | Payload in UDF HTTP Request                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| array(TYPE)             | \{"argument_name":[array1,arrary2]}                                       |
| 布尔值                     | \{"argument_name":[true,false]}                                           |
| 日期                      | \{"argument_name":["2023-07-27","2023-07-28"]}                            |
| 日期时间                    | \{"argument_name":["2023-07-27 04:00:00","2023-07-28  04:00:00"]}         |
| 日期时间64                  | \{"argument_name":["2023-07-27 04:00:00.000","2023-07-28  04:00:00.000"]} |
| float, float64, integer | \{"argument_name":[number1,number2]}                                      |
| 字符串                     | \{"argument_name":[string1,string2]}                                      |



### Returned value

The remote UDF endpoint should return the text representation of a JSON document:

```json
{
  "result":[result1, result2]
}
```

Timeplus will take each element of the result array and convert back to Timeplus data type. The supported return type are similar to argument types. The only difference is that if you return a complex data structure as a JSON, it will be converted to a `tuple` in Timeplus.

| UDF HTTP Response                      | Timeplus 数据类型              |
| -------------------------------------- | -------------------------- |
| \{"result":[array1,arrary2]}          | array(TYPE)                |
| \{"result":[true,false]}              | 布尔值                        |
| \{"result":[dateString1,dateString2]} | date, datetime, datetime64 |
| \{"result":[number1,number2]}         | float, float64, integer    |
| \{"result":[string1,string2]}         | 字符串                        |
| \{"result":[json1,json2]}             | 元组                         |



## Other ways to build UDF

You can also build the remote UDF with your own microservices or long-running application services to gain better control of the hardware resources, or gain even better performance or low latency.
“Remote UDF” is the recommended solution for our Timeplus customers to extend the capabilities of built-in functionality, without introducing potential security risks for our cloud services. For our large customers with strong on-prem deployment needs, we also built a “Local UDF” mode which allows Timeplus to call local programs to process data. 



## Best Practices for UDF

User-defined functions open the door for new possibilities to process and analyze the data with full programming capabilities within Timeplus. There are some additional factors to consider when building and using User-Defined Functions:

1. For Timeplus Cloud customers, it’s highly recommended to enable Authentication for the UDF. For example, when you register the function, you can set the key as ‘passcode’ and the value as a random word. Timeplus will set this in the HTTP header while making requests to the remote UDF endpoints. In your endpoint code, be sure to check whether the key/value pairs in the HTTP header matches the setting in Timeplus. If not, return an error code to deny the UDF request.
2. Calling a single UDF may only take 100ms or less, however, if you call a UDF for millions of rows, this could slow down the entire query. It’s recommended to aggregate the data first, then call the UDF with a lesser number of requests. E.g. `SELECT ip_lookup(ip):city as city, sum(cnt) FROM (SELECT ip, count(*) as cnt FROM access_log GROUP BY ip) GROUP BY city` 
   instead of 
   `SELECT ip_lookup(ip):city, count(*) as cnt FROM access_log GROUP BY city`
3. The Remote UDF in Timeplus is not designed for aggregation. Please turn to [JavaScript based local UDF](js-udf) for User-Defined Aggregate Functions (UDAF).
4. To improve performance, Timeplus automatically sends batched requests to the UDF endpoints. For example, if there are 1000 requests to the UDF in a single SQL execution, the framework may send 10 requests with 100 each for the input. That’s why in the sample code, I will process the `ip` as an array and also return the value in the other array. Please make sure the returned value matches the inputs.
5. Properly adding logs to your UDF code can greatly help troubleshoot/tune the function code.
6. Only the Timeplus workspace administrators can register new User-Defined Functions, while all members in the workspace can use the UDFs.
7. Make sure the UDF name doesn’t conflict with the [built-in functions](functions) or other UDFs in the same workspace.


