import { TenantAnonymousUserConfiguration, Contact, LoginFailurePolicy, Tenant, TenantLegacyUserMigrationConfig, TenantLookAndFeel, TenantManagementDomainRel, TenantPasswordConfig } from "@/graphql/generated/graphql-types";


abstract class TenantDao {


    abstract getRootTenant(): Promise<Tenant>;

    abstract createRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract updateRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract getTenants(tenantIds?: Array<string>): Promise<Array<Tenant>>;
 
    abstract getTenantById(tenantId: string): Promise<Tenant | null>;

    abstract getTenantLookAndFeed(tenantId: string): Promise<TenantLookAndFeel | null>;

    abstract createTenant(tenant: Tenant): Promise<Tenant | null>;

    abstract updateTenant(tenant: Tenant): Promise<Tenant>;

    abstract deleteTenant(tenantId: string): Promise<void>;

    abstract assignContactsToTenant(tenantId: string, contactList: Array<Contact>): Promise<Array<Contact>>;

    abstract getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>>;

    abstract addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null>;

    abstract removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null>;

    abstract createAnonymousUserConfiguration(tenantId: string, anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>;

    abstract updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>;

    abstract deleteAnonymousUserConfiguration(configurationId: string): Promise<void>;

    abstract createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>;

    abstract updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>;

    abstract deleteTenantLookAndFeel(tenantId: string): Promise<void>;

    abstract assignPasswordConfigToTenant(tenantId: string, tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig>;

    abstract getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null>;

    abstract removePasswordConfigFromTenant(tenantId: string): Promise<void>;

    abstract updateLoginFailurePolicy(loginFailurePolicy: LoginFailurePolicy): Promise<LoginFailurePolicy>;

    abstract getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null>;

    abstract setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null>;

    abstract removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void>;

}

export default TenantDao;