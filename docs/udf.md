# User-Defined Functions

At Timeplus, we leverage SQL to make powerful streaming analytics more accessible to a broad range of users. Without SQL, you have to learn and call low-level programming API, then compile/package/deploy them to get analytics results. This is a repetitive and tedious process, even for small changes. 

But some developers have concerns that complex logic or systems integrations are hard to express using SQL.

That's why we add User-Defined Functions (UDF) support in Timeplus. This enables users to leverage existing programming libraries, integrate with external systems, or just make SQL easier to maintain.

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

  const promise = new Promise(function(resolve, reject) {
    https.get(`https://ipinfo.io/${body.ip[0]}?token=${process.env.TOKEN}`, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        const response = {
          statusCode: 200,
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({result:[data]})
        };
        resolve(response);
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
      reject(Error(err))
    });
  })
  return promise
};
```

The code is straightforward. A few notes:

1. The input data is wrapped in a JSON document and key parameter `ip` is available in the array
2. We simply call the REST API of [ipinfo.io](https://ipinfo.io) with the API token from the Lambda environment variable
3. The response from ipinfo.io REST API will be put into a JSON document {“result”:[..]} and sent out as the Lambda output
4. Since the Lambda function is running outside Timeplus servers, there are no restrictions for 3rd party libraries. In this example, we are using the built-in node.js “https” library. For more complex data processing, feel free to include more sophisticated libraries, such as machine learning.

Once you have deployed the Lambda function, you can generate a publicly accessible URL, then register the function in Timeplus Web Console.

## Register the UDF

Only Timeplus workspace administer can register new UDF. Open the Workspace menu on the left, then choose "User-Defined Functions" tab, and click the 'Register New Function' button.

Simply choose a name for the function and specify the input/output data type. Set the Lambda URL in the form. You can choose to enable extra authentication key/value in the HTTP header, securing the endpoint to avoid unauthorized access.



## Other ways to build UDF

You can also build the remote UDF with your own microservices or long-running application services to gain better control of the hardware resources, or gain even better performance or low latency.
“Remote UDF” is the recommended solution for our Timeplus customers to extend the capabilities of built-in functionality, without introducing potential security risks for our cloud services. For our large customers with strong on-prem deployment needs, we also built a “Local UDF” mode which allows Timeplus to call local programs to process data. 



## Best Practices for UDF

User-defined functions open the door for new possibilities to process and analyze the data with full programming capabilities within Timeplus. There are some additional factors to consider when building and using User-Defined Functions:

1. For Timeplus Cloud customers, it’s highly recommended to enable Authentication for the UDF. For example, when you register the function, you can set the key as ‘passcode’ and the value as a random word. Timeplus will set this in the HTTP header while making requests to the remote UDF endpoints. In your endpoint code, be sure to check whether the key/value pairs in the HTTP header matches the setting in Timeplus. If not, return an error code to deny the UDF request.
2. Calling a single UDF may only take 100ms or less, however, if you call a UDF for millions of rows, this could slow down the entire query. It’s recommended to aggregate the data first, then call the UDF with a lesser number of requests. E.g. `SELECT ip_lookup(ip):city as city, sum(cnt) FROM (SELECT ip, count(*) as cnt FROM access_log GROUP BY ip) GROUP BY city` 
   instead of 
   `SELECT ip_lookup(ip):city, count(*) as cnt FROM access_log GROUP BY city`
3. The current UDF system in Timeplus is not designed for aggregation. In some systems, this is called User-Defined Scalar-Valued Functions. User-Defined Aggregate Functions (UDAF) will be introduced shortly with a better foundation for you to customize aggregate functions, or stateful processing. Stay tuned for more information.
4. To improve performance, Timeplus automatically sends batched requests to the UDF endpoints. For example, if there are 1000 requests to the UDF in a single SQL execution, the framework may send 10 requests with 100 each for the input. That’s why in the sample code, I will process the `ip` as an array and also return the value in the other array. Please make sure the returned value matches the inputs.
5. Properly adding logs to your UDF code can greatly help troubleshoot/tune the function code.
6. Only the Timeplus workspace administrators can register new User-Defined Functions, while all members in the workspace can use the UDFs.
7. Make sure the UDF name doesn’t conflict with the [built-in functions](https://docs.timeplus.com/docs/functions) or other UDFs in the same workspace.