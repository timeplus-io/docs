# Hash

Hash functions can be used for the deterministic pseudo-random shuffling of elements.

### md5

`md5(string)` Calculates the MD5 from a string and returns the resulting set of bytes as `fixed_string(16)`.  If you want to get the same result as output by the md5sum utility, use `lower(hex(md5(s)))`.

### md4

`md4(string)` Calculates the MD4 from a string and returns the resulting set of bytes as `fixed_string(16)`.

### half_md5
`half_md5(par1,..) ` Interprets all the input arguments strings and calculates the MD5 hash value for each of them. Then combines the MD5 hash values, takes the first 8 bytes of the result, and interprets them as `uint64` in big-endian order.

### weak_hash32

`weak_hash32(data)` Calculates a `uint32` from any data type.

### kostik_consistent_hash
`kostikConsistentHash(input, n)` An O(1) time and space consistent hash algorithm by Konstantin 'kostik' Oblakov.

### xx_hash32
`xx_hash32(str)` Calculates xxHash from a string.

### xx_hash64
`xx_hash64(str)` Calculates xxHash from a string.

### xxh3
`xxh3(expr)` Produces a 64-bit [xxh3](https://github.com/Cyan4973/xxHash) hash value.
