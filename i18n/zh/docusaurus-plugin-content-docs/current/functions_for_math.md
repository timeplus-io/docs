# Math

### abs

`abs(value)` returns the absolute value of the number. If the a is negative, then return -a.



### round

`round(x [,N])` Rounds a value to a specified number of decimal places.

* If `N` is omitted, we consider N as 0 and the function rounds the value to the near integer, e.g. `round(3.14)`as 3
* If `N` >0, the function rounds the value to the right of the decimal point, e.g. `round(3.14,1)` as 3.1
* If `N` \<0, the function rounds the value to the left of the decimal point. e.g. `round(314.15,-2)` as 300 

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

`sign(x)` returns the sign of the number `x`. If x\<0, return -1. If x\>0, return 1. Otherwise, return 0.



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