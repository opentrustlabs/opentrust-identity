import { Tenant, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantLookAndFeel, TenantPasswordConfig, TenantLoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel, CaptchaConfig, SystemSettings, SystemSettingsUpdateInput, SystemCategory } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS, DEFAULT_HTTP_TIMEOUT_MS, OPENTRUST_IDENTITY_VERSION, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { GraphQLError } from "graphql";
import TenantManagementDomainRelEntity from "@/lib/entities/tenant-management-domain-rel-entity";
import TenantAnonymousUserConfigurationEntity from "@/lib/entities/tenant-anonymous-user-configuration-entity";
import TenantPasswordConfigEntity from "@/lib/entities/tenant-password-config-entity";
import TenantLookAndFeelEntity from "@/lib/entities/tenant-look-and-feel-entity";
import TenantLegacyUserMigrationConfigEntity from "@/lib/entities/tenant-legacy-user-migration-config-entity";
import TenantRestrictedAuthenticationDomainRelEntity from "@/lib/entities/tenant-restricted-authentication-domain-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";
import { TenantEntity } from "@/lib/entities/tenant-entity";
import TenantLoginFailurePolicyEntity from "@/lib/entities/tenant-login-failure-policy-entity";
import UserTenantRelEntity from "@/lib/entities/user-tenant-rel-entity";
import CaptchaConfigEntity from "@/lib/entities/captcha-config-entity";
import SystemSettingsEntity from "@/lib/entities/system-settings-entity";
import { ERROR_CODES } from "@/lib/models/error";

class DBTenantDao extends TenantDao {


    /**
     * 
     * @returns 
     */
    public async getRootTenant(): Promise<Tenant | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantEntity | null = await sequelize.models.tenant.findOne({
            where: {
                tenanttype: TENANT_TYPE_ROOT_TENANT
            }
        });
        return Promise.resolve(entity ? entity.dataValues as Tenant : null);
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const sequelize: Sequelize = await DBDriver.getConnection();
        const t: TenantEntity = await sequelize.models.tenant.create(tenant);
        return Promise.resolve(tenant);
    }

    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenant.update(tenant, {where: {tenantId: tenant.tenantId}});        
        return Promise.resolve(tenant);
    }

    public async getTenants(tenantIds?: Array<string>): Promise<Array<Tenant>> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = {};
        if(tenantIds){
            filter.tenantId = { [Op.in]: tenantIds};
        }       
        
        const arr: Array<TenantEntity> = await sequelize.models.tenant.findAll({
            where: filter,
            order: [
                ["tenantName", "ASC"]
            ]          
        });
        return Promise.resolve(arr.map(e => e.dataValues));
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantEntity: TenantEntity | null = await sequelize.models.tenant.findOne({
            where: {
                tenantId: tenantId
            }
        });
        if(tenantEntity){
            return Promise.resolve(tenantEntity.dataValues as Tenant);
        }
        else{
            return Promise.resolve(null);
        }
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenant.create(tenant);
        return tenant;
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenant.update(tenant, {where: {tenantId: tenant.tenantId}});
        return Promise.resolve(tenant);    
    }

    public async deleteTenant(tenantId: string): Promise<void> {        
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenant.destroy({
            where: {
                tenantId: tenantId
            }
        });

        return Promise.resolve();        
    }

    
    public async getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>> {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantId = tenantId;
        }
        if(domain){
            queryParams.domain = domain;
        }

        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantManagementDomainRelEntities: Array<TenantManagementDomainRelEntity> | null = await sequelize.models.tenantManagementDomainRel.findAll({
            where: queryParams
        });

        return tenantManagementDomainRelEntities.map((entity) => entity.dataValues);
    }

    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantManagementDomainRel: TenantManagementDomainRel = {
            tenantId: tenantId,
            domain: domain
        };
        await sequelize.models.tenantManagementDomainRel.create(tenantManagementDomainRel)
        return Promise.resolve(tenantManagementDomainRel);
    }

    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const model: TenantManagementDomainRel = {
            tenantId: tenantId,
            domain: domain
        };
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantManagementDomainRel.destroy({
            where: {
                tenantId: tenantId,
                domain: domain
            }
        });
        
        return Promise.resolve(model);
    }
    
    public async getAnonymousUserConfiguration(tenantId: string): Promise<TenantAnonymousUserConfiguration | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantAnonymousUserConfigurationEntity | null = await sequelize.models.tenantAnonymousUserConfiguration.findOne({
            where: {
                tenantId: tenantId
            }
        });
        return entity ? Promise.resolve(entity.dataValues as TenantAnonymousUserConfiguration) : Promise.resolve(null);
    }

    public async createAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantAnonymousUserConfiguration.create(anonymousUserConfiguration);        
        return Promise.resolve(anonymousUserConfiguration);
    }

    public async updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {

        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantAnonymousUserConfiguration.update(anonymousUserConfiguration, {
            where: {
                tenantId: anonymousUserConfiguration.tenantId
            }
        });
        return Promise.resolve(anonymousUserConfiguration);
    }

    public async deleteAnonymousUserConfiguration(tenantId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantAnonymousUserConfiguration.destroy({
            where: {
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantPasswordConfigEntity: TenantPasswordConfigEntity | null = await sequelize.models.tenantPasswordConfig.findOne({
            where: {
                tenantId: tenantId
            }
        })

        if(tenantPasswordConfigEntity){
            return tenantPasswordConfigEntity.dataValues as TenantPasswordConfig;
        }
        else{
            return null;
        }        
    }

    public async assignPasswordConfigToTenant(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {                
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantPasswordConfig.create(tenantPasswordConfig);        
        return Promise.resolve(tenantPasswordConfig);
    }

    public async updatePasswordConfig(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantPasswordConfig.update(tenantPasswordConfig, {
            where: {
                tenantId: tenantPasswordConfig.tenantId
            }
        });
        return Promise.resolve(tenantPasswordConfig);
    }

    public async removePasswordConfigFromTenant(tenantId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantPasswordConfig.destroy({
            where: {
                tenantId: tenantId
            }
        });        
        return Promise.resolve();
    }

    public async getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantLookAndFeelEntity | null = await sequelize.models.tenantLookAndFeel.findOne({
            where: {
                tenantid: tenantId
            }
        });
        if(entity){
            const tenantLookAndFeel: TenantLookAndFeel = {
                tenantid: entity.getDataValue("tenantid"),
                adminheaderbackgroundcolor: entity.getDataValue("adminheaderbackgroundcolor"),
                adminheadertext: entity.getDataValue("adminheadertext"),
                adminheadertextcolor: entity.getDataValue("adminheadertextcolor"),
                adminlogo: entity.getDataValue("adminlogo") ? 
                    Buffer.from(entity.getDataValue("adminlogo")).toString("utf-8") : "",
                authenticationheaderbackgroundcolor: entity.getDataValue("authenticationheaderbackgroundcolor"),
                authenticationheadertext: entity.getDataValue("authenticationheadertext"),
                authenticationheadertextcolor: entity.getDataValue("authenticationheadertextcolor"),
                authenticationlogo: entity.getDataValue("authenticationlogo") ?
                    Buffer.from(entity.getDataValue("authenticationlogo")).toString("utf-8") : "",
                authenticationlogouri: entity.getDataValue("authenticationlogouri"),
                authenticationlogomimetype: entity.getDataValue("authenticationlogomimetype")
            }
            return Promise.resolve(tenantLookAndFeel);
        }
        else{
            return Promise.resolve(null);
        }

    }

    public async createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLookAndFeel.create(tenantLookAndFeel)
        return Promise.resolve(tenantLookAndFeel);
    }

    public async updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLookAndFeel.update(tenantLookAndFeel, {
            where: {
                tenantId: tenantLookAndFeel.tenantid
            }
        });
        return Promise.resolve(tenantLookAndFeel);
    }

    public async deleteTenantLookAndFeel(tenantId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLookAndFeel.destroy({
            where: {
                tenantId: tenantId
            }
        })
        return Promise.resolve();
    }

    public async getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantLegacyUserMigrationConfigEntity | null = await sequelize.models.tenantLegacyUserMigrationConfig.findOne({
            where: {
                tenantId: tenantId
            }
        });

        return entity ? Promise.resolve(entity.dataValues as TenantLegacyUserMigrationConfig) : Promise.resolve(null);
    }

    
    public async getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entities: Array<TenantRestrictedAuthenticationDomainRelEntity> = await sequelize.models.tenantRestrictedAuthenticationDomainRel.findAll({
            where: {
                tenantId: tenantId
            }
        });        
        return entities.map((entity) => entity.dataValues);
    }

    public async addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantRestrictedAuthenticationDomainRel: TenantRestrictedAuthenticationDomainRel = {
            tenantId,
            domain
        }
        await sequelize.models.tenantRestrictedAuthenticationDomainRel.create(tenantRestrictedAuthenticationDomainRel)
        return Promise.resolve(tenantRestrictedAuthenticationDomainRel);
    }

    public async removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantRestrictedAuthenticationDomainRel.destroy({
            where: {
                tenantId: tenantId,
                domain: domain
            }
        })
        return Promise.resolve();
    }

    public async getLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantLoginFailurePolicyEntity | null = await sequelize.models.tenantLoginFailurePolicy.findOne({
            where: {
                tenantId: tenantId
            }
        });
        return entity ? Promise.resolve(entity.dataValues) : Promise.resolve(null);
    }

    public async createLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLoginFailurePolicy.create(loginFailurePolicy);
        return loginFailurePolicy;
    }

    public async updateLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLoginFailurePolicy.update(loginFailurePolicy, {
            where: {
                tenantId: loginFailurePolicy.tenantId
            }
        });
        return Promise.resolve(loginFailurePolicy);
    }

    public async removeLoginFailurePolicy(tenantId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLoginFailurePolicy.destroy({
            where: {
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLegacyUserMigrationConfig.destroy({
            where: {
                tenantId: tenantId
            }
        })
        return Promise.resolve();
    }

    public async updateTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLegacyUserMigrationConfig.update(tenantLegacyUserMigrationConfig, {
            where: {
                tenantId: tenantLegacyUserMigrationConfig.tenantId
            }
        });
        return Promise.resolve(tenantLegacyUserMigrationConfig);
    }

    public async createTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLegacyUserMigrationConfig.create(tenantLegacyUserMigrationConfig);
        return tenantLegacyUserMigrationConfig;
    }

    public async removeAllUsersFromTenant(tenantId: string): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();

        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids        
        let hasMoreRecords = true;
        while(hasMoreRecords){
            const arr: Array<UserTenantRelEntity> = await sequelize.models.userTenantRel.findAll({
                where: {
                    tenantId: tenantId
                },
                limit: 1000
            });
            if(arr.length === 0){
                hasMoreRecords = false;
                break;
            }
            
            // sequelize does not support deletion in bulk using composite keys, so must do this manually...
            const tuples = arr
                .map(
                    (v: UserTenantRelEntity) => `(${sequelize.escape(v.getDataValue("tenantId"))}, ${sequelize.escape(v.getDataValue("userId"))})`
                )
                .join(", ");
            const sql = `DELETE FROM user_tenant_rel WHERE (tenantid, userid) IN (${tuples})`;
            await sequelize.query(sql);
        }
    }

    public async removeAllAuthStateFromTenant(tenantId: string): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        
        await sequelize.models.preAuthenticationState.destroy({
            where: {
                tenantId: tenantId
            } 
        });

        await sequelize.models.authorizationCodeData.destroy({
            where: {
                tenantId: tenantId
            }
        });

        await sequelize.models.refreshData.destroy({
            where: {
                tenantId: tenantId
            }
        });

        await sequelize.models.federatedOidcAuthorizationRel.destroy({
            where: {
                initTenantId: tenantId
            }
        });

        await sequelize.models.clientAuthHistory.destroy({
            where: {
                tenantId: tenantId
            }
        });

        await sequelize.models.userAuthenticationState.destroy({
            where: {

            }
        });

        await sequelize.models.userRegistrationState.destroy({
            where: {
                tenantId: tenantId
            }
        });

        return Promise.resolve();
    }

    public async getCaptchaConfig(): Promise<CaptchaConfig | null>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        const arr: Array<CaptchaConfigEntity> | null = await sequelize.models.captchaConfig.findAll();
        if(arr.length === 0){
            return null;
        }
        else{
            return arr[0].dataValues;
        }
    }

    public async setCaptchaConfig(captchaConfig: CaptchaConfig): Promise<CaptchaConfig>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.captchaConfig.truncate();
        await sequelize.models.captchaConfig.create(captchaConfig);        
        return captchaConfig;
    }

    public async removeCaptchaConfig(): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.captchaConfig.truncate();
    }

    public async getSystemSettings(): Promise<SystemSettings> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        
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
        const systemSettingsEntity: SystemSettingsEntity | null = await sequelize.models.systemSettings.findOne();

        if(systemSettingsEntity){            
            const first: SystemSettings = systemSettingsEntity.dataValues;
            systemSettings.systemId = first.systemId
            systemSettings.allowRecoveryEmail = first.allowRecoveryEmail;
            systemSettings.allowDuressPassword = first.allowDuressPassword;
            systemSettings.rootClientId = first.rootClientId;
            systemSettings.enablePortalAsLegacyIdp = first.enablePortalAsLegacyIdp;
            systemSettings.auditRecordRetentionPeriodDays = first.auditRecordRetentionPeriodDays ? first.auditRecordRetentionPeriodDays : DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS;
            systemSettings.contactEmail = first.contactEmail;
            systemSettings.noReplyEmail = first.noReplyEmail;
        }
        // DB Settings
        const dbCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "Database Settings"
        }
        const {DAO_STRATEGY} = process.env;
        if(DAO_STRATEGY === "rdb"){
            const {DB_HOST, DB_NAME, DB_PORT, DB_MIN_POOL_SIZE, DB_MAX_POOL_SIZE, DB_ENABLE_QUERY_LOGGING, RDB_DIALECT} = process.env;
            dbCategory.categoryEntries.push({
                categoryKey: "Database dialect",
                categoryValue: RDB_DIALECT || ""
            });
            dbCategory.categoryEntries.push({
                categoryKey: "Database Host",
                categoryValue: DB_HOST || ""
            });
            dbCategory.categoryEntries.push({
                categoryKey: "Database Name",
                categoryValue: DB_NAME || ""
            });
            dbCategory.categoryEntries.push({
                categoryKey: "Database Port",
                categoryValue: DB_PORT || ""
            });
            dbCategory.categoryEntries.push({
                categoryKey: "Min Pool Size",
                categoryValue: DB_MIN_POOL_SIZE || ""
            });
            dbCategory.categoryEntries.push({
                categoryKey: "Max Pool Size",
                categoryValue: DB_MAX_POOL_SIZE || ""
            });
            dbCategory.categoryEntries.push({
                categoryKey: "Enable Query Logging",
                categoryValue: DB_ENABLE_QUERY_LOGGING || ""
            });
        }
        systemSettings.systemCategories.push(dbCategory);


        // KMS Settings
        const kmsCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "Key Management Settings"
        }
        const {KMS_STRATEGY, FS_BASED_DATA_DIR} = process.env;
        if(KMS_STRATEGY === "filesystem"){
            kmsCategory.categoryEntries.push({
                categoryKey: "KMS Provider",
                categoryValue: "Filesystem"
            });
            kmsCategory.categoryEntries.push({
                categoryKey: "Keys data directory",
                categoryValue: FS_BASED_DATA_DIR || ""
            });
        }
        systemSettings.systemCategories.push(kmsCategory);

        // MFA settings
        const mfaSettings: SystemCategory = {
            categoryEntries: [],
            categoryName: "MFA Settings"
        }
        const {MFA_ISSUER, MFA_ORIGIN, MFA_ID} = process.env;
        mfaSettings.categoryEntries.push({
            categoryKey: "MFA Issuer",
            categoryValue: MFA_ISSUER || ""
        });
        mfaSettings.categoryEntries.push({
            categoryKey: "MFA Origin",
            categoryValue: MFA_ORIGIN || ""
        });
        mfaSettings.categoryEntries.push({
            categoryKey: "MFA ID",
            categoryValue: MFA_ID || ""
        });
        systemSettings.systemCategories.push(mfaSettings);

        // Search settings
        const searchSettings: SystemCategory = {
            categoryEntries: [],
            categoryName: "Search Engine Settings"
        }
        const {OPENSEARCH_HOST, OPENSEARCH_PORT, TRUST_STORE_PATH} = process.env;
        searchSettings.categoryEntries.push({
            categoryKey: "Opensearch Host",
            categoryValue: OPENSEARCH_HOST || ""
        });
        searchSettings.categoryEntries.push({
            categoryKey: "Opensearch Port",
            categoryValue: OPENSEARCH_PORT || ""
        });
        searchSettings.categoryEntries.push({
            categoryKey: "Opensearch Truststore Path",
            categoryValue: TRUST_STORE_PATH || ""
        });
        systemSettings.systemCategories.push(searchSettings);

        
        // Auth domain settings 
        const authDomainCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "Portal Authorization Settings"
        }
        const {PORTAL_AUTH_TOKEN_TTL_HOURS, AUTH_DOMAIN, SECURITY_EVENT_CALLBACK_URI} = process.env;
        authDomainCategory.categoryEntries.push({
            categoryKey: "Authorization Domain",
            categoryValue: AUTH_DOMAIN || ""
        });
        authDomainCategory.categoryEntries.push({
            categoryKey: "Token TTL in Hours",
            categoryValue: PORTAL_AUTH_TOKEN_TTL_HOURS || ""
        });
        authDomainCategory.categoryEntries.push({
            categoryKey: "Security Event Webhook URI",
            categoryValue: SECURITY_EVENT_CALLBACK_URI || ""
        });
        systemSettings.systemCategories.push(authDomainCategory);

        // GraphQL Settings
        const graphqlSettingCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "GraphQL Settings"
        };
        const {ALLOW_GRAPHQL_INTROSPECTION, ALLOW_GRAPHQL_ERROR_STACK_TRACES} = process.env;
        graphqlSettingCategory.categoryEntries.push({
            categoryKey: "Allow GraphQL Introspection",
            categoryValue: ALLOW_GRAPHQL_INTROSPECTION || "false"
        });
        graphqlSettingCategory.categoryEntries.push({
            categoryKey: "Allow GraphQL Error Stack Traces",
            categoryValue: ALLOW_GRAPHQL_ERROR_STACK_TRACES || "false"
        });
        systemSettings.systemCategories.push(graphqlSettingCategory);

        // Logging Settings
        const loggingSettingsCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "Logging Settings"
        };
        const {LOG_FILE_DIRECTORY, LOG_TO_STD_OUT, LOG_LEVEL} = process.env;
        loggingSettingsCategory.categoryEntries.push({
            categoryKey: "Log file directory",
            categoryValue: LOG_FILE_DIRECTORY || "Not Configured"
        });
        loggingSettingsCategory.categoryEntries.push({
            categoryKey: "Log to STDOUT",
            categoryValue: LOG_TO_STD_OUT || "false"
        });
        loggingSettingsCategory.categoryEntries.push({
            categoryKey: "Log level",
            categoryValue: LOG_LEVEL || "Not Configured"
        });
        systemSettings.systemCategories.push(loggingSettingsCategory);

        // HTTP Client Settings
        const httpClientSettingsCategory: SystemCategory = {
            categoryEntries: [],
            categoryName: "HTTP Client Settings"
        };
        const {
            HTTP_TIMEOUT_MS, MTLS_USE_PKI_IDENTITY, MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE, MTLS_PKI_IDENTITY_CERTIFICATE_FILE, 
            MTLS_PKI_IDENTITY_TRUST_STORE_FILE, HTTP_CLIENT_USE_PROXY, HTTP_PROXY_PROTOCOL, HTTP_PROXY_HOST, 
            HTTP_PROXY_PORT, HTTP_PROXY_USE_AUTHENTICATION 
        } = process.env;
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Request Timeout (milliseconds)",
            categoryValue: HTTP_TIMEOUT_MS || DEFAULT_HTTP_TIMEOUT_MS.toString()
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Use mTLS",
            categoryValue: MTLS_USE_PKI_IDENTITY || "false"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Private Key File",
            categoryValue: MTLS_PKI_IDENTITY_PRIVATE_KEY_FILE || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Certificate File",
            categoryValue: MTLS_PKI_IDENTITY_CERTIFICATE_FILE || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Trust Store File",
            categoryValue: MTLS_PKI_IDENTITY_TRUST_STORE_FILE || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Use Proxy",
            categoryValue: HTTP_CLIENT_USE_PROXY || "false"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Proxy Protocol",
            categoryValue: HTTP_PROXY_PROTOCOL || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Proxy Host",
            categoryValue: HTTP_PROXY_HOST || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Proxy Port",
            categoryValue: HTTP_PROXY_PORT || "Not Configured"
        });
        httpClientSettingsCategory.categoryEntries.push({
            categoryKey: "Use Proxy Authentication",
            categoryValue: HTTP_PROXY_USE_AUTHENTICATION || "false"
        });        
        systemSettings.systemCategories.push(httpClientSettingsCategory);

        return systemSettings;

    }
   
    
    public async updateSystemSettings(systemSettings: SystemSettings): Promise<SystemSettings> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: SystemSettingsEntity | null = await sequelize.models.systemSettings.findOne();
        if(entity){
            await sequelize.models.systemSettings.update(systemSettings, {
                where: {
                    systemId: systemSettings.systemId
                }
            });
        }
        else{
            await sequelize.models.systemSettings.create(systemSettings);
        }
        
        return systemSettings;        
    }

}

export default DBTenantDao;