# Column Compression Codecs

Timeplus historical columnar store supports multiple column compression codecs, optimized for different column types. This allows achieving the best balance between compression ratio and decompression speed, depending on the scenario.

By default, Timeplus applies `lz4` compression.

You can also define the compression method for each individual column in the `CREATE STREAM` query.

```sql
CREATE STREAM codec_example
(
    dt date CODEC(ZSTD),
    ts datetime CODEC(LZ4HC),
    float_value float32 CODEC(NONE),
    double_value float64 CODEC(LZ4HC(9)),
    value float32 CODEC(Delta, ZSTD)
)
```

## General Purpose Codecs

Timeplus supports general purpose codecs and specialized codecs.

### NONE {#none}

`NONE` — No compression.

### LZ4 {#lz4}

`LZ4` — Lossless [data compression algorithm](https://github.com/lz4/lz4) used by default. Applies LZ4 fast compression.

### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — LZ4 HC (high compression) algorithm with configurable level. Default level: 9. Setting `level <= 0` applies the default level. Possible levels: \[1, 12\]. Recommended level range: \[4, 9\].

### ZSTD {#zstd}

`ZSTD[(level)]` — [ZSTD compression algorithm](https://en.wikipedia.org/wiki/Zstandard) with configurable `level`. Possible levels: \[1, 22\]. Default level: 1.

High compression levels are useful for asymmetric scenarios, like compress once, decompress repeatedly. Higher levels mean better compression and higher CPU usage.

## Specialized Codecs {#specialized-codecs}

These codecs are designed to make compression more effective by exploiting specific features of the data. Some of these codecs do not compress data themselves, they instead preprocess the data such that a second compression stage using a general-purpose codec can achieve a higher data compression rate.

### Delta {#delta}

`Delta(delta_bytes)` — Compression approach in which raw values are replaced by the difference of two neighboring values, except for the first value that stays unchanged. Up to `delta_bytes` are used for storing delta values, so `delta_bytes` is the maximum size of raw values. Possible `delta_bytes` values: 1, 2, 4, 8. The default value for `delta_bytes` is `sizeof(type)` if equal to 1, 2, 4, or 8. In all other cases, it's 1. Delta is a data preparation codec, i.e. it cannot be used stand-alone.

### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — Calculates delta of deltas and writes it in compact binary form. Possible `bytes_size` values: 1, 2, 4, 8, the default value is `sizeof(type)` if equal to 1, 2, 4, or 8. In all other cases, it's 1. Optimal compression rates are achieved for monotonic sequences with a constant stride, such as time series data. Can be used with any fixed-width type. Implements the algorithm used in Gorilla TSDB, extending it to support 64-bit types. Uses 1 extra bit for 32-bit deltas: 5-bit prefixes instead of 4-bit prefixes. For additional information, see Compressing Time Stamps in [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf). DoubleDelta is a data preparation codec, i.e. it cannot be used stand-alone.

### GCD {#gcd}

`GCD()` - - Calculates the greatest common denominator (GCD) of the values in the column, then divides each value by the GCD. Can be used with integer, decimal and date/time columns. The codec is well suited for columns with values that change (increase or decrease) in multiples of the GCD, e.g. 24, 28, 16, 24, 8, 24 (GCD = 4). GCD is a data preparation codec, i.e. it cannot be used stand-alone.

### Gorilla {#gorilla}

`Gorilla(bytes_size)` — Calculates XOR between current and previous floating point value and writes it in compact binary form. The smaller the difference between consecutive values is, i.e. the slower the values of the series changes, the better the compression rate. Implements the algorithm used in Gorilla TSDB, extending it to support 64-bit types. Possible `bytes_size` values: 1, 2, 4, 8, the default value is `sizeof(type)` if equal to 1, 2, 4, or 8. In all other cases, it's 1. For additional information, see section 4.1 in [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078).

### FPC {#fpc}

`FPC(level, float_size)` - Repeatedly predicts the next floating point value in the sequence using the better of two predictors, then XORs the actual with the predicted value, and leading-zero compresses the result. Similar to Gorilla, this is efficient when storing a series of floating point values that change slowly. For 64-bit values (double), FPC is faster than Gorilla, for 32-bit values your mileage may vary. Possible `level` values: 1-28, the default value is 12.  Possible `float_size` values: 4, 8, the default value is `sizeof(type)` if type is Float. In all other cases, it's 4. For a detailed description of the algorithm see [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf).

### T64 {#t64}

`T64` — Compression approach that crops unused high bits of values in integer data types (including `Enum`, `Date` and `DateTime`). At each step of its algorithm, codec takes a block of 64 values, puts them into 64x64 bit matrix, transposes it, crops the unused bits of values and returns the rest as a sequence. Unused bits are the bits, that do not differ between maximum and minimum values in the whole data part for which the compression is used.

`DoubleDelta` and `Gorilla` codecs are used in Gorilla TSDB as the components of its compressing algorithm. Gorilla approach is effective in scenarios when there is a sequence of slowly changing values with their timestamps. Timestamps are effectively compressed by the `DoubleDelta` codec, and values are effectively compressed by the `Gorilla` codec. For example, to get an effectively stored table, you can create it in the following configuration:

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

## Encryption Codecs {#encryption-codecs}

These codecs don't actually compress data, but instead encrypt data on disk. These are only available when an encryption key is specified by encryption settings. Note that encryption only makes sense at the end of codec pipelines, because encrypted data usually can't be compressed in any meaningful way.

### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — Encrypts data with AES-128 in [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIV mode.

### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — Encrypts data with AES-256 in GCM-SIV mode.

These codecs use a fixed nonce and encryption is therefore deterministic.

**Example**

```sql
CREATE STREAM mystream
(
    x string CODEC(AES_128_GCM_SIV)
)
ORDER BY x;
```

:::note
If compression needs to be applied, it must be explicitly specified. Otherwise, only encryption will be applied to data.
:::

**Example**

```sql
CREATE STREAM mystream
(
    x string Codec(Delta, LZ4, AES_128_GCM_SIV)
)
ORDER BY x;
```
