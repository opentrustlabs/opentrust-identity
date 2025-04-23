import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/mysql';
import { FederatedOIDCProviderEntity } from '@/lib/entities/federated-oidc-provider-entity';
import LoginFailurePolicyEntity from '@/lib/entities/login-failure-policy-entity';
import FederatedOIDCProviderTenantRelEntity from '@/lib/entities/federated-oidc-provider-tenant-rel-entity';
import SocialOIDCProviderTenantRelEntity from '@/lib/entities/social-oidc-provider-tenant-rel-entity';
import FederatedOIDCProviderDomainRelEntity from '@/lib/entities/federated-oidc-provider-domain-rel-entity';
import ClientEntity from '@/lib/entities/client-entity';
import ClientRedirectUriRelEntity from '@/lib/entities/client-redirect-uri-rel-entity';
import AccessRuleEntity from '@/lib/entities/access-rule-entity';
import AuthenticationGroupClientRelEntity from '@/lib/entities/authentication-group-client-rel-entity';
import AuthenticationGroupEntity from '@/lib/entities/authentication-group-entity';
import AuthenticationGroupUserRelEntity from '@/lib/entities/authentication-group-user-rel-entity';
import AuthorizationCodeDataEntity from '@/lib/entities/authorization-code-data-entity';
import AuthorizationGroupEntity from '@/lib/entities/authorization-group-entity';
import AuthorizationGroupScopeRelEntity from '@/lib/entities/authorization-group-scope-rel-entity';
import ChangeEventEntity from '@/lib/entities/change-event-entity';
import ClientAuthHistoryEntity from '@/lib/entities/client-auth-history-entity';
import FederatedOIDCAuthorizationRelEntity from '@/lib/entities/federated-oidc-authorization-rel-entity';
import FooterLinkEntity from '@/lib/entities/footer-link-entity';
import PreAuthenticationStateEntity from '@/lib/entities/pre-authentication-state-entity';
import RateLimitEntity from '@/lib/entities/rate-limit-entity';
import RateLimitServiceGroupEntity from '@/lib/entities/rate-limit-service-group-entity';
import RateLimitServiceGroupScopeRelEntity from '@/lib/entities/rate-limit-service-group-scope-rel-entity';
import RefreshDataEntity from '@/lib/entities/refresh-data-entity';
import ScopeConstraintSchemaEntity from '@/lib/entities/scope-access-rule-schema-entity';
import ScopeEntity from '@/lib/entities/scope-entity';
import SigningKeyEntity from '@/lib/entities/signing-key-entity';
import TenantRateLimitRelEntity from '@/lib/entities/tenant-rate-limit-rel-entity';
import TenantAvailableScopeEntity from '@/lib/entities/tenant-available-scope-entity';
import UserAuthorizationGroupRelEntity from '@/lib/entities/authorization-group-user-rel-entity';
import UserCredentialEntity from '@/lib/entities/user-credential-entity';
import UserEntity from '@/lib/entities/user-entity';
import UserScopeRelEntity from '@/lib/entities/user-scope-rel-entity';
import UserTenantRelEntity from '@/lib/entities/user-tenant-rel-entity';
import ClientScopeRelEntity from '@/lib/entities/client-scope-rel-entity';
import ProhibitedPasswordEntity from '@/lib/entities/prohibited-password-entity';
import SchedulerLockEntity from '@/lib/entities/scheduler-lock-entity';
import TenantPasswordConfigEntity from '@/lib/entities/tenant-password-config-entity';
import UserFailedLoginAttemptsEntity from '@/lib/entities/user-failed-login-attempts-entity';
import UserVerificationTokenEntity from '@/lib/entities/user-verification-token-entity';
import UserFido2ChallengeEntity from '@/lib/entities/user-fido2-challenge-entity';
import UserFido2CounterRelEntity from '@/lib/entities/user-fido2-counter-rel-entity';
import UserMfaRelEntity from '@/lib/entities/user-mfa-rel-entity';

const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    DB_PORT,
    DB_MIN_POOL_SIZE,
    DB_MAX_POOL_SIZE,
    DB_AUTH_SCHEME,
    DB_USER_DOMAIN
} = process.env;


const connection = MikroORM.initSync(
    {
        dbName: DB_NAME,
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: parseInt(DB_PORT || "0"),
        pool: {
            max: DB_MAX_POOL_SIZE ? parseInt(DB_MAX_POOL_SIZE) : 10,
            min: DB_MIN_POOL_SIZE ? parseInt(DB_MIN_POOL_SIZE) : 4,
        },
        // driverOptions: {
        //     authenticationScheme: DB_AUTH_SCHEME || "NTLM",
        //     domain: DB_USER_DOMAIN || "domain"
        // },
        entities: [
            AccessRuleEntity,
            AuthenticationGroupClientRelEntity,
            AuthenticationGroupEntity,
            AuthenticationGroupUserRelEntity,
            AuthorizationCodeDataEntity,
            AuthorizationGroupEntity,
            AuthorizationGroupScopeRelEntity,
            ChangeEventEntity,
            ClientAuthHistoryEntity,
            ClientEntity,
            ClientRedirectUriRelEntity,
            ClientScopeRelEntity,
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
            TenantPasswordConfigEntity,
            TenantRateLimitRelEntity,
            TenantAvailableScopeEntity,
            UserAuthorizationGroupRelEntity,
            UserCredentialEntity,            
            UserFailedLoginAttemptsEntity,
            UserFido2ChallengeEntity,
            UserFido2CounterRelEntity,
            UserEntity,
            UserMfaRelEntity,
            UserVerificationTokenEntity,
            UserScopeRelEntity,
            UserTenantRelEntity
            
        ],        
    }
);

await connection.connect();

export default connection;

