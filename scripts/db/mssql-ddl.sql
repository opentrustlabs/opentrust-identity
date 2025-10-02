-- MSSQL
-- =====


create TABLE federated_oidc_provider(
    federatedoidcproviderid VARCHAR(64) PRIMARY KEY,
    federatedoidcprovidername NVARCHAR(128) NOT NULL,
    federatedoidcproviderdescription NVARCHAR(256),
    federatedoidcprovidertenantid VARCHAR(64),
    federatedoidcproviderclientid varchar(128) NOT NULL,
    federatedoidcproviderclientsecret varchar(256),
    federatedoidcproviderwellknownuri varchar(512) NOT NULL,
    refreshtokenallowed BIT NOT NULL,
    scopes varchar(256),
    usepkce BIT NOT NULL,
    clientauthtype varchar(128) NOT NULL,
    federatedoidcprovidertype varchar(128) NOT NULL,
    socialloginprovider VARCHAR(128),
    markfordelete BIT NOT NULL
);

create TABLE tenant (
    tenantid VARCHAR(64) PRIMARY KEY,
    tenantname NVARCHAR(128) NOT NULL,
    tenantdescription NVARCHAR(256),
    enabled BIT NOT NULL,
    allowunlimitedrate BIT NOT NULL,
    allowuserselfregistration BIT NOT NULL,
    allowanonymoususers BIT NOT NULL,
    allowsociallogin BIT NOT NULL,
    verifyemailonselfregistration BIT NOT NULL,
    federatedauthenticationconstraint VARCHAR(128) NOT NULL,
    markfordelete BIT NOT NULL,
    tenanttype VARCHAR(128) NOT NULL,
    migratelegacyusers BIT NOT NULL,
    allowloginbyphonenumber BIT NOT NULL,
    allowforgotpassword BIT NOT NULL,
    defaultratelimit INT,
    defaultratelimitperiodminutes INT,
    registrationrequiretermsandconditions BIT NOT NULL,
    termsandconditionsuri VARCHAR(256),
    registrationrequirecaptcha BIT NOT NULL
);
CREATE INDEX tenant_tenant_type_idx ON tenant(tenanttype);

create TABLE tenant_login_failure_policy (
    tenantid VARCHAR(64) PRIMARY KEY,
    loginfailurepolicytype VARCHAR(128) NOT NULL,
    failurethreshold INT NOT NULL,
    maximumloginfailures INT,
    pausedurationminutes INT,
    FOREIGN KEY (tenantid) references tenant(tenantid)
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
    clientsecret VARCHAR(256) NOT NULL,
    clientname NVARCHAR(128) NOT NULL,
    clientdescription NVARCHAR(256),
    enabled BIT NOT NULL,
    oidcenabled BIT NOT NULL,
    pkceenabled BIT NOT NULL,
    clienttype VARCHAR(128) NOT NULL,
    usertokenttlseconds INT,
    clienttokenttlseconds INT,
    maxrefreshtokencount INT,
    markfordelete BIT NOT NULL,
    audience VARCHAR(256),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE client_redirect_uri_rel (
    clientid VARCHAR(64) NOT NULL,
    redirecturi varchar(128) NOT NULL,
    PRIMARY KEY (clientid, redirecturi),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE users (
    userid VARCHAR(64) PRIMARY KEY,
    federatedoidcprovidersubjectid VARCHAR(128),
    email NVARCHAR(128) UNIQUE NOT NULL,
    emailverified BIT NOT NULL,
    domain NVARCHAR(128) NOT NULL,
    firstname NVARCHAR(128) NOT NULL,
    lastname NVARCHAR(128) NOT NULL,
    middlename NVARCHAR(128),
    phonenumber VARCHAR(32),
    address NVARCHAR(128),
    addressline1 NVARCHAR(128),
    city NVARCHAR(128),
    postalcode VARCHAR(32),
    stateregionprovince VARCHAR(64),
    countrycode VARCHAR(8),
    preferredlanguagecode VARCHAR(8),
    locked BIT,
    enabled BIT NOT NULL,
    nameorder VARCHAR(64) NOT NULL,
    markfordelete BIT NOT NULL
);

CREATE INDEX users_email_idx on users(email);
CREATE INDEX users_domain_idx on users(domain);
CREATE INDEX users_first_name_idx on users(firstname);
CREATE INDEX users_last_name_idx on users(lastname);
CREATE INDEX users_phone_number_idx on users(phonenumber);
CREATE INDEX users_federatedoidcprovidersubjectid_idx on users(federatedoidcprovidersubjectid);

create TABLE user_email_recovery (
    userid VARCHAR(64) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    emailverified BIT NOT NULL,
    PRIMARY KEY (userid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);
CREATE INDEX user_email_recovery_email_idx on user_email_recovery(email);

create TABLE user_tenant_rel (
    userid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    enabled BIT NOT NULL,
    reltype VARCHAR(32) NOT NULL,
    PRIMARY KEY (userid, tenantid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE user_terms_and_conditions_accepted (
    userid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    acceptedatms BIGINT NOT NULL,
    PRIMARY KEY (userid, tenantid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE authentication_group (
    authenticationgroupid VARCHAR(64) PRIMARY KEY,
    tenantid VARCHAR(64) NOT NULL,
    authenticationgroupname NVARCHAR(128) NOT NULL,
    authenticationgroupdescription NVARCHAR(256),
    defaultgroup BIT NOT NULL,
    markfordelete BIT NOT NULL,
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
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE authorization_group (
    groupid VARCHAR(64) PRIMARY KEY,
    tenantid VARCHAR(64) NOT NULL,
    groupname NVARCHAR(128) NOT NULL,
    groupdescription NVARCHAR(256),
    defaultgroup BIT NOT NULL,
    allowforanonymoususers BIT NOT NULL,
    markfordelete BIT NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid) 
);

create TABLE authorization_group_user_rel (
    userid VARCHAR(64) NOT NULL,
    groupid VARCHAR(64) NOT NULL,
    PRIMARY KEY (userid, groupid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (groupid) REFERENCES authorization_group(groupid) 
);

create TABLE user_credential (
    userid VARCHAR(64) NOT NULL,
    salt varchar(256) NOT NULL,
    hashedpassword VARCHAR(256) NOT NULL,
    hashingalgorithm VARCHAR(128) NOT NULL,
    datecreatedms BIGINT NOT NULL,
    PRIMARY KEY (userid, datecreatedms),
    FOREIGN KEY (userid) REFERENCES users(userid)
);
CREATE INDEX user_credential_date_createdms_idx ON user_credential(datecreatedms);

create TABLE signing_key (
    keyid VARCHAR(64) PRIMARY KEY,
    keyname NVARCHAR(128) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    keytype VARCHAR(64) NOT NULL,
    keyuse VARCHAR(64) NOT NULL,    
    keypassword VARCHAR(128),    
    expiresatms BIGINT NOT NULL,
    createdatms BIGINT NOT NULL,
    keystatus VARCHAR(64),
    markfordelete BIT NOT NULL,
    privatekeypkcs8 VARCHAR(8000) NOT NULL,
    keycertificate VARCHAR(8000),
    publickey VARCHAR(8000),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE rate_limit_service_group (
    servicegroupid VARCHAR(64) PRIMARY KEY,
    servicegroupname NVARCHAR(128) NOT NULL,
    servicegroupdescription NVARCHAR(256),
    markfordelete BIT NOT NULL 
);
CREATE INDEX rate_limit_service_group_servicegroupname_idx on rate_limit_service_group(servicegroupname);

create TABLE scope (
    scopeid VARCHAR(64) PRIMARY KEY,
    scopename VARCHAR(128) UNIQUE NOT NULL,
    scopedescription NVARCHAR(256) NOT NULL,
    scopeuse VARCHAR(64) NOT NULL,
    markfordelete BIT NOT NULL
);

create TABLE scope_access_rule_schema (
    scopeaccessruleschemaid VARCHAR(64) PRIMARY KEY,
    scopeid VARCHAR(64) NOT NULL,
    schemaversion INT NOT NULL,    
    scopeaccessruleschema VARBINARY(max),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid)
);

create TABLE access_rule (
    accessruleid VARCHAR(64) PRIMARY KEY,
    accessrulename NVARCHAR(128) NOT NULL,
    scopeaccessruleschemaid VARCHAR(64) NOT NULL,
    accessruledefinition VARBINARY(max) NOT NULL,
    FOREIGN KEY (scopeaccessruleschemaid) REFERENCES  scope_access_rule_schema(scopeaccessruleschemaid)
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
    ratelimitname NVARCHAR(128) NOT NULL,
    servicegroupid VARCHAR(64) NOT NULL,
    FOREIGN KEY (servicegroupid) REFERENCES rate_limit_service_group(servicegroupid)
);

create TABLE tenant_rate_limit_rel (
    servicegroupid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    allowunlimitedrate BIT NOT NULL,
    ratelimit INT,
    ratelimitperiodminutes INT,
    PRIMARY KEY (servicegroupid, tenantid),
    FOREIGN KEY (servicegroupid) REFERENCES rate_limit_service_group(servicegroupid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE tenant_available_scope (
    tenantid VARCHAR(64) NOT NULL,
    scopeid VARCHAR(64) NOT NULL,
    accessruleid VARCHAR(64),
    PRIMARY KEY (tenantid, scopeid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (accessruleid) REFERENCES access_rule(accessruleid)
);

create TABLE client_scope_rel (
    scopeid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    PRIMARY KEY (scopeid, tenantid, clientid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (tenantid, scopeid) REFERENCES tenant_available_scope(tenantid, scopeid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE authorization_group_scope_rel (
    scopeid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    groupid VARCHAR(64) NOT NULL,
    PRIMARY KEY (scopeid, tenantid, groupid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid),
    FOREIGN KEY (tenantid, scopeid) REFERENCES tenant_available_scope(tenantid, scopeid),
    FOREIGN KEY (groupid) REFERENCES authorization_group(groupid)
);

create TABLE user_scope_rel (
    userid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    scopeid VARCHAR(64) NOT NULL,
    PRIMARY KEY (userid, tenantid, scopeid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid, scopeid) REFERENCES tenant_available_scope(tenantid, scopeid),
    FOREIGN KEY (scopeid) REFERENCES scope(scopeid)
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
    FOREIGN KEY (userid) REFERENCES users(userid)
);


create TABLE authorization_device_code_data (
    devicecodeid VARCHAR(64) NOT NULL PRIMARY KEY,
    devicecode VARCHAR(128) NOT NULL,    
    usercode VARCHAR(128) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    scope VARCHAR(128) NOT NULL,
    expiresatms BIGINT NOT NULL,
    authorizationstatus VARCHAR(64) NOT NULL,
    userid VARCHAR(64),    
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);
CREATE INDEX authorization_device_code_data_devicecode_idx ON authorization_device_code_data(devicecode);
CREATE INDEX authorization_device_code_data_usercode_idx ON authorization_device_code_data(usercode);


create TABLE refresh_data (
    refreshtoken VARCHAR(256) NOT NULL PRIMARY KEY,
    redirecturi VARCHAR(256) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    userid VARCHAR(64) NOT NULL,
    scope VARCHAR(1024) NOT NULL,
    refreshtokenclienttype VARCHAR(128) NOT NULL,
    refreshcount INT,
    codechallenge VARCHAR(256),
    codechallengemethod VARCHAR(32),
    expiresatms BIGINT NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);
CREATE INDEX refresh_data_user_id_idx ON refresh_data(userid);
CREATE INDEX refresh_data_client_id_idx ON refresh_data(clientid);
CREATE INDEX refresh_data_tenant_id_idx ON refresh_data(tenantid);

create TABLE federated_oidc_authorization_rel (
    state VARCHAR(256) NOT NULL PRIMARY KEY,
    federatedoidcauthorizationreltype VARCHAR(64) NOT NULL,
    email VARCHAR(128),
    userid VARCHAR(64),
    codeverifier VARCHAR(256),
    codechallengemethod VARCHAR(16),
    federatedoidcproviderid VARCHAR(64) NOT NULL,
    initstate VARCHAR(256) NOT NULL,
    initredirecturi VARCHAR(256) NOT NULL,
    inittenantid VARCHAR(64) NOT NULL,
    initclientid VARCHAR(64),
    initscope VARCHAR(128) NOT NULL,
    initcodechallengemethod VARCHAR(16),
    initcodechallenge varchar(256),
    initresponsemode VARCHAR(64),
    initresponsetype VARCHAR(64),
    expiresatms BIGINT NOT NULL,    
    FOREIGN KEY (inittenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (initclientid) REFERENCES client(clientid),
    FOREIGN KEY (federatedoidcproviderid) REFERENCES federated_oidc_provider(federatedoidcproviderid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE client_auth_history (
    jti VARCHAR(256) NOT NULL PRIMARY KEY,
    tenantid VARCHAR(64) NOT NULL,
    clientid VARCHAR(64) NOT NULL,
    expiresatseconds BIGINT NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid),
    FOREIGN KEY (clientid) REFERENCES client(clientid)
);

create TABLE change_event (
    changeeventid VARCHAR(64) NOT NULL,
    objectid VARCHAR(64) NOT NULL,    
    changeeventtype VARCHAR(128) NOT NULL,
    changeeventclass VARCHAR(128) NOT NULL,
    changetimestamp BIGINT NOT NULL,
    changedby VARCHAR(128) NOT NULL,
    data VARBINARY(max) NOT NULL,	
    PRIMARY KEY (changeeventid, objectid)	
);
CREATE INDEX change_event_objectid_idx ON change_event(objectid);
CREATE INDEX change_event_changeeventclass_idx ON change_event(changeeventclass);

create TABLE tenant_anonymous_user_configuration (
    tenantid VARCHAR(64) PRIMARY KEY,
    defaultcountrycode VARCHAR(8) NOT NULL,
    defaultlanguagecode VARCHAR(8) NOT NULL,
    tokenttlseconds INT NOT NULL,    
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);


create TABLE tenant_look_and_feel (
    tenantid VARCHAR(64) PRIMARY KEY,
    adminheaderbackgroundcolor VARCHAR(32),
    adminheadertextcolor VARCHAR(32),    
    adminheadertext VARCHAR(128),
    authenticationheaderbackgroundcolor VARCHAR(32),
    authenticationheadertextcolor VARCHAR(32),    
    authenticationlogouri VARCHAR(256),
    authenticationlogomimetype VARCHAR(16),
    authenticationheadertext VARCHAR(128),
    authenticationlogo VARBINARY(max),
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
    contactid VARCHAR(64) PRIMARY KEY,
    objectid VARCHAR(64) NOT NULL,
    objecttype VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL,
    contactname NVARCHAR(128),
    userid VARCHAR(64)
);
CREATE INDEX contact_objectid_idx ON contact(objectid);
CREATE INDEX contact_objecttype_idx on contact(objecttype);
CREATE INDEX contact_email_idx ON contact(email);


create TABLE scheduler_lock (
    lockname VARCHAR(128) NOT NULL,
    lockinstanceid VARCHAR(128) NOT NULL,
    lockstarttimems BIGINT NOT NULL,
    lockexpiresatms BIGINT NOT NULL,
    PRIMARY KEY (lockname, lockinstanceid)
);

create TABLE tenant_password_config (
    tenantid VARCHAR(64) NOT NULL,
    passwordminlength INT NOT NULL,
    passwordmaxlength INT NOT NULL,
    passwordhashingalgorithm VARCHAR(128) NOT NULL,
    requireuppercase BIT NOT NULL,
	requirelowercase BIT NOT NULL,
	requirenumbers BIT NOT NULL,
	requirespecialcharacters BIT NOT NULL,
	specialcharactersallowed VARCHAR(64),
    requiremfa BIT NOT NULL,
    mfatypesrequired VARCHAR(128),
    maxrepeatingcharacterlength INT,
    passwordrotationperioddays INT,
    passwordhistoryperiod INT,
    PRIMARY KEY (tenantid),
    FOREIGN KEY (tenantid) references tenant(tenantid)
);

create TABLE prohibited_passwords (
    password VARCHAR(128) NOT NULL PRIMARY KEY
);

create TABLE user_failed_login (
    userid VARCHAR(64) NOT NULL,
    failureatms BIGINT NOT NULL,
    nextloginnotbefore BIGINT NOT NULL,
    failurecount INT NOT NULL,
    PRIMARY KEY (userid, failureatms),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE user_verification_token (
    token VARCHAR(256) PRIMARY KEY,
    userid VARCHAR(64) NOT NULL,
    verificationtype VARCHAR(64) NOT NULL,
    issuedatms BIGINT NOT NULL,
    expiresatms BIGINT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE user_mfa_rel (
    userid VARCHAR(64) NOT NULL,
    primarymfa BIT NOT NULL,
    mfatype VARCHAR(64) NOT NULL,
    totpsecret VARCHAR(1024),
    totphashalgorithm VARCHAR(32),
    fido2publickey VARCHAR(4000),
    fido2credentialid VARCHAR(1024),
    fido2publickeyalgorithm INT,
    fido2transports VARCHAR(1024),
    fido2keysupportscounters BIT,
    PRIMARY KEY (userid, mfatype),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE user_fido2_counter_rel (
    userid VARCHAR(64) PRIMARY KEY,
    fido2counter BIGINT,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE user_fido2_challenge (
    userid VARCHAR(64) PRIMARY KEY,
    challenge VARCHAR(2048) NOT NULL,
    issuedatms BIGINT NOT NULL,
    expiresatms BIGINT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE tenant_legacy_user_migration_config (
    tenantid VARCHAR(64) PRIMARY KEY,
    authenticationuri VARCHAR(256) NOT NULL,
    userprofileuri VARCHAR(256) NOT NULL,
    usernamecheckuri VARCHAR (256) NOT NULL,
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid)
);

create TABLE mark_for_delete (
	markfordeleteid VARCHAR(64) NOT NULL PRIMARY KEY,
	objectid VARCHAR(64) NOT NULL,
	objecttype VARCHAR(128) NOT NULL,
	submittedby VARCHAR(128) NOT NULL,
	submitteddate BIGINT NOT NULL,
    starteddate BIGINT,
	completeddate BIGINT
);

create TABLE deletion_status (
	markfordeleteid VARCHAR(64) NOT NULL,
	step VARCHAR(128) NOT NULL,
	startedat BIGINT NOT NULL,
	completedat BIGINT,
	FOREIGN KEY (markfordeleteid) REFERENCES mark_for_delete(markfordeleteid)
);

create TABLE country (
    isocountrycode VARCHAR(8) NOT NULL PRIMARY KEY,
    countryname VARCHAR(128) NOT NULL
);

create TABLE state_province_region (
    isocountrycode VARCHAR(8) NOT NULL,
    isoentrycode VARCHAR(8) NOT NULL,
    isoentryname VARCHAR(128) NOT NULL,
    isosubsettype VARCHAR(64) NOT NULL,
    PRIMARY KEY (isocountrycode, isoentrycode), 
	FOREIGN KEY (isocountrycode) REFERENCES country(isocountrycode)	
);

create TABLE user_authentication_state (
    userid VARCHAR(64) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    authenticationsessiontoken VARCHAR(128) NOT NULL,    
    authenticationstate VARCHAR(64) NOT NULL,
    authenticationstateorder INT NOT NULL,
    authenticationstatestatus VARCHAR(32) NOT NULL,
    preauthtoken VARCHAR(128),
    expiresatms BIGINT NOT NULL,
    returntouri VARCHAR(256),
    devicecodeid VARCHAR(64),
    PRIMARY KEY (userid, authenticationsessiontoken, authenticationstate),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid) 
);

create TABLE user_registration_state (
    userid VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL,
    tenantid VARCHAR(64) NOT NULL,
    registrationsessiontoken VARCHAR(128) NOT NULL,    
    registrationstate VARCHAR(64) NOT NULL,
    registrationstateorder INT NOT NULL,
    registrationstatestatus VARCHAR(32) NOT NULL,
    preauthtoken VARCHAR(128),
    expiresatms BIGINT NOT NULL,
    devicecodeid VARCHAR(64),
    PRIMARY KEY (userid, registrationsessiontoken, registrationstate),
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (tenantid) REFERENCES tenant(tenantid) 
);

create TABLE user_profile_email_change_state (
    userid VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL,
    emailchangestate VARCHAR(64) NOT NULL,
    changeemailsessiontoken VARCHAR(128) NOT NULL,
    changeorder INT NOT NULL,
    changestatestatus VARCHAR(32) NOT NULL,
    expiresatms BIGINT NOT NULL,
    isprimaryemail BIT NOT NULL,
    PRIMARY KEY (userid, changeemailsessiontoken, emailchangestate),
    FOREIGN KEY (userid) REFERENCES users(userid) 
);

create TABLE captcha_config (
    alias VARCHAR(256) PRIMARY KEY,
    projectid VARCHAR(128),
    sitekey VARCHAR(256) NOT NULL,
    apikey VARCHAR(256) NOT NULL,
    minscorethreshold FLOAT,
    userecaptchav3 BIT NOT NULL,
    useenterprisecaptcha BIT NOT NULL
);

create TABLE system_settings (
    systemid VARCHAR(64) PRIMARY KEY,
    allowrecoveryemail BIT NOT NULL,
    allowduresspassword BIT NOT NULL,
    rootclientid VARCHAR(64) NOT NULL,
    enableportalaslegacyidp BIT NOT NULL,
    auditrecordretentionperioddays INT,
    noreplyemail VARCHAR(64),
    contactemail VARCHAR(64),
    FOREIGN KEY (rootclientid) REFERENCES client(clientid)
);

create TABLE user_duress_credential (
    userid VARCHAR(64) NOT NULL,
    salt varchar(256) NOT NULL,
    hashedpassword VARCHAR(256) NOT NULL,
    hashingalgorithm VARCHAR(128) NOT NULL,
    datecreatedms BIGINT NOT NULL,
    PRIMARY KEY (userid),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE secret_share (
    secretshareid VARCHAR(64) NOT NULL PRIMARY KEY,
    objectid VARCHAR(64) NOT NULL,
    objectype VARCHAR(64) NOT NULL,
    otp VARCHAR(128) NOT NULL,
    expiresatms BIGINT
);
CREATE INDEX secret_share_otp_idx ON secret_share(otp);

create TABLE user_authentication_history (
    userid VARCHAR(64) NOT NULL,
    lastauthenticationatms BIGINT NOT NULL,
    PRIMARY KEY (userid, lastauthenticationatms),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

create TABLE federated_auth_test (
    authstate             VARCHAR(128) PRIMARY KEY,	
	clientid              VARCHAR(64) NOT NULL,
	clientsecret          VARCHAR(256),
	usepkce               BIT NOT NULL,
	codeverifier          VARCHAR(128),
	wellknownuri          VARCHAR(128) NOT NULL,
	scope                 VARCHAR(64) NOT NULL,
	redirecturi           VARCHAR(128) NOT NULL,
    clientauthtype        VARCHAR(32) NOT NULL,
	expiresatms           BIGINT NOT NULL
);
