// //import { Sequelize }  from "@sequelize/core";
// import { Sequelize } from "@sequelize/core";
// import { MySqlDialect } from "@sequelize/mysql";
// import { PostgresDialect } from "@sequelize/postgres";
// import { MsSqlDialect } from "@sequelize/mssql";
// import { TenantEntity } from "../entities/tenant-entity";
// import ContactEntity from "../entities/contact-entity";
// import TenantAnonymousUserConfigurationEntity from "../entities/tenant-anonymous-user-configuration-entity";
// import TenantManagementDomainRelEntity from "../entities/tenant-management-domain-rel-entity";
// import TenantPasswordConfigEntity from "../entities/tenant-password-config-entity";
// import TenantLookAndFeelEntity from "../entities/tenant-look-and-feel-entity";
// import TenantLegacyUserMigrationConfigEntity from "../entities/tenant-legacy-user-migration-config-entity";
// import TenantRestrictedAuthenticationDomainRelEntity from "../entities/tenant-restricted-authentication-domain-rel-entity";
// import PreAuthenticationStateEntity from "../entities/pre-authentication-state-entity";
// import AuthorizationCodeDataEntity from "../entities/authorization-code-data-entity";
// import RefreshDataEntity from "../entities/refresh-data-entity";
// import FederatedOIDCAuthorizationRelEntity from "../entities/federated-oidc-authorization-rel-entity";
// import AccessRuleEntity from "../entities/access-rule-entity";
// import AuthenticationGroupEntity from "../entities/authentication-group-entity";
// import AuthenticationGroupClientRelEntity from "../entities/authentication-group-client-rel-entity";
// import AuthenticationGroupUserRelEntity from "../entities/authentication-group-user-rel-entity";
// import AuthorizationGroupEntity from "../entities/authorization-group-entity";
// import AuthorizationGroupUserRelEntity from "../entities/authorization-group-user-rel-entity";
// import ChangeEventEntity from "../entities/change-event-entity";
// import ClientEntity from "../entities/client-entity";
// import ClientAuthHistoryEntity from "../entities/client-auth-history-entity";
// import ClientRedirectUriRelEntity from "../entities/client-redirect-uri-rel-entity";
// import FederatedOIDCProviderEntity from "../entities/federated-oidc-provider-entity";
// import FederatedOIDCProviderTenantRelEntity from "../entities/federated-oidc-provider-tenant-rel-entity";
// import FederatedOIDCProviderDomainRelEntity from "../entities/federated-oidc-provider-domain-rel-entity";
// import UserEntity from "../entities/user-entity";
// import UserCredentialEntity from "../entities/user-credential-entity";
// import UserFido2ChallengeEntity from "../entities/user-fido2-challenge-entity";
// import UserVerificationTokenEntity from "../entities/user-verification-token-entity";
// import ProhibitedPasswordEntity from "../entities/prohibited-password-entity";
// import UserTenantRelEntity from "../entities/user-tenant-rel-entity";
// import TenantRateLimitRelEntity from "../entities/tenant-rate-limit-rel-entity";
// import RateLimitServiceGroupEntity from "../entities/rate-limit-service-group-entity";
// import TenantAvailableScopeEntity from "../entities/tenant-available-scope-entity";
// import ScopeEntity from "../entities/scope-entity";
// import SigningKeyEntity from "../entities/signing-key-entity";
// import { MarkForDeleteEntity } from "../entities/mark-for-delete-entity";
// import { DeletionStatusEntity } from "../entities/deletion-status-entity";
// import UserMfaRelEntity from "../entities/user-mfa-rel-entity";
// import AuthorizationGroupScopeRelEntity from "../entities/authorization-group-scope-rel-entity";
// import ClientScopeRelEntity from "../entities/client-scope-rel-entity";
// import UserScopeRelEntity from "../entities/user-scope-rel-entity";
// import { StateProvinceRegionEntity } from "../entities/state-province-region-entity";
// import UserFido2CounterRelEntity from "../entities/user-fido2-counter-rel-entity";
// import UserAuthenticationStateEntity from "../entities/user-authentication-state-entity";
// import UserRegistrationStateEntity from "../entities/user-registration-state-entity";
// import TenantLoginFailurePolicyEntity from "../entities/tenant-login-failure-policy-entity";
// import UserFailedLoginEntity from "../entities/user-failed-login-entity";
// import SchedulerLockEntity from "../entities/scheduler-lock-entity";
// import CaptchaConfigEntity from "../entities/captcha-config-entity";
// import UserTermsAndConditionsAcceptedEntity from "../entities/user-terms-and-conditions-accepted-entity";
// import UserDuressCredentialEntity from "../entities/user-duress-credential";
// import UserEmailRecoveryEntity from "../entities/user-email-recovery-entity";
// import SystemSettingsEntity from "../entities/system-settings-entity";
// import AuthorizationDeviceCodeDataEntity from "../entities/authorization-device-code-data-entity";
// import SecretShareEntity from "../entities/secret-share-entity";
// import UserProfileChangeEmailStateEntity from "../entities/user-profile-email-change-state-entity";
// import UserAuthenticationHistoryEntity from "../entities/user-authentication-history-entity";
// import FederatedAuthTestEntity from "../entities/federated-auth-test-entity";
// import { RDB_SUPPORTED_DIALECTS } from "@/utils/consts";


// const {
//     DB_USER,
//     DB_PASSWORD,
//     DB_HOST,
//     DB_NAME,
//     DB_PORT,
//     DB_MIN_POOL_SIZE,
//     DB_MAX_POOL_SIZE,
//     RDB_DIALECT,
//     DB_ENABLE_QUERY_LOGGING,
//     // Will need these 2 values for DB which authenticate credentials based on AD
//     // For MSSQL Server
//     DB_USER_DOMAIN,
//     DB_AUTH_SCHEME
// } = process.env;


// declare global {
//     // eslint-disable-next-line no-var
//     var sequelize: Sequelize | undefined;
// }


// class DBDriver {

//     private static instance: DBDriver;
//     protected tenantAnonymousUserConfigurationEntity: typeof TenantAnonymousUserConfigurationEntity;
//     protected tenantEntity: typeof TenantEntity;
//     protected tenantLegacyUserMigrationConfigEntity: typeof TenantLegacyUserMigrationConfigEntity;
//     protected tenantLookAndFeelEntity: typeof TenantLookAndFeelEntity;
//     protected tenantManagementDomainRelEntity: typeof TenantManagementDomainRelEntity;
//     protected tenantPasswordConfigEntity: typeof TenantPasswordConfigEntity;
//     protected tenantRestrictedAuthenticationDomainRelEntity: typeof TenantRestrictedAuthenticationDomainRelEntity;
//     protected preAuthenticationStateEntity: typeof PreAuthenticationStateEntity;
//     protected authorizationCodeDataEntity: typeof AuthorizationCodeDataEntity;
//     protected refreshDataEntity: typeof RefreshDataEntity;
//     protected federatedOIDCAuthorizationRelEntity: typeof FederatedOIDCAuthorizationRelEntity;
//     protected accessRuleEntity: typeof AccessRuleEntity;
//     protected authenticationGroupEntity: typeof AuthenticationGroupEntity;
//     protected authenticationGroupClientRelEntity: typeof AuthenticationGroupClientRelEntity;
//     protected authenticationGroupUserRelEntity: typeof AuthenticationGroupUserRelEntity;
//     protected authorizationGroupEntity: typeof AuthorizationGroupEntity;
//     protected authorizationGroupUserRelEntity: typeof AuthorizationGroupUserRelEntity;
//     protected changeEventEntity: typeof ChangeEventEntity;
//     protected clientEntity: typeof ClientEntity;
//     protected clientAuthHistoryEntity: typeof ClientAuthHistoryEntity;
//     protected clientRedirectUriRelEntity: typeof ClientRedirectUriRelEntity;
//     protected federatedOIDCProviderTenantRelEntity: typeof FederatedOIDCProviderTenantRelEntity;
//     protected federatedOIDCProviderEntity: typeof FederatedOIDCProviderEntity;
//     protected federatedOIDCProviderDomainRelEntity: typeof FederatedOIDCProviderDomainRelEntity;
//     protected userEntity: typeof UserEntity;
//     protected userCredentialEntity: typeof UserCredentialEntity;
//     protected userFido2ChallengeEntity: typeof UserFido2ChallengeEntity;
//     protected userFailedLoginEntity: typeof UserFailedLoginEntity;
//     protected userVerificationTokenEntity: typeof UserVerificationTokenEntity;
//     protected prohibitedPasswordEntity: typeof ProhibitedPasswordEntity;
//     protected userTenantRelEntity: typeof UserTenantRelEntity;
//     protected tenantRateLimitRelEntity: typeof TenantRateLimitRelEntity;
//     protected rateLimitServiceGroupEntity: typeof RateLimitServiceGroupEntity;
//     protected tenantAvailableScopeEntity: typeof TenantAvailableScopeEntity;
//     protected scopeEntity: typeof ScopeEntity;
//     protected signingKeyEntity: typeof SigningKeyEntity;
//     protected markForDeleteEntity: typeof MarkForDeleteEntity;
//     protected deletionStatusEntity: typeof DeletionStatusEntity;
//     protected userMfaRelEntity: typeof UserMfaRelEntity;
//     protected userScopeRelEntity: typeof UserScopeRelEntity;
//     protected authorizationGroupScopeRelEntity: typeof AuthorizationGroupScopeRelEntity;
//     protected clientScopeRelEntity: typeof ClientScopeRelEntity;
//     protected stateProvinceRegionEntity: typeof StateProvinceRegionEntity;
//     protected userFido2CounterRelEntity: typeof UserFido2CounterRelEntity;
//     protected userAuthenticationStateEntity: typeof UserAuthenticationStateEntity;
//     protected userRegistrationStateEntity: typeof UserRegistrationStateEntity;
//     protected tenantLoginFailurePolicyEntity: typeof TenantLoginFailurePolicyEntity;
//     protected schedulerLockEntity: typeof SchedulerLockEntity;
//     protected captchaConfigEntity: typeof CaptchaConfigEntity;
//     protected userTermsAndConditionsAcceptedEntity: typeof UserTermsAndConditionsAcceptedEntity;
//     protected userDuressCredentialEntity: typeof UserDuressCredentialEntity;
//     protected systemSettingsEntity: typeof SystemSettingsEntity;
//     protected userEmailRecoveryEntity: typeof UserEmailRecoveryEntity;
//     protected authorizationDeviceCodeDataEntity: typeof AuthorizationDeviceCodeDataEntity;
//     protected secretShareEntity: typeof SecretShareEntity;
//     protected userProfileChangeEmailStateEntity: typeof UserProfileChangeEmailStateEntity;
//     protected userAuthenticationHistoryEntity: typeof UserAuthenticationHistoryEntity;
//     protected federatedAuthTestEntity: typeof FederatedAuthTestEntity;
//     protected contactEntity: typeof ContactEntity;


//     private constructor() {
//         // NO-OP
//     }

//     public static getInstance(): DBDriver {
//         if (!DBDriver.instance) {
//             DBDriver.instance = new DBDriver();
//         }
//         return DBDriver.instance;
//     }

//     public async getContactEntity(): Promise<typeof ContactEntity> {
//         if (!DBDriver.instance.contactEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.contactEntity = ContactEntity.initModel(sequelize);
            
//         }
//         return DBDriver.instance.contactEntity;
//     }

//     public async getTenantAnonymousUserConfigurationEntity(): Promise<typeof TenantAnonymousUserConfigurationEntity> {
//         if (!DBDriver.instance.tenantAnonymousUserConfigurationEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantAnonymousUserConfigurationEntity = TenantAnonymousUserConfigurationEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantAnonymousUserConfigurationEntity;
//     }
//     public  async getTenantEntity(): Promise<typeof TenantEntity> {
//         if (!DBDriver.instance.tenantEntity) {            
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantEntity = TenantEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantEntity;
//     }
//     public async getTenantLegacyUserMigrationConfigEntity(): Promise<typeof TenantLegacyUserMigrationConfigEntity> {
//         if (!DBDriver.instance.tenantLegacyUserMigrationConfigEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantLegacyUserMigrationConfigEntity = TenantLegacyUserMigrationConfigEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantLegacyUserMigrationConfigEntity;
//     }
//     public async getTenantLookAndFeelEntity(): Promise<typeof TenantLookAndFeelEntity> {
//         if (!DBDriver.instance.tenantLookAndFeelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantLookAndFeelEntity = TenantLookAndFeelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantLookAndFeelEntity;
//     }
//     public async getTenantManagementDomainRelEntity(): Promise<typeof TenantManagementDomainRelEntity> {
//         if (!DBDriver.instance.tenantManagementDomainRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantManagementDomainRelEntity = TenantManagementDomainRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantManagementDomainRelEntity;
//     }
//     public async getTenantPasswordConfigEntity(): Promise<typeof TenantPasswordConfigEntity> {
//         if (!DBDriver.instance.tenantPasswordConfigEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantPasswordConfigEntity = TenantPasswordConfigEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantPasswordConfigEntity;
//     }
//     public async getTenantRestrictedAuthenticationDomainRelEntity(): Promise<typeof TenantRestrictedAuthenticationDomainRelEntity> {
//         if (!DBDriver.instance.tenantRestrictedAuthenticationDomainRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantRestrictedAuthenticationDomainRelEntity = TenantRestrictedAuthenticationDomainRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantRestrictedAuthenticationDomainRelEntity;
//     }
//     public async getPreAuthenticationStateEntity(): Promise<typeof PreAuthenticationStateEntity> {
//         if (!DBDriver.instance.preAuthenticationStateEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.preAuthenticationStateEntity = PreAuthenticationStateEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.preAuthenticationStateEntity;
//     }
//     public async getAuthorizationCodeDataEntity(): Promise<typeof AuthorizationCodeDataEntity> {
//         if (!DBDriver.instance.authorizationCodeDataEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.authorizationCodeDataEntity = AuthorizationCodeDataEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.authorizationCodeDataEntity;
//     }
//     public async getRefreshDataEntity(): Promise<typeof RefreshDataEntity> {
//         if (!DBDriver.instance.refreshDataEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.refreshDataEntity = RefreshDataEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.refreshDataEntity;
//     }
//     public async getFederatedOIDCAuthorizationRelEntity(): Promise<typeof FederatedOIDCAuthorizationRelEntity> {
//         if (!DBDriver.instance.federatedOIDCAuthorizationRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.federatedOIDCAuthorizationRelEntity = FederatedOIDCAuthorizationRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.federatedOIDCAuthorizationRelEntity;
//     }
//     public async getAccessRuleEntity(): Promise<typeof AccessRuleEntity> {
//         if (!DBDriver.instance.accessRuleEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.accessRuleEntity = AccessRuleEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.accessRuleEntity;
//     }
//     public async getAuthenticationGroupEntity(): Promise<typeof AuthenticationGroupEntity> {
//         if (!DBDriver.instance.authenticationGroupEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.authenticationGroupEntity = AuthenticationGroupEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.authenticationGroupEntity;
//     }
//     public async getAuthenticationGroupClientRelEntity(): Promise<typeof AuthenticationGroupClientRelEntity> {
//         if (!DBDriver.instance.authenticationGroupClientRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.authenticationGroupClientRelEntity = AuthenticationGroupClientRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.authenticationGroupClientRelEntity;
//     }
//     public async getAuthenticationGroupUserRelEntity(): Promise<typeof AuthenticationGroupUserRelEntity> {
//         if (!DBDriver.instance.authenticationGroupUserRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.authenticationGroupUserRelEntity = AuthenticationGroupUserRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.authenticationGroupUserRelEntity;
//     }
//     public async getAuthorizationGroupEntity(): Promise<typeof AuthorizationGroupEntity> {
//         if (!DBDriver.instance.authorizationGroupEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.authorizationGroupEntity = AuthorizationGroupEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.authorizationGroupEntity;
//     }
//     public async getAuthorizationGroupUserRelEntity(): Promise<typeof AuthorizationGroupUserRelEntity> {
//         if (!DBDriver.instance.authorizationGroupUserRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.authorizationGroupUserRelEntity = AuthorizationGroupUserRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.authorizationGroupUserRelEntity;
//     }
//     public async getChangeEventEntity(): Promise<typeof ChangeEventEntity> {
//         if (!DBDriver.instance.changeEventEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.changeEventEntity = ChangeEventEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.changeEventEntity;
//     }
//     public async getClientEntity(): Promise<typeof ClientEntity> {
//         if (!DBDriver.instance.clientEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.clientEntity = ClientEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.clientEntity;
//     }
//     public async getClientAuthHistoryEntity(): Promise<typeof ClientAuthHistoryEntity> {
//         if (!DBDriver.instance.clientAuthHistoryEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.clientAuthHistoryEntity = ClientAuthHistoryEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.clientAuthHistoryEntity;
//     }
//     public async getClientRedirectUriRelEntity(): Promise<typeof ClientRedirectUriRelEntity> {
//         if (!DBDriver.instance.clientRedirectUriRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.clientRedirectUriRelEntity = ClientRedirectUriRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.clientRedirectUriRelEntity;
//     }
//     public async getFederatedOIDCProviderTenantRelEntity(): Promise<typeof FederatedOIDCProviderTenantRelEntity> {
//         if (!DBDriver.instance.federatedOIDCProviderTenantRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.federatedOIDCProviderTenantRelEntity = FederatedOIDCProviderTenantRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.federatedOIDCProviderTenantRelEntity;
//     }
//     public async getFederatedOIDCProviderEntity(): Promise<typeof FederatedOIDCProviderEntity> {
//         if (!DBDriver.instance.federatedOIDCProviderEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.federatedOIDCProviderEntity = FederatedOIDCProviderEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.federatedOIDCProviderEntity;
//     }
//     public async getFederatedOIDCProviderDomainRelEntity(): Promise<typeof FederatedOIDCProviderDomainRelEntity> {
//         if (!DBDriver.instance.federatedOIDCProviderDomainRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.federatedOIDCProviderDomainRelEntity = FederatedOIDCProviderDomainRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.federatedOIDCProviderDomainRelEntity;
//     }
//     public async getUserEntity(): Promise<typeof UserEntity> {
//         if (!DBDriver.instance.userEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userEntity = UserEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userEntity;
//     }
//     public async getUserCredentialEntity(): Promise<typeof UserCredentialEntity> {
//         if (!DBDriver.instance.userCredentialEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userCredentialEntity = UserCredentialEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userCredentialEntity;
//     }
//     public async getUserFido2ChallengeEntity(): Promise<typeof UserFido2ChallengeEntity> {
//         if (!DBDriver.instance.userFido2ChallengeEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userFido2ChallengeEntity = UserFido2ChallengeEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userFido2ChallengeEntity;
//     }
//     public async getUserFailedLoginEntity(): Promise<typeof UserFailedLoginEntity> {
//         if (!DBDriver.instance.userFailedLoginEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userFailedLoginEntity = UserFailedLoginEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userFailedLoginEntity;
//     }
//     public async getUserVerificationTokenEntity(): Promise<typeof UserVerificationTokenEntity> {
//         if (!DBDriver.instance.userVerificationTokenEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userVerificationTokenEntity = UserVerificationTokenEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userVerificationTokenEntity;
//     }
//     public async getProhibitedPasswordEntity(): Promise<typeof ProhibitedPasswordEntity> {
//         if (!DBDriver.instance.prohibitedPasswordEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.prohibitedPasswordEntity = ProhibitedPasswordEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.prohibitedPasswordEntity;
//     }
//     public async getUserTenantRelEntity(): Promise<typeof UserTenantRelEntity> {
//         if (!DBDriver.instance.userTenantRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userTenantRelEntity = UserTenantRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userTenantRelEntity;
//     }
//     public async getTenantRateLimitRelEntity(): Promise<typeof TenantRateLimitRelEntity> {
//         if (!DBDriver.instance.tenantRateLimitRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantRateLimitRelEntity = TenantRateLimitRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantRateLimitRelEntity;
//     }
//     public async getRateLimitServiceGroupEntity(): Promise<typeof RateLimitServiceGroupEntity> {
//         if (!DBDriver.instance.rateLimitServiceGroupEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.rateLimitServiceGroupEntity = RateLimitServiceGroupEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.rateLimitServiceGroupEntity;
//     }
//     public async getTenantAvailableScopeEntity(): Promise<typeof TenantAvailableScopeEntity> {
//         if (!DBDriver.instance.tenantAvailableScopeEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantAvailableScopeEntity = TenantAvailableScopeEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantAvailableScopeEntity;
//     }
//     public async getScopeEntity(): Promise<typeof ScopeEntity> {
//         if (!DBDriver.instance.scopeEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.scopeEntity = ScopeEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.scopeEntity;
//     }
//     public async getSigningKeyEntity(): Promise<typeof SigningKeyEntity> {
//         if (!DBDriver.instance.signingKeyEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.signingKeyEntity = SigningKeyEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.signingKeyEntity;
//     }
//     public async getMarkForDeleteEntity(): Promise<typeof MarkForDeleteEntity> {
//         if (!DBDriver.instance.markForDeleteEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.markForDeleteEntity = MarkForDeleteEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.markForDeleteEntity;
//     }
//     public async getDeletionStatusEntity(): Promise<typeof DeletionStatusEntity> {
//         if (!DBDriver.instance.deletionStatusEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.deletionStatusEntity = DeletionStatusEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.deletionStatusEntity;
//     }
//     public async getUserMfaRelEntity(): Promise<typeof UserMfaRelEntity> {
//         if (!DBDriver.instance.userMfaRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userMfaRelEntity = UserMfaRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userMfaRelEntity;
//     }
//     public async getUserScopeRelEntity(): Promise<typeof UserScopeRelEntity> {
//         if (!DBDriver.instance.userScopeRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userScopeRelEntity = UserScopeRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userScopeRelEntity;
//     }
//     public async getAuthorizationGroupScopeRelEntity(): Promise<typeof AuthorizationGroupScopeRelEntity> {
//         if (!DBDriver.instance.authorizationGroupScopeRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.authorizationGroupScopeRelEntity = AuthorizationGroupScopeRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.authorizationGroupScopeRelEntity;
//     }
//     public async getClientScopeRelEntity(): Promise<typeof ClientScopeRelEntity> {
//         if (!DBDriver.instance.clientScopeRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.clientScopeRelEntity = ClientScopeRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.clientScopeRelEntity;
//     }
//     public async getStateProvinceRegionEntity(): Promise<typeof StateProvinceRegionEntity> {
//         if (!DBDriver.instance.stateProvinceRegionEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.stateProvinceRegionEntity = StateProvinceRegionEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.stateProvinceRegionEntity;
//     }
//     public async getUserFido2CounterRelEntity(): Promise<typeof UserFido2CounterRelEntity> {
//         if (!DBDriver.instance.userFido2CounterRelEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userFido2CounterRelEntity = UserFido2CounterRelEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userFido2CounterRelEntity;
//     }
//     public async getUserAuthenticationStateEntity(): Promise<typeof UserAuthenticationStateEntity> {
//         if (!DBDriver.instance.userAuthenticationStateEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userAuthenticationStateEntity = UserAuthenticationStateEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userAuthenticationStateEntity;
//     }
//     public async getUserRegistrationStateEntity(): Promise<typeof UserRegistrationStateEntity> {
//         if (!DBDriver.instance.userRegistrationStateEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userRegistrationStateEntity = UserRegistrationStateEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userRegistrationStateEntity;
//     }
//     public async getTenantLoginFailurePolicyEntity(): Promise<typeof TenantLoginFailurePolicyEntity> {
//         if (!DBDriver.instance.tenantLoginFailurePolicyEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.tenantLoginFailurePolicyEntity = TenantLoginFailurePolicyEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.tenantLoginFailurePolicyEntity;
//     }
//     public async getSchedulerLockEntity(): Promise<typeof SchedulerLockEntity> {
//         if (!DBDriver.instance.schedulerLockEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.schedulerLockEntity = SchedulerLockEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.schedulerLockEntity;
//     }
//     public async getCaptchaConfigEntity(): Promise<typeof CaptchaConfigEntity> {
//         if (!DBDriver.instance.captchaConfigEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.captchaConfigEntity = CaptchaConfigEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.captchaConfigEntity;
//     }
//     public async getUserTermsAndConditionsAcceptedEntity(): Promise<typeof UserTermsAndConditionsAcceptedEntity> {
//         if (!DBDriver.instance.userTermsAndConditionsAcceptedEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userTermsAndConditionsAcceptedEntity = UserTermsAndConditionsAcceptedEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userTermsAndConditionsAcceptedEntity;
//     }
//     public async getUserDuressCredentialEntity(): Promise<typeof UserDuressCredentialEntity> {
//         if (!DBDriver.instance.userDuressCredentialEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userDuressCredentialEntity = UserDuressCredentialEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userDuressCredentialEntity;
//     }
//     public async getSystemSettingsEntity(): Promise<typeof SystemSettingsEntity> {
//         if (!DBDriver.instance.systemSettingsEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.systemSettingsEntity = SystemSettingsEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.systemSettingsEntity;
//     }
//     public async getUserEmailRecoveryEntity(): Promise<typeof UserEmailRecoveryEntity> {
//         if (!DBDriver.instance.userEmailRecoveryEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userEmailRecoveryEntity = UserEmailRecoveryEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userEmailRecoveryEntity;
//     }
//     public async getAuthorizationDeviceCodeDataEntity(): Promise<typeof AuthorizationDeviceCodeDataEntity> {
//         if (!DBDriver.instance.authorizationDeviceCodeDataEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.authorizationDeviceCodeDataEntity = AuthorizationDeviceCodeDataEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.authorizationDeviceCodeDataEntity;
//     }
//     public async getSecretShareEntity(): Promise<typeof SecretShareEntity> {
//         if (!DBDriver.instance.secretShareEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.secretShareEntity = SecretShareEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.secretShareEntity;
//     }
//     public async getUserProfileChangeEmailStateEntity(): Promise<typeof UserProfileChangeEmailStateEntity> {
//         if (!DBDriver.instance.userProfileChangeEmailStateEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userProfileChangeEmailStateEntity = UserProfileChangeEmailStateEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userProfileChangeEmailStateEntity;
//     }
//     public async getUserAuthenticationHistoryEntity(): Promise<typeof UserAuthenticationHistoryEntity> {
//         if (!DBDriver.instance.userAuthenticationHistoryEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.userAuthenticationHistoryEntity = UserAuthenticationHistoryEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.userAuthenticationHistoryEntity;
//     }
//     public async getFederatedAuthTestEntity(): Promise<typeof FederatedAuthTestEntity> {
//         if (!DBDriver.instance.federatedAuthTestEntity) {
//             const sequelize = await DBDriver.getConnection();
//             DBDriver.instance.federatedAuthTestEntity = FederatedAuthTestEntity.initModel(sequelize);
//         }
//         return DBDriver.instance.federatedAuthTestEntity;
//     }



//     /**
//      * 
//      */
//     public static async getConnection(): Promise<Sequelize> {

//         if (!global.sequelize) {

//             if (!RDB_DIALECT || RDB_DIALECT === "" || !RDB_SUPPORTED_DIALECTS.includes(RDB_DIALECT)) {
//                 throw new Error("ERROR_MUST_PROVIDE_VALID_DIALECT_FOR_RELATION_DATABASE_CONNECTION");
//             }

//             let sequelize: Sequelize | null = null;
//             if (RDB_DIALECT === "postgres") {
//                 sequelize = new Sequelize({
//                     dialect: PostgresDialect,
//                     host: DB_HOST,
//                     port: parseInt(DB_PORT || "0"),
//                     user: DB_USER || "",
//                     password: DB_PASSWORD,
//                     database: DB_NAME || "",
//                     pool: {
//                         max: parseInt(DB_MAX_POOL_SIZE || "10"),
//                         min: parseInt(DB_MIN_POOL_SIZE || "4")
//                     },
//                     logging: DB_ENABLE_QUERY_LOGGING === "true" ? console.log : false
//                 });
//             }
//             else if (RDB_DIALECT === "mysql") {
//                 sequelize = new Sequelize({
//                     dialect: MySqlDialect,
//                     host: DB_HOST,
//                     port: parseInt(DB_PORT || "0"),
//                     user: DB_USER || "",
//                     password: DB_PASSWORD,
//                     database: DB_NAME || "",
//                     pool: {
//                         max: parseInt(DB_MAX_POOL_SIZE || "10"),
//                         min: parseInt(DB_MIN_POOL_SIZE || "4")
//                     },
//                     logging: DB_ENABLE_QUERY_LOGGING === "true" ? console.log : false
//                 });
//             }
//             else if (RDB_DIALECT === "mssql") {
//                 sequelize = new Sequelize({
//                     dialect: MsSqlDialect,
//                     server: DB_HOST,
//                     port: parseInt(DB_PORT || "0"),
//                     database: DB_NAME || "",
//                     trustServerCertificate: true,
//                     encrypt: false,                  
//                     authentication: {
//                         type: DB_AUTH_SCHEME === "ntlm" ? "ntlm" : "default",
//                         options: {
//                             domain: DB_USER_DOMAIN ? DB_USER_DOMAIN : undefined,
//                             userName: DB_USER || "",
//                             password: DB_PASSWORD
//                         }
//                     },                    
//                     pool: {
//                         max: parseInt(DB_MAX_POOL_SIZE || "10"),
//                         min: parseInt(DB_MIN_POOL_SIZE || "4")
//                     },
//                     logging: DB_ENABLE_QUERY_LOGGING === "true" ? console.log : false
//                 });
//             }

//             if (sequelize === null) {
//                 throw new Error("ERROR_MUST_PROVIDE_VALID_DIALECT_FOR_RELATION_DATABASE_CONNECTION");
//             }
//             global.sequelize = sequelize;

//             await global.sequelize.authenticate();            

//         }
//         return global.sequelize;
//     }
// }

// export default DBDriver;

