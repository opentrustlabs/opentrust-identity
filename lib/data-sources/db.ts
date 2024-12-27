import 'reflect-metadata';
import { MikroORM, MySqlDriver } from '@mikro-orm/mysql';
//import { MikroORM as MySqlMikroORM, MsSqlDriver } from '@mikro-orm/mssql';
import { TenantEntity } from "../entities/tenant-entity";
import { FederatedOIDCProviderEntity } from '../entities/federated-oidc-provider-entity';
import LoginFailurePolicyEntity from '../entities/login-failure-policy-entity';
import TenantManagementDomainRelEntity from '../entities/tenant-management-domain-rel-entity';
import FederatedOIDCProviderTenantRelEntity from '../entities/federated-oidc-provider-tenant-rel-entity';
import SocialOIDCProviderTenantRelEntity from '../entities/social-oidc-provider-tenant-rel-entity';
import FederatedOIDCProviderDomainRelEntity from '../entities/federated-oidc-provider-domain-rel-entity';
import ClientEntity from '../entities/client-entity';
import ClientRedirectUriRelEntity from '../entities/client-redirect-uri-rel-entity';
import AccessRuleEntity from '../entities/access-rule-entity';
import AnonymousUserConfigurationEntity from '../entities/anonymous-user-configuration-entity';
import AuthenticationGroupClientRelEntity from '../entities/authentication-group-client-rel-entity';
import AuthenticationGroupEntity from '../entities/authentication-group-entity';
import AuthenticationGroupUserRelEntity from '../entities/authentication-group-user-rel-entity';
import AuthorizationCodeDataEntity from '../entities/authorization-code-data-entity';
import AuthorizationGroupEntity from '../entities/authorization-group-entity';
import AuthorizationGroupScopeRelEntity from '../entities/authorization-group-scope-rel-entity';
import ChangeEventDataEntity from '../entities/change-event-data-entity';
import ChangeEventEntity from '../entities/change-event-entity';
import ClientAuthHistoryEntity from '../entities/client-auth-history-entity';
import ClientTenantScopeRelEntity from '../entities/client-tenant-scope-rel-entity';
import ContactEntity from '../entities/contact-entity';
import FederatedOIDCAuthorizationRelEntity from '../entities/federated-oidc-authorization-rel-entity';
import FooterLinkEntity from '../entities/footer-link-entity';
import PreAuthenticationStateEntity from '../entities/pre-authentication-state-entity';
import RateLimitEntity from '../entities/rate-limit-entity';
import RateLimitServiceGroupEntity from '../entities/rate-limit-service-group-entity';
import RateLimitServiceGroupScopeRelEntity from '../entities/rate-limit-service-group-scope-rel-entity';
import RefreshDataEntity from '../entities/refresh-data-entity';
import ScopeConstraintSchemaEntity from '../entities/scope-constraint-schema-entity';
import ScopeEntity from '../entities/scope-entity';
import SigningKeyEntity from '../entities/signing-key-entity';
import TenantAnonymousUserConfigurationRelEntity from '../entities/tenant-anonymouse-user-configuration-rel-entity';
import TenantLookAndFeelEntity from '../entities/tenant-look-and-feel-entity';
import TenantRateLimitRelEntity from '../entities/tenant-rate-limit-rel-entity';
import TenantScopeRelEntity from '../entities/tenant-scope-rel-entity';
import UserAuthorizationGroupRelEntity from '../entities/user-authorization-group-rel-entity';
import UserCredentialEntity from '../entities/user-credential-entity';
import UserEntity from '../entities/user-entity';
import UserScopeRelEntity from '../entities/user-scope-rel-entity';
import UserTenantRelEntity from '../entities/user-tenant-rel-entity';

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
            ClientTenantScopeRelEntity,
            ContactEntity,
            FederatedOIDCAuthorizationRelEntity,
            FederatedOIDCProviderDomainRelEntity,
            FederatedOIDCProviderEntity,
            FederatedOIDCProviderTenantRelEntity,
            FooterLinkEntity,
            LoginFailurePolicyEntity,
            PreAuthenticationStateEntity,
            RateLimitEntity,
            RateLimitServiceGroupEntity,
            RateLimitServiceGroupScopeRelEntity,
            RefreshDataEntity,
            ScopeConstraintSchemaEntity,
            ScopeEntity,
            SigningKeyEntity,
            SocialOIDCProviderTenantRelEntity,
            TenantAnonymousUserConfigurationRelEntity,
            TenantEntity,
            TenantLookAndFeelEntity,
            TenantManagementDomainRelEntity,
            TenantRateLimitRelEntity,
            TenantScopeRelEntity,
            UserAuthorizationGroupRelEntity,
            UserCredentialEntity,
            UserEntity,
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