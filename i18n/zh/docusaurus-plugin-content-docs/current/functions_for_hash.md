# 哈希

哈希函数可用于元素的确定性伪随机洗牌。

### md5

`md5(string)` 从字符串计算 MD5 并返回结果字节集为 `fixed_string(16)`。  如果您想获得与 md5sum 实用程序输出相同的结果，请使用 `lower(hex(md5(s)))`。

### md4

`md4(string)` 从字符串中计算MD4并将结果字节集返回为 `fixed_string(16)`。 

