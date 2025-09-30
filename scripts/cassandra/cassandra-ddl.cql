


create TABLE federated_oidc_provider(
    federatedoidcproviderid UUID PRIMARY KEY,
    federatedoidcprovidername TEXT,
    federatedoidcproviderdescription TEXT,
    federatedoidcprovidertenantid TEXT,
    federatedoidcproviderclientid TEXT,
    federatedoidcproviderclientsecret TEXT,
    federatedoidcproviderwellknownuri TEXT,
    refreshtokenallowed BOOLEAN,
    scopes LIST<TEXT>,
    usepkce BOOLEAN,
    clientauthtype TEXT,
    federatedoidcprovidertype TEXT,
    socialloginprovider TEXT,
    markfordelete BOOLEAN 
);

create TABLE tenant (
    tenantid UUID,
    tenantname TEXT,
    tenantdescription TEXT,
    enabled BOOLEAN,
    allowunlimitedrate BOOLEAN,
    allowuserselfregistration BOOLEAN,
    allowanonymoususers BOOLEAN,
    allowsociallogin BOOLEAN,
    verifyemailonselfregistration BOOLEAN,
    federatedauthenticationconstraint TEXT,
    markfordelete BOOLEAN,
    tenanttype TEXT,
    migratelegacyusers BOOLEAN,
    allowloginbyphonenumber BOOLEAN,
    allowforgotpassword BOOLEAN,
    defaultratelimit INT,
    defaultratelimitperiodminutes INT,
    registrationrequiretermsandconditions BOOLEAN,
    termsandconditionsuri TEXT,
    registrationrequirecaptcha BOOLEAN,
    PRIMARY KEY(tenantid)
);

create TABLE root_tenant (
    tenantid UUID,
    tenantname TEXT,
    tenantdescription TEXT,
    enabled BOOLEAN,
    allowunlimitedrate BOOLEAN,
    allowuserselfregistration BOOLEAN,
    allowanonymoususers BOOLEAN,
    allowsociallogin BOOLEAN,
    verifyemailonselfregistration BOOLEAN,
    federatedauthenticationconstraint TEXT,
    markfordelete BOOLEAN,
    tenanttype TEXT,
    migratelegacyusers BOOLEAN,
    allowloginbyphonenumber BOOLEAN,
    allowforgotpassword BOOLEAN,
    defaultratelimit INT,
    defaultratelimitperiodminutes INT,
    registrationrequiretermsandconditions BOOLEAN,
    termsandconditionsuri TEXT,
    registrationrequirecaptcha BOOLEAN,
    PRIMARY KEY(tenantid)
);

create TABLE tenant_login_failure_policy (
    tenantid UUID PRIMARY KEY,
    loginfailurepolicytype TEXT,
    failurethreshold INT,
    maximumloginfailures INT,
    pausedurationminutes INT
);

create TABLE tenant_management_domain_rel (
    tenantid UUID,
    domain TEXT,
    PRIMARY KEY (tenantid, domain)
);

create TABLE tenant_management_domain_rel_by_domain (
    tenantid UUID,
    domain TEXT,
    PRIMARY KEY (domain, tenantid)
);


create TABLE tenant_restricted_authentication_domain_rel (
    tenantid UUID,
    domain TEXT,
    PRIMARY KEY (tenantid, domain)
);


create TABLE federated_oidc_provider_tenant_rel (
    federatedoidcproviderid UUID,
    tenantid UUID,
    PRIMARY KEY (federatedoidcproviderid, tenantid)
);

create TABLE federated_oidc_provider_tenant_rel_by_tenant (
    federatedoidcproviderid UUID,
    tenantid UUID,
    PRIMARY KEY (tenantid, federatedoidcproviderid)
);

create TABLE federated_oidc_provider_domain_rel (
    federatedoidcproviderid UUID,
    domain TEXT,
    PRIMARY KEY (federatedoidcproviderid, domain)
);

create TABLE federated_oidc_provider_domain_rel_by_domain (
    federatedoidcproviderid UUID,
    domain TEXT,
    PRIMARY KEY (domain, federatedoidcproviderid)
);


create TABLE client (
    clientid UUID,
    tenantid UUID,
    clientsecret TEXT,
    clientname TEXT,
    clientdescription TEXT,
    enabled BOOLEAN,
    oidcenabled BOOLEAN,
    pkceenabled BOOLEAN,
    clienttype TEXT,
    usertokenttlseconds INT,
    clienttokenttlseconds INT,
    maxrefreshtokencount INT,
    markfordelete BOOLEAN,
    audience TEXT,
    PRIMARY KEY (clientid, tenantid)
);

create TABLE client_by_tenant (
    clientid UUID,
    tenantid UUID,
    clientsecret TEXT,
    clientname TEXT,
    clientdescription TEXT,
    enabled BOOLEAN,
    oidcenabled BOOLEAN,
    pkceenabled BOOLEAN,
    clienttype TEXT,
    usertokenttlseconds INT,
    clienttokenttlseconds INT,
    maxrefreshtokencount INT,
    markfordelete BOOLEAN,
    audience TEXT,
	PRIMARY KEY (tenantid, clientid)
);


create TABLE client_redirect_uri_rel (
    clientid UUID,
    redirecturi TEXT,
    PRIMARY KEY (clientid, redirecturi)
);

create TABLE users (
    userid UUID PRIMARY KEY,
    federatedoidcprovidersubjectid TEXT,
    email TEXT,
    emailverified BOOLEAN,
    domain TEXT,
    firstname TEXT,
    lastname TEXT,
    middlename TEXT,
    phonenumber TEXT,
    address TEXT,
    addressline1 TEXT,
    city TEXT,
    postalcode TEXT,
    stateregionprovince TEXT,
    countrycode TEXT,
    preferredlanguagecode TEXT,
    locked BOOLEAN,
    enabled BOOLEAN,
    nameorder TEXT,
    markfordelete BOOLEAN 
);

create TABLE users_by_email (
    userid UUID,
    federatedoidcprovidersubjectid TEXT,
    email TEXT,
    emailverified BOOLEAN,
    domain TEXT,
    firstname TEXT,
    lastname TEXT,
    middlename TEXT,
    phonenumber TEXT,
    address TEXT,
    addressline1 TEXT,
    city TEXT,
    postalcode TEXT,
    stateregionprovince TEXT,
    countrycode TEXT,
    preferredlanguagecode TEXT,
    locked BOOLEAN,
    enabled BOOLEAN,
    nameorder TEXT,
    markfordelete BOOLEAN,
    PRIMARY KEY (email)
);

create TABLE users_by_phone_number (
    userid UUID,
    federatedoidcprovidersubjectid TEXT,
    email TEXT,
    emailverified BOOLEAN,
    domain TEXT,
    firstname TEXT,
    lastname TEXT,
    middlename TEXT,
    phonenumber TEXT,
    address TEXT,
    addressline1 TEXT,
    city TEXT,
    postalcode TEXT,
    stateregionprovince TEXT,
    countrycode TEXT,
    preferredlanguagecode TEXT,
    locked BOOLEAN,
    enabled BOOLEAN,
    nameorder TEXT,
    markfordelete BOOLEAN,
    PRIMARY KEY (phonenumber)
);

create TABLE users_by_federated_oidc_id (
    userid UUID,
    federatedoidcprovidersubjectid TEXT,
    email TEXT,
    emailverified BOOLEAN,
    domain TEXT,
    firstname TEXT,
    lastname TEXT,
    middlename TEXT,
    phonenumber TEXT,
    address TEXT,
    addressline1 TEXT,
    city TEXT,
    postalcode TEXT,
    stateregionprovince TEXT,
    countrycode TEXT,
    preferredlanguagecode TEXT,
    locked BOOLEAN,
    enabled BOOLEAN,
    nameorder TEXT,
    markfordelete BOOLEAN,
    PRIMARY KEY (federatedoidcprovidersubjectid)
);


create TABLE user_email_recovery (
    userid UUID,
    email TEXT,
    emailverified BOOLEAN,
    PRIMARY KEY (userid, email)
);

create TABLE user_email_recovery_by_email (
    userid UUID,
    email TEXT,
    emailverified BOOLEAN,
    PRIMARY KEY (email, userid)
);

create TABLE user_tenant_rel (
    userid UUID,
    tenantid UUID,
    enabled BOOLEAN,
    reltype TEXT,
    PRIMARY KEY (userid, tenantid)
);

create TABLE user_tenant_rel_by_tenant (
    userid UUID,
    tenantid UUID,
    enabled BOOLEAN,
    reltype TEXT,
    PRIMARY KEY (tenantid, userid)
);

create TABLE user_terms_and_conditions_accepted (
    userid UUID,
    tenantid UUID,
    acceptedatms BIGINT,
    PRIMARY KEY (userid, tenantid)
);

create TABLE authentication_group (
    authenticationgroupid UUID,
    tenantid UUID,
    authenticationgroupname TEXT,
    authenticationgroupdescription TEXT,
    defaultgroup BOOLEAN,
    markfordelete BOOLEAN,
    PRIMARY KEY (authenticationgroupid, tenantid)
);

create TABLE authentication_group_by_tenant (
    authenticationgroupid UUID,
    tenantid UUID,
    authenticationgroupname TEXT,
    authenticationgroupdescription TEXT,
    defaultgroup BOOLEAN,
    markfordelete BOOLEAN,
    PRIMARY KEY (tenantid, authenticationgroupid)
);

create TABLE authentication_group_client_rel (
    authenticationgroupid UUID,
    clientid TEXT,
    PRIMARY KEY (authenticationgroupid, clientid)
);

create TABLE authentication_group_client_rel_by_client (
    authenticationgroupid UUID,
    clientid TEXT,
    PRIMARY KEY (clientid, authenticationgroupid)
);

create TABLE authentication_group_user_rel (
    authenticationgroupid UUID,
    userid UUID,
    PRIMARY KEY (authenticationgroupid, userid)
);

create TABLE authentication_group_user_rel_by_user (
    authenticationgroupid UUID,
    userid UUID,
    PRIMARY KEY (userid, authenticationgroupid)
);

create TABLE authorization_group (
    groupid UUID,
    tenantid UUID,
    groupname TEXT,
    groupdescription TEXT,
    defaultgroup BOOLEAN,
    allowforanonymoususers BOOLEAN,
    markfordelete BOOLEAN,
    PRIMARY KEY (groupid, tenantid)
);

create TABLE authorization_group_by_tenant (
    groupid UUID,
    tenantid UUID,
    groupname TEXT,
    groupdescription TEXT,
    defaultgroup BOOLEAN,
    allowforanonymoususers BOOLEAN,
    markfordelete BOOLEAN,
    PRIMARY KEY (tenantid, groupid)
);

create TABLE authorization_group_user_rel (
    userid UUID,
    groupid UUID,
    PRIMARY KEY (userid, groupid)
);


create TABLE user_credential (
    userid UUID,
    salt TEXT,
    hashedpassword TEXT,
    hashingalgorithm TEXT,
    datecreatedms BIGINT,
    PRIMARY KEY (userid, datecreatedms)
)
WITH CLUSTERING ORDER BY (datecreatedms DESC);


create TABLE signing_key (
    keyid UUID,
    keyname TEXT,
    tenantid UUID,
    keytype TEXT,
    keyuse TEXT,    
    keypassword TEXT,    
    expiresatms BIGINT,
    createdatms BIGINT,
    keystatus TEXT,
    markfordelete BOOLEAN,
    privatekeypkcs8 TEXT,
    keycertificate TEXT,
    publickey TEXT,
    PRIMARY KEY (keyid, tenantid)
);

create TABLE signing_key_by_tenant (
    keyid UUID,
    keyname TEXT,
    tenantid UUID,
    keytype TEXT,
    keyuse TEXT,    
    keypassword TEXT,    
    expiresatms BIGINT,
    createdatms BIGINT,
    keystatus TEXT,
    markfordelete BOOLEAN,
    privatekeypkcs8 TEXT,
    keycertificate TEXT,
    publickey TEXT,
    PRIMARY KEY (tenantid, keyid)
);

create TABLE rate_limit_service_group (
    servicegroupid UUID PRIMARY KEY,
    servicegroupname TEXT,
    servicegroupdescription TEXT,
    markfordelete BOOLEAN  
);


create TABLE scope (
    scopeid UUID,
    scopename TEXT,
    scopedescription TEXT,
    scopeuse TEXT,
    markfordelete BOOLEAN,
    PRIMARY KEY (scopeid, scopename)
);

create TABLE scope_by_scope_name (
    scopeid UUID,
    scopename TEXT,
    scopedescription TEXT,
    scopeuse TEXT,
    markfordelete BOOLEAN,
    PRIMARY KEY (scopename, scopeid)
);

create TABLE scope_access_rule_schema (
    scopeaccessruleschemaid UUID PRIMARY KEY,
    scopeid UUID,
    schemaversion INT,    
    scopeaccessruleschema BLOB
);

create TABLE access_rule (
    accessruleid UUID PRIMARY KEY,
    accessrulename TEXT,
    scopeaccessruleschemaid UUID,
    accessruledefinition BLOB
);

create TABLE rate_limit_service_group_scope_rel (
    servicegroupid UUID,
    scopeid UUID,
    PRIMARY KEY(servicegroupid, scopeid)
);

create TABLE rate_limit (
    ratelimitid UUID PRIMARY KEY,
    ratelimitname TEXT,
    servicegroupid UUID
);

create TABLE tenant_rate_limit_rel (
    servicegroupid UUID,
    tenantid UUID,
    allowunlimitedrate BOOLEAN,
    ratelimit INT,
    ratelimitperiodminutes INT,
    PRIMARY KEY (servicegroupid, tenantid)
);

create TABLE tenant_rate_limit_rel_by_tenant (
    servicegroupid UUID,
    tenantid UUID,
    allowunlimitedrate BOOLEAN,
    ratelimit INT,
    ratelimitperiodminutes INT,
    PRIMARY KEY (tenantid, servicegroupid)
);

create TABLE tenant_available_scope (
    tenantid UUID,
    scopeid UUID,
    accessruleid UUID,
    PRIMARY KEY (tenantid, scopeid)
);

create TABLE tenant_available_scope_by_scope (
    tenantid UUID,
    scopeid UUID,
    accessruleid UUID,
    PRIMARY KEY (scopeid, tenantid)
);

create TABLE client_scope_rel (
    scopeid UUID,
    tenantid UUID,
    clientid UUID,
    PRIMARY KEY (clientid, scopeid, tenantid)
);

create TABLE client_scope_rel_by_tenant (
    scopeid UUID,
    tenantid UUID,
    clientid UUID,
    PRIMARY KEY (tenantid, scopeid, clientid)
);

create TABLE authorization_group_scope_rel (
    scopeid UUID,
    tenantid UUID,
    groupid UUID,
    PRIMARY KEY (groupid, scopeid, tenantid)
);

create TABLE authorization_group_scope_rel_by_tenant (
    scopeid UUID,
    tenantid UUID,
    groupid UUID,
    PRIMARY KEY (tenantid, scopeid, groupid)
);

create TABLE user_scope_rel (
    userid UUID,
    tenantid UUID,
    scopeid UUID,
    PRIMARY KEY (userid, tenantid, scopeid)    
);

create TABLE user_scope_rel_by_tenant (
    userid UUID,
    tenantid UUID,
    scopeid UUID,
    PRIMARY KEY (tenantid, scopeid, userid)    
);

create TABLE pre_authentication_state (
    pastoken TEXT PRIMARY KEY,
    state TEXT,
    redirecturi TEXT,
    codechallenge TEXT,
    codechallengemethod TEXT,
    responsemode TEXT,
    responsetype TEXT,
    scope TEXT,
    tenantid UUID,
    clientid UUID,
    expiresatms BIGINT
);

create TABLE authorization_code_data (
    code TEXT  PRIMARY KEY,
    redirecturi TEXT,
    tenantid TEXT,
    clientid TEXT,
    scope TEXT,
    codechallenge TEXT,
    codechallengemethod TEXT,
    userid TEXT,
    expiresatms BIGINT    
);


create TABLE authorization_device_code_data (
    devicecodeid TEXT,
    devicecode TEXT,    
    usercode TEXT,
    tenantid UUID,
    clientid UUID,
    scope TEXT,
    expiresatms BIGINT,
    authorizationstatus TEXT,
    userid UUID,
    PRIMARY KEY (devicecodeid)
);

create TABLE authorization_device_code_data_by_device_code (
    devicecodeid TEXT,
    devicecode TEXT,    
    usercode TEXT,
    tenantid UUID,
    clientid UUID,
    scope TEXT,
    expiresatms BIGINT,
    authorizationstatus TEXT,
    userid UUID,
    PRIMARY KEY (devicecode)
);

create TABLE authorization_device_code_data_by_user_code (
    devicecodeid TEXT,
    devicecode TEXT,    
    usercode TEXT,
    tenantid UUID,
    clientid UUID,
    scope TEXT,
    expiresatms BIGINT,
    authorizationstatus TEXT,
    userid UUID,
    PRIMARY KEY (usercode)
);


create TABLE refresh_data (
    refreshtoken TEXT,
    redirecturi TEXT,
    tenantid UUID,
    clientid UUID,
    userid UUID,
    scope TEXT,
    refreshtokenclienttype TEXT,
    refreshcount INT,
    codechallenge TEXT,
    codechallengemethod TEXT,
    expiresatms BIGINT,
    PRIMARY KEY (refreshtoken, userid)
);

create TABLE refresh_data_by_user_id (
    refreshtoken TEXT,
    redirecturi TEXT,
    tenantid UUID,
    clientid UUID,
    userid UUID,
    scope TEXT,
    refreshtokenclienttype TEXT,
    refreshcount INT,
    codechallenge TEXT,
    codechallengemethod TEXT,
    expiresatms BIGINT,
    PRIMARY KEY (userid, refreshtoken)
);


create TABLE federated_oidc_authorization_rel (
    state TEXT PRIMARY KEY,
    federatedoidcauthorizationreltype TEXT,
    email TEXT,
    userid UUID,
    codeverifier TEXT,
    codechallengemethod TEXT,
    federatedoidcproviderid UUID,
    initstate TEXT,
    initredirecturi TEXT,
    inittenantid UUID,
    initclientid UUID,
    initscope TEXT,
    initcodechallengemethod TEXT,
    initcodechallenge TEXT,
    initresponsemode TEXT,
    initresponsetype TEXT,
    expiresatms BIGINT
);

create TABLE client_auth_history (
    jti TEXT PRIMARY KEY,
    tenantid UUID,
    clientid UUID,
    expiresatseconds BIGINT
);

create TABLE change_event (
    changeeventid UUID,
    objectid UUID,    
    changeeventtype TEXT,
    changeeventclass TEXT,
    changetimestamp BIGINT,
    changedby TEXT,
    data TEXT,	
    PRIMARY KEY (changeeventid, objectid)	
);

create TABLE change_event_by_object_id (
    changeeventid UUID,
    objectid UUID,    
    changeeventtype TEXT,
    changeeventclass TEXT,
    changetimestamp BIGINT,
    changedby TEXT,
    data TEXT,	
    PRIMARY KEY (objectid, changeeventid)
);


create TABLE tenant_anonymous_user_configuration (
    tenantid UUID PRIMARY KEY,
    defaultcountrycode TEXT,
    defaultlanguagecode TEXT,
    tokenttlseconds INT
);


create TABLE tenant_look_and_feel (
    tenantid UUID PRIMARY KEY,
    adminheaderbackgroundcolor TEXT,
    adminheadertextcolor TEXT,
    adminheadertext TEXT,
    authenticationheaderbackgroundcolor TEXT,
    authenticationheadertextcolor TEXT,    
    authenticationlogouri TEXT,
    authenticationlogomimetype TEXT,
    authenticationheadertext TEXT,
    authenticationlogo BLOB
);

create TABLE footer_link (
    footerlinkid UUID PRIMARY KEY,
    tenantid UUID,
    linktext TEXT,
    uri TEXT
);

create TABLE contact (
    contactid UUID,
    objectid UUID,
    objecttype TEXT,
    email TEXT,
    contactname TEXT,
    userid UUID,
    PRIMARY KEY (contactid, objectid)
);

create TABLE contact_by_object_id (
    contactid UUID,
    objectid UUID,
    objecttype TEXT,
    email TEXT,
    contactname TEXT,
    userid UUID,
    PRIMARY KEY (objectid, contactid)
);


create TABLE scheduler_lock (
    lockname TEXT,
    lockinstanceid UUID,
    lockstarttimems BIGINT,
    lockexpiresatms BIGINT,
    PRIMARY KEY (lockname, lockinstanceid)
);

create TABLE scheduler_lock_by_instance_id (
    lockname TEXT,
    lockinstanceid UUID,
    lockstarttimems BIGINT,
    lockexpiresatms BIGINT,
    PRIMARY KEY (lockinstanceid, lockname)
);

create TABLE tenant_password_config (
    tenantid UUID,
    passwordminlength INT,
    passwordmaxlength INT,
    passwordhashingalgorithm TEXT,
    requireuppercase BOOLEAN,
	requirelowercase BOOLEAN,
	requirenumbers BOOLEAN,
	requirespecialcharacters BOOLEAN,
	specialcharactersallowed TEXT,
    requiremfa BOOLEAN,
    mfatypesrequired TEXT,
    maxrepeatingcharacterlength INT,
    passwordrotationperioddays INT,
    passwordhistoryperiod INT,
    PRIMARY KEY (tenantid)
);

create TABLE prohibited_passwords (
    password TEXT PRIMARY KEY
);

create TABLE user_failed_login (
    userid UUID,
    failureatms BIGINT,
    nextloginnotbefore BIGINT,
    failurecount INT,
    PRIMARY KEY (userid, failureatms)    
)
WITH CLUSTERING ORDER BY (failureatms DESC);


create TABLE user_verification_token (
    uvtoken TEXT PRIMARY KEY,
    userid UUID,
    verificationtype TEXT,
    issuedatms BIGINT,
    expiresatms BIGINT
);

create TABLE user_mfa_rel (
    userid UUID,
    primarymfa BOOLEAN,
    mfatype TEXT,
    totpsecret TEXT,
    totphashalgorithm TEXT,
    fido2publickey TEXT,
    fido2credentialid TEXT,
    fido2publickeyalgorithm INT,
    fido2transports TEXT,
    fido2keysupportscounters BOOLEAN,
    PRIMARY KEY (userid, mfatype)
);

create TABLE user_fido2_counter_rel (
    userid UUID PRIMARY KEY,
    fido2counter BIGINT
);

create TABLE user_fido2_challenge (
    userid UUID PRIMARY KEY,
    challenge TEXT,
    issuedatms BIGINT,
    expiresatms BIGINT
);

create TABLE tenant_legacy_user_migration_config (
    tenantid UUID PRIMARY KEY,
    authenticationuri TEXT,
    userprofileuri TEXT,
    usernamecheckuri TEXT
);

create TABLE mark_for_delete (
	markfordeleteid UUID PRIMARY KEY,
	objectid UUID,
	objecttype TEXT,
	submittedby TEXT,
	submitteddate BIGINT,
    starteddate BIGINT,
	completeddate BIGINT
);

create TABLE deletion_status (
	markfordeleteid UUID PRIMARY KEY,
	step TEXT,
	startedat BIGINT,
	completedat BIGINT	
);

create TABLE country (
    isocountrycode TEXT PRIMARY KEY,
    countryname TEXT 
);

create TABLE state_province_region (
    isocountrycode TEXT,
    isoentrycode TEXT,
    isoentryname TEXT,
    isosubsettype TEXT,
    PRIMARY KEY (isocountrycode, isoentrycode)
);

create TABLE user_authentication_state (
    userid UUID,
    tenantid UUID,
    authenticationsessiontoken TEXT,    
    authenticationstate TEXT,
    authenticationstateorder INT,
    authenticationstatestatus TEXT,
    preauthtoken TEXT,
    expiresatms BIGINT,
    returntouri TEXT,
    devicecodeid TEXT,
    PRIMARY KEY (authenticationsessiontoken, authenticationstate)    
);


create TABLE user_registration_state (
    userid UUID,
    email TEXT,
    tenantid UUID,
    registrationsessiontoken TEXT,    
    registrationstate TEXT,
    registrationstateorder INT,
    registrationstatestatus TEXT,
    preauthtoken TEXT,
    expiresatms BIGINT,
    devicecodeid TEXT,
    PRIMARY KEY (registrationsessiontoken, registrationstate, email)
);

create TABLE user_registration_state_by_email (
    userid UUID,
    email TEXT,
    tenantid UUID,
    registrationsessiontoken TEXT,    
    registrationstate TEXT,
    registrationstateorder INT,
    registrationstatestatus TEXT,
    preauthtoken TEXT,
    expiresatms BIGINT,
    devicecodeid TEXT,
    PRIMARY KEY (email, registrationsessiontoken, registrationstate)
);


create TABLE user_profile_email_change_state (
    userid UUID,
    email TEXT,
    emailchangestate TEXT,
    changeemailsessiontoken TEXT,
    changeorder INT,
    changestatestatus TEXT,
    expiresatms BIGINT,
    isprimaryemail BOOLEAN,
    PRIMARY KEY (userid, changeemailsessiontoken, emailchangestate)
);

create TABLE user_profile_email_change_state_by_session_token (
    userid UUID,
    email TEXT,
    emailchangestate TEXT,
    changeemailsessiontoken TEXT,
    changeorder INT,
    changestatestatus TEXT,
    expiresatms BIGINT,
    isprimaryemail BOOLEAN,
    PRIMARY KEY (changeemailsessiontoken)
);

create TABLE captcha_config (
    alias TEXT PRIMARY KEY,
    projectid TEXT,
    sitekey TEXT,
    apikey TEXT,
    minscorethreshold FLOAT,
    userecaptchav3 BOOLEAN,
    useenterprisecaptcha BOOLEAN 
);

create TABLE system_settings (
    systemid UUID PRIMARY KEY,
    allowrecoveryemail BOOLEAN,
    allowduresspassword BOOLEAN,
    rootclientid TEXT,
    enableportalaslegacyidp BOOLEAN,
    auditrecordretentionperioddays INT,
    noreplyemail TEXT,
    contactemail TEXT
);

create TABLE user_duress_credential (
    userid UUID,
    salt TEXT,
    hashedpassword TEXT,
    hashingalgorithm TEXT,
    datecreatedms BIGINT,
    PRIMARY KEY (userid)    
);

create TABLE secret_share (
    secretshareid UUID,
    objectid TEXT,
    objectype TEXT,
    otp TEXT,
    expiresatms BIGINT,
    PRIMARY KEY (secretshareid, otp)
);

create TABLE secret_share_by_otp (
    secretshareid UUID,
    objectid TEXT,
    objectype TEXT,
    otp TEXT,
    expiresatms BIGINT,
    PRIMARY KEY (otp, secretshareid)
);


create TABLE user_authentication_history (
    userid UUID,
    lastauthenticationatms BIGINT,
    PRIMARY KEY (userid, lastauthenticationatms)
)
WITH CLUSTERING ORDER BY (lastauthenticationatms DESC);

create TABLE federated_auth_test (
    authstate             TEXT PRIMARY KEY,	
	clientid              TEXT,
	clientsecret          TEXT,
	usepkce               BOOLEAN,
	codeverifier          TEXT,
	wellknownuri          TEXT,
	scope                 TEXT,
	redirecturi           TEXT,
    clientauthtype        TEXT,
	expiresatms           BIGINT 
);

