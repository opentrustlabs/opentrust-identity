import { TenantAnonymousUserConfiguration, TenantLoginFailurePolicy, Tenant, TenantLegacyUserMigrationConfig, TenantLookAndFeel, TenantManagementDomainRel, TenantPasswordConfig, TenantRestrictedAuthenticationDomainRel, CaptchaConfig, SystemSettings, SystemSettingsUpdateInput } from "@/graphql/generated/graphql-types";


abstract class TenantDao {


    abstract getRootTenant(): Promise<Tenant>;

    abstract createRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract updateRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract getTenants(tenantIds?: Array<string>): Promise<Array<Tenant>>;
 
    abstract getTenantById(tenantId: string): Promise<Tenant | null>;

    abstract getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null>;

    abstract createTenant(tenant: Tenant): Promise<Tenant | null>;

    abstract updateTenant(tenant: Tenant): Promise<Tenant>;

    abstract deleteTenant(tenantId: string): Promise<void>;

    abstract getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>>;

    abstract addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null>;

    abstract removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null>;

    abstract getAnonymousUserConfiguration(tenantId: string): Promise<TenantAnonymousUserConfiguration | null>;

    abstract createAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>;

    abstract updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>;

    abstract deleteAnonymousUserConfiguration(tenantId: string): Promise<void>;

    abstract createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>;

    abstract updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>;

    abstract deleteTenantLookAndFeel(tenantId: string): Promise<void>;

    abstract assignPasswordConfigToTenant(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig>;

    abstract updatePasswordConfig(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig>;

    abstract getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null>;

    abstract removePasswordConfigFromTenant(tenantId: string): Promise<void>;

    abstract getLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null>;

    abstract createLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy>;

    abstract updateLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy>;

    abstract removeLoginFailurePolicy(tenantId: string): Promise<void>;

    abstract getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null>;

    abstract createTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null>;

    abstract updateTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null>;

    abstract removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void>;

    abstract getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>>;

    abstract addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel>;

    abstract removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void>;

    abstract removeAllUsersFromTenant(tenantId: string): Promise<void>;

    abstract removeAllAuthStateFromTenant(tenantId: string): Promise<void>;

    abstract getCaptchaConfig(): Promise<CaptchaConfig | null>;

    abstract setCaptchaConfig(captchaConfig: CaptchaConfig): Promise<CaptchaConfig>;

    abstract removeCaptchaConfig(): Promise<void>;

    abstract getSystemSettings(): Promise<SystemSettings>;

    abstract updateSystemSettings(input: SystemSettingsUpdateInput): Promise<SystemSettings>;

}

export default TenantDao;