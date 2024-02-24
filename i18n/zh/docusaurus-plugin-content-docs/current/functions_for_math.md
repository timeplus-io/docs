# 数学

### abs

`abs(value)` 返回数字的绝对值。 如果 a 为负数，则返回-a。



### round

`round(x [,N])` 向一定数量的小数位点投射一个值。

* 如果遗漏了 `N` ，我们认为 N 为 0，该函数将值舍入到近整数，例如： `round(3.14)` 是 3
* 如果 `N`>0，则函数将值舍入到小数点右边，例如： `round(3.14-1)` 转为 3.1
* 如果为 `N` \<0，则该函数将值四舍五入到小数点的左边。 例如： `round(314.15-2)` 转为 300

### e

`e()` 返回一个接近数字 `e` 的 `float` 数字。



### pi

`pi()` 返回一个接近数字 `π` 的 `float` 数字。



### exp

`exp(x)` 返回一个接近参数 `x` 的指数的 `float` 数字。

### exp2

`exp2(x)` 返回一个接近 2 的 `x` 次方的 `float` 数字。

### exp10

`exp10(x)` 返回一个接近10的 `x` 次方的 `float` 数字。



### log

`log(x)`  返回一个接近于 `x` 的自然对数的 `float` 数字。

### log2

`log2(x)` 返回一个接近于参数 `x` 的二进制对数的 `float` 数字。

### log10

`log10(x)` 返回一个接近于参数 `x` 的十进制对数的 `float` 数字。



### sqrt

`sqrt(x)` 返回一个接近参数 `x` 的平方根的 `float` 数字。



### cbrt

`cbrt(x)` 返回一个接近参数 `x` 的立方根的 `float` 数字。


### lgamma

`lgamma(x)` 伽玛函数的对数。



### tgamma

`tgamma(x)` 伽玛函数。


### sin

`sin(x)` 正弦值。


### cos

`cos (x)` 余弦值。



### tan

`tan (x)` 切线。



### asin

`asin(x)` 反正弦。



### acos

`acos(x)` 反余弦。

### atan

`atan(x)` 弧切点。



### pow

`pow(x,y)` 返回一个接近 `x` 的 `y` 次方的 `float` 数字。



### power

`power(x,y)` 返回一个接近 `x` 的 `y` 次方的 `float` 数字。



### sign

`sign(x)` 返回数字 `x` 的符号。 如果 x\>0，则返回 1。 否则，返回0。 如果 x\<0，则返回 -1。



### degrees

`degrees(x)` 将以弧度为单位的输入值转换为度。 例如： 例如： `degress(3.14)` 返回 180。

### radians

`radians(x)` 将以度为单位的输入值转换为弧度。 例如： 例如： `radians(180)` 返回 3.14。

### is_finite

`is_finite(x)` 返回 1 当值 `x` 不是无限的，也不是NaN，否则返回 0。

### is_infinite

`is _infinite(x)` 返回 1 当值 `x` 是无限的，否则返回 0。

### nan

`is_nan(x)` 返回 1 当值 `x` 是 Not-a-Number(NaN)，否则返回 0。