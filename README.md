This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Introduction

OpenTrust Identity is an IAM tool that implements the OIDC specification. It also contains features 
for managing tenants, clients, asymmetric keys, authorization groups, authentication groups, 
rate limits (aka throttling), federating with 3rd party OIDC providers such as Azure AD (or Entra ID 
as it is now known) or Okta, and access control. It supports multi-factor authentication using 
time-based one-time-passwords and hardware security keys such as Yubikey or Titan
or any key which supports the FIDO2 standard.

This tool is designed to support a variety of backend data stores, both SQL and NoSQL. At the moment, those include:

- Oracle
- MSSQL
- MySQL
- PostgreSQL
- Cassandra

Support for Mongo, Aurora, Spanner, and Cockroach is part of the future development of this tool.

Since most open source IAM tools only support relational databases, and among those, frequently only
the open source databases, this makes it difficult, if not impossible, for many organizations to adopt
open source IAM tools, especially if the organization is running cloud-native application and 
is using NoSQL databases, or if the organization only supports commercial databases such as MSSQL
and Oracle.

By creating a "bring-your-own-data-store" type of solution to IAM, OpenTrust Identity may 
encourage a more wide-spread adoption of OIDC and multi-factor authentication.

#### Protocols Supported

This IAM tool ONLY supports OIDC. It does not support plain OAuth2 for federated authentication
or SAML 2.0. 

For plain OAuth2 and federated authentication, there is no guarantee of a user profile 
endpoint, keys for validation of tokens, ability to revoke a token or any other type of information
that is readily available with an OIDC provider with their well-known meta-data endpoint. Implementations
of the OAuth2 protocol can vary widely.

For SAML 2.0, there are 2 limiting factors. The first is that the information interchange language is
XML (and if this was 2006 that would be fine - we would all be doing SOAP with XML). The second 
is that you must manually manage the certificates that are used to verfiy SAML tokens. Admittedly,
some SAML providers may provide a service to retrieve certificates dynamically, but this is not
part of the specification and cannot be guaranteed.

The following social IdPs are supported:

- Google
- LinkedIn
- Salesforce

Other social IdPs such as Facebook or Apple have NOT implemented sufficient features of the OIDC specification
to be included at this time. Specifically, they are missing one or more of the following critical
features:

- Userinfo endpoint
- Response type of `code` (which means they only support the implicit grant, which is deprecated)
- Response mode of `query`
- Scopes of `openid`, `email`, and `profile`
- Claims of `email`, `family_name`, and `given_name`

This tool does NOT limit you to just the three supported social IdPs. You can configure your own,
but they __MUST__ support these five OIDC features.


#### Audience for this tool

Most organizations already have some kind of enterprise IdP or IAM. These tools are typically large, complex,
scalable, robust, full-featured, and __expensive__. They are designed with the enterprise in 
mind - that is, access to your organization email, internal networks, internal applications 
and systems - but are less suited to the development of customer-facing applications (either
B2C or B2B). 

For small-to-medium-sized organizations, which do not have a large, dedicated development
and administrative staff, and which do not want to re-invent identity and access management, this 
tool may prove to be useful. The reason is because development philosophies have changed
over the last decade or so. It is no longer an acceptable practice to just write a bunch
of web pages backed by a data store or a search engine and then call it a day. 

There has been a considerable push for API-First development. Whether that API is RESTful,
GraphQL, JSON/RCP, or something else, is entirely up the system architects and designers
(and, to a lesser extent, whatever is fashionable lately). But with an API-First design, 
it removes the burden from the development team of having to develop every single application,
and spreads it around to whoever has the time and money to do that development. And
those teams can be both inside and outside the organization.

Then the problem of access control becomes critical. Exposing your APIs to 3rd parties means
having strict controls over who can do what:

- What API services are in scope for the client.
- How are users in the 3rd party applications going to authenticate in order to access those services.
- Can the client invoke the service on behalf of itself or only on behalf of delegated users.
- Are the client and delegated users rate-limted in the number of service calls they can make.
- Is there a restricted list of users who are allowed to authenticate using the client.
- For abusive clients and users, can their sessions be revoked and their accounts disabled easily.

The rush to build AI applications has only exacerbated these problems. This IAM tool 
provides features for managing access to your API, in addition to other common IdP functions. 

One potentially overlooked problem of commercial SaaS IAM providers is the question of
whose data is it? Do you own your data? Can you easily access the raw data? Can you 
perform your own analytics on the data? Can you migrate the data to a different
system if you had to? What happens to your data if the SaaS provider goes out of business?

With proprietary or commercial solutions your options may be severly limited. Open source
tools at least provide you with the ability to manage your own data. It comes with a cost,
of course, which is that you are now responsible for managing your database, search
engine, web servers, application servers, email servers, and so on. This should not be an 
insurmountable challenge for even small-to-medium-sized organizations, but it is
an acknowledgement that free and open source tools have a total cost of ownership that
needs to be considered when making a selection.


### The software stack

Node v20 or higher

Opensearch v3.x

Your choice of databases:
- Oracle (developed on v23 but other versions should work)
- MSSQL (developed on Microsoft SQL Server 2022 (RTM) - 16.0.1000.6)
- MySQL (developed on v8.0.43)
- PostgreSQL (developed on v16.10)
- Cassandra v5.x


And if you are running the tool in a non-local development environment, you will also need:

Nginx (any recent version will be sufficient)

(Note: The reason Nginx is required for non-local development environments is because NextJS does NOT support
TLS connections for anything but development on localhost. Their recommendation is to use Nginx as the reverse proxy or deploy
on Vercel. If you choose to use Nginx, there is an example configuration file `example.nginx.conf` at the root of this project.)

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
as Oracle with TDE).

Use `filesystem` for local development ONLY. Using it any other environment is absolutely NOT recommended. See the file
at `/lib/kms/fs-based-kms.ts` for details about what the contents of the key file should be.

Use `custom` if you have some kind of vault for secret values (and you do not have any other KMS such as Google or AWS).
At the moment, this tool does not support specific vaults such as HashiCorp. For the custom implementation, 
you will need to create 2 HTTP endpoints which will be used to encrypt and decrypt the data. These endpoints will essentially
be wrappers around whatever vault you are using. The details on the payload and responses for encryption 
and decryption are in the file `/lib/kms/custom-kms.ts`. 

Briefly:

The JSON payload for both endpoints is the same:

```JSON
 {
      "value": "value to encrypt/decrypt",
      "aad": "optional value if using AES with GCM or other authenticated mode"
 }
```

The response for the encryption endpoint is:

```JSON
 {
      "encrypted": "encrypted value base64 encoded"
 }
 ```

 The response for the decription endpoint is:
 
 ```JSON
 {
      "decrypted": "decrypted value base64 encoded"
 }
```

This service call will be invoked with a Bearer Authorization header for the client that is defined as the root
client for the IAM tool. This client, by default when the IAM tool is initilized, is configured with
a scope of `custom.encryptdecrypt`. Your implementation of this service can check for the presence of this scope using
the endpoint `/api/users/me` (see below for details) or by using PKI identities if the application is 
configured for it (see the env.example file for details). 

Future development of this tool will include support for the following KMSs
- AWS
- Google
- Azure
- Tencent



##### 3. Security Event Callback Service

First: What is a security event? Technically, it is broad category of events, which could include
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
- A user has generated a link for allowing an external user to set the client secret for a federated OIDC provider (`secret_share_link_generated`)

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

__However__, there are a number of security events which this IAM tool emits and which the framework does NOT yet support.
These include viewing secret values or logging in using a duress password, both of which might trigger external
actions. For that reason, this tool does NOT support the "Shared Signals" framework. If future work on the "Shared
Signals" framework includes greater customization of security events, then this decision will be revisited.

This tool has a simple implementation of the security event handler which you can use if you are developing on localhost.
Set the envrironment variable as follows:

```bash
SECURITY_EVENT_CALLBACK_URI=http://localhost:3000/api/security-events/handler
```

The JSON payload sent to this service is:

```JSON
{
	"securityEventType": "user_registered | account_locked | account_unlocked | duress_authentication | successful_authentication | ...",
	"userId": "string | null,",
	"email": "string | null,",
	"phoneNumber": "string | null,",
	"address": "string | null,",
	"city": "string | null,",
	"stateRegionProvince": "string | null,",
	"countryCode": "string | null,",
	"postalCode": "string | null,",
	"jti": "string | null,",
	"ipAddress": "string | null,",
	"geoLocation": "string | null,",
	"deviceFingerprint": "string | null",
}
```

This service call will be invoked with a Bearer Authorization header for the client that is defined as the root
client for the IAM tool. This client, by default when the IAM tool is initilized, is configured with
a scope of `security.event.write`. Your implementation of this service can check for the presence of this scope using
the endpoint `/api/users/me` (see below for details) or by using PKI identities if the application is 
configured for it (see the env.example file for details). 


##### 4. SMS Service Wrapper

This tool does not yet support SMS (for features such as verifying phone numbers or sending one-time passcodes for
password reset), although it is on the roadmap. The issue with SMS is the great variety of SMS providers,
each with its own API and authorization. This tool is not intended support any particular provider, but if an SMS 
provider is available in your organization, and you want to enable SMS in this tool when the feature is
ready, then you will need to write a wrapper service around your SMS provider. 

The JSON payload for the SMS service is: 

```JSON
{
    "lines": [
        "line1",
        "line2",
        "line3",
        "etc"        
    ],
    "to": "+123456789012"
}
```

More details can be found in the file `/lib/models/sms.ts`.

This service call will be invoked with a Bearer Authorization header for the client which is defined as the root
client for the IAM tool. This client, by default when the IAM tool is initilized, is configured with
a scope of `sms.send`. Your implementation of this service can check for the presence of this scope using
the endpoint `/api/users/me` (see below for details) or by using PKI identities if the application is 
configured for it (see the env.example file for details).

This tool has a simple implementation of the SMS handler which you can use if you are developing on localhost.
Set the environment variable as follows:

```bash
SMS_SERVICE_WRAPPER_URI=http://localhost:3000/api/sms-service/handler
```

## Legacy User Migration

If you have an existing, custom-built user-management system (or one to which you have some kind of access to
the underlying credential and profile data) and you need to migrate those users to this IAM tool, 
you have a couple of options:

One, if you have a used a password hashing algorithm that exactly matches one of the hashing algorithms
supported by this tool, then you should be able to copy the credential and profile data directly into
the database and search engine using an ETL tool. This is not a likely scenario, however. Plus, you will
need to make sure that the users are correctly assigned to tenants, authentication groups, authorization groups,
and so on, which may be very difficult.

Two, you can use this IAM tool to automatically migrate legacy users when they attempt to login or register. 
In order to use this feature, (assuming you have access to the credential and profile data) you will need to 
create 3 endpoints as wrappers (or decorators) around your existing user management system:

- Username check
- Authentication
- User profile

These service calls will be invoked with a Bearer Authorization header for the client which is defined as the root
client for the IAM tool. This client, by default when the IAM tool is initilized, is configured with
a scope of `legacy.user.migrate`. Your implementation of these services can check for the presence of this scope using
the endpoint `/api/users/me` (see below for details) or by using PKI identities if the application is 
configured for it (see the env.example file for details).


For the username check endpoint, it uses a method of `HEAD` and has one required query param: `email`. Example:

```bash
HEAD /my/username/check?email=emailtocheck@somedomain.com
```

It should return a status code of 403 if there is not a valid authorization token, 404 if the user is not found,
and 200 if the user is found.

For the authentication endpoint, it uses a method of `POST` and the JSON payload is:

```JSON
{
    "email": "myemail@mydomain.com",
    "password": "mypassword"
}
```

It should return a status code of 403 if there is not a valid authorization token or if the credentials
are not valid, a 404 if the user is not found, and 200 otherwise.


For the profile endpoint, it uses a method of `GET` and has one required query param: `email`. It returns
a JSON object of 

```JSON
{
	"email": "string",
	"emailVerified": "boolean,",
	"firstName": "string",
	"lastName": "string",
	"middleName": "string | null",
	"phoneNumber": "string | null",
	"address": "string,",
	"addressLine1": "string | null,",
	"city": "string,",
	"postalCode": "string,",
	"stateRegionProvince": "string | null,",
	"countryCode": "string",
	"preferredLanguageCode": "string,    ",
	"nameOrder": "string"
}
```

if the user is found and the authorization token is valid. Otherwise it returns a 403 for an invalid authorization
token and 404 if the user is not found.

!!!!!!!!!!!!! IMPORTANT !!!!!!!!!!!!!!!!!!

One important thing to note is that this IAM tool can also be configured as a legacy user migration service
for other IAM tools. The endpoints are at:

```bash
/api/legacy/namecheck
/api/legacy/login
/api/legacy/profile
```

These endpoints require that there is a __service__ client within this application that belongs to the root tenant
and is configured with a scope of `legacy.user.migrate`.

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
who can create indexes or create aliases on indexes, and who is allowed to create, read, update, and
delete data from those indexes. While it is outside the scope of this tool, you want to make 
sure you configure your Opensearch users to have the appropriate permissions for their use.

The second important thing to note about Opensearch is that creating the initial index using 
a date stamp and then creating an alias is generally the approach you should take. You will 
have a much easier path to upgrading the indexes over time.

For the `iam_object_search` index

`PUT   /iam_object_search`

(or better:  `PUT   /iam_object_search_MM_DD_YYYY` )

with the contents of the file at `/scripts/object-search-ddl.json`

To create an alias:

`POST /_aliases`

```JSON
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

`POST /_aliases`

```JSON
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

`POST /_aliases`

```JSON
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

`POST /_aliases`

```JSON
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

##### 4. Configure the .env file

You will need to configure your .env file for local or development or deployment. There is an example file `env.example` at the root of 
this project. Please read it carefully since it contains several caveats about using mTLS and proxy configuration for
outbound HTTP and SMTP calls. 


##### 5. Start the server

```bash
npm run dev
# or
yarn dev
```

##### 6. Initialize the IAM tool with the Root Tenant and all ancillary data.

There is only one way to initialize the IAM tool, regardless if you are on a local development machine or deploying to 
a higher environment, and it does NOT involve default credentials of admin/admin. With over 30 years of PKI we can do better. 

While the process that will be described for initialization may seem a little convoluted, from a security standpoint there 
is actually a reasonably good explanation for it. We can start with the OWASP Top 10. Here is what it has to say:

> Default credentials preconfigured on hardware devices or software applications by manufacturers or 
> vendors are often left unchanged by users or administrators, creating a security vulnerability.

(Source here: https://owasp.org/www-project-top-10-infrastructure-security-risks/docs/2024/ISR07_2024-Insecure_Authentication_Methods_and_Default_Credentials)

The CWE has something similar to say (source here: https://cwe.mitre.org/data/definitions/1392.html)

> It is common practice for products to be designed to use default keys, passwords, or 
> other mechanisms for authentication. The rationale is to simplify the manufacturing process 
> or the system administrator's task of installation and deployment into an enterprise. 
> However, if admins do not change the defaults, it is easier for attackers to bypass 
> authentication quickly across multiple organizations.

And if you have a PCI compliant application, "Requirement 2" contains this statement:

> Malicious individuals, both external and internal to an entity, often use default passwords 
> and other vendor default settings to compromise systems. These passwords and settings 
> are well known and are easily determined via public information.

So one obvious solution, then, is NOT to include any default credentials. But that means that we need another way to 
identify a user who can initialize the system. One way to do that is via asymmetric keys - the identifier is in a
public certificate, while the private key remains in the possession of the person who is performing the initialization. 

To describe the process at a high level:  A certificate is deployed on the server(s) along with a 
flag indicating that the system should be initialized. During initialization, the person who is 
performing the initialization will upload their private key which will be used to sign a JWT. 
That JWT will be verified by the certificate that was deployed to the server. 

In this scenario, only one person has the key. The web admin team (or devops team), which should 
NOT include the person performing initialization, has access to the server configuration. And once 
initialization is complete it cannot be re-performed, unless all of the data is truncated from the 
database and the proper environment variables are set. After the initialization is complete, the web 
admin team (or devops team) should remove the environment settings for initialization and restart the server.

The environment variables that need to be set for system initialization are the following:

```bash
SYSTEM_INIT=true
SYSTEM_INIT_CERTIFICATE_FILE=/path/to/system/initialization/certificate.crt
```

The `SYSTEM_INIT_CERTIFICATE_FILE` should contain the certificate that matches the private key generated
by the person performing the initialization.

If your system is already initialized, the `SYSTEM_INIT` variable can be omitted or set to false. If omitted
or set to false or the system is already initialized, the `SYSTEM_INIT_CERTIFICATE_FILE` variable is ignored.

The certificate does not need to be signed by a CA - it can be a self-signed certificate. The important thing
is that the private key remain only in the possession of the person performing initialization. If you 
do not have a local CA, you can generate a self-signed certificate using OpenSSL with the following
command:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout initialization.key -out initialization.crt -days 2
```

You should use a different key-pair for each environment that you are initializing.

To start initialization, open your browser to:

> http(s)://mydomain:port/system-init

You will be prompted to upload your private key first. Then the initialization process will perform
several checks:

- Is the database reachable and is the schema deployed
- Is there already a Root Tenant
- Is the search engine reachable and are the indexes available
- Is a KMS strategy defined
- Is the auth domain defined and are the multi-factor-authentication variables defined
- Is there an SMTP server defined
- Is there a security event callback URI defined

If you are missing the last 2 of these, the system will generate warnings, but allow you proceed. If the other
checks fail then the system cannot be initialized.

You will configure, in order:

- Root Tenant - Required
- Root Client - Required (This is used for outbound messages to other internal systems such as the security event URI or SMS URI)
- Root Admin Authorization Group - Required
- A Root User - Required (This is the user performing the initialization)
- A Read-Only Default Authorization Group - Optional (But useful if you want people in your organization to have read access to the tool)
- A federated OIDC provider for your organization - Optional (But should be created if your organization uses Azure AD or Okta or similar for SSO)
- Global System Settings - Required
- ReCaptcha - Optional

Once initialization is complete, you will be prompted to log in with the credentials you provided or with the
federated OIDC provider you configured.

##### A Brief Explanation of the Root Tenant and Tenant Permissions

The Root Tenant is created during system initialization. While this IAM tool can support an arbitrary number
of tenants, there is only one Root Tenant. It is the tenant to which your organization belongs and to which
authentication is limited to users from the same domain(s) as your organization. 

All scope for IAM management is assigned to the Root Tenant. However, some limited amount of IAM management scope
can be assigned to other tenants if, for example, you want create tenants for some of your customers
and they want to be able to manage their own clients, authorization groups, and authentication groups within
their tenant.

A member of the Root Tenant is in a privileged position relative to the other tenants. A member of a non-root
tenant is restricted to data within their tenant and the IAM management scope to which they are 
assigned. However, a member of the Root Tenant is only restricted by the IAM management scope to 
which they are assigned, which is applied to ALL tenants. 

## The OIDC Endpoints

All of the OIDC endpoints are relative to a tenant ID. This includes the root tenant. At the moment, there are
no common or public tenants. 

###### Discovery endpoint

```bash
/api/{tenant_id}/.well-known/openid-configuration
```

###### Authorization endpoint

```bash
/api/{tenant_id}/oidc/authorize
```

###### JWKS endpoint

```bash
/api/{tenant_id}/oidc/keys
```

###### Token endpoint

```bash
/api/{tenant_id}/oidc/token
```

###### User info endpoint

```bash
/api/{tenant_id}/oidc/userinfo
```

###### Revocation endpoint

```bash
/api/{tenant_id}/oidc/revoke
```

###### Device code endpoint

```bash
/api/{tenant_id}/oidc/devicecode
```

## Additional utility endpoints

In addition to the standard OIDC endpoints there are several utility endpoints which clients can invoke.

###### My Profile endpoint

```bash
/api/users/me
```

This `GET` endpoint is meant to supplemnt the standard OIDC userinfo endpoint, and contains more information
about either the end user or the service client which is represented by the access token (which should
be provided as a Bearer Authorization header). 

Use this endpoint if you want a full list of the scope values or authorization groups that the 
profile contains.

For service accounts, no special scope is required. For end user accounts, the client which was used
for OIDC authentication either needs to be of type IDENTITY or needs to have a delegated scope of
`user.profile.read`.

###### Create an anonymous user

```bash
/api/users/anonymous
```

This is for tenants which may have some type of B2C functionality, and which have enabled anonymous users, so that 
authentication is NOT required to browse the site. 

The method is `POST` with a content type of `x-www-form-urlencoded` and an optional payload with the following
parameters

```bash
country_code=ISO-country-code
language_code=ISO-language-code
```

If the parameters are omitted, this defaults to the country and language configured for the tenant.

Clients need to be assigned the scope 
`anonymous.user.create`.

###### Rate limits

```bash
/api/users/rate-limits
```

If you are implementing any type of throttling for your tenants, this `GET` endpoint will return
all of the rate limits that have been configured for the tenant. These are applicable to
both service accounts and end users. The response is object is:

```typescript
interface RateLimitResponse {
    allowUnlimitedRate: boolean,
    rateLimit: number | null,
    rateLimitPeriodMinutes: number | null,
    serviceRateLimits: Array<ServiceRateLimit>
}

interface ServiceRateLimit {
    allowUnlimitedRate: boolean,
    rateLimit: number | null,
    rateLimitPeriodMinutes: number | null
    serviceGroupId: string
    serviceGroupName: string
}
```