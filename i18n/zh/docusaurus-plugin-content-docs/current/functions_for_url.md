

# URL和IP处理

### 协议

`protocol(url)`从URL中提取协议。

例如`protocol('https://docs.timeplus.com/functions')`将返回字符串`https`

### 域名

`domain(url)`从URL中提取域。

例如`domain('https://docs.timeplus.com/functions')`将返回字符串 `docs.timeplus.com`

### 端口

`port(url)`从URL中提取端口。 如果URL中缺少端口，则返回 0。

例如`port('https://docs.timeplus.com/functions')`将返回整数 0

### 路径

`path(url)`从URL中提取路径，不含查询字符串或片段。

例如`path('https://docs.timeplus.com/functions')`将返回字符串`/functions`

### 所有路径

`path_all(url)`从URL中提取路径，包括查询字符串或片段。

例如`path_full('https://docs.timeplus.com/functions_for_logic#if')`将返回字符串`/functions_for_logic#if`

### 片段

`fragment(url)`从URL中提取片段。 如果没有片段，则返回一个空字符串。

例如`fragment('https://docs.timeplus.com/functions_for_logic#if')`将返回字符串`if`

### 查询字符串

`query_string(url)`从URL中提取查询字符串。 如果没有查询字符串，则返回一个空字符串。

例如`query_string('https://a.com?k=v&key=value')`将返回字符串`k=v&key=value`

### decode_url_component

`decode_url_component(url)`返回解码的URL。

### encode_url_component

`encode_url_component(url)`返回编码的URL。



### ipv4_num_to_string

`ipv4_num_to_string(ip)`采用`ipv4`或`uint32`的值并返回一个包含相应IPv4地址的字符串，格式为 A.B.C.d（十进制形式的点分隔数字）。

例如： 例如： `select ipv4_num_to_string(1823216871)`返回`'108.172.20.231'`

### ipv4_string_to_num

`ipv4_string_to_num(string)`采用`string`的值并返回一个`uint32`的值。 如果IPv4地址的格式无效，则会引发异常。

例如： 例如： `select ipv4_string_to_num('108.172.20.231')`返回`1823216871`

### to_ipv4

`ipv4_string_to_num`的另一种表达方式

### ipv4_num_to_string_class_c

`ipv4_num_to_string_class_c(ip)`。 与ipv4_num_to_string(ip)相似，但使用xxx代替最后一个八位字节。

例如： 例如： `select ipv4_num_to_string_class_c(1823216871)`返回`'108.172.20.xxx'`

:::warning

由于使用“xxx”是非常不寻常的，因此这在将来可能会发生改变。 我们建议您不要依赖这一片段的确切格式。

:::

### ipv6_num_to_string

`ipv6_num_to_string(ip)`采用一个包含二进制格式的IPv6地址的`fixed_string(16)` 以文本格式返回包含此地址的字符串。 以文本格式返回包含此地址的字符串。 IPv6-mapped IPv4地址的输出格式为::ffff:111.222.33.44。

例如： 例如： `select ipv6_num_to_string(to_fixed_string(unhex('2A0206B8000000000000000000000011'),16))`返回`'2a02:6b8::11'`

### ipv6_string_to_num

`ipv6_string_to_num(string)`采用一个`string`的值并返回一个`uint128`的值。 如果IPv6地址的格式无效，则会引发异常。

如果输入字符串包含有效的IPv4地址，则返回其IPv6的等效地址。 HEX可以大写也可以小写。

例如： 例如： `select hex(ipv6_string_to_num('2a02:2168:aaa:bbbb::2'))`返回`2A0221680AAABBBB0000000000000002`

`select hex(ipv6_string_to_num('108.172.20.231'))`返回`00000000000000000000FFFF6CAC14E7`

### to_ipv6

`ipv6_string_to_num`的另一种表达方式

### ipv4_to_ipv6

`ipv4_to_ipv6(ip)`将`ipv4`的值转换成`ipv6`

例如：`select ipv6_num_to_string(ipv4_to_ipv6(ipv4_string_to_num('192.168.0.1')))`返回`'::ffff:192.168.0.1'`



### ipv4_cidr_to_range

`ipv4_cidr_to_range(ipv4,number)`接受IPv4和包含[CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)的uint8的值。 返回一个包含两个IPv4的元组，其中包含子网的较低范围和较高范围。

例如：`select ipv4_cidr_to_range(to_ipv4('192.168.0.1'),16)`返回`('192.168.0.0','192.168.255.255')`

### ipv6_cidr_to_range

`ipv6_cidr_to_range(ipv6,number)`接受IPv6和包含[CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)的uint128的值。 返回一个包含两个IPv6的元组，其中包含子网的较低范围和较高范围。

例如：`select ipv6_cidr_to_range(to_ipv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'),32)`返回`('2001:db8::','2001:db8:ffff:ffff:ffff:ffff:ffff:ffff')`

### is_ipv4_string

`is_ipv4_string(string)` returns 1 if it's an ipv4 string, otherwise 0.

### is_ipv6_string

`is_ipv6_string(string)` returns 1 if it's an ipv6 string, otherwise 0.

### is_ip_address_in_range

`is_ip_address_in_range(address, prefix)`确定IP地址是否包含在[CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)表示法表示的网络中。 返回true或false。

例如，`select is_ip_address_in_range('127.0.0.1', '127.0.0.0/8')`返回`true`。 `select is_ip_address_in_range('127.0.0.1', 'ffff::/16')`返回`false`

### geohash_encode

`geohash_encode(longitude, latitude, [precision])`将经度和纬度编码为geohash字符串。

**输入值**

- longitude——你想编码的坐标的经度。 浮动范围`[-180°, 180°]`
- latitude——你想编码的坐标的纬度。 浮动范围`[-90°, 90°]`
- precision——可选的，生成的编码字符串的长度，默认为`12`。 整数范围`[1, 12]`。 任何小于`1`或大于`12`的值都会被静默转换为`12`。

**返回值**

- 字母数字编码坐标`字符串`（使用base32编码字母表的修改版本）。

**示例**

```sql
SELECT geohash_encode(-5.60302734375, 42.593994140625, 0) AS res;
```

**结果**

```text
┌─res──────────┐
│ ezs42d000000 │
└──────────────┘
```

### geohash_decode

将任何geohash编码的字符串解码为经度和纬度。

**输入值**

- 编码字符串——geohash编码的字符串。

**返回值**

- （经度、纬度）——由经度和纬度的`float64`值组成的两个元组。

**示例**

```sql
SELECT geohash_decode('ezs42d000000') AS res;
```

**结果**

```text
┌─res────────────────────────────────────┐
│ (-5.603027176111937,42.59399422444403) │
└────────────────────────────────────────┘
```



### geohashes_in_box

返回具有给定精度的geohash编码字符串数组，这些字符串位于给定框的边界内并与边界相交，基本上是一个扁平成数组的二维网格。

**语法**

```sql
geohashes_in_box(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```



**参数**

- `longitude_min`——经度最小值。 范围：`[-180°, 180°]`。 类型：浮点型。
- `latitude_min`——纬度最小值。 范围：`[-90°, 90°]`。 类型：浮点型。
- `longitude_max`——经度最大值。 范围：`[-180°, 180°]`。 类型：浮点型。
- `latitude_max`——纬度最大值。 范围：`[-90°, 90°]`。 类型：浮点型。
- `precision`——Geohash精度。 范围：`[1, 12]`。 类型：unit8.



:::info note

所有坐标参数的类型必须相同： `float32`或`float64`。

:::info

**返回值**

- 覆盖所提供区域的精度长的geohash-boxes字符串数组，你不应该依赖项目的顺序。
- `[]`——如果最小纬度和经度值不小于相应的最大值，则为空数组。

类型：[数组](https://clickhouse.com/docs/en/sql-reference/data-types/array)（[字符串](https://clickhouse.com/docs/en/sql-reference/data-types/string)）。



:::info note

如果生成的数组长超过10’000’000项目时，函数会显示异常。

:::

**示例**

查询：

```sql
SELECT geohashes_in_box(24.48, 40.56, 24.785, 40.81, 4) AS thasos;
```

**结果**：

```text
┌─thasos──────────────────────────────────────┐
│ ['sx1q','sx1r','sx32','sx1w','sx1x','sx38'] │
└─────────────────────────────────────────────┘
```
