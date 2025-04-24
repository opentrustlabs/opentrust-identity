import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/mysql';
import { FederatedOIDCProviderEntity } from '@/lib/entities/federated-oidc-provider-entity';
import LoginFailurePolicyEntity from '@/lib/entities/login-failure-policy-entity';
import FederatedOIDCProviderTenantRelEntity from '@/lib/entities/federated-oidc-provider-tenant-rel-entity';
import SocialOIDCProviderTenantRelEntity from '@/lib/entities/social-oidc-provider-tenant-rel-entity';
import FederatedOIDCProviderDomainRelEntity from '@/lib/entities/federated-oidc-provider-domain-rel-entity';
import AuthorizationGroupScopeRelEntity from '@/lib/entities/authorization-group-scope-rel-entity';
import FooterLinkEntity from '@/lib/entities/footer-link-entity';
import RateLimitEntity from '@/lib/entities/rate-limit-entity';
import RateLimitServiceGroupEntity from '@/lib/entities/rate-limit-service-group-entity';
import RateLimitServiceGroupScopeRelEntity from '@/lib/entities/rate-limit-service-group-scope-rel-entity';
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
            AuthorizationGroupScopeRelEntity,
            ClientScopeRelEntity,
            FederatedOIDCProviderDomainRelEntity,
            FederatedOIDCProviderEntity,
            FederatedOIDCProviderTenantRelEntity,
            FooterLinkEntity,
            LoginFailurePolicyEntity,
            ProhibitedPasswordEntity,
            RateLimitEntity,
            RateLimitServiceGroupEntity,
            RateLimitServiceGroupScopeRelEntity,
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

