import 'reflect-metadata';
import { MikroORM, MySqlDriver } from '@mikro-orm/mysql';
//import { MikroORM as MySqlMikroORM, MsSqlDriver } from '@mikro-orm/mssql';
import { TenantEntity } from "@/lib/entities/tenant-entity";
import { FederatedOIDCProviderEntity } from '@/lib/entities/federated-oidc-provider-entity';
import LoginFailurePolicyEntity from '@/lib/entities/login-failure-policy-entity';
import TenantManagementDomainRelEntity from '@/lib/entities/tenant-management-domain-rel-entity';
import FederatedOIDCProviderTenantRelEntity from '@/lib/entities/federated-oidc-provider-tenant-rel-entity';
import SocialOIDCProviderTenantRelEntity from '@/lib/entities/social-oidc-provider-tenant-rel-entity';
import FederatedOIDCProviderDomainRelEntity from '@/lib/entities/federated-oidc-provider-domain-rel-entity';
import ClientEntity from '@/lib/entities/client-entity';
import ClientRedirectUriRelEntity from '@/lib/entities/client-redirect-uri-rel-entity';
import AccessRuleEntity from '@/lib/entities/access-rule-entity';
import AnonymousUserConfigurationEntity from '@/lib/entities/anonymous-user-configuration-entity';
import AuthenticationGroupClientRelEntity from '@/lib/entities/authentication-group-client-rel-entity';
import AuthenticationGroupEntity from '@/lib/entities/authentication-group-entity';
import AuthenticationGroupUserRelEntity from '@/lib/entities/authentication-group-user-rel-entity';
import AuthorizationCodeDataEntity from '@/lib/entities/authorization-code-data-entity';
import AuthorizationGroupEntity from '@/lib/entities/authorization-group-entity';
import AuthorizationGroupScopeRelEntity from '@/lib/entities/authorization-group-scope-rel-entity';
import ChangeEventEntity from '@/lib/entities/change-event-entity';
import ClientAuthHistoryEntity from '@/lib/entities/client-auth-history-entity';
import ContactEntity from '@/lib/entities/contact-entity';
import FederatedOIDCAuthorizationRelEntity from '@/lib/entities/federated-oidc-authorization-rel-entity';
import FooterLinkEntity from '@/lib/entities/footer-link-entity';
import PreAuthenticationStateEntity from '@/lib/entities/pre-authentication-state-entity';
import RateLimitEntity from '@/lib/entities/rate-limit-entity';
import RateLimitServiceGroupEntity from '@/lib/entities/rate-limit-service-group-entity';
import RateLimitServiceGroupScopeRelEntity from '@/lib/entities/rate-limit-service-group-scope-rel-entity';
import RefreshDataEntity from '@/lib/entities/refresh-data-entity';
import ScopeConstraintSchemaEntity from '@/lib/entities/scope-constraint-schema-entity';
import ScopeEntity from '@/lib/entities/scope-entity';
import SigningKeyEntity from '@/lib/entities/signing-key-entity';
import TenantAnonymousUserConfigurationRelEntity from '@/lib/entities/tenant-anonymous-user-configuration-rel-entity';
import TenantLookAndFeelEntity from '@/lib/entities/tenant-look-and-feel-entity';
import TenantRateLimitRelEntity from '@/lib/entities/tenant-rate-limit-rel-entity';
import TenantScopeRelEntity from '@/lib/entities/tenant-scope-rel-entity';
import UserAuthorizationGroupRelEntity from '@/lib/entities/user-authorization-group-rel-entity';
import UserCredentialEntity from '@/lib/entities/user-credential-entity';
import UserEntity from '@/lib/entities/user-entity';
import UserScopeRelEntity from '@/lib/entities/user-scope-rel-entity';
import UserTenantRelEntity from '@/lib/entities/user-tenant-rel-entity';
import ChangeEventDataEntity from '@/lib/entities/change-event-data-entity';
import ClientScopeRelEntity from '@/lib/entities/client-tenant-scope-rel-entity';
import ProhibitedPasswordEntity from '@/lib/entities/prohibited-password-entity';
import SchedulerLockEntity from '@/lib/entities/scheduler-lock-entity';
import TenantPasswordConfigEntity from '@/lib/entities/tenant-password-config-entity';
import TenantRestrictedAuthenticationDomainRelEntity from '@/lib/entities/tenant-restricted-authentication-domain-rel-entity';
import UserFailedLoginAttemptsEntity from '@/lib/entities/user-failed-login-attempts-entity';
import UserPasswordResetTokenEntity from '@/lib/entities/user-password-reset-token-entity';


const connection = MikroORM.initSync(
    {
        dbName: "OPEN_CERTS_OIDC_IAM",
        user: "root",
        password: "sagman",
        host: "localhost",
        port: 3306,
        pool: {
            max: 10,
            min: 4
        },
        // driverOptions: {
        //     authenticationScheme: "NTLM",
        //     domain: "domain"
        // },
        entities: [
            AccessRuleEntity,
            AnonymousUserConfigurationEntity,
            AuthenticationGroupClientRelEntity,
            AuthenticationGroupEntity,
            AuthenticationGroupUserRelEntity,
            AuthorizationCodeDataEntity,
            AuthorizationGroupEntity,
            AuthorizationGroupScopeRelEntity,
            ChangeEventDataEntity,
            ChangeEventEntity,
            ClientAuthHistoryEntity,
            ClientEntity,
            ClientRedirectUriRelEntity,
            ClientScopeRelEntity,
            ContactEntity,
            FederatedOIDCAuthorizationRelEntity,
            FederatedOIDCProviderDomainRelEntity,
            FederatedOIDCProviderEntity,
            FederatedOIDCProviderTenantRelEntity,
            FooterLinkEntity,
            LoginFailurePolicyEntity,
            PreAuthenticationStateEntity,
            ProhibitedPasswordEntity,
            RateLimitEntity,
            RateLimitServiceGroupEntity,
            RateLimitServiceGroupScopeRelEntity,
            RefreshDataEntity,
            SchedulerLockEntity,
            ScopeConstraintSchemaEntity,
            ScopeEntity,
            SigningKeyEntity,
            SocialOIDCProviderTenantRelEntity,
            TenantAnonymousUserConfigurationRelEntity,
            TenantEntity,
            TenantLookAndFeelEntity,
            TenantManagementDomainRelEntity,
            TenantPasswordConfigEntity,
            TenantRateLimitRelEntity,
            TenantRestrictedAuthenticationDomainRelEntity,
            TenantScopeRelEntity,
            UserAuthorizationGroupRelEntity,
            UserCredentialEntity,
            UserFailedLoginAttemptsEntity,
            UserEntity,
            UserPasswordResetTokenEntity,
            UserScopeRelEntity,
            UserTenantRelEntity
            
        ],        
    }
);

await connection.connect();

export default connection;


// export const AppDataSource: Sequelize = new Sequelize({
//     dialect: "mysql",
//     host: "localhost",
//     port: 3306,
//     username: "root",
//     password: "sagman",
//     database: "OPEN_CERTS_OIDC_IAM",
//     models: [
//         TenantEntity
//     ],
//     pool: {
//         max: 10,
//         min: 4
//     },
//     logging: true,
    

    // synchronize: false,
    // entities: [
    //     TenantEntity
    // ],
    // logging: true,
    // poolSize: 10,
    // extra: []
//});
// console.log('created new sequelize');
// AppDataSource
//     .authenticate()
//     .then(
//         () =>{
//             console.log("connection established")
//         }
//     )
//     .catch(err => {
//         console.log("error unable to connect to database", err);
//     })
//     ;

// AppDataSource.addModels([
//     TenantEntity
// ]);

//AppDataSource.sync();