import { AnonymousUserConfiguration, Tenant, TenantLookAndFeel, TenantManagementDomainRel } from "@/graphql/generated/graphql-types";


abstract class TenantDao {


    abstract getRootTenant(): Promise<Tenant>;

    abstract createRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract updateRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract getTenants(): Promise<Array<Tenant>>;
 
    abstract getTenantById(tenantId: string): Promise<Tenant | null>;

    abstract createTenant(tenant: Tenant): Promise<Tenant | null>;

    abstract updateTenant(tenant: Tenant): Promise<Tenant>;

    abstract deleteTenant(tenantId: string): Promise<void>;

    abstract getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>>;

    abstract addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null>;

    abstract removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null>;

    abstract createAnonymousUserConfiguration(tenantId: string, anonymousUserConfiguration: AnonymousUserConfiguration): Promise<AnonymousUserConfiguration>;

    abstract updateAnonymousUserConfiguration(anonymousUserConfiguration: AnonymousUserConfiguration): Promise<AnonymousUserConfiguration>;

    abstract deleteAnonymousUserConfiguration(configurationId: string): Promise<void>;

    abstract createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>;

    abstract updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>;

    abstract deleteTenantLookAndFeel(tenantId: string): Promise<void>;

}

export default TenantDao;