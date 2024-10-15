# Hash

Hash functions can be used for the deterministic pseudo-random shuffling of elements.

### md5

`md5(string)` Calculates the MD5 from a string and returns the resulting set of bytes as `fixed_string(16)`.  If you want to get the same result as output by the md5sum utility, use `lower(hex(md5(s)))`.

### md4

`md4(string)` Calculates the MD4 from a string and returns the resulting set of bytes as `fixed_string(16)`.

### weak_hash32

`weak_hash32(data)` Calculates a `uint32` from any data type.
