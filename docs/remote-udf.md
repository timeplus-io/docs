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

1. You can call the UDF for more than 1 row, such as `select my_udf(col) from my_stream`. To improve the efficiency, Timeplus will send batch requests to the remote UDF, e.g. `my_udf([input1, input2, input3])`and the return value is an array too `[return1, return2, return3]`
2. The input data is wrapped in a JSON document `{"ip":["ip1","ip2","ip3"]}`
3. We simply call the REST API of [ipinfo.io](https://ipinfo.io) with the API token from the Lambda environment variable
4. The response from ipinfo.io REST API will be put into a JSON document \{“result”:[..]} and sent out as the Lambda output
5. Since the Lambda function is running outside Timeplus servers, there are no restrictions for 3rd party libraries. In this example, we are using the built-in node.js “https” library. For more complex data processing, feel free to include more sophisticated libraries, such as machine learning.

Once you have deployed the Lambda function, you can generate a publicly accessible URL, then register the function in Timeplus Web Console.

## Register the UDF in Timeplus Console

In Timeplus web console, open "UDFs" from the navigation menu on the left, and click the 'Register New Function' button. Choose "Remote" as the UDF type.

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

| Timeplus Data Types     | Payload in UDF HTTP Request                                  |
| ----------------------- | ------------------------------------------------------------ |
| array(TYPE)             | \{"argument_name":[array1,array2]}                           |
| bool                    | \{"argument_name":[true,false]}                               |
| date                    | \{"argument_name":["2023-07-27","2023-07-28"]}                |
| datetime                | \{"argument_name":["2023-07-27 04:00:00","2023-07-28  04:00:00"]} |
| datetime64              | \{"argument_name":["2023-07-27 04:00:00.000","2023-07-28  04:00:00.000"]} |
| float, float64, integer | \{"argument_name":[number1,number2]}                          |
| string                  | \{"argument_name":[string1,string2]}                          |



### Returned value

The remote UDF endpoint should return the text representation of a JSON document:

```json
{
  "result":[result1, result2]
}
```

Timeplus will take each element of the result array and convert back to Timeplus data type. The supported return type are similar to argument types. The only difference is that if you return a complex data structure as a JSON, it will be converted to a `tuple` in Timeplus.

| UDF HTTP Response                    | Timeplus Data Types        |
| ------------------------------------ | -------------------------- |
| \{"result":[array1,array2]}          | array(TYPE)                |
| \{"result":[true,false]}              | bool                       |
| \{"result":[dateString1,dateString2]} | date, datetime, datetime64 |
| \{"result":[number1,number2]}         | float, float64, integer    |
| \{"result":[string1,string2]}         | string                     |
| \{"result":[json1,json2]}             | tuple                      |

## Register the UDF via SQL

You can also create the UDF in Timeplus Proton or Timeplus Enterprise via SQL.

```sql
CREATE REMOTE FUNCTION udf_name(ip string) RETURNS string
 URL 'https://the_url'
 AUTH_METHOD 'none'
```

If you need to protect the end point and only accept requests with a certain HTTP header, you can use the `AUTH_HEADER` and `AUTH_KEY` setting, e,g.
```sql
CREATE REMOTE FUNCTION udf_name(ip string) RETURNS string
 URL 'https://the_url'
 AUTH_METHOD 'auth_header'
 AUTH_HEADER 'header_name'
 AUTH_KEY 'value';
```

Run `DROP FUNCTION udf_name` to delete or recreate the UDF.

## Other ways to build UDF

You can also build the remote UDF with your own microservices or long-running application services to gain better control of the hardware resources, or gain even better performance or low latency.
“Remote UDF” is the recommended solution for our Timeplus customers to extend the capabilities of built-in functionality, without introducing potential security risks for our cloud services. For our large customers with strong on-prem deployment needs, we also built a “Local UDF” mode which allows Timeplus to call local programs to process data.



## Best Practices for UDF

User-defined functions open the door for new possibilities to process and analyze the data with full programming capabilities within Timeplus. There are some additional factors to consider when building and using User-Defined Functions:

1. For Timeplus Cloud customers, it’s highly recommended to enable Authentication for the UDF. For example, when you register the function, you can set the key as ‘passcode’ and the value as a random word. Timeplus will set this in the HTTP header while making requests to the remote UDF endpoints. In your endpoint code, be sure to check whether the key/value pairs in the HTTP header matches the setting in Timeplus. If not, return an error code to deny the UDF request.
2. Calling a single UDF may only take 100ms or less, however, if you call a UDF for millions of rows, this could slow down the entire query. It’s recommended to aggregate the data first, then call the UDF with a lesser number of requests. E.g. `SELECT ip_lookup(ip):city as city, sum(cnt) FROM (SELECT ip, count(*) as cnt FROM access_log GROUP BY ip) GROUP BY city`
   instead of
   `SELECT ip_lookup(ip):city, count(*) as cnt FROM access_log GROUP BY city`
3. The Remote UDF in Timeplus is not designed for aggregation. Please turn to [JavaScript based local UDF](/js-udf) for User-Defined Aggregate Functions (UDAF).
4. To improve performance, Timeplus automatically sends batched requests to the UDF endpoints. For example, if there are 1000 requests to the UDF in a single SQL execution, the framework may send 10 requests with 100 each for the input. That’s why in the sample code, I will process the `ip` as an array and also return the value in the other array. Please make sure the returned value matches the inputs.
5. Properly adding logs to your UDF code can greatly help troubleshoot/tune the function code.
6. Only the Timeplus workspace administrators can register new User-Defined Functions, while all members in the workspace can use the UDFs.
7. Make sure the UDF name doesn’t conflict with the [built-in functions](/functions) or other UDFs in the same workspace.
