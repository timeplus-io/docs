# JDBC Drivers
Timeplus provides 2 types of JDBC drivers:
* [com.timeplus:timeplus-native-jdbc](https://github.com/timeplus-io/timeplus-native-jdbc) is the JDBC driver over the native TCP port. It can run both streaming queries and batch queries, with high performance. It's recommended to use this driver with Timeplus Enterprise.
* [com.timeplus:proton-jdbc](https://github.com/timeplus-io/proton-java-driver) is the JDBC driver over HTTP, ideal for running batch queries. It supports more formats, but it's not as performant as the native jdbc driver.

## JDBC over TCP {#native}

### Use Case {#usecase_native}
This JDBC driver is designed for running streaming queries and the performance is usually higher than the JDBC over HTTP, but with [some limitations](https://github.com/timeplus-io/timeplus-native-jdbc?tab=readme-ov-file#limitations) on data types and compression methods.

This library is available on maven central repository:

### Maven {#maven_native}
```xml
<dependency>
    <groupId>com.timeplus</groupId>
    <artifactId>timeplus-native-jdbc</artifactId>
    <version>2.0.1</version>
</dependency>
```

### Gradle {#gradle_native}
```groovy
dependencies {
    implementation 'com.timeplus:timeplus-native-jdbc:2.0.1'
}
```

### Configuration {#config_native}
* Driver class is `com.timeplus.jdbc.TimeplusDriver`
* JDBC URL is `jdbc:timeplus://localhost:8463`
* For Timeplus Proton, the username is `default` and password is an empty string. For Timeplus Enterprise, the username and password can be customized.

Please note, by default Timeplus' query behavior is streaming SQL, looking for new data in the future and never ends. The `ResultSet.next()` can always return `true`.

### Example {#example_native}

```java
package test_jdbc_driver;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class App {

    public static void main(String[] args) throws Exception {
        String url = "jdbc:timeplus://localhost:8463";
        try (Connection connection = DriverManager.getConnection(url)) {
            try (Statement stmt = connection.createStatement()) {
                stmt.executeQuery(
                    "create random stream if not exists simple_random(i int, s string) settings eps=3"
                );
                try (
                    ResultSet rs = stmt.executeQuery(
                        "SELECT * FROM simple_random"
                    )
                ) {
                    while (rs.next()) {
                        System.out.println(
                            rs.getInt(1) + "\t" + rs.getString(2)
                        );
                    }
                }
            }
        }
    }
}
```

### DBeaver {#dbeaver_native}

You can also connect to Timeplus from GUI tools that supports JDBC, such as DBeaver.

First add the Timeplus Native JDBC driver to DBeaver. Taking DBeaver 23.2.3 as an example, choose "Driver Manager" from "Database" menu. Click the "New" button, and use the following settings:
* Driver Name: Timeplus
* Driver Type: Generic
* Class Name: com.timeplus.jdbc.TimeplusDriver
* URL Template: jdbc:timeplus://localhost:8463

![New Driver](/img/jdbc_native_new_driver.png)

In the "Libraries" tab, click "Add Artifact" and type `com.timeplus:timeplus-native-jdbc:2.0.1`. Click the "Find Class" button to load the class.
![Load Driver](/img/jdbc_native_load_driver.png)

Create a new database connection, choose "Timeplus" and accept the default settings. Click the "Test Connection.." to verify the connection is okay.

![Create Connection](/img/jdbc_native_new_conn.png)

Open a SQL script for this connection, type the sample SQL `select 1` Ctrl+Enter to run the query and get the result.

But it's more common to use this native JDBC driver in your Java program to process the results from streaming SQL.


## JDBC over HTTP {#http}

### Use Case {#usecase}
This JDBC driver is designed for running batch queries and you can integrate it with DBeaver and other tools.

This library is available on maven central repository:

### Maven {#maven}
```xml
<dependency>
    <groupId>com.timeplus</groupId>
    <artifactId>proton-jdbc</artifactId>
    <version>0.6.0</version>
</dependency>
```

### Gradle {#gradle}
```groovy
dependencies {
    implementation 'com.timeplus:proton-jdbc:0.6.0'
}
```

### Configuration {#config}
* Driver class is `com.timeplus.proton.jdbc.ProtonDriver`
* JDBC URL is `jdbc:proton://localhost:8123` or `jdbc:proton://localhost:8123/default`
* For Timeplus Proton, the username is `default` and password is an empty string. For Timeplus Enterprise, the username and password can be customized.

Please note, by default Timeplus' query behavior is streaming SQL, looking for new data in the future and never ends. This can be considered as hang for JDBC client. You have 2 options:
* Use the 8123 port. In this mode, all SQL are ran in batch mode. So `select .. from car_live_data` will read all existing data.
* Use 3218 port. In this mode, by default all SQL are ran in streaming mode. Please use `select .. from .. LIMIT 100` to stop the query at 100 events. Or use the [table function](functions_for_streaming#table) to query historical data, such as `select .. from table(car_live_data)..`

### Example {#example}

```java
package test_jdbc_driver;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;


public class App {
    static int query(String url, String user, String password, String table) throws SQLException {
        String sql = "select * from " + table+" limit 10";
        System.out.println(sql);
        try (Connection conn = DriverManager.getConnection(url, user, password);
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {
                //ResultSet rs = stmt.executeQuery("select 1")) {
            int count = 0;
            while (rs.next()) {
                count++;
                System.out.println(rs.getString(1));
                System.out.println(rs.getString(2));
            }
            return count;
        }
    }
    public static void main(String[] args) {
        String url = "jdbc:proton://localhost:8123";
        String user = System.getProperty("user", "default");
        String password = System.getProperty("password", "");
        String table = "car_live_data";

        try {
            query(url, user, password, table);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

### DBeaver {#dbeaver}

You can also connect to Timeplus from GUI tools that supports JDBC, such as DBeaver.

First add the Proton JDBC driver to DBeaver. Taking DBeaver 23.2.3 as an example, choose "Driver Manager" from "Database" menu. Click the "New" button, and use the following settings:
* Driver Name: Timeplus Proton
* Driver Type: Generic
* Class Name: com.timeplus.proton.jdbc.ProtonDriver
* URL Template: jdbc:proton://\{host}:\{port}/\{database}
* Default Port: 8123
* Default Database: default
* Default User: default
* Allow Empty Password

In the "Libraries" tab, click "Add Artifact" and type `com.timeplus:proton-jdbc:0.6.0`. Click the "Find Class" button to load the class.

Create a new database connection, choose "Timeplus Proton" and accept the default settings. Click the "Test Connection.." to verify the connection is okay.

Open a SQL script for this connection, type the sample SQL `select 1` Ctrl+Enter to run the query and get the result.
