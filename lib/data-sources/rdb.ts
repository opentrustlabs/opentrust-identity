import { TenantEntity } from "../entities/tenant-entity";
import ContactEntity from "../entities/contact-entity";
import TenantAnonymousUserConfigurationEntity from "../entities/tenant-anonymous-user-configuration-entity";
import TenantManagementDomainRelEntity from "../entities/tenant-management-domain-rel-entity";
import TenantPasswordConfigEntity from "../entities/tenant-password-config-entity";
import TenantLookAndFeelEntity from "../entities/tenant-look-and-feel-entity";
import TenantLegacyUserMigrationConfigEntity from "../entities/tenant-legacy-user-migration-config-entity";
import TenantRestrictedAuthenticationDomainRelEntity from "../entities/tenant-restricted-authentication-domain-rel-entity";
import PreAuthenticationStateEntity from "../entities/pre-authentication-state-entity";
import AuthorizationCodeDataEntity from "../entities/authorization-code-data-entity";
import RefreshDataEntity from "../entities/refresh-data-entity";
import FederatedOIDCAuthorizationRelEntity from "../entities/federated-oidc-authorization-rel-entity";
import AccessRuleEntity from "../entities/access-rule-entity";
import AuthenticationGroupEntity from "../entities/authentication-group-entity";
import AuthenticationGroupClientRelEntity from "../entities/authentication-group-client-rel-entity";
import AuthenticationGroupUserRelEntity from "../entities/authentication-group-user-rel-entity";
import AuthorizationGroupEntity from "../entities/authorization-group-entity";
import AuthorizationGroupUserRelEntity from "../entities/authorization-group-user-rel-entity";
import ChangeEventEntity from "../entities/change-event-entity";
import ClientEntity from "../entities/client-entity";
import ClientAuthHistoryEntity from "../entities/client-auth-history-entity";
import ClientRedirectUriRelEntity, { ClientRedirectUriRel } from "../entities/client-redirect-uri-rel-entity";
import FederatedOIDCProviderEntity from "../entities/federated-oidc-provider-entity";
import FederatedOIDCProviderTenantRelEntity from "../entities/federated-oidc-provider-tenant-rel-entity";
import FederatedOIDCProviderDomainRelEntity from "../entities/federated-oidc-provider-domain-rel-entity";
import UserEntity from "../entities/user-entity";
import UserCredentialEntity from "../entities/user-credential-entity";
import UserFido2ChallengeEntity, { UserFido2Challenge } from "../entities/user-fido2-challenge-entity";
import UserVerificationTokenEntity, { UserVerificationToken } from "../entities/user-verification-token-entity";
import ProhibitedPasswordEntity, { ProhibitedPassword } from "../entities/prohibited-password-entity";
import UserTenantRelEntity from "../entities/user-tenant-rel-entity";
import TenantRateLimitRelEntity from "../entities/tenant-rate-limit-rel-entity";
import RateLimitServiceGroupEntity from "../entities/rate-limit-service-group-entity";
import TenantAvailableScopeEntity from "../entities/tenant-available-scope-entity";
import ScopeEntity from "../entities/scope-entity";
import SigningKeyEntity from "../entities/signing-key-entity";
import { MarkForDeleteEntity } from "../entities/mark-for-delete-entity";
import { DeletionStatusEntity } from "../entities/deletion-status-entity";
import UserMfaRelEntity from "../entities/user-mfa-rel-entity";
import AuthorizationGroupScopeRelEntity from "../entities/authorization-group-scope-rel-entity";
import ClientScopeRelEntity from "../entities/client-scope-rel-entity";
import UserScopeRelEntity from "../entities/user-scope-rel-entity";
import { StateProvinceRegionEntity } from "../entities/state-province-region-entity";
import UserFido2CounterRelEntity, { UserFido2CounterRel } from "../entities/user-fido2-counter-rel-entity";
import UserAuthenticationStateEntity from "../entities/user-authentication-state-entity";
import UserRegistrationStateEntity from "../entities/user-registration-state-entity";
import TenantLoginFailurePolicyEntity from "../entities/tenant-login-failure-policy-entity";
import UserFailedLoginEntity from "../entities/user-failed-login-entity";
import SchedulerLockEntity from "../entities/scheduler-lock-entity";
import CaptchaConfigEntity from "../entities/captcha-config-entity";
import UserTermsAndConditionsAcceptedEntity from "../entities/user-terms-and-conditions-accepted-entity";
import UserDuressCredentialEntity, { UserDuressCredential } from "../entities/user-duress-credential";
import UserEmailRecoveryEntity, { UserEmailRecovery } from "../entities/user-email-recovery-entity";
import SystemSettingsEntity from "../entities/system-settings-entity";
import AuthorizationDeviceCodeDataEntity from "../entities/authorization-device-code-data-entity";
import SecretShareEntity from "../entities/secret-share-entity";
import UserProfileChangeEmailStateEntity from "../entities/user-profile-email-change-state-entity";
import UserAuthenticationHistoryEntity, { UserAuthenticationHistory } from "../entities/user-authentication-history-entity";
import FederatedAuthTestEntity from "../entities/federated-auth-test-entity";
import { RDB_SUPPORTED_DIALECTS } from "@/utils/consts";
import { DataSource, Repository } from "typeorm";
import { AccessRule, AuthenticationGroup, AuthenticationGroupClientRel, AuthenticationGroupUserRel, AuthorizationCodeData, AuthorizationDeviceCodeData, AuthorizationGroup, AuthorizationGroupScopeRel, AuthorizationGroupUserRel, CaptchaConfig, ChangeEvent, Client, ClientAuthHistory, ClientScopeRel, Contact, DeletionStatus, FederatedAuthTest, FederatedOidcAuthorizationRel, FederatedOidcProvider, FederatedOidcProviderDomainRel, FederatedOidcProviderTenantRel, MarkForDelete, PreAuthenticationState, ProfileEmailChangeState, RateLimitServiceGroup, RefreshData, SchedulerLock, Scope, SecretShare, SigningKey, StateProvinceRegion, SystemSettings, Tenant, TenantAnonymousUserConfiguration, TenantAvailableScope, TenantLegacyUserMigrationConfig, TenantLoginFailurePolicy, TenantLookAndFeel, TenantManagementDomainRel, TenantPasswordConfig, TenantRateLimitRel, TenantRestrictedAuthenticationDomainRel, User, UserAuthenticationState, UserCredential, UserFailedLogin, UserMfaRel, UserRegistrationState, UserScopeRel, UserTenantRel, UserTermsAndConditionsAccepted } from "@/graphql/generated/graphql-types";



const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    DB_PORT,
    DB_MIN_POOL_SIZE,
    DB_MAX_POOL_SIZE,
    RDB_DIALECT,
    DB_ENABLE_QUERY_LOGGING,
    // Will need these 2 values for DB which authenticate credentials based on AD
    // For MSSQL Server
    DB_USER_DOMAIN,
    DB_AUTH_SCHEME
} = process.env;


declare global {
    // eslint-disable-next-line no-var
    var dataSource: DataSource | undefined;
}

const entities = [
    TenantAnonymousUserConfigurationEntity,
    TenantEntity,
    TenantLegacyUserMigrationConfigEntity,
    TenantLookAndFeelEntity,
    TenantManagementDomainRelEntity,
    TenantPasswordConfigEntity,
    TenantRestrictedAuthenticationDomainRelEntity,
    PreAuthenticationStateEntity,
    AuthorizationCodeDataEntity,
    RefreshDataEntity,
    FederatedOIDCAuthorizationRelEntity,
    AccessRuleEntity,
    AuthenticationGroupEntity,
    AuthenticationGroupClientRelEntity,
    AuthenticationGroupUserRelEntity,
    AuthorizationGroupEntity,
    AuthorizationGroupUserRelEntity,
    ChangeEventEntity,
    ClientEntity,
    ClientAuthHistoryEntity,
    ClientRedirectUriRelEntity,
    FederatedOIDCProviderTenantRelEntity,
    FederatedOIDCProviderEntity,
    FederatedOIDCProviderDomainRelEntity,
    UserEntity,
    UserCredentialEntity,
    UserFido2ChallengeEntity,
    UserFailedLoginEntity,
    UserVerificationTokenEntity,
    ProhibitedPasswordEntity,
    UserTenantRelEntity,
    TenantRateLimitRelEntity,
    RateLimitServiceGroupEntity,
    TenantAvailableScopeEntity,
    ScopeEntity,
    SigningKeyEntity,
    MarkForDeleteEntity,
    DeletionStatusEntity,
    UserMfaRelEntity,
    UserScopeRelEntity,
    AuthorizationGroupScopeRelEntity,
    ClientScopeRelEntity,
    StateProvinceRegionEntity,
    UserFido2CounterRelEntity,
    UserAuthenticationStateEntity,
    UserRegistrationStateEntity,
    TenantLoginFailurePolicyEntity,
    SchedulerLockEntity,
    CaptchaConfigEntity,
    UserTermsAndConditionsAcceptedEntity,
    UserDuressCredentialEntity,
    SystemSettingsEntity,
    UserEmailRecoveryEntity,
    AuthorizationDeviceCodeDataEntity,
    SecretShareEntity,
    UserProfileChangeEmailStateEntity,
    UserAuthenticationHistoryEntity,
    FederatedAuthTestEntity,
    ContactEntity
]


class RDBDriver {

    private static instance: RDBDriver;
    tenantAnonymousUserConfigurationRepository: Repository<TenantAnonymousUserConfiguration>;
    tenantRepository: Repository<Tenant>;
    tenantLegacyUserMigrationConfigRepository: Repository<TenantLegacyUserMigrationConfig>;
    tenantLookAndFeelRepository: Repository<TenantLookAndFeel>;
    tenantManagementDomainRelRepository: Repository<TenantManagementDomainRel>;
    tenantPasswordConfigRepository: Repository<TenantPasswordConfig>;
    tenantRestrictedAuthenticationDomainRelRepository: Repository<TenantRestrictedAuthenticationDomainRel>;
    preAuthenticationStateRepository: Repository<PreAuthenticationState>;
    authorizationCodeDataRepository: Repository<AuthorizationCodeData>;
    refreshDataRepository: Repository<RefreshData>;
    federatedOIDCAuthorizationRelRepository: Repository<FederatedOidcAuthorizationRel>;
    accessRuleRepository: Repository<AccessRule>;
    authenticationGroupRepository: Repository<AuthenticationGroup>;
    authenticationGroupClientRelRepository: Repository<AuthenticationGroupClientRel>;
    authenticationGroupUserRelRepository: Repository<AuthenticationGroupUserRel>;
    authorizationGroupRepository: Repository<AuthorizationGroup>;
    authorizationGroupUserRelRepository: Repository<AuthorizationGroupUserRel>;
    changeEventRepository: Repository<ChangeEvent>;
    clientRepository: Repository<Client>;
    clientAuthHistoryRepository: Repository<ClientAuthHistory>;
    clientRedirectUriRelRepository: Repository<ClientRedirectUriRel>;
    federatedOIDCProviderTenantRelRepository: Repository<FederatedOidcProviderTenantRel>;
    federatedOIDCProviderRepository: Repository<FederatedOidcProvider>;
    federatedOIDCProviderDomainRelRepository: Repository<FederatedOidcProviderDomainRel>;
    userRepository: Repository<User>;
    userCredentialRepository: Repository<UserCredential>;
    userFido2ChallengeRepository: Repository<UserFido2Challenge>;
    userFailedLoginRepository: Repository<UserFailedLogin>;
    userVerificationTokenRepository: Repository<UserVerificationToken>;
    prohibitedPasswordRepository: Repository<ProhibitedPassword>;
    userTenantRelRepository: Repository<UserTenantRel>;
    tenantRateLimitRelRepository: Repository<TenantRateLimitRel>;
    rateLimitServiceGroupRepository: Repository<RateLimitServiceGroup>;
    tenantAvailableScopeRepository: Repository<TenantAvailableScope>;
    scopeRepository: Repository<Scope>;
    signingKeyRepository: Repository<SigningKey>;
    markForDeleteRepository: Repository<MarkForDelete>;
    deletionStatusRepository: Repository<DeletionStatus>;
    userMfaRelRepository: Repository<UserMfaRel>;
    userScopeRelRepository: Repository<UserScopeRel>;
    authorizationGroupScopeRelRepository: Repository<AuthorizationGroupScopeRel>;
    clientScopeRelRepository: Repository<ClientScopeRel>;
    stateProvinceRegionRepository: Repository<StateProvinceRegion>;
    userFido2CounterRelRepository: Repository<UserFido2CounterRel>;
    userAuthenticationStateRepository: Repository<UserAuthenticationState>;
    userRegistrationStateRepository: Repository<UserRegistrationState>;
    tenantLoginFailurePolicyRepository: Repository<TenantLoginFailurePolicy>;
    schedulerLockRepository: Repository<SchedulerLock>;
    captchaConfigRepository: Repository<CaptchaConfig>;
    userTermsAndConditionsAcceptedRepository: Repository<UserTermsAndConditionsAccepted>;
    userDuressCredentialRepository: Repository<UserDuressCredential>;
    systemSettingsRepository: Repository<SystemSettings>;
    userEmailRecoveryRepository: Repository<UserEmailRecovery>;
    authorizationDeviceCodeDataRepository: Repository<AuthorizationDeviceCodeData>;
    secretShareRepository: Repository<SecretShare>;
    userProfileChangeEmailStateRepository: Repository<ProfileEmailChangeState>;
    userAuthenticationHistoryRepository: Repository<UserAuthenticationHistory>;
    federatedAuthTestRepository: Repository<FederatedAuthTest>;
    contactRepository: Repository<Contact>;


    private constructor() {
        // NO-OP
    }

    public static getInstance(): RDBDriver {
        if (!RDBDriver.instance) {
            RDBDriver.instance = new RDBDriver();
        }
        return RDBDriver.instance;
    }

    /**
     * 
     */
    public static async getConnection(): Promise<DataSource> {

        if (!global.dataSource) {

            if (!RDB_DIALECT || RDB_DIALECT === "" || !RDB_SUPPORTED_DIALECTS.includes(RDB_DIALECT)) {
                throw new Error("ERROR_MUST_PROVIDE_VALID_DIALECT_FOR_RELATION_DATABASE_CONNECTION");
            }

            let dataSource: DataSource | undefined = undefined;
            if (RDB_DIALECT === "postgres") {
                dataSource = new DataSource({
                    type: "postgres",
                    host: DB_HOST,
                    port: parseInt(DB_PORT || "0"),
                    username: DB_USER,
                    password: DB_PASSWORD,
                    database: DB_NAME,
                    entities: entities,
                    extra: {                
                        // ####### Postresql and MSSql pool options
                        max: parseInt(DB_MAX_POOL_SIZE || "10"),
                        min: parseInt(DB_MIN_POOL_SIZE || "4")
                    },
                    logging: DB_ENABLE_QUERY_LOGGING === "true",
                    logger: "simple-console"
                });
                
            }
            else if (RDB_DIALECT === "mysql") {
                dataSource = new DataSource({                    
                    type: "mysql",
                    host: DB_HOST,
                    port: parseInt(DB_PORT || "0"),
                    username: DB_USER,
                    password: DB_PASSWORD,
                    database: DB_NAME,
                    entities: entities,
                    extra: {
                        // ######## MySQL pool options
                        connectionLimit: parseInt(DB_MAX_POOL_SIZE || "10"),
                        waitForConnections: true,
                        queueLimit: 0 // Unlimited                
                        // ######## Oracle pool options
                        // poolMax: 10,
                        // poolMin: 4                        
                    },                    
                    logging: DB_ENABLE_QUERY_LOGGING === "true",
                    logger: "simple-console"
                });
            }
            else if (RDB_DIALECT === "mssql") {

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let authnOptions: any | undefined = undefined;                
                if(DB_AUTH_SCHEME === "ntlm"){
                    // ######### Standard tedious options
                    authnOptions = {
                        type: "ntlm",
                        options: {
                            userName: DB_USER,
                            password: DB_PASSWORD,
                            domain: DB_USER_DOMAIN
                        }
                    }                
                }
                dataSource = new DataSource({                    
                    type: "mssql",
                    host: DB_HOST,
                    port: parseInt(DB_PORT || "0"),
                    username: DB_USER,
                    password: DB_PASSWORD,
                    database: DB_NAME,
                    entities: entities,
                    extra: {                        
                        max: parseInt(DB_MAX_POOL_SIZE || "10"),
                        min: parseInt(DB_MIN_POOL_SIZE || "4"),
                
                        // ######## Oracle pool options
                        // poolMax: 10,
                        // poolMin: 4
                        authentication: authnOptions
                    },
                    // ######## Options for mssql connections
                    options: {
                        encrypt: false,
                        trustServerCertificate: true
                    },
                    logging: DB_ENABLE_QUERY_LOGGING === "true",
                    logger: "simple-console"
                });
            }

            if (dataSource === undefined) {
                throw new Error("ERROR_MUST_PROVIDE_VALID_DIALECT_FOR_RELATION_DATABASE_CONNECTION");
            }
            global.dataSource = dataSource;
            await global.dataSource.initialize();
        }
        return global.dataSource;
    }

    
    public async getUserRepository(): Promise<Repository<User>> {
        if(!RDBDriver.instance.userRepository){
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userRepository = driver.getRepository("users");
        }
        return RDBDriver.instance.userRepository;        
    }
    
    public async getContactRepository(): Promise<Repository<Contact>> {
        if (!RDBDriver.instance.contactRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.contactRepository = driver.getRepository("contact");
            
        }
        return RDBDriver.instance.contactRepository;
    }

    public async getTenantAnonymousUserConfigurationRepository(): Promise<Repository<TenantAnonymousUserConfiguration>> {
        if (!RDBDriver.instance.tenantAnonymousUserConfigurationRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantAnonymousUserConfigurationRepository = driver.getRepository("tenantAnonymousUserConfiguration");
        }
        return RDBDriver.instance.tenantAnonymousUserConfigurationRepository;
    }
    public  async getTenantRepository(): Promise<Repository<Tenant>> {
        if (!RDBDriver.instance.tenantRepository) {            
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantRepository = driver.getRepository("tenant");
        }
        return RDBDriver.instance.tenantRepository;
    }
    public async getTenantLegacyUserMigrationConfigRepository(): Promise<Repository<TenantLegacyUserMigrationConfig>> {
        if (!RDBDriver.instance.tenantLegacyUserMigrationConfigRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantLegacyUserMigrationConfigRepository = driver.getRepository("tenantLegacyUserMigrationConfig");
        }
        return RDBDriver.instance.tenantLegacyUserMigrationConfigRepository;
    }
    public async getTenantLookAndFeelRepository(): Promise<Repository<TenantLookAndFeel>> {
        if (!RDBDriver.instance.tenantLookAndFeelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantLookAndFeelRepository = driver.getRepository("tenantLookAndFeel");
        }
        return RDBDriver.instance.tenantLookAndFeelRepository;
    }
    public async getTenantManagementDomainRelRepository(): Promise<Repository<TenantManagementDomainRel>> {
        if (!RDBDriver.instance.tenantManagementDomainRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantManagementDomainRelRepository = driver.getRepository("tenantManagementDomainRel");
        }
        return RDBDriver.instance.tenantManagementDomainRelRepository;
    }
    public async getTenantPasswordConfigRepository(): Promise<Repository<TenantPasswordConfig>> {
        if (!RDBDriver.instance.tenantPasswordConfigRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantPasswordConfigRepository = driver.getRepository("tenantPasswordConfig");
        }
        return RDBDriver.instance.tenantPasswordConfigRepository;
    }
    public async getTenantRestrictedAuthenticationDomainRelRepository(): Promise<Repository<TenantRestrictedAuthenticationDomainRel>> {
        if (!RDBDriver.instance.tenantRestrictedAuthenticationDomainRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantRestrictedAuthenticationDomainRelRepository = driver.getRepository("tenantRestrictedAuthenticationDomainRel");
        }
        return RDBDriver.instance.tenantRestrictedAuthenticationDomainRelRepository;
    }
    public async getPreAuthenticationStateRepository(): Promise<Repository<PreAuthenticationState>> {
        if (!RDBDriver.instance.preAuthenticationStateRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.preAuthenticationStateRepository = driver.getRepository("preAuthenticationState");
        }
        return RDBDriver.instance.preAuthenticationStateRepository;
    }
    public async getAuthorizationCodeDataRepository(): Promise<Repository<AuthorizationCodeData>> {
        if (!RDBDriver.instance.authorizationCodeDataRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.authorizationCodeDataRepository = driver.getRepository("authorizationCodeData");
        }
        return RDBDriver.instance.authorizationCodeDataRepository;
    }
    public async getRefreshDataRepository(): Promise<Repository<RefreshData>> {
        if (!RDBDriver.instance.refreshDataRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.refreshDataRepository = driver.getRepository("refreshData");
        }
        return RDBDriver.instance.refreshDataRepository;
    }
    public async getFederatedOIDCAuthorizationRelRepository(): Promise<Repository<FederatedOidcAuthorizationRel>> {
        if (!RDBDriver.instance.federatedOIDCAuthorizationRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.federatedOIDCAuthorizationRelRepository = driver.getRepository("federatedOIDCAuthorizationRel");
        }
        return RDBDriver.instance.federatedOIDCAuthorizationRelRepository;
    }
    public async getAccessRuleRepository(): Promise<Repository<AccessRule>> {
        if (!RDBDriver.instance.accessRuleRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.accessRuleRepository = driver.getRepository("accessRule");
        }
        return RDBDriver.instance.accessRuleRepository;
    }
    public async getAuthenticationGroupRepository(): Promise<Repository<AuthenticationGroup>> {
        if (!RDBDriver.instance.authenticationGroupRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.authenticationGroupRepository = driver.getRepository("authenticationGroup");
        }
        return RDBDriver.instance.authenticationGroupRepository;
    }
    public async getAuthenticationGroupClientRelRepository(): Promise<Repository<AuthenticationGroupClientRel>> {
        if (!RDBDriver.instance.authenticationGroupClientRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.authenticationGroupClientRelRepository = driver.getRepository("authenticationGroupClientRel");
        }
        return RDBDriver.instance.authenticationGroupClientRelRepository;
    }
    public async getAuthenticationGroupUserRelRepository(): Promise<Repository<AuthenticationGroupUserRel>> {
        if (!RDBDriver.instance.authenticationGroupUserRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.authenticationGroupUserRelRepository = driver.getRepository("authenticationGroupUserRel");
        }
        return RDBDriver.instance.authenticationGroupUserRelRepository;
    }
    public async getAuthorizationGroupRepository(): Promise<Repository<AuthorizationGroup>> {
        if (!RDBDriver.instance.authorizationGroupRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.authorizationGroupRepository = driver.getRepository("authorizationGroup");
        }
        return RDBDriver.instance.authorizationGroupRepository;
    }
    public async getAuthorizationGroupUserRelRepository(): Promise<Repository<AuthorizationGroupUserRel>> {
        if (!RDBDriver.instance.authorizationGroupUserRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.authorizationGroupUserRelRepository = driver.getRepository("authorizationGroupUserRel");
        }
        return RDBDriver.instance.authorizationGroupUserRelRepository;
    }
    public async getChangeEventRepository(): Promise<Repository<ChangeEvent>> {
        if (!RDBDriver.instance.changeEventRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.changeEventRepository = driver.getRepository("changeEvent");
        }
        return RDBDriver.instance.changeEventRepository;
    }
    public async getClientRepository(): Promise<Repository<Client>> {
        if (!RDBDriver.instance.clientRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.clientRepository = driver.getRepository("client");
        }
        return RDBDriver.instance.clientRepository;
    }
    public async getClientAuthHistoryRepository(): Promise<Repository<ClientAuthHistory>> {
        if (!RDBDriver.instance.clientAuthHistoryRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.clientAuthHistoryRepository = driver.getRepository("clientAuthHistory");
        }
        return RDBDriver.instance.clientAuthHistoryRepository;
    }
    public async getClientRedirectUriRelRepository(): Promise<Repository<ClientRedirectUriRel>> {
        if (!RDBDriver.instance.clientRedirectUriRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.clientRedirectUriRelRepository = driver.getRepository("clientRedirectUriRel");
        }
        return RDBDriver.instance.clientRedirectUriRelRepository;
    }
    public async getFederatedOIDCProviderTenantRelRepository(): Promise<Repository<FederatedOidcProviderTenantRel>> {
        if (!RDBDriver.instance.federatedOIDCProviderTenantRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.federatedOIDCProviderTenantRelRepository = driver.getRepository("federatedOIDCProviderTenantRel");
        }
        return RDBDriver.instance.federatedOIDCProviderTenantRelRepository;
    }
    public async getFederatedOIDCProviderRepository(): Promise<Repository<FederatedOidcProvider>> {
        if (!RDBDriver.instance.federatedOIDCProviderRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.federatedOIDCProviderRepository = driver.getRepository("federatedOIDCProvider");
        }
        return RDBDriver.instance.federatedOIDCProviderRepository;
    }
    public async getFederatedOIDCProviderDomainRelRepository(): Promise<Repository<FederatedOidcProviderDomainRel>> {
        if (!RDBDriver.instance.federatedOIDCProviderDomainRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.federatedOIDCProviderDomainRelRepository = driver.getRepository("federatedOIDCProviderDomainRel");
        }
        return RDBDriver.instance.federatedOIDCProviderDomainRelRepository;
    }
public async getUserCredentialRepository(): Promise<Repository<UserCredential>> {
        if (!RDBDriver.instance.userCredentialRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userCredentialRepository = driver.getRepository("userCredential");
        }
        return RDBDriver.instance.userCredentialRepository;
    }
    public async getUserFido2ChallengeRepository(): Promise<Repository<UserFido2Challenge>> {
        if (!RDBDriver.instance.userFido2ChallengeRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userFido2ChallengeRepository = driver.getRepository("userFido2Challenge");
        }
        return RDBDriver.instance.userFido2ChallengeRepository;
    }
    public async getUserFailedLoginRepository(): Promise<Repository<UserFailedLogin>> {
        if (!RDBDriver.instance.userFailedLoginRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userFailedLoginRepository = driver.getRepository("userFailedLogin");
        }
        return RDBDriver.instance.userFailedLoginRepository;
    }
    public async getUserVerificationTokenRepository(): Promise<Repository<UserVerificationToken>> {
        if (!RDBDriver.instance.userVerificationTokenRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userVerificationTokenRepository = driver.getRepository("userVerificationToken");
        }
        return RDBDriver.instance.userVerificationTokenRepository;
    }
    public async getProhibitedPasswordRepository(): Promise<Repository<ProhibitedPassword>> {
        if (!RDBDriver.instance.prohibitedPasswordRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.prohibitedPasswordRepository = driver.getRepository("prohibitedPassword");
        }
        return RDBDriver.instance.prohibitedPasswordRepository;
    }
    public async getUserTenantRelRepository(): Promise<Repository<UserTenantRel>> {
        if (!RDBDriver.instance.userTenantRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userTenantRelRepository = driver.getRepository("userTenantRel");
        }
        return RDBDriver.instance.userTenantRelRepository;
    }
    public async getTenantRateLimitRelRepository(): Promise<Repository<TenantRateLimitRel>> {
        if (!RDBDriver.instance.tenantRateLimitRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantRateLimitRelRepository = driver.getRepository("tenantRateLimitRel");
        }
        return RDBDriver.instance.tenantRateLimitRelRepository;
    }
    public async getRateLimitServiceGroupRepository(): Promise<Repository<RateLimitServiceGroup>> {
        if (!RDBDriver.instance.rateLimitServiceGroupRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.rateLimitServiceGroupRepository = driver.getRepository("rateLimitServiceGroup");
        }
        return RDBDriver.instance.rateLimitServiceGroupRepository;
    }
    public async getTenantAvailableScopeRepository(): Promise<Repository<TenantAvailableScope>> {
        if (!RDBDriver.instance.tenantAvailableScopeRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantAvailableScopeRepository = driver.getRepository("tenantAvailableScope");
        }
        return RDBDriver.instance.tenantAvailableScopeRepository;
    }
    public async getScopeRepository(): Promise<Repository<Scope>> {
        if (!RDBDriver.instance.scopeRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.scopeRepository = driver.getRepository("scope");
        }
        return RDBDriver.instance.scopeRepository;
    }
    public async getSigningKeyRepository(): Promise<Repository<SigningKey>> {
        if (!RDBDriver.instance.signingKeyRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.signingKeyRepository = driver.getRepository("signingKey");
        }
        return RDBDriver.instance.signingKeyRepository;
    }
    public async getMarkForDeleteRepository(): Promise<Repository<MarkForDelete>> {
        if (!RDBDriver.instance.markForDeleteRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.markForDeleteRepository = driver.getRepository("markForDelete");
        }
        return RDBDriver.instance.markForDeleteRepository;
    }
    public async getDeletionStatusRepository(): Promise<Repository<DeletionStatus>> {
        if (!RDBDriver.instance.deletionStatusRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.deletionStatusRepository = driver.getRepository("deletionStatus");
        }
        return RDBDriver.instance.deletionStatusRepository;
    }
    public async getUserMfaRelRepository(): Promise<Repository<UserMfaRel>> {
        if (!RDBDriver.instance.userMfaRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userMfaRelRepository = driver.getRepository("userMfaRel");
        }
        return RDBDriver.instance.userMfaRelRepository;
    }
    public async getUserScopeRelRepository(): Promise<Repository<UserScopeRel>> {
        if (!RDBDriver.instance.userScopeRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userScopeRelRepository = driver.getRepository("userScopeRel");
        }
        return RDBDriver.instance.userScopeRelRepository;
    }
    public async getAuthorizationGroupScopeRelRepository(): Promise<Repository<AuthorizationGroupScopeRel>> {
        if (!RDBDriver.instance.authorizationGroupScopeRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.authorizationGroupScopeRelRepository = driver.getRepository("authorizationGroupScopeRel");
        }
        return RDBDriver.instance.authorizationGroupScopeRelRepository;
    }
    public async getClientScopeRelRepository(): Promise<Repository<ClientScopeRel>> {
        if (!RDBDriver.instance.clientScopeRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.clientScopeRelRepository = driver.getRepository("clientScopeRel");
        }
        return RDBDriver.instance.clientScopeRelRepository;
    }
    public async getStateProvinceRegionRepository(): Promise<Repository<StateProvinceRegion>> {
        if (!RDBDriver.instance.stateProvinceRegionRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.stateProvinceRegionRepository = driver.getRepository("stateProvinceRegion");
        }
        return RDBDriver.instance.stateProvinceRegionRepository;
    }
    public async getUserFido2CounterRelRepository(): Promise<Repository<UserFido2CounterRel>> {
        if (!RDBDriver.instance.userFido2CounterRelRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userFido2CounterRelRepository = driver.getRepository("userFido2CounterRel");
        }
        return RDBDriver.instance.userFido2CounterRelRepository;
    }
    public async getUserAuthenticationStateRepository(): Promise<Repository<UserAuthenticationState>> {
        if (!RDBDriver.instance.userAuthenticationStateRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userAuthenticationStateRepository = driver.getRepository("userAuthenticationState");
        }
        return RDBDriver.instance.userAuthenticationStateRepository;
    }
    public async getUserRegistrationStateRepository(): Promise<Repository<UserRegistrationState>> {
        if (!RDBDriver.instance.userRegistrationStateRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userRegistrationStateRepository = driver.getRepository("userRegistrationState");
        }
        return RDBDriver.instance.userRegistrationStateRepository;
    }
    public async getTenantLoginFailurePolicyRepository(): Promise<Repository<TenantLoginFailurePolicy>> {
        if (!RDBDriver.instance.tenantLoginFailurePolicyRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.tenantLoginFailurePolicyRepository = driver.getRepository("tenantLoginFailurePolicy");
        }
        return RDBDriver.instance.tenantLoginFailurePolicyRepository;
    }
    public async getSchedulerLockRepository(): Promise<Repository<SchedulerLock>> {
        if (!RDBDriver.instance.schedulerLockRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.schedulerLockRepository = driver.getRepository("schedulerLock");
        }
        return RDBDriver.instance.schedulerLockRepository;
    }
    public async getCaptchaConfigRepository(): Promise<Repository<CaptchaConfig>> {
        if (!RDBDriver.instance.captchaConfigRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.captchaConfigRepository = driver.getRepository("captchaConfig");
        }
        return RDBDriver.instance.captchaConfigRepository;
    }
    public async getUserTermsAndConditionsAcceptedRepository(): Promise<Repository<UserTermsAndConditionsAccepted>> {
        if (!RDBDriver.instance.userTermsAndConditionsAcceptedRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userTermsAndConditionsAcceptedRepository = driver.getRepository("userTermsAndConditionsAccepted");
        }
        return RDBDriver.instance.userTermsAndConditionsAcceptedRepository;
    }
    public async getUserDuressCredentialRepository(): Promise<Repository<UserDuressCredential>> {
        if (!RDBDriver.instance.userDuressCredentialRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userDuressCredentialRepository = driver.getRepository("userDuressCredential");
        }
        return RDBDriver.instance.userDuressCredentialRepository;
    }
    public async getSystemSettingsRepository(): Promise<Repository<SystemSettings>> {
        if (!RDBDriver.instance.systemSettingsRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.systemSettingsRepository = driver.getRepository("systemSettings");
        }
        return RDBDriver.instance.systemSettingsRepository;
    }
    public async getUserEmailRecoveryRepository(): Promise<Repository<UserEmailRecovery>> {
        if (!RDBDriver.instance.userEmailRecoveryRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userEmailRecoveryRepository = driver.getRepository("userEmailRecovery");
        }
        return RDBDriver.instance.userEmailRecoveryRepository;
    }
    public async getAuthorizationDeviceCodeDataRepository(): Promise<Repository<AuthorizationDeviceCodeData>> {
        if (!RDBDriver.instance.authorizationDeviceCodeDataRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.authorizationDeviceCodeDataRepository = driver.getRepository("authorizationDeviceCodeData");
        }
        return RDBDriver.instance.authorizationDeviceCodeDataRepository;
    }
    public async getSecretShareRepository(): Promise<Repository<SecretShare>> {
        if (!RDBDriver.instance.secretShareRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.secretShareRepository = driver.getRepository("secretShare");
        }
        return RDBDriver.instance.secretShareRepository;
    }
    public async getUserProfileChangeEmailStateRepository(): Promise<Repository<ProfileEmailChangeState>> {
        if (!RDBDriver.instance.userProfileChangeEmailStateRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userProfileChangeEmailStateRepository = driver.getRepository("userProfileChangeEmailState");
        }
        return RDBDriver.instance.userProfileChangeEmailStateRepository;
    }
    public async getUserAuthenticationHistoryRepository(): Promise<Repository<UserAuthenticationHistory>> {
        if (!RDBDriver.instance.userAuthenticationHistoryRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.userAuthenticationHistoryRepository = driver.getRepository("userAuthenticationHistory");
        }
        return RDBDriver.instance.userAuthenticationHistoryRepository;
    }
    public async getFederatedAuthTestRepository(): Promise<Repository<FederatedAuthTest>> {
        if (!RDBDriver.instance.federatedAuthTestRepository) {
            const driver = await RDBDriver.getConnection();
            RDBDriver.instance.federatedAuthTestRepository = driver.getRepository("federatedAuthTest");
        }
        return RDBDriver.instance.federatedAuthTestRepository;
    }

    

}

export default RDBDriver;

