# Single Sign On

## Introduction

This document describes how to configure Single Sign-On (SSO) for **Timeplus Enterprise**, enabling your organization to integrate its Identity Provider (IdP) for centralized authentication.

## Capacity and Limitations

| Feature                               | Supported |
| ------------------------------------- | --------- |
| Single Sign-On (SSO)                  | ✅         |
|   • via OpenID Connect (OIDC)         | ✅         |
|   • via SAML                          | ❌         |
| Service Provider (SP)-initiated SSO   | ✅         |
| Identity Provider (IdP)-initiated SSO | ✅         |
| Single Logout (SLO)                   | ✅         |
| Just-In-Time (JIT) provisioning       | ❌         |

## Prerequisites

Before you begin, ensure that:
- You have **administrator access** to your IdP so you can create a new application integration.
- You have **permission to modify and redeploy** your Timeplus Enterprise environment.
- (Recommended) You already have a running deployment of Timeplus Enterprise before configuring SSO.

## Configuration Steps

This guide uses [Okta Identity Engine](https://help.okta.com/oie/en-us/content/topics/identity-engine/oie-index.htm) as an example IdP.
If you use other IdPs such as Keycloak or Auth0, the steps will be similar.

### Step 1. Create an OIDC application in your IdP

In the Okta Admin Console, navigate to:
**Applications → Applications → Create App Integration**

1. Choose **Sign-in method**: OIDC – OpenID Connect
2. Choose **Application type**: Web Application
3. Click **Next**

Then fill in the following fields:

| Field                               | Value                                                              |
| ----------------------------------- | ------------------------------------------------------------------ |
| **App integration name**            | `Timeplus Enterprise`                                              |
| **Sign-in redirect URIs**           | `https://{{timeplus_host}}/oidc-callback`                          |
| **Sign-out redirect URIs**          | `https://{{timeplus_host}}/logout`                                 |
| **Assignments – Controlled access** | Select the option that best fits your organization’s access policy |

Leave all other fields as default.

### [Optional] Step 2. Enable IdP-initiated login

To allow users to launch Timeplus directly from their Okta dashboard:

1. Click **Edit** under **General Settings**.
2. Update the following fields:

| Field                  | Value                                  |
| ---------------------- | -------------------------------------- |
| **Login initiated by** | `Either Okta or App`                   |
| **Initiate login URI** | `https://{{timeplus_host}}/oidc-login` |

### Step 3. Configure Timeplus Appserver

Add the following configuration to your existing values.yaml file used in your Timeplus Enterprise Helm deployment.

You can find the corresponding values (client ID, secret, and host) on the application details page in Okta.

```yaml
timeplusAppserver:
  configs:
    enable-oidc: true
    oidc-host: 'https://{{subdomain}}.okta.com'
    oidc-client-id: '{{client_id}}'
    oidc-client-secret: '{{client_secret}}'
```

### Step 4. Test the integration

1. Redeploy the Timeplus Enterprise so the new configuration takes effect.
2. Once the service is running, open the **Timeplus Web Console**.
3. You should be redirected automatically to the Okta login page.
4. Log in using your Okta credentials.
5. Upon successful authentication, you’ll be redirected back to Timeplus login page.

✅ **Congratulations!**

Your Timeplus Enterprise instance is now integrated with your IdP via Single Sign-On. You can now login Timeplus Enterprise with the credentials.
