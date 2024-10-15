# Local UDF in JavaScript

In addition to [Remote UDF](/remote-udf), Timeplus Proton also supports JavaScript-based UDF running in the SQL engine. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with modern JavaScript (powered by [V8](https://v8.dev/)). No need to deploy extra server/service for the UDF. More languages will be supported in the future.

:::info

The JavaScript-based UDF can run in both Timeplus and Proton local deployments. It runs "locally" in the database engine. It doesn't mean this feature is only available for local deployment.

:::

## Register a JS UDF via SQL {#ddl}
Please check [CREATE FUNCTION](/sql-create-function) page for the SQL syntax.

## Register a JS UDF via Web Console {#register}

1. Open "UDFs" from the navigation menu on the left, and click the 'Register New Function' button.
2. Specify a function name, such as `second_max`. Make sure the name won't conflict with built-in functions or other UDF. Description is optional.
3. Choose the data type for input parameters and return value.
4. Choose "JavaScript" as the UDF type.
5. Specify whether the function is for aggregation or not.
6. Enter the JavaScript source for the UDF. (We will explain more how to write the code.)
7. Click **Create** button to register the function.

### Arguments

Unlike Remote UDF, the argument names don't matter when you register a JS UDF. Make sure you the list of arguments matches the input parameter lists in your JavaScript function.

The input data are in Timeplus data type. They will be converted to JavaScript data type.

| Timeplus Data Types                      | JavaScript Data Types   |
| ---------------------------------------- | ----------------------- |
| int8/16/32/64, uint8/16/32/64,float32/64 | number                  |
| bool                                     | boolean                 |
| fixed_string/string                      | string                  |
| date/date32/datetime/datetime64          | Date  (in milliseconds) |
| array(Type)                              | Array                   |

### Returned value

The JavaScript UDF can return the following data types and they will be converted back to the specified Timeplus data types. The supported return type are similar to argument types. The only difference is that if you return a complex data structure as an `object`, it will be converted to a named `tuple` in Timeplus.

| JavaScript Data Types   | Timeplus Data Types                      |
| ----------------------- | ---------------------------------------- |
| number                  | int8/16/32/64, uint8/16/32/64,float32/64 |
| boolean                 | bool                                     |
| string                  | fixed_string/string                      |
| Date  (in milliseconds) | date/date32/datetime/datetime64          |
| Array                   | array(Type)                              |
| object                  | tuple                                    |

## Develop a scalar function {#udf}

A scalar function is a function that returns one value per invocation; in most cases, you can think of this as returning one value per row. This contrasts with [Aggregate Functions](#udaf), which returns one value per group of rows.



### Scalar function with 1 argument {#scalar1}

For example, you would like to check whether the user sets a work email in their profile. Although this could be doable with plain SQL but it'll be nice if you can create a UDF to make the SQL more readable, e.g.

```SQL
SELECT * FROM user_clicks where is_work_email(email)
```

You can use the following code to define a new function `is_work_email` with one input type `string` and return `bool`.

```javascript
function is_work_email(values){
  return values.map(email=>email.endsWith("@gmail.com"));
}
```

Notes:

1. The first line defines a function with the exact same name as the UDF. The number of arguments should match what you specify in the UDF form.
2. Please note the input is actually a JavaScript list. For the sake of high performance, Timeplus will reduce the number of function calls by combining the arguments together. You need to return a list with the exact same length of the input.
3. `values.map(..)` creates a new array populated with the results of calling a provided function on every element in the calling array ([doc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)).
4. `email=>email.endsWith("@gmail.com")` is the shortcut to return a `bool` by checking whether the email ends with "@gmail.com". You can add more complex logic, or write in multiple lines and end with `return ..`.

### Scalar function with 2 or more arguments {#scalar2}

Let's enhance the previous example, by defining a list of email domains which won't be considered as work-related. e.g.

```sql
SELECT * FROM user_clicks where email_not_in(email,'gmail.com,icloud.com,live.com')
```

Similar to the last tutorial, you create a new function called `email_not_in`. This time you specify two arguments in `string`. Note: currently JS UDF doesn't support complex data types, such as `array(string)`.

The following code implements this new function:

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

### Scalar function with no argument {#scalar0}

Currently we don't support JS UDF without arguments. As a workaround, you can define a single argument, e.g.

```SQL
SELECT *, magic_number(1) FROM user_clicks
```

The `magic_number` takes an `int` argument as a workaround.

```javascript
function magic_number(values){
  return values.map(v=>42)
}
```

In this case, the function will return `42` no matter what parameter is specified.

## Develop an aggregate function {#udaf}

An aggregate function returns one value per group of rows. When you register the UDF, make sure you turn on the option to indicate this is an aggregation function. Compared to scalar functions, the life cycle is a bit more complex.

### 3 required and 3 optional functions {#udaf-lifecycle}

Let's take an example of a function to get the second maximum values from the group.

| Order | Function         | Required? | Description                                                  | Example                                                      |
| ----- | ---------------- | --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1     | initialize()     | Yes       | Initialize the states.                                       | function()\{<br />this.max=-1.0;<br />this.sec_max=-1.0;<br />} |
| 2     | process(args..)  | Yes       | Main logic for the function                                  | function(values)\{<br />values.map(..)<br />}                 |
| 3     | finalize()       | Yes       | Return the final aggregation result                          | function()\{<br />return this.sec_max<br />}                  |
| 4     | serialize()      | No        | Serialize JS internal state to a string, so that Timeplus can persist for failover/recovery. | function()\{<br />return JSON.stringify(\{'max':this.max,'sec_max':this.sec_max})<br />} |
| 5     | deserialize(str) | No        | Opposite to serialize(). Read the string and convert back to JS internal state. | function(str)\{<br />let s=JSON.parse(str);<br />this.max=s['max'];<br />this.sec_max=s['sec_max'];<br />} |
| 6     | merge(str)       | No        | Merges two states into one. Used for multiple shards processing. | function(str)\{<br />let s=JSON.parse(str);<br />if..else..}  |



### Example: get second largest number {#udaf-example}

The full source code for this JS UDAF is

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

* With Timeplus UI: choose JavaScript as UDF type, make sure to turn on 'is aggregation'. Set the function name say `second_max` (you don't need to repeat the function name in JS code). Add one argument in `float` type and set return type to `float` too. Please note, unlike JavaScript scalar function, you need to put all functions under an object `{}`. You can define internal private functions, as long as the name won't conflict with native functions in JavaScript, or in the UDF lifecycle.
* With SQL in Proton Client: check the example at [here](/js-udf#udaf).

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

There is an advanced setting `has_customized_emit`. When this is set to `true`:

* `initialize()` is called to prepare a clean state for each function invocation.
* Proton partitions the data according to `group by` keys and feeds the partitioned data to the JavaScript UDAF. `process(..)` is called to run the customized aggregation logic. If the return value of `process(..)` is 0, no result will be emitted. If a none-zero value is returned by `process(..)`, then `finalize()` function will be called to get the aggregation result.  Proton will emit the results immediately. `finalize()` function should also reset its state for next aggregation and emit.

Caveats:

1. One streaming SQL supports up to 1 UDAF with `has_customized_emit=true`
2. If there are 1 million unique key, there will be 1 million UDAF invocations and each of them handles its own partitioned data.
3. If one key has aggregation results to emit, but other keys don't have, then Proton only emit results for that key.

This is an advanced feature. Please contact us or discuss your use case in [Community Slack](https://timeplus.com/slack) with us.



## Notes

* We will provide better testing tools in the future.
* The custom JavaScript code is running in a sandbox with V8 engine. It won't impact other workspaces.
