

# 处理文本

### lower

`小(字符串)`

将字符串中的 ASCII 拉丁符号转换为小写。

### upper

`上级(字符串)`

将字符串中的 ASCII 拉丁符号转换为大写。

### format

`format(template,args)` 使用参数中列出的字符串格式化常量模式。

例如：`format('{} {}', 'Hello', 'World')` 获得 `Hello World`

### concat

`concat(str1,str2 [,str3])` 将2 或更多字符串合并为单个字符串。 例如， `concat('95','%')` 以获得95%。 您也可以使用 `||` 作为快捷语法，例如：`'95' || '%'` 此函数中的每个参数必须是字符串。 您可以使用 [to_string](#to_string) 函数来转换他们，例如 `到_string(95)|| '%'`

### substr

`substr(str,index [,length])` 返回 `str` 从 `index` 开始的子串(第一个字符的index是1)。 `length` 是可选的。

### trim

`修剪(字符串)`

删除字符串开头或结尾的所有指定字符。 默认情况下，删除字符串两端连续出现的所有常用空格（ASCII 字符 32）。

### split_by_string

`split_by_string(sep,string)`

用字符串分隔一个字符串到子字符串。 它使用由多个字符组成的常量字符串 `sep` 作为分隔符。 如果字符串 `sep` 为空，它会将字符串 `字符串` 拆分为单个字符的数组。

例如： `split_by_string('b','abcbxby')` 将会获得一个包涵字符串 `['a','c','x','y']` 的数组。

### match

`match(string,pattern)` 决定字符串是否匹配给定的正则表达式。 例如，要检查文本是否包含一个敏感的 AWS ARN，您可以运行 `match(text,'arn:aws:kms:us-east-1:\d{12}:key/.{36}')`

### multi_search

`multi_search_any(text, array)` 决定文本是否包含给定数组中的字符串。 例如，要检查文本是否包含任何敏感关键词，您可以运行 `multi_search_any(text,['password','token','secret'])`

### replace_one

`替换 (string,pattern,replacement)`

将 `模式` 替换为第三个参数 `替换` `字符串`

例如， `replace_one('abca','a','z')` 将得到 `zbca`

### replace

`替换 (string,pattern,replacement)`

将 `模式` 替换为第三个参数 `替换` `字符串`

例如 `替换 ('aabc','a','z')` 将得到 `zzbc`

### replace_regex

`replace_regex(string,pattern,replacement)`

替换所有出现的模式。

这可以用来掩盖数据，例如： 要隐藏完整的电话号码，您可以运行 `replace_regex('604-123-4567' (\\d{3})-(\\d{3})-(\\d{4})','\\1-***-******')` 获得 `604-***-****`

### extract

用正则表达式处理纯文本并提取内容。 例如， `extract('key1=value1, key2=value2','key1=(\\w+)')`, 这将得到“value1”。  如果日志行放入一个单一的文本列，您可以用提取的字段创建一个视图，例如：

```sql
将视图日志创建为 
从log_stream中选择 'key1=(\\w+)' 作为key1,
       extract(value, 'key2=(\\w+)' 作为key2
```



### extract_all_groups

`extract_all_groups(haystack, pattern)`

使用 `模式` 正则表达式匹配所有组 `haystack` 字符串。 返回数组，其中第一个数组包含键值，第二个数组包含所有值。

```sql
SELECT 
 extract_all_groups('v1=111, v2=222, v3=333', '("[^"+"|\\w+)=("[^"]+"|\\w+)=分组
 -- 返回 [ [ "v1", "v2", "v3" ], [ "111", "222", "333" ]
```



### extract_all_groups_horizontal

`extract_all_groups_水平(haystack, pattern)`

使用 `模式` 正则表达式匹配所有组 `haystack` 字符串。 返回数组，其中第一个数组包括与第一组匹配的所有片段，第二个数组匹配第二组等。

```sql
SELECT 
 extract_all_groups_horizontal('v1=111, v2=222, v3=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') as groups
 -- [ [ "v1", "111" ], [ "v2", "222" ], [ "v3", "333" ] ]
```



### grok

`grok(string,pattern)`

在不使用正则表达式的情况下从计划文本中提取值。 例如：`SELECT grok('我的名字是杰克。 我今年 23 岁。','我的名字是 %{DATA:name}。 我是 %{INT:age} 岁。） 因为m`将得到 `{"name":"Jack","age":"23"}` 作为 `m`

请注意返回 map 中的所有密钥和值都是字符串类型。 您可以将它们转换为其他类型，例如 `(m['age'])：int`

### coalesce

`coalesce(value1, value2,...)` 从左到右检查 `NULL` 参数是否被传递并返回第一个非 `NULL` 参数。 如果您获得了与Nullable类型相关的错误信息，例如： “嵌套类型数组(字符串) 不能在Nullable类型内”， 您可以使用此函数将数据转换为非-`NULL` 例如： `json_extract_array(coalesce(raw:payload, ')`

### hex

`hex(argument)` 返回包含参数十六进制表示形式的字符串。`argument` 可以是任何类型。

### uuid

`uuid ()` 或 `uuid (x)` 生成通用唯一标识符 (UUID)，这是一个用于识别记录的 16 字节数字。 为了在一行中生成多个UUID, 在每个函数调用中传递一个参数, 例如 `SELECT uuid(1) as a, uuid(2) 为 b` ，否则如果在调用多个 `uuid 时没有参数` 函数在一个 SQL 语句中 将返回相同的 UUID 值。