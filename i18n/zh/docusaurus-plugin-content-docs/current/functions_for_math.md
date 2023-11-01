# Math

### abs

`abs(value)` 返回数字的绝对值。 如果 a 为负数，则返回-a。



### round

`round(x [,N])` Rounds a value to a specified number of decimal places.

* 如果遗漏了 `N` ，我们认为 N 为 0，该函数将值舍入到近整数，例如： `round(3.14)` 是 3
* 如果 `N`>0，则函数将值舍入到小数点右边，例如： `round(3.14-1)` 转为 3.1
* 如果为 `N` \<0，则该函数将值四舍五入到小数点的左边。 例如： `round(314.15-2)` 转为 300

### e

`e()` returns a `float` number that is close to the number `e`



### pi

`pi()` returns a `float` number that is close to the number `π`



### exp

`exp(x)` returns a `float` number that is close to the exponent of the argument `x`.

### exp2

`exp2(x)` returns a `float` number that is close to 2 to the power of `x`.

### exp10

`exp10(x)` returns a `float` number that is close to 10 to the power of `x`.



### log

`log(x)`  returns a `float` number that is close to the natural logarithm of the argument `x`.

### log2

`log2(x)` returns a `float` number that is close to the binary logarithm of the argument `x`.

### log10

`log10(x)` returns a `float` number that is close to the decimal logarithm of the argument `x`.



### sqrt

`sqrt(x) `returns a `float` number that is close to the square root of the argument `x`.



### cbrt

`cbrt(x)` returns a `float` number that is close to the cubic root of the argument `x`.


### lgamma

`lgamma(x)` the logarithm of the gamma function.



### tgamma

`tgamma(x)`the gamma function


### sin

`sin(x)` the sine


### cos

`cos(x)` the cosine



### tan

`tan(x)` the tangent



### asin

`asin(x)` the arc sine



### acos

`acos(x)` the arc cosine

### atan

`atan(x)` the arc tangent



### pow

`pow(x,y)` returns a `float` number that is close to  `x` to the power of `y`



### power

`power(x,y)`  returns a `float` number that is close to  `x` to the power of `y`



### sign

`sign(x)` 返回数字 `x` 的符号。 如果 x\<0，则返回 -1。 如果 x\>0，则返回 1。 否则，返回0。



### degrees

`degrees(x)` converts the input value in radians to degrees. E.g. `degress(3.14)` returns 180.

### radians

`radians(x)` converts the input value in degrees to radians . E.g. `radians(180)` returns 3.14.

### is_finite

`is_finite(x)` return 1 when the value `x` is not infinite and not a NaN, otherwise return 0.

### is_infinite

`is_infinite(x)` to return 1 when the value `x` is infinite, otherwise return 0.

### is_nan

`is_nan(x)` to return 1 if the `x` is Not-a-Number(NaN), otherwise return 0.