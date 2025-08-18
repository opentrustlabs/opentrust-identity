import { Tenant, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantLookAndFeel, TenantPasswordConfig, TenantLoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel, CaptchaConfig, SystemSettings, SystemSettingsUpdateInput, SystemCategory } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS, OPENTRUST_IDENTITY_VERSION, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
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


    public async getRootTenant(): Promise<Tenant> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantEntity | null = await sequelize.models.tenant.findOne({
            where: {
                tenanttype: TENANT_TYPE_ROOT_TENANT
            }
        });

        if(!entity){
            throw new GraphQLError(ERROR_CODES.EC00035.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00035}});
        }
        return Promise.resolve(entity.dataValues as Tenant);
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const sequelize: Sequelize = await DBDriver.getConnection();
        const t: TenantEntity = await sequelize.models.tenant.create(tenant);
        return Promise.resolve(t.dataValues as Tenant);
    }

    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenant.update(tenant, {where: {tenantId: tenant.tenantId}});        
        return Promise.resolve(tenant);
    }

    public async getTenants(tenantIds?: Array<string>): Promise<Array<Tenant>> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        // @typescript-eslint/no-explicit-any
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

        // @typescript-eslint/no-explicit-any
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
                tenantId: tenantId
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

        // Trust store settings
        const trustStoreSettings: SystemCategory = {
            categoryEntries: [],
            categoryName: "Trust Store Settings"
        }
        const {PKI_IDENTITY_PRIVATE_KEY_PATH, PKI_IDENTITY_CERTIFICATE_PATH, PKI_IDENTITY_CA_TRUST_STORE_PATH} = process.env;
        trustStoreSettings.categoryEntries.push({
            categoryKey: "Private Key Path",
            categoryValue: PKI_IDENTITY_PRIVATE_KEY_PATH || "NA"
        });
        trustStoreSettings.categoryEntries.push({
            categoryKey: "Certificate Path",
            categoryValue: PKI_IDENTITY_CERTIFICATE_PATH || "NA"
        });
        trustStoreSettings.categoryEntries.push({
            categoryKey: "CA Trust Store Path",
            categoryValue: PKI_IDENTITY_CA_TRUST_STORE_PATH || "NA"
        });
        systemSettings.systemCategories.push(trustStoreSettings);

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
        return systemSettings;

    }
    
    public async updateSystemSettings(input: SystemSettingsUpdateInput): Promise<SystemSettings> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: SystemSettingsEntity | null = await sequelize.models.systemSettings.findOne();
        let systemId: string = "";
        if(entity){
            systemId = entity.getDataValue("systemId");
            entity.setDataValue("allowRecoveryEmail", input.allowRecoveryEmail);
            entity.setDataValue("allowDuressPassword", input.allowDuressPassword);
            entity.setDataValue("rootClientId", input.rootClientId);
            entity.setDataValue("enablePortalAsLegacyIdp", input.enablePortalAsLegacyIdp);
            entity.setDataValue("auditRecordRetentionPeriodDays", input.auditRecordRetentionPeriodDays || DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS);
            await entity.save();
        }
        return {
            systemId: systemId,
            softwareVersion: OPENTRUST_IDENTITY_VERSION,
            allowDuressPassword: input.allowDuressPassword,
            allowRecoveryEmail: input.allowRecoveryEmail,
            rootClientId: "",
            enablePortalAsLegacyIdp: false,
            systemCategories: []
        }
    }

}

export default DBTenantDao;