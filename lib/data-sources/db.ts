import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/mysql';
import LoginFailurePolicyEntity from '@/lib/entities/login-failure-policy-entity';
import SocialOIDCProviderTenantRelEntity from '@/lib/entities/social-oidc-provider-tenant-rel-entity';
import AuthorizationGroupScopeRelEntity from '@/lib/entities/authorization-group-scope-rel-entity';
import FooterLinkEntity from '@/lib/entities/footer-link-entity';
import RateLimitEntity from '@/lib/entities/rate-limit-entity';
import RateLimitServiceGroupScopeRelEntity from '@/lib/entities/rate-limit-service-group-scope-rel-entity';
import ScopeConstraintSchemaEntity from '@/lib/entities/scope-access-rule-schema-entity';
import ScopeEntity from '@/lib/entities/scope-entity';
import SigningKeyEntity from '@/lib/entities/signing-key-entity';
import TenantAvailableScopeEntity from '@/lib/entities/tenant-available-scope-entity';
import UserScopeRelEntity from '@/lib/entities/user-scope-rel-entity';
import ClientScopeRelEntity from '@/lib/entities/client-scope-rel-entity';
import SchedulerLockEntity from '@/lib/entities/scheduler-lock-entity';
import UserFido2CounterRelEntity from '@/lib/entities/user-fido2-counter-rel-entity';

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
            FooterLinkEntity,
            LoginFailurePolicyEntity,
            RateLimitEntity,
            RateLimitServiceGroupScopeRelEntity,
            SchedulerLockEntity,
            ScopeConstraintSchemaEntity,
            ScopeEntity,
            SigningKeyEntity,
            SocialOIDCProviderTenantRelEntity,
            TenantAvailableScopeEntity,
            UserFido2CounterRelEntity,
            UserScopeRelEntity
            
        ],        
    }
);

await connection.connect();

export default connection;

