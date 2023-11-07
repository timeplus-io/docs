

# Process URL and IP

### 协议

`protocol(url)` 从 URL 中提取协议。

例如 `protocol('https://docs.timeplus.com/functions')` 将返回字符串 `https`

### 域名

`domain(url)` 从 URL 中提取域。

例如 `domain('https://docs.timeplus.com/functions')` 将返回字符串 `docs.timeplus.com`

### 端口

`port(url)` 从 URL 中提取端口。 如果 URL 中缺少端口，则返回 0。

例如 `port('https://docs.timeplus.com/functions')` 将返回整数 0

### 路径

`path (url)` 从 URL 中提取路径，不含查询字符串或片段。

例如 `path('https://docs.timeplus.com/functions')` 将返回字符串 `/functions`

### 所有路径

`path_all (url)` 从 URL 中提取路径，包括查询字符串或片段。

例如 `path_full('https://docs.timeplus.com/functions_for_logic#if')` 将返回字符串 `/functions_for_logic#if`

### 片段

`fragment(url)` 从 URL 中提取片段。 如果没有片段，则返回一个空字符串。

例如 `fragment('https://docs.timeplus.com/functions_for_logic#if')` 将返回字符串 `if`

### 查询字符串

`query_string (url)` 从 URL 中提取查询字符串。 如果没有查询字符串，则返回一个空字符串。

例如 `query_string('https://a.com?k=v&key=value')` 将返回字符串 `k=v&key=value`

### decode_url_component

`decode_url_component(url)` 返回解码的 URL。

### encode_url_component

`encode_url_component(url)` 返回编码的 URL。



### ipv4_num_to_string

`ipv4_num_to_string(ip)` takes a `ipv4` or `uint32` value and returns a string containing the corresponding IPv4 address in the format A.B.C.d (dot-separated numbers in decimal form).

For example. `select ipv4_num_to_string(1823216871)` returns `'108.172.20.231'`

### ipv4_string_to_num

`ipv4_string_to_num(string)` takes a `string` value and returns a `uint32` value. If the IPv4 address has an invalid format, it throws exception.

For example. `select ipv4_string_to_num('108.172.20.231')` returns `1823216871`

### to_ipv4

Alias of `ipv4_string_to_num`

### ipv4_num_to_string_class_c

`ipv4_num_to_string_class_c(ip)`. Similar to ipv4_num_to_string(ip), but using xxx instead of the last octet.

For example. `select ipv4_num_to_string_class_c(1823216871)` returns `'108.172.20.xxx'`

:::warning

Since using ‘xxx’ is highly unusual, this may be changed in the future. We recommend that you do not rely on the exact format of this fragment.

:::

### ipv6_num_to_string

`ipv6_num_to_string(ip)` takes a `fixed_string(16)` containing the IPv6 address in binary format. Returns a string containing this address in text format. IPv6-mapped IPv4 addresses are output in the format ::ffff:111.222.33.44.

For example. `select ipv6_num_to_string(to_fixed_string(unhex('2A0206B8000000000000000000000011'),16))` returns `'2a02:6b8::11'`

### ipv6_string_to_num

`ipv6_string_to_num(string)` takes a `string` value and returns a `uint128` value. If the IPv6 address has an invalid format, it throws exception.

If the input string contains a valid IPv4 address, returns its IPv6 equivalent. HEX can be uppercase or lowercase.

For example. `select hex(ipv6_string_to_num('2a02:2168:aaa:bbbb::2'))` returns `2A0221680AAABBBB0000000000000002`

`select hex(ipv6_string_to_num('108.172.20.231'))` returns `00000000000000000000FFFF6CAC14E7`

### to_ipv6

Alias of `ipv6_string_to_num`

### ipv4_to_ipv6

`ipv4_to_ipv6(ip)` Convert the `ipv4` value to `ipv6`

For example: `select ipv6_num_to_string(ipv4_to_ipv6(ipv4_string_to_num('192.168.0.1')))` returns `'::ffff:192.168.0.1'`



### ipv4_cidr_to_range

`ipv4_cidr_to_range(ipv4,number)`Accepts an IPv4 and an uint8 value containing the [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Return a tuple with two IPv4 containing the lower range and the higher range of the subnet.

For example: `select ipv4_cidr_to_range(to_ipv4('192.168.0.1'),16)` returns `('192.168.0.0','192.168.255.255')`

### ipv6_cidr_to_range

`ipv6_cidr_to_range(ipv6,number)`Accepts an IPv6 and an uint128 value containing the [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Return a tuple with two IPv6 containing the lower range and the higher range of the subnet.

For example: `select ipv6_cidr_to_range(to_ipv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'),32)` returns `('2001:db8::','2001:db8:ffff:ffff:ffff:ffff:ffff:ffff')`

### is_ipv4_string

`is_ipv4_string(string)` returns 1 if it's a ipv4 string, otherwise 0.

### is_ipv6_string

`is_ipv6_string(string)` returns 1 if it's a ipv6 string, otherwise 0.

### is_ip_address_in_range

`is_ip_address_in_range(address, prefix)` Determines if an IP address is contained in a network represented in the [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) notation. Returns true or false.

For example, `select is_ip_address_in_range('127.0.0.1', '127.0.0.0/8')` returns `true`. `select is_ip_address_in_range('127.0.0.1', 'ffff::/16')` returns `false`

### geohash_encode

`geohash_encode(longitude, latitude, [precision])`  Encodes latitude and longitude as a geohash string.

**Input values**

- longitude - longitude part of the coordinate you want to encode. Floating in range`[-180°, 180°]`
- latitude - latitude part of the coordinate you want to encode. Floating in range `[-90°, 90°]`
- precision - Optional, length of the resulting encoded string, defaults to `12`. Integer in range `[1, 12]`. Any value less than `1` or greater than `12` is silently converted to `12`.

**Returned values**

- alphanumeric `String` of encoded coordinate (modified version of the base32-encoding alphabet is used).

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

Decodes any geohash-encoded string into longitude and latitude.

**Input values**

- encoded string - geohash-encoded string.

**Returned values**

- (longitude, latitude) - 2-tuple of `float64` values of longitude and latitude.

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

Returns an array of geohash-encoded strings of given precision that fall inside and intersect boundaries of given box, basically a 2D grid flattened into array.

**Syntax**

```sql
geohashes_in_box(longitude_min, latitude_min, longitude_max, latitude_max, precision)
```



**参数**

- `longitude_min` — Minimum longitude. Range: `[-180°, 180°]`. Type: float.
- `latitude_min` — Minimum latitude. Range: `[-90°, 90°]`. Type: float.
- `longitude_max` — Maximum longitude. Range: `[-180°, 180°]`. Type: float.
- `latitude_max` — Maximum latitude. Range: `[-90°, 90°]`. Type: float.
- `precision` — Geohash precision. Range: `[1, 12]`. Type: uint8.



:::info note

All coordinate parameters must be of the same type: either `float32` or `float64`.

:::info

**Returned values**

- Array of precision-long strings of geohash-boxes covering provided area, you should not rely on order of items.
- `[]` - Empty array if minimum latitude and longitude values aren’t less than corresponding maximum values.

Type: [Array](https://clickhouse.com/docs/en/sql-reference/data-types/array)([String](https://clickhouse.com/docs/en/sql-reference/data-types/string)).



:::info note

Function throws an exception if resulting array is over 10’000’000 items long.

:::

**示例**

Query:

```sql
SELECT geohashes_in_box(24.48, 40.56, 24.785, 40.81, 4) AS thasos;
```

**Result**:

```text
┌─thasos──────────────────────────────────────┐
│ ['sx1q','sx1r','sx32','sx1w','sx1x','sx38'] │
└─────────────────────────────────────────────┘
```