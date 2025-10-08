import { Tenant, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantLookAndFeel, TenantPasswordConfig, TenantLoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel, CaptchaConfig, SystemSettings, SystemCategory, UserTenantRel, RefreshData, ClientAuthHistory } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS, OPENTRUST_IDENTITY_VERSION, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import RDBDriver from "@/lib/data-sources/rdb";
import { Brackets, In } from "typeorm";


class DBTenantDao extends TenantDao {

    /**
     * 
     * @returns 
     */
    public async getRootTenant(): Promise<Tenant | null> {

        const tenant: Tenant | null = this.getRootTenantFromCache();
        if(tenant === null){
            const tenantRepo = await RDBDriver.getInstance().getTenantRepository();
            const entity = await tenantRepo.findOne({
                where: {
                    tenantType: TENANT_TYPE_ROOT_TENANT
                }
            });
            if(entity){                
                this.setRootTenantOnCache(entity);
                return entity;
            }
            return null;            
        }
        return tenant;         
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const tenantRepo = await RDBDriver.getInstance().getTenantRepository();
        await tenantRepo.insert(tenant);
        return Promise.resolve(tenant);
    }

    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const tenantRepo = await RDBDriver.getInstance().getTenantRepository();
        await tenantRepo.update(
            {
                tenantId: tenant.tenantId
            },
            tenant
        );
        return Promise.resolve(tenant);
    }

    public async getTenants(tenantIds: Array<string>): Promise<Array<Tenant>> {
        const tenantRepo = await RDBDriver.getInstance().getTenantRepository();
 
        const arr = await tenantRepo.find({
            where: {
                tenantId: In(tenantIds)
            },
            order: {
                tenantName: "ASC"
            }
        });
        return arr;
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const tenantRepo = await RDBDriver.getInstance().getTenantRepository();
        const result = await tenantRepo.findOne({
            where: {
                tenantId: tenantId
            }
        });
        return result;
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const tenantRepo = await RDBDriver.getInstance().getTenantRepository();
        await tenantRepo.insert(tenant);
        return tenant;
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const tenantRepo = await RDBDriver.getInstance().getTenantRepository();
        await tenantRepo.update(
            {
                tenantId: tenant.tenantId
            },
            tenant
        )
        return Promise.resolve(tenant);    
    }

    public async deleteTenant(tenantId: string): Promise<void> {        
        const tenantRepo = await RDBDriver.getInstance().getTenantRepository();
        await tenantRepo.delete({
            tenantId: tenantId
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
        const tenantManagementDomainRelRepo = await RDBDriver.getInstance().getTenantManagementDomainRelRepository();
        const tenantManagementDomainRelEntities = await tenantManagementDomainRelRepo.find({
            where: queryParams
        });
        return tenantManagementDomainRelEntities;
    }

    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const tenantManagementDomainRelRepo = await RDBDriver.getInstance().getTenantManagementDomainRelRepository();
        const tenantManagementDomainRel: TenantManagementDomainRel = {
            tenantId: tenantId,
            domain: domain
        };
        await tenantManagementDomainRelRepo.insert(tenantManagementDomainRel)
        return Promise.resolve(tenantManagementDomainRel);
    }

    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const model: TenantManagementDomainRel = {
            tenantId: tenantId,
            domain: domain
        };
        const tenantManagementDomainRelRepo = await RDBDriver.getInstance().getTenantManagementDomainRelRepository();
        await tenantManagementDomainRelRepo.delete({
            tenantId: tenantId,
            domain: domain
        });        
        return Promise.resolve(model);
    }
    
    public async getAnonymousUserConfiguration(tenantId: string): Promise<TenantAnonymousUserConfiguration | null> {
        const tenantAnonUserRepo = await RDBDriver.getInstance().getTenantAnonymousUserConfigurationRepository();
        const entity: TenantAnonymousUserConfiguration | null = await tenantAnonUserRepo.findOne({
            where: {
                tenantId: tenantId
            }
        });
        return entity;
    }

    public async createAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const tenantAnonUserRepo = await RDBDriver.getInstance().getTenantAnonymousUserConfigurationRepository();
        await tenantAnonUserRepo.insert(anonymousUserConfiguration);        
        return Promise.resolve(anonymousUserConfiguration);
    }

    public async updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const tenantAnonUserRepo = await RDBDriver.getInstance().getTenantAnonymousUserConfigurationRepository();
        await tenantAnonUserRepo.update(
            {
                tenantId: anonymousUserConfiguration.tenantId
            },
            anonymousUserConfiguration
        );
        return Promise.resolve(anonymousUserConfiguration);
    }

    public async deleteAnonymousUserConfiguration(tenantId: string): Promise<void> {
        const tenantAnonUserRepo = await RDBDriver.getInstance().getTenantAnonymousUserConfigurationRepository();
        await tenantAnonUserRepo.delete({
            tenantId: tenantId
        });
        return Promise.resolve();
    }

    public async getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {
        const tenantPasswordConfigRepo = await RDBDriver.getInstance().getTenantPasswordConfigRepository();
        const tenantPasswordConfigEntity = await tenantPasswordConfigRepo.findOne({
            where: {
                tenantId: tenantId
            }
        });
        return tenantPasswordConfigEntity;      
    }

    public async assignPasswordConfigToTenant(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        const tenantPasswordConfigRepo = await RDBDriver.getInstance().getTenantPasswordConfigRepository();
        await tenantPasswordConfigRepo.insert(tenantPasswordConfig);        
        return Promise.resolve(tenantPasswordConfig);
    }

    public async updatePasswordConfig(tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        const tenantPasswordConfigRepo = await RDBDriver.getInstance().getTenantPasswordConfigRepository();
        await tenantPasswordConfigRepo.update(
            {
                tenantId: tenantPasswordConfig.tenantId
            },
            tenantPasswordConfig
        );
        return Promise.resolve(tenantPasswordConfig);
    }

    public async removePasswordConfigFromTenant(tenantId: string): Promise<void> {
        const tenantPasswordConfigRepo = await RDBDriver.getInstance().getTenantPasswordConfigRepository();
        await tenantPasswordConfigRepo.delete({
            tenantId: tenantId
        });        
        return Promise.resolve();
    }

    public async getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null> {
        const tenantLookAndFeelRepo = await RDBDriver.getInstance().getTenantLookAndFeelRepository();
        const entity = await tenantLookAndFeelRepo.findOne({
            where: {
                tenantid: tenantId
            }
        });
        return entity;
    }

    public async createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        const tenantLookAndFeelRepo = await RDBDriver.getInstance().getTenantLookAndFeelRepository();
        await tenantLookAndFeelRepo.insert(tenantLookAndFeel);
        return Promise.resolve(tenantLookAndFeel);
    }


    public async updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        const tenantLookAndFeelRepo = await RDBDriver.getInstance().getTenantLookAndFeelRepository();
        await tenantLookAndFeelRepo.update(
            {
                tenantid: tenantLookAndFeel.tenantid
            },
            tenantLookAndFeel
        );
        return Promise.resolve(tenantLookAndFeel);
    }

    public async deleteTenantLookAndFeel(tenantId: string): Promise<void> {
        const tenantLookAndFeelRepo = await RDBDriver.getInstance().getTenantLookAndFeelRepository();
        await tenantLookAndFeelRepo.delete({
            tenantid: tenantId
        })
        return Promise.resolve();
    }

    
    public async getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>> {
        const tenantRestrictedDomainRelRepository = await RDBDriver.getInstance().getTenantRestrictedAuthenticationDomainRelRepository();
        const entities = await tenantRestrictedDomainRelRepository.find({
            where: {
                tenantId: tenantId
            }
        });        
        return entities;
    }

    public async addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel> {
        const tenantRestrictedDomainRelRepository = await RDBDriver.getInstance().getTenantRestrictedAuthenticationDomainRelRepository();
        const tenantRestrictedAuthenticationDomainRel: TenantRestrictedAuthenticationDomainRel = {
            tenantId,
            domain
        }
        await tenantRestrictedDomainRelRepository.insert(tenantRestrictedAuthenticationDomainRel)
        return Promise.resolve(tenantRestrictedAuthenticationDomainRel);
    }

    public async removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void> {
        const tenantRestrictedDomainRelRepository = await RDBDriver.getInstance().getTenantRestrictedAuthenticationDomainRelRepository();
        await tenantRestrictedDomainRelRepository.delete({
            tenantId: tenantId,
            domain: domain
        })
        return Promise.resolve();
    }

    public async getLoginFailurePolicy(tenantId: string): Promise<TenantLoginFailurePolicy | null>{
        const loginFailureRepo = await RDBDriver.getInstance().getTenantLoginFailurePolicyRepository();
        const entity = await loginFailureRepo.findOne({
            where: {
                tenantId: tenantId
            }
        });
        return entity;
    }

    public async createLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        const loginFailureRepo = await RDBDriver.getInstance().getTenantLoginFailurePolicyRepository();
        await loginFailureRepo.insert(loginFailurePolicy);
        return loginFailurePolicy;
    }

    public async updateLoginFailurePolicy(loginFailurePolicy: TenantLoginFailurePolicy): Promise<TenantLoginFailurePolicy> {
        const loginFailureRepo = await RDBDriver.getInstance().getTenantLoginFailurePolicyRepository();
        await loginFailureRepo.update(
            {
                tenantId: loginFailurePolicy.tenantId
            }, 
            loginFailurePolicy
        );
        return Promise.resolve(loginFailurePolicy);
    }

    public async removeLoginFailurePolicy(tenantId: string): Promise<void> {
        const loginFailureRepo = await RDBDriver.getInstance().getTenantLoginFailurePolicyRepository();
        await loginFailureRepo.delete({
            tenantId: tenantId
        });
        return Promise.resolve();
    }

    public async getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {
        const tenantLegacyUserRepo = await RDBDriver.getInstance().getTenantLegacyUserMigrationConfigRepository();
        const entity = tenantLegacyUserRepo.findOne({
            where: {
                tenantId: tenantId
            }
        });
        return entity;
    }

    public async removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void> {
        const tenantLegacyUserRepo = await RDBDriver.getInstance().getTenantLegacyUserMigrationConfigRepository();
        await tenantLegacyUserRepo.delete({
            tenantId: tenantId
        })
        return Promise.resolve();
    }

    public async updateTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const tenantLegacyUserRepo = await RDBDriver.getInstance().getTenantLegacyUserMigrationConfigRepository();
        await tenantLegacyUserRepo.update(
            {
                tenantId: tenantLegacyUserMigrationConfig.tenantId
            },tenantLegacyUserMigrationConfig
        );
        return Promise.resolve(tenantLegacyUserMigrationConfig);
    }

    public async createTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const tenantLegacyUserRepo = await RDBDriver.getInstance().getTenantLegacyUserMigrationConfigRepository();
        await tenantLegacyUserRepo.insert(tenantLegacyUserMigrationConfig);
        return tenantLegacyUserMigrationConfig;
    }

    public async removeAllUsersFromTenant(tenantId: string): Promise<void>{
        
        const userTenantRelRepo = await RDBDriver.getInstance().getUserTenantRelRepository();
        // To delete the authnGroup/user rel records, retrieve 1000 at a time and delete by composite ids        
        let hasMoreRecords = true;
        while(hasMoreRecords){
            const arr: Array<UserTenantRel> = await userTenantRelRepo.find({
                where: {
                    tenantId: tenantId
                },
                take: 1000
            });

            if(arr.length === 0){
                hasMoreRecords = false;
                break;
            }
           
            // sequelize does not support deletion in bulk using composite keys, so must do this manually...
            const conditions = arr.map(
                (rel: UserTenantRel) => {
                    return {
                        userId: rel.userId,
                        tenantId: rel.tenantId
                    }
                }
            );

            await userTenantRelRepo
                .createQueryBuilder()
                .delete()
                .from("userTenantRel")
                .where(
                    new Brackets(
                        qb => {
                            conditions.forEach(
                                (condition, index) => {
                                    if(index === 0){
                                        qb.where(
                                            "tenantId = :tenantId_0 AND userId = : userId_0",
                                            {
                                                ["tenantId_0"]: condition.tenantId,
                                                ["userId_0"]: condition.userId
                                            }
                                        )
                                    }
                                    else{
                                        qb.orWhere(
                                            `tenantId = :tenantId_${index} AND userId = :userId_${index}`,
                                            {
                                                [`tenantId_${index}`]: condition.tenantId,
                                                [`userId_${index}`]: condition.userId
                                            }
                                        )
                                    }
                                }
                            )
                        }
                    )
                )
                .execute();            
        }
    }

    public async removeAllAuthStateFromTenant(tenantId: string): Promise<void>{
        const preAuthStateRepo = await RDBDriver.getInstance().getPreAuthenticationStateRepository()
        await preAuthStateRepo.delete({
            tenantId: tenantId
        });

        const authCodeDataRepo = await RDBDriver.getInstance().getAuthorizationCodeDataRepository();
        await authCodeDataRepo.delete({
            tenantId: tenantId
        });


        const refreshDataRepo = await RDBDriver.getInstance().getRefreshDataRepository();
        let hasMoreRefreshData: boolean = true;
        while(hasMoreRefreshData){
            const arr: Array<RefreshData> = await refreshDataRepo.find({
                where: {
                    tenantId: tenantId
                },
                take: 1000
            });
            if(arr.length === 0){
                hasMoreRefreshData = false;
                break;
            }
            const ids: Array<string> = arr.map(
                (d: RefreshData) => d.refreshToken
            );
            await refreshDataRepo.delete({
                refreshToken: In(ids)
            });
        }
        
        const federatedOIDCAuthRelRepo = await RDBDriver.getInstance().getFederatedOIDCAuthorizationRelRepository();
        await federatedOIDCAuthRelRepo.delete({
            initTenantId: tenantId
        });
        

        const clientAuthHistoryRepo = await RDBDriver.getInstance().getClientAuthHistoryRepository();
        let hasMoreAuthHistory: boolean = true;
        while(hasMoreAuthHistory){
            const arr: Array<ClientAuthHistory> = await clientAuthHistoryRepo.find({
                where: {
                    tenantId: tenantId
                }
            });
            if(arr.length === 0){
                hasMoreAuthHistory = false;
                break;
            }
            const arrJtis: Array<string> = arr.map(
                (h: ClientAuthHistory) => h.jti
            );
            await clientAuthHistoryRepo.delete({
                jti: In(arrJtis)
            });
        }
        
        const userAuthStateRepo = await RDBDriver.getInstance().getUserAuthenticationStateRepository();
        await userAuthStateRepo.delete({
            tenantId: tenantId
        });

        const userRegistrationStateRepo = await RDBDriver.getInstance().getUserRegistrationStateRepository();
        await userRegistrationStateRepo.delete({
            tenantId: tenantId
        });

        return Promise.resolve();
    }

    public async getCaptchaConfig(): Promise<CaptchaConfig | null>{
        const captchaConfigRepo = await RDBDriver.getInstance().getCaptchaConfigRepository();
        const arr = await captchaConfigRepo.find();        
        if(arr.length === 0){
            return null;
        }
        else{
            return arr[0];
        }
    }

    public async setCaptchaConfig(captchaConfig: CaptchaConfig): Promise<CaptchaConfig>{
        const captchaConfigRepo = await RDBDriver.getInstance().getCaptchaConfigRepository();
        await captchaConfigRepo.clear();
        await captchaConfigRepo.insert(captchaConfig);
        return captchaConfig;
    }

    public async removeCaptchaConfig(): Promise<void>{
        const captchaConfigRepo = await RDBDriver.getInstance().getCaptchaConfigRepository();
        await captchaConfigRepo.clear();
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
        
        const systemSettingsRepo = await RDBDriver.getInstance().getSystemSettingsRepository();
        const arrSystemSettings: Array<SystemSettings> = await systemSettingsRepo.find();        

        if(arrSystemSettings && arrSystemSettings.length > 0){            
            const first: SystemSettings = arrSystemSettings[0];
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
        const systemSettingsRepo = await RDBDriver.getInstance().getSystemSettingsRepository();

        const arr = await systemSettingsRepo.find();
        if(arr && arr.length > 0){         
            await systemSettingsRepo.update(
                {
                    systemId: systemSettings.systemId
                },
                {
                    systemId: systemSettings.systemId,
                    allowRecoveryEmail: systemSettings.allowRecoveryEmail,
                    allowDuressPassword: systemSettings.allowDuressPassword,
                    rootClientId: systemSettings.rootClientId,
                    enablePortalAsLegacyIdp: systemSettings.enablePortalAsLegacyIdp,
                    auditRecordRetentionPeriodDays: systemSettings.auditRecordRetentionPeriodDays ? systemSettings.auditRecordRetentionPeriodDays : DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS,
                    contactEmail: systemSettings.contactEmail,
                    noReplyEmail: systemSettings.noReplyEmail,
                } 
            );
        }
        else{
            await systemSettingsRepo.insert(
                {
                    systemId: systemSettings.systemId,
                    allowRecoveryEmail: systemSettings.allowRecoveryEmail,
                    allowDuressPassword: systemSettings.allowDuressPassword,
                    rootClientId: systemSettings.rootClientId,
                    enablePortalAsLegacyIdp: systemSettings.enablePortalAsLegacyIdp,
                    auditRecordRetentionPeriodDays: systemSettings.auditRecordRetentionPeriodDays ? systemSettings.auditRecordRetentionPeriodDays : DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS,
                    contactEmail: systemSettings.contactEmail,
                    noReplyEmail: systemSettings.noReplyEmail,
                } 
            );
            
        }        
        return systemSettings;        
    }

}

export default DBTenantDao;