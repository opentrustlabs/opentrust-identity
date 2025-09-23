import { Tenant, TenantLookAndFeel, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantPasswordConfig, TenantLoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel, CaptchaConfig, SystemSettings } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";



class CassandraTenantDao extends TenantDao {

    
    getRootTenant(): Promise<Tenant | null> {
        throw new Error("Method not implemented.");
    }
    createRootTenant(tenant: Tenant): Promise<Tenant> {
        throw new Error("Method not implemented.");
    }
    updateRootTenant(tenant: Tenant): Promise<Tenant> {
        throw new Error("Method not implemented.");
    }
    public async getTenants(tenantIds?: Array<string>): Promise<Array<Tenant>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        const m = await CassandraDriver.getMapper();
        
        //const m1 = m.forModel("tenant");
        const results = await mapper.findAll();
        console.log(results);
        const a = results.toArray();
        console.log(a[0]);
        
        const t: Tenant = a[0];
        console.log(t);
        return a;
    }

    getTenantById(tenantId: string): Promise<Tenant | null> {
        throw new Error("Method not implemented.");
    }
    getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null> {
        throw new Error("Method not implemented.");
    }
    createTenant(tenant: Tenant): Promise<Tenant | null> {
        throw new Error("Method not implemented.");
    }
    updateTenant(tenant: Tenant): Promise<Tenant> {
        throw new Error("Method not implemented.");
    }
    deleteTenant(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>> {
        throw new Error("Method not implemented.");
    }
    addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        throw new Error("Method not implemented.");
    }
    removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        throw new Error("Method not implemented.");
    }
    getAnonymousUserConfiguration(tenantId: string): Promise<TenantAnonymousUserConfiguration | null> {
        throw new Error("Method not implemented.");
    }
    createAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        throw new Error("Method not implemented.");
    }
    updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        throw new Error("Method not implemented.");
    }
    deleteAnonymousUserConfiguration(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        throw new Error("Method not implemented.");
    }
    updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        throw new Error("Method not implemented.");
    }
    deleteTenantLookAndFeel(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    assignPasswordConfigToTenant(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        throw new Error("Method not implemented.");
    }
    updatePasswordConfig(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        throw new Error("Method not implemented.");
    }
    getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {
        throw new Error("Method not implemented.");
    }
    removePasswordConfigFromTenant(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null> {
        throw new Error("Method not implemented.");
    }
    createLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        throw new Error("Method not implemented.");
    }
    updateLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        throw new Error("Method not implemented.");
    }
    removeLoginFailurePolicy(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {
        throw new Error("Method not implemented.");
    }
    createTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        throw new Error("Method not implemented.");
    }
    updateTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        throw new Error("Method not implemented.");
    }
    removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>> {
        throw new Error("Method not implemented.");
    }
    addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel> {
        throw new Error("Method not implemented.");
    }
    removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    removeAllUsersFromTenant(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    removeAllAuthStateFromTenant(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCaptchaConfig(): Promise<CaptchaConfig | null> {
        throw new Error("Method not implemented.");
    }
    setCaptchaConfig(captchaConfig: CaptchaConfig): Promise<CaptchaConfig> {
        throw new Error("Method not implemented.");
    }
    removeCaptchaConfig(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getSystemSettings(): Promise<SystemSettings> {
        throw new Error("Method not implemented.");
    }
    updateSystemSettings(systemSettings: SystemSettings): Promise<SystemSettings> {
        throw new Error("Method not implemented.");
    }
    
}

export default CassandraTenantDao;