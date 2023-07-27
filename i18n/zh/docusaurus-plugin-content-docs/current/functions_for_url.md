

# Process URL

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