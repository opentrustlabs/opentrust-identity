import { Dialect, Sequelize } from "sequelize";
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
import ClientRedirectUriRelEntity from "../entities/client-redirect-uri-rel-entity";
import FederatedOIDCProviderEntity from "../entities/federated-oidc-provider-entity";
import FederatedOIDCProviderTenantRelEntity from "../entities/federated-oidc-provider-tenant-rel-entity";
import FederatedOIDCProviderDomainRelEntity from "../entities/federated-oidc-provider-domain-rel-entity";
import UserEntity from "../entities/user-entity";
import UserCredentialEntity from "../entities/user-credential-entity";
import UserFido2ChallengeEntity from "../entities/user-fido2-challenge-entity";
import UserFailedLoginAttemptsEntity from "../entities/user-failed-login-attempts-entity";
import UserVerificationTokenEntity from "../entities/user-verification-token-entity";
import ProhibitedPasswordEntity from "../entities/prohibited-password-entity";
import UserTenantRelEntity from "../entities/user-tenant-rel-entity";
import TenantRateLimitRelEntity from "../entities/tenant-rate-limit-rel-entity";
import RateLimitServiceGroupEntity from "../entities/rate-limit-service-group-entity";
import TenantAvailableScopeEntity from "../entities/tenant-available-scope-entity";
import ScopeEntity from "../entities/scope-entity";
import SigningKeyEntity from "../entities/signing-key-entity";

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    DB_PORT,
    DB_MIN_POOL_SIZE,
    DB_MAX_POOL_SIZE,
    DB_AUTH_SCHEME,
    DB_USER_DOMAIN,
    RDB_DIALECT,
    DB_ENABLE_QUERY_LOGGING
} = process.env;


declare global {
    var sequelize: Sequelize | undefined;
}


class DBDriver {

    private constructor() {
        // NO-OP
    }


    /**
     * 
     */
    public static async getConnection(): Promise<Sequelize> {

        if(!global.sequelize){
                        
            let dialect: Dialect | null = null; 
            
            if(RDB_DIALECT === "postgres"){
                dialect = "postgres";
            } 
            else if(RDB_DIALECT === "mysql"){
                dialect = "mysql";
            } 
            else if(RDB_DIALECT === "mssql"){
                dialect = "mssql";
            }
            else if(RDB_DIALECT === "oracle"){
                dialect = "oracle"
            }

            if(dialect === null){
                throw new Error("ERROR_MUST_PROVIDE_VALID_DIALECT_FOR_RELATION_DATABASE_CONNECTION");
            }

            global.sequelize = new Sequelize(
                DB_NAME || "",
                DB_USER || "",
                DB_PASSWORD,
                {
                    host: DB_HOST,
                    dialect: dialect,
                    port: parseInt(DB_PORT || "0"),
                    pool: {
                        max: parseInt(DB_MAX_POOL_SIZE || "10"),
                        min: parseInt(DB_MIN_POOL_SIZE || "4")
                    },
                    logging: DB_ENABLE_QUERY_LOGGING === "true"
                },
                
                
            );
            ContactEntity.initModel(global.sequelize);
            TenantAnonymousUserConfigurationEntity.initModel(global.sequelize);
            TenantEntity.initModel(global.sequelize);
            TenantLegacyUserMigrationConfigEntity.initModel(global.sequelize);
            TenantLookAndFeelEntity.initModel(global.sequelize);            
            TenantManagementDomainRelEntity.initModel(global.sequelize);
            TenantPasswordConfigEntity.initModel(global.sequelize);
            TenantRestrictedAuthenticationDomainRelEntity.initModel(global.sequelize);
            PreAuthenticationStateEntity.initModel(global.sequelize);
            AuthorizationCodeDataEntity.initModel(global.sequelize);
            RefreshDataEntity.initModel(global.sequelize);
            FederatedOIDCAuthorizationRelEntity.initModel(global.sequelize);
            AccessRuleEntity.initModel(global.sequelize);
            AuthenticationGroupEntity.initModel(global.sequelize);
            AuthenticationGroupClientRelEntity.initModel(global.sequelize);
            AuthenticationGroupUserRelEntity.initModel(global.sequelize);
            AuthorizationGroupEntity.initModel(global.sequelize);
            AuthorizationGroupUserRelEntity.initModel(global.sequelize);
            ChangeEventEntity.initModel(global.sequelize);
            ClientEntity.initModel(global.sequelize);
            ClientAuthHistoryEntity.initModel(global.sequelize);
            ClientRedirectUriRelEntity.initModel(global.sequelize);
            FederatedOIDCProviderTenantRelEntity.initModel(global.sequelize);
            FederatedOIDCProviderEntity.initModel(global.sequelize);
            FederatedOIDCProviderDomainRelEntity.initModel(global.sequelize);
            UserEntity.initModel(global.sequelize);
            UserCredentialEntity.initModel(global.sequelize);
            UserFido2ChallengeEntity.initModel(global.sequelize);
            UserFailedLoginAttemptsEntity.initModel(global.sequelize);
            UserVerificationTokenEntity.initModel(global.sequelize);
            ProhibitedPasswordEntity.initModel(global.sequelize);
            UserTenantRelEntity.initModel(global.sequelize);
            AuthorizationGroupEntity.initModel(global.sequelize);
            TenantRateLimitRelEntity.initModel(global.sequelize);
            RateLimitServiceGroupEntity.initModel(global.sequelize);
            TenantAvailableScopeEntity.initModel(global.sequelize);
            ScopeEntity.initModel(global.sequelize);
            SigningKeyEntity.initModel(global.sequelize);
        } 

        return global.sequelize;
    }

}

export default DBDriver;

