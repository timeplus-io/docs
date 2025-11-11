# Single Sign On

## Introduction

This document describes how to configure Single Sign-On (SSO) for Timeplus Enterprise, enabling your organization to integrate its Identity Provider (IdP).

## Capacity and Limitations

- ✅ Single Sign-On (SSO)
  - ✅ via OpenID Connect (OIDC)
  - ❌ via SAML
- ✅ Service Provider Initiated SSO
- ✅ Identity Provider Initiated SSO
- ✅ Single Logout (SLO)
- ❌ Just-In-Time provisioning

## Prerequisites

- You will need to be the admin of the IdP in order to add a new SSO integration.
- You will need to have the permission to modify and update Timeplus Enterprise deployment.
- Even through this is not mandatory, we recommended you to have the Timeplus Enterprise deployed and running already before setting up SSO for it.

## Configuration Steps

In this document, we will use [Okta Identity Engine](https://help.okta.com/oie/en-us/content/topics/identity-engine/oie-index.htm) as the example. The high level steps should be very similar if you use other IdP service such as Keycloak or etc.

### Step 1. Create an OIDC application in IdP for Timeplus Enterprise.

Go to Admin Console -> Applications -> Applications, and then click Create App Integration button. In the creation form, select `OIDC - OpenID Connect` as the **Sign-in method** and `Web Application` as the **Application type**.

In the next detailed form, please fill the form with the following information:

- **App integration name:** `Timeplus Enterprise`
- **Sign-in redirect URIs:** `https://{{timeplus_host}}/oidc-callback`
- **Sign-out redirect URIs:** `https://{{timeplus_host}}/logout`
- **Assignments - Controlled access:** Please choose an option that fit your need

The other fields that not listed above, please just leave them as-it-is to use the default value.

### [Optional] Step 2. Edit the integration to support Identity Provider Initiated SSO

Click Edit on General Settings and edit the following sections:

- **Login initiated by:** `Either Okta or App`
- **Initiate login URI:** `https://{{timeplus_host}}/oidc-login`

With the settings above, the user is able to launch Timeplus Enterprise directly on their Okta dashboard.

### Step 3. Configure Timeplus Appserver

Add the following configuration to the existing `values.yaml` of your Timeplus Enterprise deployment. You should be able to find these information on the detail page of newly created Timeplus Enterprise application on Okta.

```yaml
timeplusAppserver:
  configs:
    enable-oidc: true
    oidc-host: 'https://{{subdomain}}.okta.com'
    oidc-client-id: '{{client_id}}'
    oidc-client-secret: '{{client_secret}}'
```

### Step 4. Test the integration

1. Make sure you update the deployment so that Timeplus Appserver so that it can pick up new configurations. 
2. When it is up and running, go to the root path of Timeplus Web Console again. If the integration is configured properly, you will be redirected to the Okta login page. 
3. Login with your Okta credential. If everything is setup properly, you will be redirected to back to the login page of Timeplus Enterprise.
4. Congratulations! You can now login Timeplus Enterprise just like what you did before. SSO has been properly setup at this point.
