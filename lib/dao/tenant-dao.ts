import { Client, ClientTenantScopeRel, Group, Key, LoginGroup, LoginGroupClientRel, RateLimit, Scope, Tenant, TenantRateLimitRel, TenantScopeRel, UserGroupRel } from "@/graphql/generated/graphql-types";


abstract class TenantDao {


    abstract getRootTenant(): Promise<Tenant>;

    abstract createRootTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant>;

    abstract updateRootTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant>;

    abstract getTenants(): Promise<Array<Tenant>>;
 
    abstract getTenantById(tenantId: string): Promise<Tenant | null>;

    abstract createTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant | null>;

    abstract updateTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant>;

    abstract deleteTenant(tenantId: string): Promise<void>;
  

}

export default TenantDao;