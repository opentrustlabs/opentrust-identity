import { Tenant, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantLookAndFeel, TenantPasswordConfig, LoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
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

class DBTenantDao extends TenantDao {

        
    public async removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    
    public async updateLoginFailurePolicy(loginFailurePolicy: LoginFailurePolicy): Promise<LoginFailurePolicy> {
        throw new Error("Method not implemented.");
    }

    public async getRootTenant(): Promise<Tenant> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantEntity | null = await sequelize.models.tenant.findOne({
            where: {
                tenanttype: TENANT_TYPE_ROOT_TENANT
            },
            raw: true            
        });

        if(!entity){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_A_ROOT_TENANT");
        }
        return Promise.resolve(entity as any as Tenant);
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const sequelize: Sequelize = await DBDriver.getConnection();
        const t: TenantEntity = await sequelize.models.tenant.create(tenant);
        return Promise.resolve(t as any as Tenant);
    }

    // TODO
    // Do we want to index the root tenant? Or do we want
    // to call out the root tenant separately for those who
    // have access to it. The call out would be on the left
    // hand navigation for root tenant access and would look
    // like:
    // Root Tenant
    // Tenants
    // Clients
    // ...etc.
    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const sequelize: Sequelize = await DBDriver.getConnection();
        const count: [affectedCount: number] = await sequelize.models.tenant.update(tenant, {where: {tenantId: tenant.tenantId}});        
        return Promise.resolve(tenant);
    }

    public async getTenants(tenantIds?: Array<string>): Promise<Array<Tenant>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const filter: any = {};
        if(tenantIds){
            filter.tenantId = { [Op.in]: tenantIds};
        }       
        
        const arr: Array<TenantEntity> = await sequelize.models.tenant.findAll({
            where: filter,
            order: [
                ["tenantName", "ASC"]
            ],
            raw: true            
        });
        return Promise.resolve(arr as any as Array<Tenant>);
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantEntity: TenantEntity | null = await sequelize.models.tenant.findOne({
            where: {
                tenantId: tenantId
            },
            raw: true
        });
        if(tenantEntity){
            return Promise.resolve(tenantEntity as any as Tenant);
        }
        else{
            return Promise.resolve(null);
        }
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const t: TenantEntity = await sequelize.models.tenant.create(tenant);
        return Promise.resolve(t as any as Tenant);
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const count: [affectedCount: number] = await sequelize.models.tenant.update(tenant, {where: {tenantId: tenant.tenantId}});
        return Promise.resolve(tenant);    
    }

    public async deleteTenant(tenantId: string): Promise<void> {        
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantEntity: TenantEntity | null = await sequelize.models.tenant.findOne({
            where: {
                tenantId: tenantId
            },
            raw: true
        });

        if(tenantEntity){
            tenantEntity.set({
                markForDelete: true
            });
            await tenantEntity.save();            
        }
    }

    
    public async getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>> {

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

        return Promise.resolve(tenantManagementDomainRelEntities as any as Array<TenantManagementDomainRel>);
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
    
    //tenantAnonymousUserConfiguration
    public async getAnonymousUserConfiguration(tenantId: string): Promise<TenantAnonymousUserConfiguration | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantAnonymousUserConfigurationEntity | null = await sequelize.models.tenantAnonymousUserConfiguration.findOne({
            where: {
                tenantId: tenantId
            },
            raw: true
        });
        return entity ? Promise.resolve(entity as any as TenantAnonymousUserConfiguration) : Promise.resolve(null);
    }

    public async createAnonymousUserConfiguration(tenantId: string, anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
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
            },
            raw: true
        })

        if(tenantPasswordConfigEntity){
            return tenantPasswordConfigEntity as any as TenantPasswordConfig;
        }
        else{
            return null;
        }        
    }

    public async assignPasswordConfigToTenant(tenantId: string, tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {        
        tenantPasswordConfig.tenantId = tenantId;
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantPasswordConfig.create(tenantPasswordConfig);        
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

        return entity ? Promise.resolve(entity as any as TenantLegacyUserMigrationConfig) : Promise.resolve(null);
    }

    public async setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantLegacyUserMigrationConfig.upsert(tenantLegacyUserMigrationConfig, {
            conflictWhere: {
                tenantId: tenantLegacyUserMigrationConfig.tenantId
            }
        });
        return Promise.resolve(tenantLegacyUserMigrationConfig);
    }

    public async getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entities: Array<TenantRestrictedAuthenticationDomainRelEntity> = await sequelize.models.tenantRestrictedAuthenticationDomainRel.findAll({
            where: {
                tenantId: tenantId
            }
        });        
        
        return Promise.resolve(entities as any as Array<TenantRestrictedAuthenticationDomainRel>);
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

}

export default DBTenantDao;