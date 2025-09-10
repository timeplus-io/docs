# Streaming JOIN

:::info

1. This tutorial is mainly for Timeplus Proton users. For Timeplus Enterprise users, please check the [guide](/quickstart) for connecting Timeplus with Confluent Cloud with web UI. SQL in this guide can be ran both in Timeplus Proton and Timeplus Enterprise.
2. Check [the previous tutorial](/tutorial-sql-kafka) to setup the sample data.

:::

In the `owlshop-customers` topic, there are a list of customers with the following metadata

* id
* firstName
* lastName
* gender
* email

In the `owlshop-addresses` topic, it contains the detailed address for each customer

* customer.id
* street, state, city, zip
* firstName, lastName

You can create a streaming JOIN to validate the data in these 2 topics matches to each other.

```sql
CREATE EXTERNAL STREAM customers(raw string)
SETTINGS type='kafka',
         brokers='redpanda:9092',
         topic='owlshop-customers';

CREATE EXTERNAL STREAM addresses(raw string)
SETTINGS type='kafka',
         brokers='redpanda:9092',
         topic='owlshop-addresses';

WITH parsed_customer AS (SELECT raw:id as id, raw:firstName||' '||raw:lastName as name,
raw:gender as gender FROM customers SETTINGS seek_to='earliest'),
parsed_addr AS (SELECT raw:customer.id as id, raw:street||' '||raw:city as addr,
raw:firstName||' '||raw:lastName as name FROM addresses SETTINGS seek_to='earliest')
SELECT * FROM parsed_customer JOIN parsed_addr USING(id);
```

Note:

* Two CTE are defined to parse the JSON attribute as columns
* `SETTINGS seek_to='earliest'` is the special settings to fetch earliest data from the Kafka topic
* `USING(id)` is same as `ON left.id=right.id`
* Check [JOIN](/streaming-joins) for more options to join dynamic and static data

:::info

By default, proton-client is started in single line and single query mode. To run multiple query statements together, start with the `-n` parameters, i.e. `docker exec -it proton-container-name proton-client -n`

:::
