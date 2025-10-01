import cassandra from "cassandra-driver";


export const TENANT_MODEL: {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant": {
        tables: ["tenant"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
            "tenantname": "tenantName",
            "tenantdescription": "tenantDescription",
            "enabled": "enabled",
            "allowunlimitedrate": "allowUnlimitedRate",
            "allowuserselfregistration": "allowUserSelfRegistration",
            "allowsociallogin": "allowSocialLogin",
            "allowanonymoususers": "allowAnonymousUsers",
            "verifyemailonselfregistration": "verifyEmailOnSelfRegistration",
            "federatedauthenticationconstraint": "federatedAuthenticationConstraint",
            "markfordelete": "markForDelete",
            "tenanttype": "tenantType",
            "migratelegacyusers": "migrateLegacyUsers",
            "allowloginbyphonenumber": "allowLoginByPhoneNumber",
            "allowforgotpassword": "allowForgotPassword",
            "defaultratelimit": "defaultRateLimit",
            "defaultratelimitperiodminutes": "defaultRateLimitPeriodMinutes",
            "registrationrequiretermsandconditions": "registrationRequireTermsAndConditions",
            "termsandconditionsuri": "termsAndConditionsUri",
            "registrationrequirecaptcha": "registrationRequireCaptcha"
        }
    }
};

export const ROOT_TENANT_MODEL: {[key: string]: cassandra.mapping.ModelOptions} = {
    "root_tenant": {
        tables: ["root_tenant"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
            "tenantname": "tenantName",
            "tenantdescription": "tenantDescription",
            "enabled": "enabled",
            "allowunlimitedrate": "allowUnlimitedRate",
            "allowuserselfregistration": "allowUserSelfRegistration",
            "allowsociallogin": "allowSocialLogin",
            "allowanonymoususers": "allowAnonymousUsers",
            "verifyemailonselfregistration": "verifyEmailOnSelfRegistration",
            "federatedauthenticationconstraint": "federatedAuthenticationConstraint",
            "markfordelete": "markForDelete",
            "tenanttype": "tenantType",
            "migratelegacyusers": "migrateLegacyUsers",
            "allowloginbyphonenumber": "allowLoginByPhoneNumber",
            "allowforgotpassword": "allowForgotPassword",
            "defaultratelimit": "defaultRateLimit",
            "defaultratelimitperiodminutes": "defaultRateLimitPeriodMinutes",
            "registrationrequiretermsandconditions": "registrationRequireTermsAndConditions",
            "termsandconditionsuri": "termsAndConditionsUri",
            "registrationrequirecaptcha": "registrationRequireCaptcha"
        }
    }
};

export const ACCESS_RULE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "access_rule": {
        tables: ["access_rule"],
        columns: {
            "accessruleid": {
                name: "accessRuleId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"accessrulename": "accessRuleName",
			"scopeconstraintschemaid": "scopeAccessRuleSchemaId",
			"accessruledefinition": "accessRuleDefinition"
        }
    }
};

export const AUTHENTICATION_GROUP_CLIENT_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "authentication_group_client_rel": {
        tables: ["authentication_group_client_rel", "authentication_group_client_rel_by_client"],
        columns: {
            "authenticationgroupid": {
                name: "authenticationGroupId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            }
        }
    }
};

export const AUTHENTICATION_GROUP_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "authentication_group": {
        tables: ["authentication_group", "authentication_group_by_tenant"],
        columns: {
            "authenticationgroupid": {
                name: "authenticationGroupId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"authenticationgroupname": "authenticationGroupName",
			"authenticationgroupdescription": "authenticationGroupDescription",
			"defaultgroup": "defaultGroup",
			"markfordelete": "markForDelete"
        }
    }
};

export const AUTHENTICATION_GROUP_USER_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "authentication_group_user_rel": {
        tables: ["authentication_group_user_rel", "authentication_group_user_rel_by_user"],
        columns: {
            "authenticationgroupid": {
                name: "authenticationGroupId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            }
        }
    }
};

export const AUTHORIZATION_CODE_DATA_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "authorization_code_data": {
        tables: ["authorization_code_data"],
        columns: {
            "code": "code",
			"clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"codechallenge": "codeChallenge",
			"codechallengemethod": "codeChallengeMethod",
			"expiresatms": "expiresAtMs",
			"redirecturi": "redirectUri",
			"scope": "scope",
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            }
        }
    }
};

export const AUTHORIZATION_DEVICE_CODE_DATA_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "authorization_device_code_data": {
        tables: ["authorization_device_code_data", "authorization_device_code_data_by_device_code", "authorization_device_code_data_by_user_code"],
        columns: {
            "devicecodeid": "deviceCodeId",
			"devicecode": "deviceCode",
			"usercode": "userCode",
			"clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"expiresatms": "expiresAtMs",
			"scope": "scope",
			"authorizationstatus": "authorizationStatus",
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            }
        }
    }
};

export const AUTHORIZATION_GROUP_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "authorization_group": {
        tables: ["authorization_group", "authorization_group_by_tenant"],
        columns: {
            "groupid": {
                name: "groupId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"groupname": "groupName",
			"groupdescription": "groupDescription",
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"defaultgroup": "default",
			"allowforanonymoususers": "allowForAnonymousUsers",
			"markfordelete": "markForDelete"
        }
    }
};

export const AUTHORIZATION_GROUP_SCOPE_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "authorization_group_scope_rel": {
        tables: ["authorization_group_scope_rel", "authorization_group_scope_rel_by_tenant"],
        columns: {
            "groupid": {
                name: "groupId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"scopeid": {
                name: "scopeId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            }
        }
    }
};

export const AUTHORIZATION_GROUP_USER_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "authorization_group_user_rel": {
        tables: ["authorization_group_user_rel", "authorization_group_user_rel_by_user"],
        columns: {
            "groupid": {
                name: "groupId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            }
        }
    }
};

export const CAPTCHA_CONFIG_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "captcha_config": {
        tables: ["captcha_config"],
        columns: {
            "alias": "alias",
			"projectid": "projectId",
			"sitekey": "siteKey",
			"apikey": "apiKey",
			"minscorethreshold": "minScoreThreshold",
			"userecaptchav3": "useCaptchaV3",
			"useenterprisecaptcha": "useEnterpriseCaptcha"
        }
    }
};


export const CHANGE_EVENT_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "change_event": {
        tables: ["change_event", "change_event_by_object_id"],
        columns: {
            "changeeventid": {
                name: "changeEventId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"objectid": {
                name: "objectId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"changeeventclass": "changeEventClass",
			"changeeventtype": "changeEventType",
			"changetimestamp": "changeTimestamp",
			"changedby": "changedBy",
			"data": "data"
        }
    }
};


export const CLIENT_AUTH_HISTORY_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "client_auth_history": {
        tables: ["client_auth_history"],
        columns: {
            "jti": "jti",
			"clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"expiresatseconds": "expiresAtSeconds"
        }
    }
};


export const CLIENT_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "client": {
        tables: ["client", "client_by_tenant"],
        columns: {
            "clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"clientname": "clientName",
			"clientdescription": "clientDescription",
			"clientsecret": "clientSecret",
			"clienttokenttlseconds": "clientTokenTTLSeconds",
			"clienttype": "clientType",
			"maxrefreshtokencount": "maxRefreshTokenCount",
			"enabled": "enabled",
			"oidcenabled": "oidcEnabled",
			"pkceenabled": "pkceEnabled",
			"usertokenttlseconds": "userTokenTTLSeconds",
			"markfordelete": "markForDelete",
			"audience": "audience"
        }
    }
};

export const CLIENT_REDIRECT_URI_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "client_redirect_uri_rel": {
        tables: ["client_redirect_uri_rel"],
        columns: {
            "clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"redirecturi": "redirectUri"
        }
    }
};

export const CLIENT_SCOPE_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "client_scope_rel": {
        tables: ["client_scope_rel", "client_scope_rel_by_tenant"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"scopeid": {
                name: "scopeId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            }
        }
    }
};

export const CONTACT_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "contact": {
        tables: ["contact", "contact_by_object_id"],
        columns: {
            "contactid": {
                name: "contactid",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"objectid": {
                name: "objectid",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"objecttype": "objecttype",
			"email": "email",
			"contactname": "name",
			"userid": "userid"
        }
    }
};

export const DELETION_STATUS_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "deletion_status": {
        tables: ["deletion_status"],
        columns: {
            "markfordeleteid": {
                name: "markForDeleteId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"step": "step",
			"startedat": "startedAt",
			"completedat": "completedAt"
        }
    }
};

export const FEDERATED_AUTH_TEST_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "federated_auth_test": {
        tables: ["federated_auth_test"],
        columns: {
            "authstate": "authState",
			"clientid": "clientId",
			"clientsecret": "clientSecret",
			"usepkce": "usePkce",
			"codeverifier": "codeVerifier",
			"wellknownuri": "wellKnownUri",
			"scope": "scope",
			"redirecturi": "redirectUri",
			"clientauthtype": "clientAuthType",
			"expiresatms": "expiresAtMs"
        }
    }
};

export const FEDERATED_OIDC_AUTHORIZATION_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "federated_oidc_authorization_rel": {
        tables: ["federated_oidc_authorization_rel"],
        columns: {
            "state": "state",
			"federatedoidcauthorizationreltype": "federatedOIDCAuthorizationRelType",
			"email": "email",
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"codeverifier": "codeVerifier",
			"codechallengemethod": "codechallengemethod",
			"expiresatms": "expiresAtMs",
			"federatedoidcproviderid": {
                name: "federatedOIDCProviderId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"initclientid": {
                name: "initClientId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"initcodechallenge": "initCodeChallenge",
			"initcodechallengemethod": "initCodeChallengeMethod",
			"initredirecturi": "initRedirectUri",
			"initresponsemode": "initResponseMode",
			"initresponsetype": "initResponseType",
			"initscope": "initScope",
			"initstate": "initState",
			"inittenantid": {
                name: "initTenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            }
        }
    }
};

export const FEDERATED_OIDC_PROVIDER_DOMAIN_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "federated_oidc_provider_domain_rel": {
        tables: ["federated_oidc_provider_domain_rel", "federated_oidc_provider_domain_rel_by_domain"],
        columns: {
            "federatedoidcproviderid": {
                name: "federatedOIDCProviderId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"domain": "domain"
        }
    }
};


export const FEDERATED_OIDC_PROVIDER_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "federated_oidc_provider": {
        tables: ["federated_oidc_provider"],
        columns: {
            "federatedoidcproviderid": {
                name: "federatedOIDCProviderId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"federatedoidcprovidername": "federatedOIDCProviderName",
			"federatedoidcproviderdescription": "federatedOIDCProviderDescription",
			"federatedoidcprovidertenantid": "federatedOIDCProviderTenantId",
			"federatedoidcproviderclientid": "federatedOIDCProviderClientId",
			"federatedoidcproviderclientsecret": "federatedOIDCProviderClientSecret",
			"federatedoidcproviderwellknownuri": "federatedOIDCProviderWellKnownUri",
			"refreshtokenallowed": "refreshTokenAllowed",
			"scopes": "scopes",
			"usepkce": "usePkce",
			"clientauthtype": "clientAuthType",
			"federatedoidcprovidertype": "federatedOIDCProviderType",
			"socialloginprovider": "socialLoginProvider",
			"markfordelete": "markForDelete"
        }
    }
};

export const FEDERATED_OIDC_PROVIDER_TENANT_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "federated_oidc_provider_tenant_rel": {
        tables: ["federated_oidc_provider_tenant_rel", "federated_oidc_provider_tenant_rel_by_tenant"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"federatedoidcproviderid": {
                name: "federatedOIDCProviderId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            }
        }
    }
};

export const MARK_FOR_DELETE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "mark_for_delete": {
        tables: ["mark_for_delete"],
        columns: {
            "markfordeleteid": {
                name: "markForDeleteId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"objectid": {
                name: "objectId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"objecttype": "objectType",
			"submittedby": "submittedBy",
			"submitteddate": "submittedDate",
			"starteddate": "startedDate",
			"completeddate": "completedDate"
        }
    }
};

export const PRE_AUTHENTICATION_STATE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "pre_authentication_state": {
        tables: ["pre_authentication_state"],
        columns: {
            "pastoken": "token",
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"codechallenge": "codeChallenge",
			"codechallengemethod": "codeChallengeMethod",
			"expiresatms": "expiresAtMs",
			"redirecturi": "redirectUri",
			"responsemode": "responseMode",
			"responsetype": "responseType",
			"scope": "scope",
			"state": "state"
        }
    }
};

export const PROHIBITED_PASSWORD_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "prohibited_passwords": {
        tables: ["prohibited_passwords"],
        columns: {
            "password": "password"
        }
    }
};

export const RATE_LIMIT_SERVICE_GROUP_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "rate_limit_service_group": {
        tables: ["rate_limit_service_group"],
        columns: {
            "servicegroupid": {
                name: "servicegroupid",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"servicegroupname": "servicegroupname",
			"servicegroupdescription": "servicegroupdescription",
			"markfordelete": "markForDelete"
        }
    }
};

export const REFRESH_DATA_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "refresh_data": {
        tables: ["refresh_data", "refresh_data_by_user_id"],
        columns: {
            "refreshtoken": "refreshToken",
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"clientid": {
                name: "clientId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"redirecturi": "redirecturi",
			"refreshcount": "refreshCount",
			"refreshtokenclienttype": "refreshTokenClientType",
			"scope": "scope",
			"codechallenge": "codeChallenge",
			"codechallengemethod": "codeChallengeMethod",
			"expiresatms": "expiresAtMs"
        }
    }
};

export const SCHEDULER_LOCK_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "scheduler_lock": {
        tables: ["scheduler_lock", "scheduler_lock_by_instance_id"],
        columns: {
            "lockname": "lockName",
			"lockinstanceid": {
                name: "lockInstanceId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"lockstarttimems": "lockStartTimeMS",
			"lockexpiresatms": "lockExpiresAtMS"
        }
    }
};

export const SCOPE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "scope": {
        tables: ["scope", "scope_by_scope_name"],
        columns: {
            "scopeid": {
                name: "scopeId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"scopename": "scopeName",
			"scopedescription": "scopeDescription",
			"scopeuse": "scopeUse",
			"markfordelete": "markForDelete"
        }
    }
};

export const SECRET_SHARE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "secret_share": {
        tables: ["secret_share", "secret_share_by_otp"],
        columns: {
            "secretshareid": {
                name: "secretShareId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"objectid": "objectId",
			"objectype": "secretShareObjectType",
			"otp": "otp",
			"expiresatms": "expiresAtMs"
        }
    }
};

export const SIGNING_KEY_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "signing_key": {
        tables: ["signing_key", "signing_key_by_tenant"],
        columns: {
            "keyid": {
                name: "keyId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"keytype": "keyType",
			"keyname": "keyName",
			"keyuse": "keyUse",
			"keypassword": "keyPassword",
			"expiresatms": "expiresAtMs",
			"createdatms": "createdAtMs",
			"keystatus": "keyStatus",
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"markfordelete": "markForDelete",
			"privatekeypkcs8": "privateKeyPkcs8",
			"publickey": "publicKey",
			"keycertificate": "keyCertificate"
        }
    }
};

export const STATE_PROVINCE_REGION_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "state_province_region": {
        tables: ["state_province_region"],
        columns: {
            "isocountrycode": "isoCountryCode",
			"isoentrycode": "isoEntryCode",
			"isoentryname": "isoEntryName",
			"isosubsettype": "isoSubsetType"
        }
    }
};

export const SYSTEM_SETTINGS_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "system_settings": {
        tables: ["system_settings"],
        columns: {
            "systemid": {
                name: "systemId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"allowrecoveryemail": "allowRecoveryEmail",
			"allowduresspassword": "allowDuressPassword",
			"rootclientid": {
                name: "rootClientId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"enableportalaslegacyidp": "enablePortalAsLegacyIdp",
			"auditrecordretentionperioddays": "auditRecordRetentionPeriodDays",
			"noreplyemail": "noReplyEmail",
			"contactemail": "contactEmail"
        }
    }
};

export const TENANT_ANONYMOUS_USER_CONFIGURATION_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_anonymous_user_configuration": {
        tables: ["tenant_anonymous_user_configuration"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"defaultcountrycode": "defaultcountrycode",
			"defaultlanguagecode": "defaultlanguagecode",
            "tokenttlseconds": "tokenttlseconds"
        }
    }
};

export const TENANT_AVAILABLE_SCOPE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_available_scope": {
        tables: ["tenant_available_scope", "tenant_available_scope_by_scope"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"scopeid": {
                name: "scopeId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"accessruleid": "accessRuleId"
        }
    }
};

export const TENANT_LEGACY_USER_MIGRATION_CONFIG_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_legacy_user_migration_config": {
        tables: ["tenant_legacy_user_migration_config"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"authenticationuri": "authenticationUri",
			"userprofileuri": "userProfileUri",
			"usernamecheckuri": "usernameCheckUri"
        }   
    }
};

export const TENANT_LOGIN_FAILURE_POLICY_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_login_failure_policy": {
        tables: ["tenant_login_failure_policy"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"loginfailurepolicytype": "loginFailurePolicyType",
			"failurethreshold": "failureThreshold",
			"pausedurationminutes": "pauseDurationMinutes",
			"maximumloginfailures": "maximumLoginFailures"
        }
    }
};

export const TENANT_LOOK_AND_FEEL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_look_and_feel": {
        tables: ["tenant_look_and_feel"],
        columns: {
            "tenantid": {
                name: "tenantid",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"adminheaderbackgroundcolor": "adminheaderbackgroundcolor",
			"adminheadertext": "adminheadertext",
			"adminheadertextcolor": "adminheadertextcolor",
			"authenticationheaderbackgroundcolor": "authenticationheaderbackgroundcolor",
			"authenticationheadertext": "authenticationheadertext",
			"authenticationheadertextcolor": "authenticationheadertextcolor",
			"authenticationlogouri": "authenticationlogouri",
			"authenticationlogomimetype": "authenticationlogomimetype",
			"authenticationlogo": {
                name: "authenticationlogo",
                toModel(columnValue) {
                    return columnValue.toString();
                },
                fromModel(modelValue: string) {
                    return Buffer.from(modelValue);
                }
            }
        }
    }
};

export const TENANT_MANAGEMENT_DOMAIN_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_management_domain_rel": {
        tables: ["tenant_management_domain_rel", "tenant_management_domain_rel_by_domain"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"domain": "domain"
        }
    }
};

export const TENANT_PASSWORD_CONFIG_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_password_config": {
        tables: ["tenant_password_config"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"passwordhashingalgorithm": "passwordHashingAlgorithm",
			"passwordmaxlength": "passwordMaxLength",
			"passwordminlength": "passwordMinLength",
			"requirelowercase": "requireLowerCase",
			"requirenumbers": "requireNumbers",
			"requirespecialcharacters": "requireSpecialCharacters",
			"requireuppercase": "requireUpperCase",
			"specialcharactersallowed": "specialCharactersAllowed",
			"requiremfa": "requireMfa",
			"mfatypesrequired": "mfaTypesRequired",
			"maxrepeatingcharacterlength": "maxRepeatingCharacterLength",
			"passwordrotationperioddays": "passwordRotationPeriodDays",
			"passwordhistoryperiod": "passwordHistoryPeriod"
        }
    }
};

export const TENANT_RATE_LIMIT_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_rate_limit_rel": {
        tables: ["tenant_rate_limit_rel", "tenant_rate_limit_rel_by_tenant"],
        columns: {
			"servicegroupid": {
                name: "servicegroupid",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"allowunlimitedrate": "allowUnlimitedRate",
			"ratelimit": "rateLimit",
			"ratelimitperiodminutes": "rateLimitPeriodMinutes"
        }
    }
};



export const TENANT_RESTRICTED_AUTHENTICATION_DOMAIN_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "tenant_restricted_authentication_domain_rel": {
        tables: ["tenant_restricted_authentication_domain_rel"],
        columns: {
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"domain": "domain"
        }
    }
};

export const USER_AUTHENTICATION_HISTORY_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_authentication_history": {
        tables: ["user_authentication_history"],
        columns: {
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"lastauthenticationatms": "lastAuthenticationAtMs"
        }
    }
};

export const USER_AUTHENTICATION_STATE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_authentication_state": {
        tables: ["user_authentication_state"],
        columns: {
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"authenticationsessiontoken": "authenticationSessionToken",
			"authenticationstate": "authenticationState",
			"authenticationstateorder": "authenticationStateOrder",
			"authenticationstatestatus": "authenticationStateStatus",
			"preauthtoken": "preAuthToken",
			"expiresatms": "expiresAtMs",
			"returntouri": "returnToUri",
			"devicecodeid": "deviceCodeId"
        }
    }
};

export const USER_CREDENTIAL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_credential": {
        tables: ["user_credential"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"datecreatedms": "dateCreatedMs",
			"hashedpassword": "hashedPassword",
			"hashingalgorithm": "hashingAlgorithm",
			"salt": "salt"
        }
    }
};

export const USER_DURESS_CREDENTIAL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_duress_credential": {
        tables: ["user_duress_credential"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"datecreatedms": "dateCreatedMs",
			"hashedpassword": "hashedPassword",
			"hashingalgorithm": "hashingAlgorithm",
			"salt": "salt"
        }
    }
};

export const USER_EMAIL_RECOVERY_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_email_recovery": {
        tables: ["user_email_recovery", "user_email_recovery_by_email"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"email": "email",
			"emailverified": "emailVerified"
        }
    }
};

export const USERS_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "users": {
        tables: ["users"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"address": "address",
			"addressline1": "addressLine1",
			"city": "city",
			"postalcode": "postalCode",
			"stateregionprovince": "stateRegionProvince",
			"countrycode": "countryCode",
			"domain": "domain",
			"email": "email",
			"emailverified": "emailVerified",
			"enabled": "enabled",
			"federatedoidcprovidersubjectid": "federatedOIDCProviderSubjectId",
			"firstname": "firstName",
			"lastname": "lastName",
			"locked": "locked",
			"middlename": "middleName",
			"nameorder": "nameOrder",
			"phonenumber": "phoneNumber",
			"preferredlanguagecode": "preferredLanguageCode",
			"markfordelete": "markForDelete"
        }
    }
};

export const USERS_BY_EMAIL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "users_by_email": {
        tables: ["users_by_email"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"address": "address",
			"addressline1": "addressLine1",
			"city": "city",
			"postalcode": "postalCode",
			"stateregionprovince": "stateRegionProvince",
			"countrycode": "countryCode",
			"domain": "domain",
			"email": "email",
			"emailverified": "emailVerified",
			"enabled": "enabled",
			"federatedoidcprovidersubjectid": "federatedOIDCProviderSubjectId",
			"firstname": "firstName",
			"lastname": "lastName",
			"locked": "locked",
			"middlename": "middleName",
			"nameorder": "nameOrder",
			"phonenumber": "phoneNumber",
			"preferredlanguagecode": "preferredLanguageCode",
			"markfordelete": "markForDelete"
        }
    }
};

export const USERS_BY_FEDERATED_OIDC_ID_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "users_by_federated_oidc_id": {
        tables: ["users_by_federated_oidc_id"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"address": "address",
			"addressline1": "addressLine1",
			"city": "city",
			"postalcode": "postalCode",
			"stateregionprovince": "stateRegionProvince",
			"countrycode": "countryCode",
			"domain": "domain",
			"email": "email",
			"emailverified": "emailVerified",
			"enabled": "enabled",
			"federatedoidcprovidersubjectid": "federatedOIDCProviderSubjectId",
			"firstname": "firstName",
			"lastname": "lastName",
			"locked": "locked",
			"middlename": "middleName",
			"nameorder": "nameOrder",
			"phonenumber": "phoneNumber",
			"preferredlanguagecode": "preferredLanguageCode",
			"markfordelete": "markForDelete"
        }
    }
};

export const USERS_BY_PHONE_NUMBER_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "users_by_phone_number": {
        tables: ["users_by_phone_number"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"address": "address",
			"addressline1": "addressLine1",
			"city": "city",
			"postalcode": "postalCode",
			"stateregionprovince": "stateRegionProvince",
			"countrycode": "countryCode",
			"domain": "domain",
			"email": "email",
			"emailverified": "emailVerified",
			"enabled": "enabled",
			"federatedoidcprovidersubjectid": "federatedOIDCProviderSubjectId",
			"firstname": "firstName",
			"lastname": "lastName",
			"locked": "locked",
			"middlename": "middleName",
			"nameorder": "nameOrder",
			"phonenumber": "phoneNumber",
			"preferredlanguagecode": "preferredLanguageCode",
			"markfordelete": "markForDelete"
        }
    }
};

export const USER_FAILED_LOGIN_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_failed_login": {
        tables: ["user_failed_login"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"failureatms": "failureAtMs",
			"nextloginnotbefore": "nextLoginNotBefore",
			"failurecount": "failureCount"
        }
    }
};


export const USER_FIDO2_CHALLENGE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_fido2_challenge": {
        tables: ["user_fido2_challenge"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"challenge": "challenge",
			"issuedatms": "issuedAtMs",
			"expiresatms": "expiresAtMs"
        }
    }
};

export const USER_FIDO2_COUNTER_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_fido2_counter_rel": {
        tables: ["user_fido2_counter_rel"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"fido2Counter": "fido2Counter"
        }
    }
};

export const USER_MFA_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_mfa_rel": {
        tables: ["user_mfa_rel"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"mfatype": "mfaType",
			"primarymfa": "primaryMfa",
			"totpsecret": "totpSecret",
			"totphashalgorithm": "totpHashAlgorithm",
			"fido2publickey": "fido2PublicKey",
			"fido2credentialid": "fido2CredentialId",
			"fido2publickeyalgorithm": "fido2PublicKeyAlgorithm",
			"fido2transports": "fido2Transports",
			"fido2keysupportscounters": "fido2KeySupportsCounters",
        }
    }
};

export const USER_PROFILE_EMAIL_CHANGE_STATE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_profile_email_change_state": {
        tables: ["user_profile_email_change_state"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"changeemailsessiontoken": "changeEmailSessionToken",
			"emailchangestate": "emailChangeState",
			"email": "email",
			"changeorder": "changeOrder",
			"changestatestatus": "changeStateStatus",
			"expiresatms": "expiresAtMs",
			"isprimaryemail": "isPrimaryEmail"
        }
    }
};

export const USER_REGISTRATION_STATE_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_registration_state": {
        tables: ["user_registration_state", "user_registration_state_by_email"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"email": "email",
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"registrationsessiontoken": "registrationSessionToken",
			"registrationstate": "registrationState",
			"registrationstateorder": "registrationStateOrder",
			"registrationstatestatus": "registrationStateStatus",
			"preauthtoken": "preAuthToken",
			"expiresatms": "expiresAtMs",
			"devicecodeid": "deviceCodeId"
        }
    }
};

export const USER_SCOPE_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_scope_rel": {
        tables: ["user_scope_rel", "user_scope_rel_by_tenant"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"scopeid": {
                name: "scopeId",
                toModel(columnValue) {
                    return columnValue.toString()
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            }
        }
    }
};

export const USER_TENANT_REL_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_tenant_rel": {
        tables: ["user_tenant_rel", "user_tenant_rel_by_tenant"],
        columns: {
            "tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"reltype": "relType",
			"enabled": "enabled",
        }
    }
};

export const USER_TERMS_AND_CONDITIONS_ACCEPTED_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_terms_and_conditions_accepted": {
        tables: ["user_terms_and_conditions_accepted"],
        columns: {
            "userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"tenantid": {
                name: "tenantId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"acceptedatms": "acceptedAtMs"
        }
    }
};

export const USER_VERIFICATION_TOKEN_MODEL:  {[key: string]: cassandra.mapping.ModelOptions} = {
    "user_verification_token": {
        tables: ["user_verification_token"],
        columns: {
            "uvtoken": "token",
			"userid": {
                name: "userId",
                toModel(columnValue) {
                    return columnValue.toString();
                }
            },
			"verificationtype": "verificationType",
			"issuedatms": "issuedAtMS",
			"expiresatms": "expiresAtMS"
        }
    }
};


