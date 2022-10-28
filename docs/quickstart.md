# Quickstart

Timeplus is a high-performance converged platform that unifies streaming and historical data processing, to empower developers to build the most powerful and reliable streaming analytics applications, at speed and scale, anywhere. 

Timeplus Cloud provides the following major features:

* [Streaming SQL](query-syntax)
* [Streaming Data Collection](ingestion)
* [Streaming Visualization](viz)
* [Streaming Alerts and Destinations](destination)

The following section contains step-by-step instructions on how to easily get started with Timeplus Cloud.

## Step 1: Sign up for a Timeplus account {#step1}

Let's start by creating an account for [Timeplus Cloud](https://beta.timeplus.cloud). Currently Google or Microsoft Single Sign-On (SSO) are supported. Please choose a work email or Google/Microsoft work subscription to apply the beta access. It usually takes less than 2 minutes to get the account setup and have the first [workspace](glossary#workspace) created.

![Signup](/img/signup_screen.png)

## Step 2: Create your first workspace {#step2}

A workspace is the isolated storage and computing unit for you to run streaming data collection and analysis. During the beta program, every user can create up to 1 free workspace and join many workspaces. Usually a group of users in the same organization join the same workspace, to build one or more streaming analytics solutions.

To create a workspace:

1. Sign in [Timeplus Cloud](https://beta.timeplus.cloud)
2. Click **Create a Workspace** on the landing page
3. The workspace ID is automatically created. Create a readable name, such as the legal name for the organization or team name.

![Choose a workspace name](/img/workspace_name.png)



## Step 3: Load Sample data

If your streaming data resides in Confluent Cloud or publicly accessible Kafka or Pulsar, you can create sources in Timeplus to load them now. Otherwise you can follow one of the guides below to use sample data.

* [Load sample streaming data from Confluent Cloud](quickstart-confluent)
* [Load sample streaming data without Confluent Cloud](quickstart-sample)

## Next steps

* Try more streaming SQL capabilities, such as `tumble` window and `seek_to`
* Create a dashboard
* Send the results to Kafka/Pulsar, or email/slack
* Check the [Glossary](glossary)

