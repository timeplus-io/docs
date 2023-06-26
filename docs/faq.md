# Frequently Asked Questions

## Can I run Timeplus in our own cloud VPC or on-prem? {#deployment}

In the first few releases of Timeplus, our focus is the AWS-based fully-managed cloud service. Supporting other cloud vendors, or hybrid cloud is certainly doable. Please contact us with your requirements.

## How much data I can load into Timeplus? {#datasize}

For Free Trial accounts, the total storage for each workspace is 20GB by default. Please contact us if you need to load or keep more data. You can choose the storage size when you upgrade to a paid plan.

## Can I invite other members to my workspace? {#invite}

Yes, the workspace owner can invite team members to access the workspace. Go to the "Settings" and "Members" tab. An email will be sent to the members and once they login, they will have the access to all objects in the workspace. More team collaboration features and fine-grained access control are in the product roadmap.

## What's the SLA and can I run production load? {#sla}

We don't recommend the beta users to run production workload during the beta. Stay tuned for our official product releases.

## What is the IP address for Timeplus Cloud so that I can allow Timeplus to access my Kafka/Redpanda/Pulsar servers {#ip}

If you maintain an IP whitelist, you'll need to whitelist our static IP:

`44.232.236.191` for us.timeplus.cloud
