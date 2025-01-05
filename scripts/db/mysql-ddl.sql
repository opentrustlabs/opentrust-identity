
CREATE DATABASE IF NOT EXISTS OPEN_CERTS_OIDC_IAM DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE OPEN_CERTS_OIDC_IAM;

create TABLE federated_oidc_provider(
    federatedoidcproviderid VARCHAR(64) PRIMARY KEY,
    federatedoidcprovidername VARCHAR(128) NOT NULL,
    federatedoidcproviderdescription VARCHAR(256),
    federatedoidcprovidertenantid VARCHAR(64),
    federatedoidcproviderclientid varchar(128) NOT NULL,
    federatedoidcproviderclientsecret varchar(256),
    federatedoidcproviderwellknownuri varchar(512) NOT NULL,
    refreshtokenallowed BOOLEAN NOT NULL,
    scopes varchar(256),
    usepkce BOOLEAN NOT NULL,
    clientauthtype varchar(128) NOT NULL,
    federatedoidcprovidertype varchar(128) NOT NULL,
    socialloginicon BLOB,
    sociallogindisplayname varchar(128)
);

create TABLE tenant (
    tenantid VARCHAR(64) PRIMARY KEY,
    tenantname VARCHAR(128) NOT NULL,
    tenantdescription VARCHAR(256),
    enabled BOOLEAN NOT NULL,
    claimssupported VARCHAR(1024),
    allowunlimitedrate BOOLEAN NOT NULL,
    allowuserselfregistration BOOLEAN NOT NULL,
    allowanonymoususers BOOLEAN NOT NULL,
    allowsociallogin BOOLEAN NOT NULL,
    verifyemailonselfregistration BOOLEAN NOT NULL,
    federatedauthenticationconstraint VARCHAR(128) NOT NULL,
    markfordelete BOOLEAN NOT NULL,
    tenanttype VARCHAR(128) NOT NULL
);
CREATE INDEX tenant_tenant_type_idx ON tenant(tenanttype);

create TABLE login_failure_policy (
    loginfailurepolicytype VARCHAR(128) NOT NULL,
    failurethreshold INT,
    pausedurationminutes INT,
    numberofpausecyclesbeforelocking INT,
    initbackoffdurationminutes INT,
    numberofbackoffcyclesbeforelocking INT
);

create TABLE tenant_management_domain_rel (
    tenantid VARCHAR(64) NOT NULL,
    domain VARCHAR(128) NOT NULL,
    PRIMARY KEY (tenantid, domain),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);
CREATE INDEX tenant_management_domain_rel_domain_idx ON tenant_management_domain_rel (domain);


create TABLE tenant_restricted_authentication_domain_rel (
    tenantid VARCHAR(64) NOT NULL,
    domain VARCHAR(128) NOT NULL,
    PRIMARY KEY (tenantid, domain),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);
CREATE INDEX tenant_restricted_authentication_domain_rel_domain_idx ON tenant_restricted_authentication_domain_rel (domain);


create TABLE federated_oidc_provider_tenant_rel (
    federatedoidcproviderid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    PRIMARY KEY (federatedoidcproviderid, tenantid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (federatedoidcproviderid) REFERENCES federated_oidc_provider(federatedoidcproviderid)
);

create TABLE social_oidc_provider_tenant_rel (
    federatedoidcproviderid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    PRIMARY KEY (federatedoidcproviderid, tenantid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (federatedoidcproviderid) REFERENCES federated_oidc_provider(federatedoidcproviderid)
);

create TABLE federated_oidc_provider_domain_rel (
    federatedoidcproviderid VARCHAR(64) NOT NULL,
    domain VARCHAR(128) NOT NULL UNIQUE,
    PRIMARY KEY (federatedoidcproviderid, domain),
    FOREIGN KEY (federatedoidcproviderid) REFERENCES federated_oidc_provider(federatedoidcproviderid)
);
CREATE INDEX federated_oidc_provider_domain_rel_domain_idx ON federated_oidc_provider_domain_rel(domain);

create TABLE client (
    clientid VARCHAR(64) PRIMARY KEY,
    tenantid VARCHAR(64) NOT NULL,
    clientsecret varchar(256) NOT NULL,
    clientname varchar (128) NOT NULL,
    clientdescription VARCHAR(256),
    enabled BOOLEAN NOT NULL,
    oidcenabled BOOLEAN NOT NULL,
    pkceenabled BOOLEAN NOT NULL,
    clienttype VARCHAR(128) NOT NULL,
    usertokenttlseconds INT,
    clienttokenttlseconds INT,
    maxrefreshtokencount INT,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE client_redirect_uri_rel (
    clientid VARCHAR(64) NOT NULL,
    redirecturi varchar(128) NOT NULL,
    PRIMARY KEY (clientid, redirecturi),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE user (
    userid VARCHAR(64) PRIMARY KEY,
    federatedoidcprovidersubjectid VARCHAR(64),
    email VARCHAR(128) UNIQUE NOT NULL,
    emailverified BOOLEAN NOT NULL,
    domain VARCHAR(128) NOT NULL,
    firstname VARCHAR(128) NOT NULL,
    lastname VARCHAR(128) NOT NULL,
    middlename VARCHAR(128),
    phonenumber VARCHAR(64),
    address VARCHAR(128),
    countrycode VARCHAR(8),
    preferredlanguagecode VARCHAR(8),
    twofactorauthtype VARCHAR(64),
    locked BOOLEAN,
    enabled BOOLEAN NOT NULL,
    nameorder VARCHAR(64) NOT NULL
);

CREATE INDEX user_email_idx on user(email);
CREATE INDEX user_domain_idx on user(domain);
CREATE INDEX user_first_name_idx on user(firstname);
CREATE INDEX user_last_name_idx on user(lastname);

create TABLE user_tenant_rel (
    userid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    enabled BOOLEAN NOT NULL,
    PRIMARY KEY (userid, tenantid),
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE authentication_group (
    authenticationgroupid VARCHAR(64) PRIMARY KEY,
    tenantid VARCHAR(64) NOT NULL,
    authenticationgroupname VARCHAR(128) NOT NULL,
    authenticationgroupdescription VARCHAR(256),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE authentication_group_client_rel (
    authenticationgroupid VARCHAR(64),
    clientid VARCHAR(64) NOT NULL,
    PRIMARY KEY (authenticationgroupid, clientid),
    FOREIGN KEY (authenticationgroupid) REFERENCES authentication_group(authenticationgroupid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE authentication_group_user_rel (
    authenticationgroupid VARCHAR(64),
    userid VARCHAR(64) NOT NULL,
    PRIMARY KEY (authenticationgroupid, userid),
    FOREIGN KEY (authenticationgroupid) REFERENCES authentication_group(authenticationgroupid),
    FOREIGN KEY (userid) REFERENCES user(userid)
);

create TABLE authorization_group (
    groupid VARCHAR(64) PRIMARY KEY,
    tenantid VARCHAR(64) NOT NULL,
    groupname VARCHAR(128) NOT NULL,
    defaultgroup BOOLEAN NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid) 
);

create TABLE user_authorization_group_rel (
    userid VARCHAR(64) NOT NULL,
    groupid VARCHAR(64) NOT NULL,
    PRIMARY KEY (userid, groupid),
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (groupid) REFERENCES authorization_group(groupid) 
);

create TABLE user_credential (
    userid VARCHAR(64) NOT NULL,
    salt varchar(256) NOT NULL,
    hashedpassword VARCHAR(256) NOT NULL,
    hashingalgorithm VARCHAR(128) NOT NULL,
    datecreated TIMESTAMP NOT NULL,
    PRIMARY KEY (userid),
    FOREIGN KEY (userid) REFERENCES user(userid)    
);
CREATE INDEX user_credential_date_created_idx ON user_credential(datecreated);

create TABLE signing_key (
    keyid VARCHAR(64) PRIMARY KEY,
    keyname VARCHAR(128) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    keytype VARCHAR(64) NOT NULL,
    keyuse VARCHAR(64) NOT NULL,
    privatekeypkcs8 BLOB NOT NULL,
    password VARCHAR(128),
    certificate BLOB,
    publickey BLOB,
    expiresatms BIGINT,
    status VARCHAR(64),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE rate_limit_service_group (
    servicegroupid VARCHAR(64) PRIMARY KEY,
    servicegroupname VARCHAR(128) NOT NULL,
    servicegroupdescription VARCHAR(256)    
);
CREATE INDEX rate_limit_service_group_servicegroupname_idx on rate_limit_service_group(servicegroupname);

create TABLE scope (
    scopeid VARCHAR(64) PRIMARY KEY,
    scopename VARCHAR(128) UNIQUE NOT NULL,
    scopedescription VARCHAR(256)
);

create TABLE scope_constraint_schema (
    scopeconstraintschemaid VARCHAR(64) PRIMARY KEY,
    scopeconstraintschemaname VARCHAR(128) NOT NULL,
    schemaversion INT NOT NULL,    
    scopeid VARCHAR(64) NOT NULL,
    scopeconstrainschema BLOB,
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid)
);

create TABLE access_rule (
    accessruleid VARCHAR(64) PRIMARY KEY,
    accessrulename VARCHAR(128) NOT NULL,
    scopeid VARCHAR(64) NOT NULL,
    scopeconstraintschemaid VARCHAR(64) NOT NULL,
    accessruledefinition BLOB NOT NULL,
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (scopeconstraintschemaid) REFERENCES  scope_constraint_schema(scopeconstraintschemaid)
);

create TABLE rate_limit_service_group_scope_rel (
    servicegroupid VARCHAR(64) NOT NULL,
    scopeid VARCHAR(64) NOT NULL,
    PRIMARY KEY(servicegroupid, scopeid),
    FOREIGN KEY (servicegroupid) REFERENCES rate_limit_service_group(servicegroupid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid)    
);

create TABLE rate_limit (
    ratelimitid VARCHAR(64) PRIMARY KEY,
    ratelimitname VARCHAR(128) NOT NULL,
    servicegroupid VARCHAR(64) NOT NULL,
    FOREIGN KEY (servicegroupid) REFERENCES rate_limit_service_group(servicegroupid)
);

create TABLE tenant_rate_limit_rel (
    ratelimitid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    allowunlimitedrate BOOLEAN NOT NULL,
    ratelimit INT,
    ratelimitperiodminutes INT,
    FOREIGN KEY (ratelimitid) REFERENCES rate_limit(ratelimitid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE tenant_scope_rel (
    scopeid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    accessruleid VARCHAR(64),
    PRIMARY KEY (scopeid, tenantid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (accessruleid) REFERENCES access_rule(accessruleid)
);

create TABLE client_scope_rel (
    scopeid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    accessruleid VARCHAR(64),
    PRIMARY KEY (scopeid, tenantid, clientid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid),
    FOREIGN KEY (accessruleid) REFERENCES access_rule(accessruleid)
);

create TABLE authorization_group_scope_rel (
    scopeid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    groupid VARCHAR(64) NOT NULL,
    accessruleid VARCHAR(64),
    PRIMARY KEY (scopeid, tenantid, groupid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (groupid) REFERENCES authorization_group(groupid),
    FOREIGN KEY (accessruleid) REFERENCES access_rule(accessruleid)
);


create TABLE user_scope_rel (
    userid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    scopeid VARCHAR(64) NOT NULL,
    accessruleid VARCHAR(64),
    PRIMARY KEY (userid, tenantid, scopeid),
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (accessruleid) REFERENCES access_rule(accessruleid)
);


create TABLE pre_authentication_state (
    token VARCHAR(128) NOT NULL PRIMARY KEY,
    state VARCHAR(128) NOT NULL,
    redirecturi VARCHAR(256) NOT NULL,
    codechallenge VARCHAR(256),
    codechallengemethod VARCHAR(32),
    responsemode VARCHAR(64) NOT NULL,
    responsetype VARCHAR(64) NOT NULL,
    scope VARCHAR(128) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    expiresatms BIGINT NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE authorization_code_data (
    code VARCHAR(128) NOT NULL PRIMARY KEY,
    redirecturi VARCHAR(256) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    scope VARCHAR(128) NOT NULL,
    codechallenge VARCHAR(256),
    codechallengemethod VARCHAR(32),
    userid VARCHAR(64) NOT NULL,
    expiresatms BIGINT NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid),
    FOREIGN KEY (userid) REFERENCES user(userid)
);

create TABLE refresh_data (
    refreshtoken VARCHAR(256) NOT NULL PRIMARY KEY,
    redirecturi VARCHAR(256) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    userid VARCHAR(64) NOT NULL,
    scope VARCHAR(128) NOT NULL,
    refreshtokenclienttype VARCHAR(128) NOT NULL,
    refreshcount INT,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid),
    FOREIGN KEY (userid) REFERENCES user(userid)
);

create TABLE federated_oidc_authorization_rel (
    state VARCHAR(256) NOT NULL PRIMARY KEY,
    codeverifier VARCHAR(256),
    codechallengemethod VARCHAR(16),
    federatedoidcproviderid VARCHAR(64) NOT NULL,
    initstate VARCHAR(256) NOT NULL,
    initredirecturi VARCHAR(256) NOT NULL,
    inittenantid VARCHAR(64) NOT NULL,
    initclientid VARCHAR(64) NOT NULL,
    initscope VARCHAR(128) NOT NULL,
    initcodechallengemethod VARCHAR(16),
    initcodechallenge varchar(256),
    initresponsemode VARCHAR(64),
    initresponsetype VARCHAR(64),
    expiresatms BIGINT NOT NULL,    
    FOREIGN KEY (inittenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (initclientid) REFERENCES client(clientid),
    FOREIGN KEY (federatedoidcproviderid) REFERENCES federated_oidc_provider(federatedoidcproviderid)
);

create TABLE client_auth_history (
    jti VARCHAR(256) NOT NULL PRIMARY KEY,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    expiresatms BIGINT NOT NULL,    
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE change_event (
    changeeventid VARCHAR(64) NOT NULL,
    objectid VARCHAR(64) NOT NULL,
    objecttype VARCHAR(128) NOT NULL,
    changeeventtype VARCHAR(128) NOT NULL,
	changeeventtypeid VARCHAR(64),
    changeeventclass VARCHAR(128) NOT NULL,
	changeeventclassid VARCHAR(64),
    changetimestamp BIGINT NOT NULL,
    changedbyid VARCHAR(64) NOT NULL,
    data BLOB NOT NULL,
	signature BLOB NOT NULL,
	keyid VARCHAR(64) NOT NULL,
    PRIMARY KEY (changeeventid, objectid), 
	FOREIGN KEY (changedbyid) REFERENCES user(userid),
	FOREIGN KEY (keyid) REFERENCES signing_key(keyid)
);
CREATE INDEX change_event_objectid_idx ON change_event(objectid);
CREATE INDEX change_event_objecttype_idx ON change_event(objecttype);

create TABLE anonymous_user_configuration (
    anonymoususerconfigurationid VARCHAR(64) PRIMARY KEY,
    defaultcountrycode VARCHAR(8) NOT NULL,
    defaultlanguagecode VARCHAR(8) NOT NULL,
    tokenttlseconds INT NOT NULL,
    scopeids VARCHAR(4096),
    groupids VARCHAR(4096)    
);

create TABLE tenant_anonymous_user_configuration_rel (
    tenantid VARCHAR(64) NOT NULL,
    anonymoususerconfigurationid VARCHAR(64) NOT NULL,
    PRIMARY KEY(tenantid, anonymoususerconfigurationid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (anonymoususerconfigurationid) REFERENCES anonymous_user_configuration(anonymoususerconfigurationid)
);

create TABLE tenant_look_and_feel (
    tenantid VARCHAR(64) PRIMARY KEY,
    adminheaderbackgroundcolor VARCHAR(32),
    adminheadertextcolor VARCHAR(32),
    adminlogo BLOB,
    adminheadertext VARCHAR(128),
    authenticationheaderbackgroundcolor VARCHAR(32),
    authenticationheadertextcolor VARCHAR(32),
    authenticationlogo BLOB,
    authenticationheadertext VARCHAR(128),    
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE footer_link (
    footerlinkid VARCHAR(64) PRIMARY KEY,
    tenantid VARCHAR(64) NOT NULL,
    linktext VARCHAR(256) NOT NULL,
    uri VARCHAR(256) NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE contact (
    objectid VARCHAR(64) NOT NULL,
    objecttype VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL,
    name VARCHAR(128) NOT NULL,
    userid VARCHAR(64),
    PRIMARY KEY(objectid, email)
);
CREATE INDEX contact_objectid_idx ON contact(objectid);
CREATE INDEX contact_email_idx ON contact(email);


create TABLE scheduler_lock (
    lockname VARCHAR(128) NOT NULL,
    lockinstanceid VARCHAR(128) NOT NULL,
    lockstarttimems BIGINT NOT NULL,
    lockexpiresat BIGINT NOT NULL,
    PRIMARY KEY (lockname, lockinstanceid)
);

create TABLE tenant_password_config (
    tenantid VARCHAR(64) NOT NULL,
    passwordminlength INT NOT NULL,
    passwordmaxlength INT NOT NULL,
    passwordhashingalgorithm VARCHAR(128) NOT NULL,
    requireuppercase BOOLEAN NOT NULL,
	requirelowercase BOOLEAN NOT NULL,
	requirenumbers BOOLEAN NOT NULL,
	requirespecialcharacters BOOLEAN NOT NULL,
	specialcharactersallowed VARCHAR(64),
    PRIMARY KEY (tenantid),
    FOREIGN KEY (tenantid) references tenant(tenantid)
);

create TABLE prohibited_passwords (
    password VARCHAR(128) NOT NULL PRIMARY KEY
);

create TABLE user_failed_login_attempts (
    userid VARCHAR(64) NOT NULL,
    failureatms BIGINT NOT NULL,
    PRIMARY KEY (userid, failureatms),
    FOREIGN KEY (userid) REFERENCES user(userid)
);

create TABLE user_password_reset_token (
    resettoken VARCHAR(256),
    userid VARCHAR(64) NOT NULL,
    issuedatms BIGINT NOT NULL,    
    FOREIGN KEY (userid) REFERENCES user(userid)
);