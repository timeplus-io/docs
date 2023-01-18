# Local UDF in JavaScript

Recently we also added the support of JavaScript-based local UDF. You can develop User-defined scalar functions (UDFs) or User-defined aggregate functions (UDAFs) with modern JavaScript (powered by [V8](https://v8.dev/)). No need to deploy extra server/service for the UDF. More languages will be supported in the future.

## Register a JS UDF {#register}

1. Open the workspace settings page via clicking on the workspace name at top-right corner and choosing **Settings**.
2. Click the **Register New Function** button.
3. Specify a function name, such as `second_max`. Make sure the name won't conflict with built-in functions or other UDF. Description is optional.
4. Choose the data type for input parameters and return value.
5. Choose JavaScript as the UDF type.
6. Specify whether the function is for aggregation or not.
7. Enter the JavaScript source for the UDF. (We will explain more how to write the code.)
8. Click **Create** button to register the function.

## Develop a scalar function {#udf}

A scalar function is a function that returns one value per invocation; in most cases, you can think of this as returning one value per row. This contrasts with [Aggregate Functions](#udaf), which return one value per group of rows.



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

1. The first line defines a function with the exactly same name as the UDF. The number of arguments should match what you specify in the UDF form.
2. Please note the input is actually a JavaScript list. For the sake of high performance, Timeplus will reduce the number of function calls by combining the arguments together. You need to return a list with the exactly same length of the input.
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

An aggregate function returns one value per group of rows. When you register the UDF, make sure you turn on the option to indicate this is an aggregation funciton. Comparing to scalar functions, the life cycle is a bit more complex.

### 3 required and 3 optional functions

Let's take an example of a function to get the second maxium values from the group.

| Order | Function         | Required? | Description                                                  | Example                                                      |
| ----- | ---------------- | --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1     | initialize()     | Yes       | Initialize the states.                                       | function(){<br />this.max=-1.0;<br />this.sec_max=-1.0;<br />} |
| 2     | process(args..)  | Yes       | Main logic for the function                                  | function(values){<br />values.map(..)<br />}                 |
| 3     | finalize()       | Yes       | Return the final aggregation result                          | function(){<br />return this.sec_max<br />}                  |
| 4     | serialize()      | No        | Serialize JS internal state to a string, so that Timeplus can persistent for failover/recovery. | function(){<br />return JSON.stringify({'max':this.max,'sec_max':this.sec_max})<br />} |
| 5     | deserialize(str) | No        | Opposite to serialize(). Read the string and convert back to JS internal state. | function(str){<br />let s=JSON.parse(str);<br />this.max=s['max'];<br />this.sec_max=s['sec_max'];<br />} |
| 6     | merge(str)       | No        | Merges two states into one. Used for multiple shards processing. | function(str){<br />let s=JSON.parse(str);<br />if..else..}  |

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

To register this function, choose JavaScript as UDF type, make sure turn on 'is aggregation'. Set the function name say `second_max` (you don't need to repeat the function name in JS code). Add one argument in `float` type and set return type to `float` too.

Please note, unlike JS sclar function, you need to put all functions under an object `{}`. You can define internal priviate functions, as long as the name won't conflict with native functions in JavaScript, or in the UDF lifecycle.

