# Append Stream

By default, the streams in Timeplus are Append Streams:
* They are designed to handle a continuous flow of data, where new events are added to the end of the stream.
* The data is saved in columnar storage, optimized for high throughput and low latency read and write.
* Older data can be purged automatically by setting a retention policy, which helps manage storage costs and keeps the stream size manageable.
* Limited capabilities to update or delete existing data, as the primary focus is on appending new data.
