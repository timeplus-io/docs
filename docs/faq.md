# Frequently Asked Questions

## Can I run Timeplus in our own cloud VPC or on-prem? {#deployment}

In the first few releases of Timeplus, our focus is the AWS-based fully-managed cloud service. Supporting other cloud vendors, or hybrid cloud is certainly doable. Please contact us with your requirements.

## How much data I can load into Timeplus? {#datasize}

For Free Trial accounts, the total storage for each workspace is 20GB by default. Please contact us if you need to load or keep more data. You can choose the storage size when you upgrade to a paid plan.

## Can I invite other members to my workspace? {#invite}

Yes, the workspace owner can invite team members to access the workspace. Go to the "Settings" and "Members" tab. An email will be sent to the members and once they login, they will have the access to all objects in the workspace. More team collaboration features and fine-grained access control are in the product roadmap.

## What's relationship for Timeplus and Proton? {#compare}

Proton is the core engine of Timeplus and open-sourced on September 2023. Please check the [Proton FAQ](proton-faq) for details.

## What's the SLA and can I run production load? {#sla}

Timeplus Cloud went GA on August 2023, ready for production workload. There is no SLA for free trial. For Professional tier, it's 99.5%. For Enterprise tier, it's 99.9% or above. Please check https://timeplus.com/pricing for more details and FAQ.

## What is the IP address for Timeplus Cloud so that I can allow Timeplus to access my Kafka/Redpanda/Pulsar servers {#ip}

If you maintain an IP whitelist, you'll need to whitelist our static IP:

`44.232.236.191` for us.timeplus.cloud
