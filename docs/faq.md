# Timeplus Enterprise FAQ

## Fully-managed Timeplus Enterprise {#cloud}

### How much data I can load into Timeplus Cloud? {#datasize}

For Free Trial accounts, the total storage for each workspace is 20GB by default. Please contact us if you need to load or keep more data. You can choose the storage size when you upgrade to a paid plan.

### Can I invite other members to my workspace? {#invite}

Yes, the workspace owner can invite team members to access the workspace. Go to the "Settings" and "Members" tab. An email will be sent to the members and once they login, they will have the access to all objects in the workspace. More team collaboration features and fine-grained access control are in the product roadmap.

### What's the SLA and can I run production load? {#cloud_sla}

Timeplus Cloud went GA on August 2023, ready for production workload. There is no SLA for free trial. For the paid tier, it's 99.5% or above. Please check https://timeplus.com/pricing for more details and FAQ. To monitor Timeplus Cloud health status, please visit or subscribe to https://timeplus.statuspage.io.

### What is the IP address for Timeplus Cloud so that I can allow Timeplus to access my Kafka/Redpanda/Pulsar servers {#ip}

If you maintain an IP whitelist, you'll need to whitelist our static IP:

`44.232.236.191` for us-west-2.timeplus.cloud

## Self-hosted Timeplus Enterprise {#self_host}

### Can I run Timeplus Enterprise in our own cloud VPC or on-prem? {#deployment}

Certainly! [Timeplus Enterprise](/timeplus-enterprise) can be installed in your local data center or cloud VPC, with similar features as Timeplus Cloud. You can download the 30-day free trial at timeplus.com or [contact us](mailto:info@timeplus.com) to get more details or schedule a demo.

## General

### What's relationship for Timeplus Enterprise and Timeplus Proton? {#compare}

Timeplus Proton is the core engine of Timeplus Enterprise and open-sourced on September 2023. Timeplus Enterprise provides external features and support. Please check the [Proton FAQ](/proton-faq#compare) for details.
