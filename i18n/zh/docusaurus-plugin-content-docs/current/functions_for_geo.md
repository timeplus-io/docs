# 地理位置

### point_in_polygon

检查点是否属于多边形。 `point_in_polygon((x,y),[(a,b),(c,d)...)` 例如：`SELECT point_in_polygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res` 返回 `1` 因为点(3,3)在定义的多边形中。



### geo_distance

计算 WGS-84 椭圆上的距离。 `geo_distance(lon1,lat1,lon2,lat2)`