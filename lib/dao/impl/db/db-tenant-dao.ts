import { Tenant, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantLookAndFeel, TenantPasswordConfig, TenantLoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel, CaptchaConfig, SystemSettings, SystemCategory } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS, OPENTRUST_IDENTITY_VERSION, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import TenantManagementDomainRelEntity from "@/lib/entities/tenant-management-domain-rel-entity";
import TenantAnonymousUserConfigurationEntity from "@/lib/entities/tenant-anonymous-user-configuration-entity";
import TenantPasswordConfigEntity from "@/lib/entities/tenant-password-config-entity";
import TenantLookAndFeelEntity from "@/lib/entities/tenant-look-and-feel-entity";
import TenantLegacyUserMigrationConfigEntity from "@/lib/entities/tenant-legacy-user-migration-config-entity";
import TenantRestrictedAuthenticationDomainRelEntity from "@/lib/entities/tenant-restricted-authentication-domain-rel-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "@sequelize/core";
import { TenantEntity } from "@/lib/entities/tenant-entity";
import TenantLoginFailurePolicyEntity from "@/lib/entities/tenant-login-failure-policy-entity";
import UserTenantRelEntity from "@/lib/entities/user-tenant-rel-entity";
import CaptchaConfigEntity from "@/lib/entities/captcha-config-entity";
import SystemSettingsEntity from "@/lib/entities/system-settings-entity";


class DBTenantDao extends TenantDao {

    /**
     * 
     * @returns 
     */
    public async getRootTenant(): Promise<Tenant | null> {

        const tenant: Tenant | null = this.getRootTenantFromCache();
        if(tenant === null){
            const tenantEntity: typeof TenantEntity = await DBDriver.getInstance().getTenantEntity();        
            const entity: TenantEntity | null = await tenantEntity.findOne({
                where: {
                    tenantType: TENANT_TYPE_ROOT_TENANT
                }
            });
            if(entity){
                const root: Tenant = entity.dataValues
                this.setRootTenantOnCache(root);
                return root;
            }
            return null;            
        }
        return tenant;         
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const tenantEntity: typeof TenantEntity = await DBDriver.getInstance().getTenantEntity();    
        await tenantEntity.create(tenant);
        return Promise.resolve(tenant);
    }

    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const tenantEntity: typeof TenantEntity = await DBDriver.getInstance().getTenantEntity();    
        await tenantEntity.update(tenant, {where: {tenantId: tenant.tenantId}});        
        return Promise.resolve(tenant);
    }

    public async getTenants(tenantIds: Array<string>): Promise<Array<Tenant>> {
        const tenantEntity: typeof TenantEntity = await DBDriver.getInstance().getTenantEntity();    

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = {};
        if(tenantIds){
            filter.tenantId = { [Op.in]: tenantIds};
        }       
        
        const arr: Array<TenantEntity> = await tenantEntity.findAll({
            where: filter,
            order: [
                ["tenantName", "ASC"]
            ]          
        });
        return Promise.resolve(arr.map(e => e.dataValues));
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const tenantEntity: typeof TenantEntity = await DBDriver.getInstance().getTenantEntity();    
        const entity: TenantEntity | null = await tenantEntity.findOne({
            where: {
                tenantId: tenantId
            }
        });
        if(entity){
            return Promise.resolve(entity.dataValues as Tenant);
        }
        else{
            return Promise.resolve(null);
        }
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const tenantEntity: typeof TenantEntity = await DBDriver.getInstance().getTenantEntity();    
        await tenantEntity.create(tenant);
        return tenant;
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const tenantEntity: typeof TenantEntity = await DBDriver.getInstance().getTenantEntity();    
        await tenantEntity.update(tenant, {where: {tenantId: tenant.tenantId}});
        return Promise.resolve(tenant);    
    }

    public async deleteTenant(tenantId: string): Promise<void> {        
        const tenantEntity: typeof TenantEntity = await DBDriver.getInstance().getTenantEntity();    
        await tenantEntity.destroy({
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
        const mndRelEntity: typeof TenantManagementDomainRelEntity = await DBDriver.getInstance().getTenantManagementDomainRelEntity();
        const tenantManagementDomainRelEntities: Array<TenantManagementDomainRelEntity> | null = await mndRelEntity.findAll({
            where: queryParams
        });

        return tenantManagementDomainRelEntities.map((entity) => entity.dataValues);
    }

    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const mndRelEntity: typeof TenantManagementDomainRelEntity = await DBDriver.getInstance().getTenantManagementDomainRelEntity();
        const tenantManagementDomainRel: TenantManagementDomainRel = {
            tenantId: tenantId,
            domain: domain
        };
        await mndRelEntity.create(tenantManagementDomainRel)
        return Promise.resolve(tenantManagementDomainRel);
    }

    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const model: TenantManagementDomainRel = {
            tenantId: tenantId,
            domain: domain
        };
        const mndRelEntity: typeof TenantManagementDomainRelEntity = await DBDriver.getInstance().getTenantManagementDomainRelEntity();
        await mndRelEntity.destroy({
            where: {
                tenantId: tenantId,
                domain: domain
            }
        });
        
        return Promise.resolve(model);
    }
    
    public async getAnonymousUserConfiguration(tenantId: string): Promise<TenantAnonymousUserConfiguration | null> {
        const tenantAnonUserConfigEntity: typeof TenantAnonymousUserConfigurationEntity = await DBDriver.getInstance().getTenantAnonymousUserConfigurationEntity();      
        const entity: TenantAnonymousUserConfigurationEntity | null = await tenantAnonUserConfigEntity.findOne({
            where: {
                tenantId: tenantId
            }
        });
        return entity ? Promise.resolve(entity.dataValues as TenantAnonymousUserConfiguration) : Promise.resolve(null);
    }

    public async createAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const tenantAnonUserConfigEntity: typeof TenantAnonymousUserConfigurationEntity = await DBDriver.getInstance().getTenantAnonymousUserConfigurationEntity();  
        await tenantAnonUserConfigEntity.create(anonymousUserConfiguration);        
        return Promise.resolve(anonymousUserConfiguration);
    }

    public async updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {

        const tenantAnonUserConfigEntity: typeof TenantAnonymousUserConfigurationEntity = await DBDriver.getInstance().getTenantAnonymousUserConfigurationEntity(); 
        await tenantAnonUserConfigEntity.update(anonymousUserConfiguration, {
            where: {
                tenantId: anonymousUserConfiguration.tenantId
            }
        });
        return Promise.resolve(anonymousUserConfiguration);
    }

    public async deleteAnonymousUserConfiguration(tenantId: string): Promise<void> {
        const tenantAnonUserConfigEntity: typeof TenantAnonymousUserConfigurationEntity = await DBDriver.getInstance().getTenantAnonymousUserConfigurationEntity(); 
        await tenantAnonUserConfigEntity.destroy({
            where: {
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {        
        const tenantPasswordConfigEntity: TenantPasswordConfigEntity | null = await (await DBDriver.getInstance().getTenantPasswordConfigEntity()).findOne({
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
        await (await DBDriver.getInstance().getTenantPasswordConfigEntity()).create(tenantPasswordConfig);        
        return Promise.resolve(tenantPasswordConfig);
    }

    public async updatePasswordConfig(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        await (await DBDriver.getInstance().getTenantPasswordConfigEntity()).update(tenantPasswordConfig, {
            where: {
                tenantId: tenantPasswordConfig.tenantId
            }
        });
        return Promise.resolve(tenantPasswordConfig);
    }

    public async removePasswordConfigFromTenant(tenantId: string): Promise<void> {
        await (await DBDriver.getInstance().getTenantPasswordConfigEntity()).destroy({
            where: {
                tenantId: tenantId
            }
        });        
        return Promise.resolve();
    }

    public async getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null> {
        
        const entity: TenantLookAndFeelEntity | null = await (await DBDriver.getInstance().getTenantLookAndFeelEntity()).findOne({
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
        
        await (await DBDriver.getInstance().getTenantLookAndFeelEntity()).create({
            ...tenantLookAndFeel,
            authenticationlogo: tenantLookAndFeel.authenticationlogo ? Buffer.from(tenantLookAndFeel.authenticationlogo, "utf-8") : null
            

        });
        return Promise.resolve(tenantLookAndFeel);
    }


    public async updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {

        await (await DBDriver.getInstance().getTenantLookAndFeelEntity()).update({
                ...tenantLookAndFeel,
                authenticationlogo: tenantLookAndFeel.authenticationlogo ? Buffer.from(tenantLookAndFeel.authenticationlogo, "utf-8") : null
            }, 
            {
            where: {
                tenantid: tenantLookAndFeel.tenantid
            }
        });
        return Promise.resolve(tenantLookAndFeel);
    }

    public async deleteTenantLookAndFeel(tenantId: string): Promise<void> {
        await (await DBDriver.getInstance().getTenantLookAndFeelEntity()).destroy({
            where: {
                tenantId: tenantId
            }
        })
        return Promise.resolve();
    }

    
    public async getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>> {
        const entities: Array<TenantRestrictedAuthenticationDomainRelEntity> = await (await DBDriver.getInstance().getTenantRestrictedAuthenticationDomainRelEntity()).findAll({
            where: {
                tenantId: tenantId
            }
        });        
        return entities.map((entity) => entity.dataValues);
    }

    public async addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel> {
        const tenantRestrictedAuthenticationDomainRel: TenantRestrictedAuthenticationDomainRel = {
            tenantId,
            domain
        }
        await (await DBDriver.getInstance().getTenantRestrictedAuthenticationDomainRelEntity()).create(tenantRestrictedAuthenticationDomainRel)
        return Promise.resolve(tenantRestrictedAuthenticationDomainRel);
    }

    public async removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void> {
        await (await DBDriver.getInstance().getTenantRestrictedAuthenticationDomainRelEntity()).destroy({
            where: {
                tenantId: tenantId,
                domain: domain
            }
        })
        return Promise.resolve();
    }

    public async getLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null>{
        const entity: TenantLoginFailurePolicyEntity | null = await (await DBDriver.getInstance().getTenantLoginFailurePolicyEntity()).findOne({
            where: {
                tenantId: tenantId
            }
        });
        return entity ? Promise.resolve(entity.dataValues) : Promise.resolve(null);
    }

    public async createLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        await (await DBDriver.getInstance().getTenantLoginFailurePolicyEntity()).create(loginFailurePolicy);
        return loginFailurePolicy;
    }

    public async updateLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        await (await DBDriver.getInstance().getTenantLoginFailurePolicyEntity()).update(loginFailurePolicy, {
            where: {
                tenantId: loginFailurePolicy.tenantId
            }
        });
        return Promise.resolve(loginFailurePolicy);
    }

    public async removeLoginFailurePolicy(tenantId: string): Promise<void> {
        await (await DBDriver.getInstance().getTenantLoginFailurePolicyEntity()).destroy({
            where: {
                tenantId: tenantId
            }
        });
        return Promise.resolve();
    }

    public async getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {        
        const entity: TenantLegacyUserMigrationConfigEntity | null = await (await DBDriver.getInstance().getTenantLegacyUserMigrationConfigEntity()).findOne({
            where: {
                tenantId: tenantId
            }
        });

        return entity ? Promise.resolve(entity.dataValues as TenantLegacyUserMigrationConfig) : Promise.resolve(null);
    }

    public async removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void> {
        await (await DBDriver.getInstance().getTenantLegacyUserMigrationConfigEntity()).destroy({
            where: {
                tenantId: tenantId
            }
        })
        return Promise.resolve();
    }

    public async updateTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        await (await DBDriver.getInstance().getTenantLegacyUserMigrationConfigEntity()).update(tenantLegacyUserMigrationConfig, {
            where: {
                tenantId: tenantLegacyUserMigrationConfig.tenantId
            }
        });
        return Promise.resolve(tenantLegacyUserMigrationConfig);
    }

    public async createTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        await (await DBDriver.getInstance().getTenantLegacyUserMigrationConfigEntity()).create(tenantLegacyUserMigrationConfig);
        return tenantLegacyUserMigrationConfig;
    }

    public async removeAllUsersFromTenant(tenantId: string): Promise<void>{
        const sequelize: Sequelize = await DBDriver.getConnection();

        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids        
        let hasMoreRecords = true;
        while(hasMoreRecords){
            
            const arr: Array<UserTenantRelEntity> = await (await DBDriver.getInstance().getUserTenantRelEntity()).findAll({
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
        
        await (await DBDriver.getInstance().getPreAuthenticationStateEntity()).destroy({
            where: {
                tenantId: tenantId
            } 
        });

        await (await DBDriver.getInstance().getAuthorizationCodeDataEntity()).destroy({
            where: {
                tenantId: tenantId
            }
        });

        await (await DBDriver.getInstance().getRefreshDataEntity()).destroy({
            where: {
                tenantId: tenantId
            }
        });

        await (await DBDriver.getInstance().getFederatedOIDCAuthorizationRelEntity()).destroy({
            where: {
                initTenantId: tenantId
            }
        });

        await (await DBDriver.getInstance().getClientAuthHistoryEntity()).destroy({
            where: {
                tenantId: tenantId
            }
        });

        await (await DBDriver.getInstance().getUserAuthenticationStateEntity()).destroy({
            where: {

            }
        });

        await (await DBDriver.getInstance().getUserRegistrationStateEntity()).destroy({
            where: {
                tenantId: tenantId
            }
        });

        return Promise.resolve();
    }

    public async getCaptchaConfig(): Promise<CaptchaConfig | null>{
        const arr: Array<CaptchaConfigEntity> | null = await (await DBDriver.getInstance().getCaptchaConfigEntity()).findAll();
        if(arr.length === 0){
            return null;
        }
        else{
            return arr[0].dataValues;
        }
    }

    public async setCaptchaConfig(captchaConfig: CaptchaConfig): Promise<CaptchaConfig>{
        await (await DBDriver.getInstance().getCaptchaConfigEntity()).truncate();
        await (await DBDriver.getInstance().getCaptchaConfigEntity()).create(captchaConfig);        
        return captchaConfig;
    }

    public async removeCaptchaConfig(): Promise<void>{
        await (await DBDriver.getInstance().getCaptchaConfigEntity()).truncate();
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
        
        const systemSettingsEntity: SystemSettingsEntity | null = await (await DBDriver.getInstance().getSystemSettingsEntity()).findOne();

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

        const envSystemSettings = this.getEnvironmentSystemSettings();
        systemSettings.systemCategories.push(...envSystemSettings);        

        return systemSettings;

    }
   
    
    public async updateSystemSettings(systemSettings: SystemSettings): Promise<SystemSettings> {        
        const entity: SystemSettingsEntity | null = await (await DBDriver.getInstance().getSystemSettingsEntity()).findOne();
        if(entity){
            await (await DBDriver.getInstance().getSystemSettingsEntity()).update(systemSettings, {
                where: {
                    systemId: systemSettings.systemId
                }
            });
        }
        else{
            await (await DBDriver.getInstance().getSystemSettingsEntity()).create(systemSettings);
        }
        
        return systemSettings;        
    }

}

export default DBTenantDao;