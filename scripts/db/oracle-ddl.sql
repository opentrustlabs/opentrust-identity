
-- ORACLE
-- ======

-- CREATE USER opentrust with password (this opentrust user will be the same as the schema)
-- (Grant privileges to your database user account)


create TABLE federated_oidc_provider(
    federatedoidcproviderid VARCHAR2(64) PRIMARY KEY,
    federatedoidcprovidername VARCHAR2(128) NOT NULL,
    federatedoidcproviderdescription VARCHAR2(256),
    federatedoidcprovidertenantid VARCHAR2(64),
    federatedoidcproviderclientid VARCHAR2(128) NOT NULL,
    federatedoidcproviderclientsecret VARCHAR2(256),
    federatedoidcproviderwellknownuri VARCHAR2(512) NOT NULL,
    refreshtokenallowed BOOLEAN NOT NULL,
    scopes VARCHAR2(256),
    usepkce BOOLEAN NOT NULL,
    clientauthtype VARCHAR2(128) NOT NULL,
    federatedoidcprovidertype VARCHAR2(128) NOT NULL,
    socialloginprovider VARCHAR2(128),
    markfordelete BOOLEAN NOT NULL
);

create TABLE tenant (
    tenantid VARCHAR2(64) PRIMARY KEY,
    tenantname VARCHAR2(128) NOT NULL,
    tenantdescription VARCHAR2(256),
    enabled BOOLEAN NOT NULL,
    allowunlimitedrate BOOLEAN NOT NULL,
    allowuserselfregistration BOOLEAN NOT NULL,
    allowanonymoususers BOOLEAN NOT NULL,
    allowsociallogin BOOLEAN NOT NULL,
    verifyemailonselfregistration BOOLEAN NOT NULL,
    federatedauthenticationconstraint VARCHAR2(128) NOT NULL,
    markfordelete BOOLEAN NOT NULL,
    tenanttype VARCHAR2(128) NOT NULL,
    migratelegacyusers BOOLEAN NOT NULL,
    allowloginbyphonenumber BOOLEAN NOT NULL,
    allowforgotpassword BOOLEAN NOT NULL,
    defaultratelimit INT,
    defaultratelimitperiodminutes INT,
    registrationrequiretermsandconditions BOOLEAN NOT NULL,
    termsandconditionsuri VARCHAR2(256),
    registrationrequirecaptcha BOOLEAN NOT NULL
);
CREATE INDEX tenant_tenant_type_idx ON tenant(tenanttype);

create TABLE tenant_login_failure_policy (
    tenantid VARCHAR2(64) PRIMARY KEY,
    loginfailurepolicytype VARCHAR2(128) NOT NULL,
    failurethreshold INT NOT NULL,
    maximumloginfailures INT,
    pausedurationminutes INT,
    FOREIGN KEY (tenantid) references tenant(tenantid)
);

create TABLE tenant_management_domain_rel (
    tenantid VARCHAR2(64) NOT NULL,
    domain VARCHAR2(128) NOT NULL,
    PRIMARY KEY (tenantid, domain),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);
CREATE INDEX tenant_management_domain_rel_domain_idx ON tenant_management_domain_rel (domain);


create TABLE tenant_restricted_authentication_domain_rel (
    tenantid VARCHAR2(64) NOT NULL,
    domain VARCHAR2(128) NOT NULL,
    PRIMARY KEY (tenantid, domain),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);
CREATE INDEX tenant_restricted_authentication_domain_rel_domain_idx ON tenant_restricted_authentication_domain_rel (domain);


create TABLE federated_oidc_provider_tenant_rel (
    federatedoidcproviderid VARCHAR2(64) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    PRIMARY KEY (federatedoidcproviderid, tenantid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (federatedoidcproviderid) REFERENCES federated_oidc_provider(federatedoidcproviderid)
);

create TABLE federated_oidc_provider_domain_rel (
    federatedoidcproviderid VARCHAR2(64) NOT NULL,
    domain VARCHAR2(128) NOT NULL UNIQUE,
    PRIMARY KEY (federatedoidcproviderid, domain),
    FOREIGN KEY (federatedoidcproviderid) REFERENCES federated_oidc_provider(federatedoidcproviderid)
);
CREATE INDEX federated_oidc_provider_domain_rel_domain_idx ON federated_oidc_provider_domain_rel(domain);

create TABLE client (
    clientid VARCHAR2(64) PRIMARY KEY,
    tenantid VARCHAR2(64) NOT NULL,
    clientsecret VARCHAR2(256) NOT NULL,
    clientname varchar (128) NOT NULL,
    clientdescription VARCHAR2(256),
    enabled BOOLEAN NOT NULL,
    oidcenabled BOOLEAN NOT NULL,
    pkceenabled BOOLEAN NOT NULL,
    clienttype VARCHAR2(128) NOT NULL,
    usertokenttlseconds INT,
    clienttokenttlseconds INT,
    maxrefreshtokencount INT,
    markfordelete BOOLEAN NOT NULL,
    audience VARCHAR2(256),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE client_redirect_uri_rel (
    clientid VARCHAR2(64) NOT NULL,
    redirecturi VARCHAR2(128) NOT NULL,
    PRIMARY KEY (clientid, redirecturi),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE users (
    userid VARCHAR2(64) PRIMARY KEY,
    federatedoidcprovidersubjectid VARCHAR2(128),
    email VARCHAR2(128) UNIQUE NOT NULL,
    emailverified BOOLEAN NOT NULL,
    domain VARCHAR2(128) NOT NULL,
    firstname VARCHAR2(128) NOT NULL,
    lastname VARCHAR2(128) NOT NULL,
    middlename VARCHAR2(128),
    phonenumber VARCHAR2(32),
    address VARCHAR2(128),
    addressline1 VARCHAR2(128),
    city VARCHAR2(128),
    postalcode VARCHAR2(32),
    stateregionprovince VARCHAR2(64),
    countrycode VARCHAR2(8),
    preferredlanguagecode VARCHAR2(8),
    locked BOOLEAN,
    enabled BOOLEAN NOT NULL,
    nameorder VARCHAR2(64) NOT NULL,
    markfordelete BOOLEAN NOT NULL
);

CREATE INDEX users_email_idx on users(email);
CREATE INDEX users_domain_idx on users(domain);
CREATE INDEX users_first_name_idx on users(firstname);
CREATE INDEX users_last_name_idx on users(lastname);
CREATE INDEX users_phone_number_idx on users(phonenumber);
CREATE INDEX users_federatedoidcprovidersubjectid_idx on users(federatedoidcprovidersubjectid);

create TABLE user_email_recovery (
    userid VARCHAR2(64) NOT NULL,
    email VARCHAR2(128) UNIQUE NOT NULL,
    emailverified BOOLEAN NOT NULL,
    PRIMARY KEY (userid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);
CREATE INDEX user_email_recovery_email_idx on user_email_recovery(email);

create TABLE user_tenant_rel (
    userid VARCHAR2(64) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    enabled BOOLEAN NOT NULL,
    reltype VARCHAR2(32) NOT NULL,
    PRIMARY KEY (userid, tenantid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE user_terms_and_conditions_accepted (
    userid VARCHAR2(64) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    acceptedatms NUMBER NOT NULL,
    PRIMARY KEY (userid, tenantid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE authentication_group (
    authenticationgroupid VARCHAR2(64) PRIMARY KEY,
    tenantid VARCHAR2(64) NOT NULL,
    authenticationgroupname VARCHAR2(128) NOT NULL,
    authenticationgroupdescription VARCHAR2(256),
    defaultgroup BOOLEAN NOT NULL,
    markfordelete BOOLEAN NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE authentication_group_client_rel (
    authenticationgroupid VARCHAR2(64),
    clientid VARCHAR2(64) NOT NULL,
    PRIMARY KEY (authenticationgroupid, clientid),
    FOREIGN KEY (authenticationgroupid) REFERENCES authentication_group(authenticationgroupid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE authentication_group_user_rel (
    authenticationgroupid VARCHAR2(64),
    userid VARCHAR2(64) NOT NULL,
    PRIMARY KEY (authenticationgroupid, userid),
    FOREIGN KEY (authenticationgroupid) REFERENCES authentication_group(authenticationgroupid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE authorization_group (
    groupid VARCHAR2(64) PRIMARY KEY,
    tenantid VARCHAR2(64) NOT NULL,
    groupname VARCHAR2(128) NOT NULL,
    groupdescription VARCHAR2(256),
    defaultgroup BOOLEAN NOT NULL,
    allowforanonymoususers BOOLEAN NOT NULL,
    markfordelete BOOLEAN NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid) 
);

create TABLE authorization_group_user_rel (
    userid VARCHAR2(64) NOT NULL,
    groupid VARCHAR2(64) NOT NULL,
    PRIMARY KEY (userid, groupid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (groupid) REFERENCES authorization_group(groupid) 
);

create TABLE user_credential (
    userid VARCHAR2(64) NOT NULL,
    salt VARCHAR2(256) NOT NULL,
    hashedpassword VARCHAR2(256) NOT NULL,
    hashingalgorithm VARCHAR2(128) NOT NULL,
    datecreatedms NUMBER NOT NULL,
    PRIMARY KEY (userid, datecreatedms),
    FOREIGN KEY (userid) REFERENCES users(userid)    
);
CREATE INDEX user_credential_datecreatedms_idx ON user_credential(datecreatedms);

create TABLE signing_key (
    keyid VARCHAR2(64) PRIMARY KEY,
    keyname VARCHAR2(128) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    keytype VARCHAR2(64) NOT NULL,
    keyuse VARCHAR2(64) NOT NULL,    
    keypassword VARCHAR2(128),    
    expiresatms NUMBER NOT NULL,
    createdatms NUMBER NOT NULL,
    keystatus VARCHAR2(64),
    markfordelete BOOLEAN NOT NULL,
    privatekeypkcs8 VARCHAR2(8000) NOT NULL,
    keycertificate VARCHAR2(8000),
    publickey VARCHAR2(8000),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE rate_limit_service_group (
    servicegroupid VARCHAR2(64) PRIMARY KEY,
    servicegroupname VARCHAR2(128) NOT NULL,
    servicegroupdescription VARCHAR2(256),
    markfordelete BOOLEAN NOT NULL 
);
CREATE INDEX rate_limit_service_group_servicegroupname_idx on rate_limit_service_group(servicegroupname);

create TABLE scope (
    scopeid VARCHAR2(64) PRIMARY KEY,
    scopename VARCHAR2(128) UNIQUE NOT NULL,
    scopedescription VARCHAR2(256) NOT NULL,
    scopeuse VARCHAR2(64) NOT NULL,
    markfordelete BOOLEAN NOT NULL
);

create TABLE scope_access_rule_schema (
    scopeaccessruleschemaid VARCHAR2(64) PRIMARY KEY,
    scopeid VARCHAR2(64) NOT NULL,
    schemaversion INT NOT NULL,    
    scopeaccessruleschema BLOB,
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid)
);

create TABLE access_rule (
    accessruleid VARCHAR2(64) PRIMARY KEY,
    accessrulename VARCHAR2(128) NOT NULL,
    scopeaccessruleschemaid VARCHAR2(64) NOT NULL,
    accessruledefinition BLOB NOT NULL,
    FOREIGN KEY (scopeaccessruleschemaid) REFERENCES  scope_access_rule_schema(scopeaccessruleschemaid)
);

create TABLE rate_limit_service_group_scope_rel (
    servicegroupid VARCHAR2(64) NOT NULL,
    scopeid VARCHAR2(64) NOT NULL,
    PRIMARY KEY(servicegroupid, scopeid),
    FOREIGN KEY (servicegroupid) REFERENCES rate_limit_service_group(servicegroupid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid)    
);

create TABLE rate_limit (
    ratelimitid VARCHAR2(64) PRIMARY KEY,
    ratelimitname VARCHAR2(128) NOT NULL,
    servicegroupid VARCHAR2(64) NOT NULL,
    FOREIGN KEY (servicegroupid) REFERENCES rate_limit_service_group(servicegroupid)
);

create TABLE tenant_rate_limit_rel (
    servicegroupid VARCHAR2(64) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    allowunlimitedrate BOOLEAN NOT NULL,
    ratelimit INT,
    ratelimitperiodminutes INT,
    PRIMARY KEY (servicegroupid, tenantid),
    FOREIGN KEY (servicegroupid) REFERENCES rate_limit_service_group(servicegroupid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE tenant_available_scope (
    tenantid VARCHAR2(64) NOT NULL,
    scopeid VARCHAR2(64) NOT NULL,
    accessruleid VARCHAR2(64),
    PRIMARY KEY (tenantid, scopeid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (accessruleid) REFERENCES access_rule(accessruleid)
);

create TABLE client_scope_rel (
    scopeid VARCHAR2(64) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    clientid VARCHAR2(64) NOT NULL,
    PRIMARY KEY (scopeid, tenantid, clientid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (tenantid, scopeid) REFERENCES tenant_available_scope(tenantid, scopeid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE authorization_group_scope_rel (
    scopeid VARCHAR2(64) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    groupid VARCHAR2(64) NOT NULL,
    PRIMARY KEY (scopeid, tenantid, groupid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (tenantid, scopeid) REFERENCES tenant_available_scope(tenantid, scopeid),
    FOREIGN KEY (groupid) REFERENCES authorization_group(groupid)
);

create TABLE user_scope_rel (
    userid VARCHAR2(64) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    scopeid VARCHAR2(64) NOT NULL,
    PRIMARY KEY (userid, tenantid, scopeid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid, scopeid) REFERENCES tenant_available_scope(tenantid, scopeid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid)
);

create TABLE pre_authentication_state (
    token VARCHAR2(128) NOT NULL PRIMARY KEY,
    state VARCHAR2(128) NOT NULL,
    redirecturi VARCHAR2(256) NOT NULL,
    codechallenge VARCHAR2(256),
    codechallengemethod VARCHAR2(32),
    responsemode VARCHAR2(64) NOT NULL,
    responsetype VARCHAR2(64) NOT NULL,
    scope VARCHAR2(128) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    clientid VARCHAR2(64) NOT NULL,
    expiresatms NUMBER NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE authorization_code_data (
    code VARCHAR2(128) NOT NULL PRIMARY KEY,
    redirecturi VARCHAR2(256) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    clientid VARCHAR2(64) NOT NULL,
    scope VARCHAR2(128) NOT NULL,
    codechallenge VARCHAR2(256),
    codechallengemethod VARCHAR2(32),
    userid VARCHAR2(64) NOT NULL,
    expiresatms NUMBER NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);


create TABLE authorization_device_code_data (
    devicecodeid VARCHAR2(64) NOT NULL PRIMARY KEY,
    devicecode VARCHAR2(128) NOT NULL,    
    usercode VARCHAR2(128) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    clientid VARCHAR2(64) NOT NULL,
    scope VARCHAR2(128) NOT NULL,
    expiresatms NUMBER NOT NULL,
    authorizationstatus VARCHAR2(64) NOT NULL,
    userid VARCHAR2(64),    
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);
CREATE INDEX authorization_device_code_data_devicecode_idx ON authorization_device_code_data(devicecode);
CREATE INDEX authorization_device_code_data_usercode_idx ON authorization_device_code_data(usercode);


create TABLE refresh_data (
    refreshtoken VARCHAR2(256) NOT NULL PRIMARY KEY,
    redirecturi VARCHAR2(256) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    clientid VARCHAR2(64) NOT NULL,
    userid VARCHAR2(64) NOT NULL,
    scope VARCHAR2(1024) NOT NULL,
    refreshtokenclienttype VARCHAR2(128) NOT NULL,
    refreshcount INT,
    codechallenge VARCHAR2(256),
    codechallengemethod VARCHAR2(32),
    expiresatms NUMBER NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);
CREATE INDEX refresh_data_user_id_idx ON refresh_data(userid);
CREATE INDEX refresh_data_client_id_idx ON refresh_data(clientid);
CREATE INDEX refresh_data_tenant_id_idx ON refresh_data(tenantid);

create TABLE federated_oidc_authorization_rel (
    state VARCHAR2(256) NOT NULL PRIMARY KEY,
    federatedoidcauthorizationreltype VARCHAR2(64) NOT NULL,
    email VARCHAR2(128),
    userid VARCHAR2(64),
    codeverifier VARCHAR2(256),
    codechallengemethod VARCHAR2(16),
    federatedoidcproviderid VARCHAR2(64) NOT NULL,
    initstate VARCHAR2(256) NOT NULL,
    initredirecturi VARCHAR2(256) NOT NULL,
    inittenantid VARCHAR2(64) NOT NULL,
    initclientid VARCHAR2(64),
    initscope VARCHAR2(128) NOT NULL,
    initcodechallengemethod VARCHAR2(16),
    initcodechallenge VARCHAR2(256),
    initresponsemode VARCHAR2(64),
    initresponsetype VARCHAR2(64),
    expiresatms NUMBER NOT NULL,    
    FOREIGN KEY (inittenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (initclientid) REFERENCES client(clientid),
    FOREIGN KEY (federatedoidcproviderid) REFERENCES federated_oidc_provider(federatedoidcproviderid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE client_auth_history (
    jti VARCHAR2(256) NOT NULL PRIMARY KEY,
    tenantid VARCHAR2(64) NOT NULL,
    clientid VARCHAR2(64) NOT NULL,
    expiresatseconds NUMBER NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE change_event (
    changeeventid VARCHAR2(64) NOT NULL,
    objectid VARCHAR2(64) NOT NULL,    
    changeeventtype VARCHAR2(128) NOT NULL,
    changeeventclass VARCHAR2(128) NOT NULL,
    changetimestamp NUMBER NOT NULL,
    changedby VARCHAR2(128) NOT NULL,
    data BLOB NOT NULL,	
    PRIMARY KEY (changeeventid, objectid)	
);
CREATE INDEX change_event_objectid_idx ON change_event(objectid);
CREATE INDEX change_event_changeeventclass_idx ON change_event(changeeventclass);

create TABLE tenant_anonymous_user_configuration (
    tenantid VARCHAR2(64) PRIMARY KEY,
    defaultcountrycode VARCHAR2(8) NOT NULL,
    defaultlanguagecode VARCHAR2(8) NOT NULL,
    tokenttlseconds INT NOT NULL,    
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);


create TABLE tenant_look_and_feel (
    tenantid VARCHAR2(64) PRIMARY KEY,
    adminheaderbackgroundcolor VARCHAR2(32),
    adminheadertextcolor VARCHAR2(32),
    adminheadertext VARCHAR2(128),
    authenticationheaderbackgroundcolor VARCHAR2(32),
    authenticationheadertextcolor VARCHAR2(32),    
    authenticationlogouri VARCHAR2(256),
    authenticationlogomimetype VARCHAR2(16),
    authenticationheadertext VARCHAR2(128),
    authenticationlogo BLOB,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE footer_link (
    footerlinkid VARCHAR2(64) PRIMARY KEY,
    tenantid VARCHAR2(64) NOT NULL,
    linktext VARCHAR2(256) NOT NULL,
    uri VARCHAR2(256) NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE contact (
    contactid VARCHAR2(64) PRIMARY KEY,
    objectid VARCHAR2(64) NOT NULL,
    objecttype VARCHAR2(64) NOT NULL,
    email VARCHAR2(128) NOT NULL,
    contactname VARCHAR2(128),
    userid VARCHAR2(64)
);
CREATE INDEX contact_objectid_idx ON contact(objectid);
CREATE INDEX contact_objecttype_idx on contact(objecttype);
CREATE INDEX contact_email_idx ON contact(email);


create TABLE scheduler_lock (
    lockname VARCHAR2(128) NOT NULL,
    lockinstanceid VARCHAR2(128) NOT NULL,
    lockstarttimems NUMBER NOT NULL,
    lockexpiresatms NUMBER NOT NULL,
    PRIMARY KEY (lockname, lockinstanceid)
);

create TABLE tenant_password_config (
    tenantid VARCHAR2(64) NOT NULL,
    passwordminlength INT NOT NULL,
    passwordmaxlength INT NOT NULL,
    passwordhashingalgorithm VARCHAR2(128) NOT NULL,
    requireuppercase BOOLEAN NOT NULL,
	requirelowercase BOOLEAN NOT NULL,
	requirenumbers BOOLEAN NOT NULL,
	requirespecialcharacters BOOLEAN NOT NULL,
	specialcharactersallowed VARCHAR2(64),
    requiremfa BOOLEAN NOT NULL,
    mfatypesrequired VARCHAR2(128),
    maxrepeatingcharacterlength INT,
    passwordrotationperioddays INT,
    passwordhistoryperiod INT,
    PRIMARY KEY (tenantid),
    FOREIGN KEY (tenantid) references tenant(tenantid)
);

create TABLE prohibited_passwords (
    password VARCHAR2(128) NOT NULL PRIMARY KEY
);

create TABLE user_failed_login (
    userid VARCHAR2(64) NOT NULL,
    failureatms NUMBER NOT NULL,
    nextloginnotbefore NUMBER NOT NULL,
    failurecount INT NOT NULL,
    PRIMARY KEY (userid, failureatms),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE user_verification_token (
    token VARCHAR2(256) PRIMARY KEY,
    userid VARCHAR2(64) NOT NULL,
    verificationtype VARCHAR2(64) NOT NULL,
    issuedatms NUMBER NOT NULL,
    expiresatms NUMBER NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE user_mfa_rel (
    userid VARCHAR2(64) NOT NULL,
    primarymfa BOOLEAN NOT NULL,
    mfatype VARCHAR2(64) NOT NULL,
    totpsecret VARCHAR2(1024),
    totphashalgorithm VARCHAR2(32),
    fido2publickey VARCHAR2(4000),
    fido2credentialid VARCHAR2(1024),
    fido2publickeyalgorithm INT,
    fido2transports VARCHAR2(1024),
    fido2keysupportscounters BOOLEAN,
    PRIMARY KEY (userid, mfatype),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE user_fido2_counter_rel (
    userid VARCHAR2(64) PRIMARY KEY,
    fido2counter NUMBER,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE user_fido2_challenge (
    userid VARCHAR2(64) PRIMARY KEY,
    challenge VARCHAR2(2048) NOT NULL,
    issuedatms NUMBER NOT NULL,
    expiresatms NUMBER NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE tenant_legacy_user_migration_config (
    tenantid VARCHAR2(64) PRIMARY KEY,
    authenticationuri VARCHAR2(256) NOT NULL,
    userprofileuri VARCHAR2(256) NOT NULL,
    usernamecheckuri VARCHAR (256) NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE mark_for_delete (
	markfordeleteid VARCHAR2(64) NOT NULL PRIMARY KEY,
	objectid VARCHAR2(64) NOT NULL,
	objecttype VARCHAR2(128) NOT NULL,
	submittedby VARCHAR2(128) NOT NULL,
	submitteddate NUMBER NOT NULL,
    starteddate NUMBER,
	completeddate NUMBER
);

create TABLE deletion_status (
	markfordeleteid VARCHAR2(64) NOT NULL,
	step VARCHAR2(128) NOT NULL,
	startedat NUMBER NOT NULL,
	completedat NUMBER,
	FOREIGN KEY (markfordeleteid) REFERENCES mark_for_delete(markfordeleteid)
);

create TABLE country (
    isocountrycode VARCHAR2(8) NOT NULL PRIMARY KEY,
    countryname VARCHAR2(128) NOT NULL
);

create TABLE state_province_region (
    isocountrycode VARCHAR2(8) NOT NULL,
    isoentrycode VARCHAR2(8) NOT NULL,
    isoentryname VARCHAR2(128) NOT NULL,
    isosubsettype VARCHAR2(64) NOT NULL,
    PRIMARY KEY (isocountrycode, isoentrycode), 
	FOREIGN KEY (isocountrycode) REFERENCES country(isocountrycode)	
);

create TABLE user_authentication_state (
    userid VARCHAR2(64) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    authenticationsessiontoken VARCHAR2(128) NOT NULL,    
    authenticationstate VARCHAR2(64) NOT NULL,
    authenticationstateorder INT NOT NULL,
    authenticationstatestatus VARCHAR2(32) NOT NULL,
    preauthtoken VARCHAR2(128),
    expiresatms NUMBER NOT NULL,
    returntouri VARCHAR2(256),
    devicecodeid VARCHAR2(64),
    PRIMARY KEY (userid, authenticationsessiontoken, authenticationstate),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid) 
);

create TABLE user_registration_state (
    userid VARCHAR2(64) NOT NULL,
    email VARCHAR2(128) NOT NULL,
    tenantid VARCHAR2(64) NOT NULL,
    registrationsessiontoken VARCHAR2(128) NOT NULL,    
    registrationstate VARCHAR2(64) NOT NULL,
    registrationstateorder INT NOT NULL,
    registrationstatestatus VARCHAR2(32) NOT NULL,
    preauthtoken VARCHAR2(128),
    expiresatms NUMBER NOT NULL,
    devicecodeid VARCHAR2(64),
    PRIMARY KEY (userid, registrationsessiontoken, registrationstate),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid) 
);

create TABLE user_profile_email_change_state (
    userid VARCHAR2(64) NOT NULL,
    email VARCHAR2(128) NOT NULL,
    emailchangestate VARCHAR2(64) NOT NULL,
    changeemailsessiontoken VARCHAR2(128) NOT NULL,
    changeorder INT NOT NULL,
    changestatestatus VARCHAR2(32) NOT NULL,
    expiresatms NUMBER NOT NULL,
    isprimaryemail BOOLEAN NOT NULL,
    PRIMARY KEY (userid, changeemailsessiontoken, emailchangestate),
    FOREIGN KEY (userid) REFERENCES users(userid) 
);

create TABLE captcha_config (
    alias VARCHAR2(256) PRIMARY KEY,
    projectid VARCHAR2(128),
    sitekey VARCHAR2(256) NOT NULL,
    apikey VARCHAR2(256) NOT NULL,
    minscorethreshold FLOAT,
    userecaptchav3 BOOLEAN NOT NULL,
    useenterprisecaptcha BOOLEAN NOT NULL
);

create TABLE system_settings (
    systemid VARCHAR2(64) PRIMARY KEY,
    allowrecoveryemail BOOLEAN NOT NULL,
    allowduresspassword BOOLEAN NOT NULL,
    rootclientid VARCHAR2(64) NOT NULL,
    enableportalaslegacyidp BOOLEAN NOT NULL,
    auditrecordretentionperioddays INT,
    noreplyemail VARCHAR2(64),
    contactemail VARCHAR2(64),
    FOREIGN KEY (rootclientid) REFERENCES client(clientid)
);

create TABLE user_duress_credential (
    userid VARCHAR2(64) NOT NULL,
    salt VARCHAR2(256) NOT NULL,
    hashedpassword VARCHAR2(256) NOT NULL,
    hashingalgorithm VARCHAR2(128) NOT NULL,
    datecreatedms NUMBER NOT NULL,
    PRIMARY KEY (userid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE secret_share (
    secretshareid VARCHAR2(64) NOT NULL PRIMARY KEY,
    objectid VARCHAR2(64) NOT NULL,
    objectype VARCHAR2(64) NOT NULL,
    otp VARCHAR2(128) NOT NULL,
    expiresatms NUMBER
);
CREATE INDEX secret_share_otp_idx ON secret_share(otp);

create TABLE user_authentication_history (
    userid VARCHAR2(64) NOT NULL,
    lastauthenticationatms NUMBER NOT NULL,
    PRIMARY KEY (userid, lastauthenticationatms),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE federated_auth_test (
    authstate             VARCHAR2(128) PRIMARY KEY,	
	clientid              VARCHAR2(64) NOT NULL,
	clientsecret          VARCHAR2(256),
	usepkce               BOOLEAN NOT NULL,
	codeverifier          VARCHAR2(128),
	wellknownuri          VARCHAR2(128) NOT NULL,
	scope                 VARCHAR2(64) NOT NULL,
	redirecturi           VARCHAR2(128) NOT NULL,
    clientauthtype        VARCHAR2(32) NOT NULL,
	expiresatms           NUMBER NOT NULL
);
