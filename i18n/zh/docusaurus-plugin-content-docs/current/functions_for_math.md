# 数学

### abs

`abs(value)` 返回数字的绝对值。 如果一个<，则返回 -a。



### round

`round(x [,N])` 向一定数量的小数位点投射一个值。

* 如果遗漏了 `N` ，我们认为N 为 0，函数将值轮到附近的整数，e。 。 `round(3.14)`作为 3
* 如果 `N`>0，函数将值转到小数点的右边，例如 `round(3.14-1)` 转为3.1
* 如果 `N` <0，则函数将值放回小数点左边。 例如： `round(314.15-2)` as 300

### e

`e()` 返回一个 `浮点` 数字接近数字 `e`。



### pi

`pi()` 返回一个 `浮点` 靠近数字 `π`。



### exp

`exp(x)` 返回一个 `浮点` 接近实参指数的数 `x`。

### exp2

`exp2(x)` 返回一个 `浮点` 接近2的次幂的数 `x`。

### exp10

`exp10(x)` 返回一个 `浮点` 接近10的次幂的数 `x`。



### log

`log(x)`  返回一个 `浮点` 与实参的自然对数接近的数 `x`。

### log2

`log2(x)` 返回一个 `浮点` 与参数的二进制对数接近的数 `x`。

### log10

`log10(x)` 返回一个 `浮点` 接近实参的十进制对数的数 `x`。



### sqrt

`sqrt(x)`返回一个 `浮点` 接近实参平方根的数 `x`。



### cbrt

`cbrt(x)` 返回一个 `浮点` 接近实参的立方根的数 `x`。


### lgamma

`lgamma(x)` 伽玛函数的对数。



### tgamma

`tgamma(x)`伽玛函数


### sin

`sin(x)` 个正弦值


### cos

`cos(x)` 余osine



### tan

`tan(x)` 切线



### asin

`asin(x)` 弧正体



### acos

`acos(x)` arc cosine

### atan

`atan(x)` 弧切点



### pow

`pow(x,y)` 返回一个 `浮点` 靠近  `x` 靠近 `y` 的数字



### power

`power(x,y)`  返回 `浮点` 靠近  `x` 靠近 `y`



### sign

`sign(x)` 返回数字 `x` 的签名。 如果x<0, 返回 -1。 如果x>0, 返回 1。 否则，返回0。



### degrees

`degrees(x)` 将以弧度为单位的输入值转换为度。 。 `圆形(3.14)`作为 3

### radians

`radians(x)` 将以度为单位的输入值转换为弧度。 。 `圆形(3.14)`作为 3

### is_finite

`is_finite(x)` return 1 when the value `x` is not infinite and not a NaN, otherwise return 0.

### is_infinite

`is _infinite(x)` to return 1 while the value `x` is 无限，否则返回 0。

### nan

`is_nan(x)` 返回如果 `x` 为 not-a-Number(NAN)，否则返回 0。