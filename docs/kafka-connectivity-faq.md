# Kafka External Stream Troubleshooting Guide

## FAQ: Common Kafka External Stream Issues

### Q: Why can I list topics but get "Failed to query watermark offsets" when creating external streams?

**A:** This is typically a network connectivity issue that occurs during external stream creation. While you can list topics (metadata requests), the stream creation process fails when trying to query watermark offsets from partition leaders.

**Key difference:**
- **Metadata requests** (listing topics): Can be answered by any broker in the cluster
- **Watermark offset queries** (during stream creation): Must connect to the broker that is currently acting as the leader for each partition

**Example error:**
```
Failed to create stream 'default.MV_SITE_TELEMETRY_KEYLESS', 
error= Code: 1002. DB::Exception: Failed to query watermark offsets 
topic=dcentriq.site.telemetry partition=0 error=Local: Timed out in queue.
```

**Common scenarios:**
- Private Link configuration issues
- VPN peering problems  
- Incorrect port configurations
- Firewall restrictions blocking access to partition leader brokers
- DNS resolution issues for advertised listener addresses

---

### Q: How do I debug Kafka external stream connectivity issues?

**A:** Follow this step-by-step debugging process:

#### Step 1: Verify Basic Connectivity
1. **Test topic listing** (metadata request):
   - If this works, you can connect to at least one broker in the cluster
   - Any Kafka broker can answer metadata requests about cluster state
   - If this fails, check basic network connectivity and authentication

   **Using kcat:**
   ```bash
   # List topics
   kcat -L -b <your-kafka-broker>
   ```
   
   **Using rpk for RedPanda clusters:**
   ```bash
   # List topics
   rpk topic list --brokers <broker-address>
   ```

#### Step 2: Test Consumer Connectivity
2. **Use kcat for debugging**:
   ```bash
   # Test consuming from the topic
   kcat -C -b <your-kafka-broker> -t <topic-name> -p 0 -o beginning -e
   ```
   
3. **Use rpk for RedPanda clusters**:
   ```bash
   # Test topic consumption
   rpk topic consume <topic-name> --brokers <broker-address>
   ```

#### Step 3: Check Multi-Broker Connectivity
4. **Verify access to partition leaders**:
   - Kafka clients need to maintain connections to multiple brokers
   - Data is partitioned, so clients must talk to the broker hosting their data
   - Check that you can reach all brokers that host partitions for your topics

#### Step 4: Common Network Issues to Check
- **Private Link vs VPN Peering**: Ensure consistent network routing
- **Port access**: Verify all required Kafka ports are accessible
- **Security groups/firewalls**: Check both source and destination rules
- **DNS resolution**: Ensure broker hostnames resolve correctly

---

## Keywords
`kafka external stream`, `network connectivity`, `watermark offsets`, `troubleshooting`