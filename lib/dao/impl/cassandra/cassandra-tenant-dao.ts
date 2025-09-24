import { Tenant, TenantLookAndFeel, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantPasswordConfig, TenantLoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel, CaptchaConfig, SystemSettings, SystemCategory, UserTenantRel } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import cassandra from "cassandra-driver";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS, OPENTRUST_IDENTITY_VERSION, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";


class CassandraTenantDao extends TenantDao {

    
    public async getRootTenant(): Promise<Tenant | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("root_tenant");
        const t: cassandra.mapping.Result<Tenant | null> = await mapper.findAll();
        return t.first() || null;
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const rootTenantMapper = await CassandraDriver.getInstance().getModelMapper("root_tenant");
        await rootTenantMapper.insert(tenant);

        const tenantMapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        await tenantMapper.insert(tenant);

        return tenant;
    }

    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const rootTenantMapper = await CassandraDriver.getInstance().getModelMapper("root_tenant");
        await rootTenantMapper.update(tenant);
        
        const tenantMapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        await tenantMapper.update(tenant);

        return tenant;
    }

    public async getTenants(tenantIds: Array<string>): Promise<Array<Tenant>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        const results = await mapper.find({
            tenantId: cassandra.mapping.q.in_(tenantIds)
        });
        const a = results.toArray();
        return a;
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        const result = await mapper.get({tenantId: tenantId});        
        return result ? result as Tenant : null; 
    }


    public async getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_look_and_feel");
        return mapper.get({tenantId: tenantId});
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const tenantMapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        await tenantMapper.insert(tenant);
        return tenant;
    }


    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const tenantMapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        await tenantMapper.update(tenant);
        return tenant;
    }


    public async deleteTenant(tenantId: string): Promise<void> {
        const tenantMapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        await tenantMapper.remove({tenantId: tenantId});
        return;
    }


    public async getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>> {
        throw new Error("Method not implemented.");
    }

    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_management_domain_rel");
        const tenantManagementDomainRel: TenantManagementDomainRel = {
            domain,
            tenantId
        };
        await mapper.insert(tenantManagementDomainRel);
        return tenantManagementDomainRel;
    }

    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_management_domain_rel");
        await mapper.remove({
            tenantId: tenantId,
            domain: domain
        });
        return {
            domain,
            tenantId
        }
    }

    public async getAnonymousUserConfiguration(tenantId: string): Promise<TenantAnonymousUserConfiguration | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_anonymous_user_configuration");
        const c: TenantAnonymousUserConfiguration | null = await mapper.get({tenantId: tenantId});
        return c;
    }


    public async createAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_anonymous_user_configuration");
        await mapper.insert(anonymousUserConfiguration);
        return anonymousUserConfiguration;
    }

    public async updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_anonymous_user_configuration");
        await mapper.update(anonymousUserConfiguration);
        return anonymousUserConfiguration;
    }

    public async deleteAnonymousUserConfiguration(tenantId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_anonymous_user_configuration");
        await mapper.remove({tenantId: tenantId})
    }

    public async createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_look_and_feel");
        await mapper.insert(tenantLookAndFeel);
        return tenantLookAndFeel;
    }

    public async updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_look_and_feel");
        await mapper.update(tenantLookAndFeel);
        return tenantLookAndFeel;
    }
    
    public async deleteTenantLookAndFeel(tenantId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_look_and_feel");
        await mapper.remove({tenantid: tenantId});
        return;
    }

    public async assignPasswordConfigToTenant(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_password_config");
        await mapper.insert(tenantPasswordConfig);
        return tenantPasswordConfig;
    }

    public async updatePasswordConfig(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_password_config");
        await mapper.update(tenantPasswordConfig);
        return tenantPasswordConfig;
    }

    public async getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_password_config");
        return mapper.get({tenantId: tenantId});
    }

    public async removePasswordConfigFromTenant(tenantId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_password_config");
        await mapper.remove({tenantId: tenantId});
        return;
    }

    public async getLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_login_failure_policy");
        return mapper.get({tenantId: tenantId});
    }

    public async createLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_login_failure_policy");
        await mapper.insert(loginFailurePolicy);
        return loginFailurePolicy;
    }

    public async updateLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_login_failure_policy");
        await mapper.update(loginFailurePolicy);
        return loginFailurePolicy;
    }

    public async removeLoginFailurePolicy(tenantId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_login_failure_policy");
        await mapper.remove({tenantId: tenantId});
        return;
    }

    public async getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_legacy_user_migration_config");
        return mapper.get({tenantId: tenantId});
    }

    public async createTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_legacy_user_migration_config");
        await mapper.insert(tenantLegacyUserMigrationConfig);
        return tenantLegacyUserMigrationConfig;
    }

    public async updateTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_legacy_user_migration_config");
        await mapper.update(tenantLegacyUserMigrationConfig);
        return tenantLegacyUserMigrationConfig;
    }

    public async removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_legacy_user_migration_config");
        await mapper.remove({tenantId: tenantId});
        return;
    }

    public async getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_restricted_authentication_domain_rel");
        const results = await mapper.find({tenantId: tenantId});
        return results.toArray();
    }

    public async addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_restricted_authentication_domain_rel");
        const rel: TenantRestrictedAuthenticationDomainRel = {
            domain,
            tenantId
        };
        await mapper.insert(rel);
        return rel;
    }

    public async removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_restricted_authentication_domain_rel");
        await mapper.remove({tenantId: tenantId, domain: domain});
        return;
    }

    public async removeAllUsersFromTenant(tenantId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("user_tenant_rel");

        let hasMore: boolean = true;
        while(hasMore === true){
            const resultList: cassandra.mapping.Result<UserTenantRel> = await mapper.find({tenantId: tenantId}, {}, {fetchSize: 2000});
            const arr: Array<UserTenantRel> = resultList.toArray();
            for(let i = 0; i < arr.length; i++){
                await mapper.remove({usreId: arr[i].userId, tenantId: arr[i].tenantId});
            }
            hasMore = arr.length === 2000;
        }
    }

    public async removeAllAuthStateFromTenant(): Promise<void> {
        // NO OP
        // Most of the the auth state data in Cassandra is managed via a TTL set on each
        // record when the data is inserted. 
    }

    public async getCaptchaConfig(): Promise<CaptchaConfig | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("captcha_config");
        const results = await mapper.findAll();
        return results.first() ? results.first() : null;
    }

    public async setCaptchaConfig(captchaConfig: CaptchaConfig): Promise<CaptchaConfig> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("captcha_config");
        await mapper.update(captchaConfig);
        return captchaConfig;
    }

    public async removeCaptchaConfig(): Promise<void> {
        const config: CaptchaConfig | null = await this.getCaptchaConfig();
        if(config !== null){
            const mapper = await CassandraDriver.getInstance().getModelMapper("captcha_config");
            await mapper.remove({alias: config.alias});
        }
        return;
    }

    public async getSystemSettings(): Promise<SystemSettings> {
        const systemSettings: SystemSettings = {
            systemId: "",
            allowRecoveryEmail: false,
            allowDuressPassword: false,
            rootClientId: "",
            enablePortalAsLegacyIdp: false,
            auditRecordRetentionPeriodDays: DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS,
            softwareVersion: OPENTRUST_IDENTITY_VERSION,
            systemCategories: []
        }
        const mapper = await CassandraDriver.getInstance().getModelMapper("system_settings");
        const results = await mapper.findAll();
        if(results && results.first()){
            const existingSettings = results.first() as SystemSettings;
            systemSettings.systemId = existingSettings.systemId;
            systemSettings.allowDuressPassword = existingSettings.allowDuressPassword;
            systemSettings.allowRecoveryEmail = existingSettings.allowRecoveryEmail;
            systemSettings.auditRecordRetentionPeriodDays = existingSettings.auditRecordRetentionPeriodDays ? existingSettings.auditRecordRetentionPeriodDays : DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS;
            systemSettings.contactEmail = existingSettings.contactEmail;
            systemSettings.noReplyEmail = existingSettings.noReplyEmail;
            systemSettings.rootClientId = existingSettings.rootClientId;
            systemSettings.enablePortalAsLegacyIdp = existingSettings.enablePortalAsLegacyIdp;            
        }

        const { CASSANDRA_CONTACT_POINTS, CASSANDRA_KEY_SPACE, CASSANDRA_LOCAL_DATA_CENTER } = process.env;
        // DB Settings
        const dbCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "Cassandra Database Settings"
        }
        dbCategory.categoryEntries.push({
            categoryKey: "Contact Points",
            categoryValue: CASSANDRA_CONTACT_POINTS || ""
        });
        dbCategory.categoryEntries.push({
            categoryKey: "Cassandra Keyspace",
            categoryValue: CASSANDRA_KEY_SPACE || ""
        });
        dbCategory.categoryEntries.push({
            categoryKey: "Local Datacenter",
            categoryValue: CASSANDRA_LOCAL_DATA_CENTER || ""
        });
        systemSettings.systemCategories.push(dbCategory);
        const envSystemSettings = this.getEnvironmentSystemSettings();
        systemSettings.systemCategories.push(...envSystemSettings);        

        return systemSettings;

    }

    public async updateSystemSettings(systemSettings: SystemSettings): Promise<SystemSettings> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("system_settings");
        await mapper.update(systemSettings);
        return systemSettings;
    }
    
}

export default CassandraTenantDao;