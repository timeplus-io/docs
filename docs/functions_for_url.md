

# Process URL and IP

### protocol

`protocol(url)` Extracts the protocol from a URL.

For example `protocol('https://docs.timeplus.com/functions')`will return the string `https`

### domain

`domain(url)` Extracts the domain from a URL.

For example `domain('https://docs.timeplus.com/functions')`will return the string `docs.timeplus.com`

### port

`port(url)` Extracts the port from a URL. If port is missing in the URL, it returns 0.

For example `port('https://docs.timeplus.com/functions')` will return the integer 0

### path

`path(url)` Extracts the path from a URL, without the query string or fragment.

For example `path('https://docs.timeplus.com/functions')` will return the string `/functions`

### path_all

`path_all(url)` Extracts the path from a URL, including the query string or fragment.

For example `path_full('https://docs.timeplus.com/functions_for_logic#if')` will return the string `/functions_for_logic#if`

### fragment

`fragment(url)` Extracts the fragment from a URL. If there is no fragment, return an empty string.

For example `fragment('https://docs.timeplus.com/functions_for_logic#if')` will return the string `if`

### query_string

`query_string(url)` Extracts the query string from a URL. If there is no query string, return an empty string.

For example `query_string('https://a.com?k=v&key=value')` will return the string `k=v&key=value`

### decode_url_component

`decode_url_component(url)` Returns the decoded URL.

### encode_url_component

`encode_url_component(url)` Returns the encoded URL.



### ipv4_num_to_string

`ipv4_num_to_string(ip)` takes a `ipv4` or `uint32` value and returns a string containing the corresponding IPv4 address in the format A.B.C.d (dot-separated numbers in decimal form).

For example. `select ipv4_num_to_string(1823216871)` returns ` '108.172.20.231'`

### ipv4_string_to_num

`ipv4_string_to_num(string)` takes a `string` value and returns a `uint32` value. If the IPv4 address has an invalid format, it throws exception.

For example. `select ipv4_string_to_num('108.172.20.231')` returns ` 1823216871`

### to_ipv4

Alias of `ipv4_string_to_num`

### ipv4_num_to_string_class_c

`ipv4_num_to_string_class_c(ip)`. Similar to ipv4_num_to_string(ip), but using xxx instead of the last octet.

For example. `select ipv4_num_to_string_class_c(1823216871)` returns ` '108.172.20.xxx'`

:::warning

Since using ‘xxx’ is highly unusual, this may be changed in the future. We recommend that you do not rely on the exact format of this fragment.

:::

### ipv6_num_to_string

`ipv6_num_to_string(ip)` takes a `fixed_string(16) ` containing the IPv6 address in binary format. Returns a string containing this address in text format. IPv6-mapped IPv4 addresses are output in the format ::ffff:111.222.33.44.

For example. `select ipv6_num_to_string(to_fixed_string(unhex('2A0206B8000000000000000000000011'),16))` returns ` '2a02:6b8::11'`

### ipv6_string_to_num

`ipv6_string_to_num(string)` takes a `string` value and returns a `uint128` value. If the IPv6 address has an invalid format, it throws exception.

If the input string contains a valid IPv4 address, returns its IPv6 equivalent. HEX can be uppercase or lowercase.

For example. `select hex(ipv6_string_to_num('2a02:2168:aaa:bbbb::2'))` returns ` 2A0221680AAABBBB0000000000000002`

`select hex(ipv6_string_to_num('108.172.20.231'))` returns ` 00000000000000000000FFFF6CAC14E7`

### to_ipv6

Alias of `ipv6_string_to_num`

### ipv4_to_ipv6

`ipv4_to_ipv6(ip)` Convert the `ipv4` value to `ipv6`

For example: `select ipv6_num_to_string(ipv4_to_ipv6(ipv4_string_to_num('192.168.0.1')))` returns `'::ffff:192.168.0.1'`



### ipv4_cidr_to_range

`ipv4_cidr_to_range(ipv4,number)`Accepts an IPv4 and an uint8 value containing the [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Return a tuple with two IPv4 containing the lower range and the higher range of the subnet.

For example: `select ipv4_cidr_to_range(to_ipv4('192.168.0.1'),16)` returns ` ('192.168.0.0','192.168.255.255')`

### ipv6_cidr_to_range

`ipv6_cidr_to_range(ipv4,number)`Accepts an IPv6 and an uint128 value containing the [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Return a tuple with two IPv6 containing the lower range and the higher range of the subnet.

For example: `select ipv6_cidr_to_range(to_ipv6('2001:0db8:0000:85a3:0000:0000:ac1f:8001'),32)` returns `('2001:db8::','2001:db8:ffff:ffff:ffff:ffff:ffff:ffff')` 

### is_ipv4_string

`is_ipv4_string(string)` returns 1 if it's a ipv4 string, otherwise 0.

### is_ipv6_string

`is_ipv6_string(string)` returns 1 if it's a ipv6 string, otherwise 0.

### is_ip_address_in_range

`is_ip_address_in_range(address, prefix)` Determines if an IP address is contained in a network represented in the [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) notation. Returns true or false.

For example, `select is_ip_address_in_range('127.0.0.1', '127.0.0.0/8')` returns `true`. `select is_ip_address_in_range('127.0.0.1', 'ffff::/16')` returns `false`