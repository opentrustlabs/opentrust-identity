This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Introduction

OpenTrust Identity is an IAM tool that implements the OIDC specification. It also contains features for managing tenants, clients,
asymmetric keys, authorization groups, authentication groups, rate limits (aka throttling), federating with 3rd party
OIDC providers such as Azure AD (or Entra ID as it is now known) or Okta, and access control. It supports
multi-factor authentication using time-based one-time-passwords and hardware security keys such as Yubikey or Titan
or any key which supports the FIDO2 standard.

Most open source IAM tools only support relational databases, and among those, frequently only
the open source databases. This makes it difficult, if not impossible, for many organizations to adopt
open source IAM tools, especially if the organization is running cloud-native application and 
is using NoSQL databases, or if the organization only supports commercial databases such as MSSQL
and Oracle.

This tool is designed to support a variety of backend data stores, both SQL and NoSQL. At the moment, those include:

- Oracle
- MSSQL
- MySQL
- PostgreSQL
- Cassandra

Support for Mongo, Aurora, Spanner, and Cockroach is part of future development of this tool.


### The software stack

Node v20 or higher

Opensearch v3.x

Your choice of databases:
- Oracle (developed on v23 but other versions should work)
- MSSQL 
- MySQL
- PostgreSQL
- Cassandra v5.x


And if you are running the tool in a non-local development environment, you will also need:

Nginx (any recent version will be sufficient)

(Note: The reason Nginx is required for non-local development environments is because NextJS does NOT support
TLS connections for anything but localhost. Their recommendation is to use Nginx as the reverse proxy or deploy
on Vercel. For Nginx, there is an example configuration file `example.nginx.conf` at the root of this project.)

There are several things you should have, especially if you are in a non-local development environment.

##### 1. Email (SMTP) Server

There are a number of features that are dependent on sending emails, such as email verification, password
resets, and so on. Without an email server these features are not possible. If you need an email service
for local development and you do not have one, you can use a free service like Ethereal (https://ethereal.email/).

##### 2. Key Management Service (KMS)

There is a lot of data which needs to be encrypted at rest. These include the client secret, unencrypted private keys or
the passcode for encrypted private keys, client secrets for federated OIDC providers, and ReCaptcha API keys (if you
are using ReCaptcha). 

Currently, this tool supports the following configuration for KMS:
- none
- filesystem
- custom

Use `none` for local development or for cases where you have column-level encryption available in your database (such
as TDE with Oracle).

Use `filesystem` for local development ONLY. Using it any other environment is absolutely NOT recommended. See the file
at `/lib/kms/fs-based-kms.ts` for details about what the contents of the key file should be.

Use `custom` if you have some kind of vault for secret values (and you do not have any other KMS such as Google or AWS).
At the moment, this tool does not support specific vaults such as HashiCorp. For the custom implementation, 
you will need to create 2 HTTP endpoints which will be used to encrypt and decrypt the data. These endpoints will essentially
be wrappers around whatever vault you are using. The details on the payload and responses for encryption 
and decryption are in the file `/lib/kms/custom-kms.ts`.  The 

Future development of this tool will include support for the following KMSs
- AWS
- Google
- Azure
- Tencent

##### 3. Security Event Callback Service

The first question is: What is a security event? Technically, it is broad category of events, which could include
breaches of security, access control denied, or any type of anomaly that you might want to take action on (such
as user who normally logs in from Chicago suddenly logging in from Moscow). For the purposes of this 
IAM tool, security events are the following:

- User has registered (`user_registered`)
- User account is locked due to too many failed login attempts  (`account_locked`)
- An admin has unlocked a user account  (`account_unlocked`)
- A user has authenticated using their duress password  (`duress_authentication`)
- A user has successfully authenticated (`successful_authentication`)
- A user has reset their password (`reset_password`)
- A user has authenticated using their backup email (`backup_email_authentication`)
- A user has logged out (`logout`)
- A new device has been registered (`device_registered`)
- An authorization code has been exchanged for an access token (`auth_code_exchanged`)
- A user has viewed the client secret for a federated OIDC provider (`federated_idp_secret_viewed`)
- A user has viewed a client secret (`client_secret_viewed`)
- A user has viewed a private key (`private_key_viewed`)
- A user has viewed the password for an encrypted private key (`private_key_password_viewed`)
- A user has viewed the ReCaptcha API key (`recaptcha_api_key_viewed`)
- A user has benerated a link for allowing an external user to set the client secret for a federated OIDC provider (`secret_share_link_generated`)

These are all defined in the file: `/lib/models/security-events.ts`

Since this tool cannot make any assumptions about what to do in case of a security event, and since it is meant
to be used as a standalone application, it should communicate to the outside world in some way when these
events happen. By default, the tool will log the events to a log file. However, logging to a log file does
not mean that the event will actionable in real time. The logged data may take time to go from the
filesystem to Kibana or Splunk (or some other tool) and to show up on a dashboard which may (or more
likely, will not) be monitored on a continuous basis. 

If you decide that you need to take real-time action on certain security events, then you will need to 
develop a service which will listen for these events and relay them to the appropriate parties.

There is curently, at the time of writing in October 2025, a working group that has developed a framework
for handling security events. It is called "OpenID Shared Signals". The framework has been approved and
the specification is here:

https://openid.net/specs/openid-sharedsignals-framework-1_0.html

__However__, there are a number of security events which this tool emits and which the framework does NOT yet support.
These include viewing secret values or logging in using a duress password, both of which might trigger external
actions. For that reason, this tool does support the "Shared Signals" framework. If future work on the "Shared
Signals" framework includes greater customization of security events, then this decision will be revisited.

This tool has a simple implementation of the security event handler which you can use if you are developing on localhost.
Set the envrironment variable as follows:

```bash
SECURITY_EVENT_CALLBACK_URI=http://localhost:3000/api/security-events/handler
```

##### 4. SMS Service Wrapper

This tool does not yet support SMS (for features such as verifying phone numbers or sending one-time passcodes for
password reset), although it is on the roadmap. The issue with SMS is the great variety of SMS providers,
each with its own API and authorization. This tool will not support any particular provider, but if an SMS 
provider is available in your organization, and you want to enable SMS in this tool when the feature is
ready, then you will need to write a wrapper service around your SMS provider. 

The payload for the SMS service can be found in the file `/lib/models/sms.ts`.

This tool has a simple implementation of the SMS handler which you can use if you are developing on localhost.
Set the environment variable as follows:

```bash
SMS_SERVICE_WRAPPER_URI=http://localhost:3000/api/sms-service/handler
```


## Getting Started

##### 1. install the dependencies:

```bash
npm install 
# or
yarn install
```

##### 2. Create the database schemas

DDL scripts for each database are included in the `/scripts/db` or `/scripts/cassandra` directories of
this project.


##### 3. Create the 2 search indexes

The JSON payloads for the 2 Opensearch indexes are under `/scripts/search`

!!!!!!!!!!!!!  IMPORTANT  !!!!!!!!!!!!!!!!!!

The first important thing to note about Opensearch is that is has quite a few strict rules about
who can create indexes or create aliases on indexes, and who is allow to create, read, update, and
delete data from those indexes. While it is outside the scope of this tool, you want to make 
sure you configure users who have the appropriate permissions for their use.

The second important thing to note about Opensearch is that creating the initial index using 
a date stamp and then creating an alias is generally the approach you should take. You will 
have a much easier path to upgrading the indexes over time.

For the `iam_object_search` index

`PUT   /iam_object_search`

(or better:  `PUT   /iam_object_search_MM_DD_YYYY` )

with the contents of the file at `/scripts/object-search-ddl.json`

To create or remove an alias:

```JSON
POST _aliases
{
  "actions": [
    {
      "add": {
        "index": "iam_object_search_MM_DD_YYYY",
        "alias": "iam_object_search",
        "is_write_index": true 
      }
    }
  ]
}
```

You can remove an alias with the following request:

```JSON
POST _aliases
{
  "actions": [
    {
      "remove": {
        "index": "iam_object_search_MM_DD_YYYY",
        "alias": "iam_object_search"
      }
    }
  ]
}
```

For the `iam_rel_search` index: 

`PUT  /iam_rel_search`

(or better:  `PUT   /iam_rel_search_MM_DD_YYYY` )

with the contents of the file at `/scripts/rel-search-ddl.json`

To create or remove an alias:

```JSON
POST _aliases
{
  "actions": [
    {
      "add": {
        "index": "iam_rel_search_MM_DD_YYYY",
        "alias": "iam_rel_search",
        "is_write_index": true 
      }
    }
  ]
}
```

```JSON
POST _aliases
{
  "actions": [
    {
      "remove": {
        "index": "iam_rel_search_MM_DD_YYYY",
        "alias": "iam_rel_search"
      }
    }
  ]
}
```


```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

You will need to configure your .env file for local testing or development. There is an example file `env.example` at the root of 
this project. 

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.





##### One-liner for the initialization process. This will generate a private key and certificate for use in initializaing the IdP

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout initialization.key -out initialization.crt -days 365
```

#### To create the 2 search indexes in OpenSearch, use the following HTTP calls:



