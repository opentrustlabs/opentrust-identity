import { Tenant, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantLookAndFeel, Contact, TenantPasswordConfig, LoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import connection  from "@/lib/data-sources/db";
import { DBDriver, TenantEntity2 } from "@/lib/data-sources/sequelize-db";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { GraphQLError } from "graphql";
import TenantManagementDomainRelEntity from "@/lib/entities/tenant-management-domain-rel-entity";
import TenantAnonymousUserConfigurationEntity from "@/lib/entities/tenant-anonymous-user-configuration-entity";
import TenantPasswordConfigEntity from "@/lib/entities/tenant-password-config-entity";
import TenantLookAndFeelEntity from "@/lib/entities/tenant-look-and-feel-entity";
import TenantLegacyUserMigrationConfigEntity from "@/lib/entities/tenant-legacy-user-migration-config-entity";
import TenantRestrictedAuthenticationDomainRelEntity from "@/lib/entities/tenant-restricted-authentication-domain-rel-entity";
import { Op, Sequelize } from "sequelize";

class DBTenantDao extends TenantDao {

        
    public async removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    
    public async updateLoginFailurePolicy(loginFailurePolicy: LoginFailurePolicy): Promise<LoginFailurePolicy> {
        throw new Error("Method not implemented.");
    }

    public async getRootTenant(): Promise<Tenant> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const entity: TenantEntity2 | null = await sequelize.models.tenant.findOne({
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
        const t: TenantEntity2 = await sequelize.models.tenant.create(tenant);
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
        
        const arr: Array<TenantEntity2> = await sequelize.models.tenant.findAll({
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
        const tenantEntity: TenantEntity2 | null = await sequelize.models.tenant.findOne({
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
        const t: TenantEntity2 = await sequelize.models.tenant.create(tenant);
        return Promise.resolve(t as any as Tenant);
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const count: [affectedCount: number] = await sequelize.models.tenant.update(tenant, {where: {tenantId: tenant.tenantId}});
        return Promise.resolve(tenant);    
    }

    public async deleteTenant(tenantId: string): Promise<void> {        
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantEntity: TenantEntity2 | null = await sequelize.models.tenant.findOne({
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
        const em = connection.em.fork();
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantid = tenantId;
        }
        if(domain){
            queryParams.domain = domain;
        }
        const entities: Array<TenantManagementDomainRelEntity> = await em.find(
            TenantManagementDomainRelEntity, 
            queryParams
        );
        const models = entities.map(
            (e: TenantManagementDomainRelEntity) => e.toModel()
        )
        return Promise.resolve(models);

    }

    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const em = connection.em.fork();
        const tenantManagementDomainRelEntity: TenantManagementDomainRelEntity = new TenantManagementDomainRelEntity({
            tenantId: tenantId,
            domain: domain
        });
        await em.persist(tenantManagementDomainRelEntity).flush();
        return Promise.resolve(tenantManagementDomainRelEntity.toModel());
    }

    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const model: TenantManagementDomainRel = {
            tenantId: tenantId,
            domain: domain
        }
        const em = connection.em.fork();
        await em.nativeDelete(TenantManagementDomainRelEntity, {
            tenantid: tenantId,
            domain: domain
        });
        await em.flush();
        return Promise.resolve(model);
    }
    
    public async createAnonymousUserConfiguration(tenantId: string, anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const em = connection.em.fork();
        const configEntity: TenantAnonymousUserConfigurationEntity = new TenantAnonymousUserConfigurationEntity(anonymousUserConfiguration);
        await em.persistAndFlush(configEntity);
        return Promise.resolve(anonymousUserConfiguration);
    }

    public async updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration> {
        const em = connection.em.fork();
        const e: TenantAnonymousUserConfigurationEntity = new TenantAnonymousUserConfigurationEntity(anonymousUserConfiguration);
        em.upsert(e);
        await em.flush();
        return Promise.resolve(e);
    }

    public async deleteAnonymousUserConfiguration(tenantId: string): Promise<void> {
        const em = connection.em.fork();        
        await em.nativeDelete(TenantAnonymousUserConfigurationEntity, {
            tenantId: tenantId
        });
        await em.flush();
        return Promise.resolve();
    }

    public async getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {
        const em = connection.em.fork();
        const tenantPasswordConfigEntity: TenantPasswordConfigEntity | null = await em.findOne(TenantPasswordConfigEntity, {tenantId: tenantId});
        if(tenantPasswordConfigEntity){
            return tenantPasswordConfigEntity;
        }
        else{
            return null;
        }        
    }

    public async assignPasswordConfigToTenant(tenantId: string, tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig> {
        const em = connection.em.fork();
        tenantPasswordConfig.tenantId = tenantId;
        const entity: TenantPasswordConfigEntity = new TenantPasswordConfigEntity(tenantPasswordConfig);
        await em.persistAndFlush(entity);
        return Promise.resolve(tenantPasswordConfig);
    }

    public async removePasswordConfigFromTenant(tenantId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(TenantPasswordConfigEntity, {
            tenantId: tenantId
        });
        return Promise.resolve();
    }

    public async getTenantLookAndFeel(tenantId: string): Promise<TenantLookAndFeel | null> {
        const em = connection.em.fork();
        const entity: TenantLookAndFeelEntity | null = await em.findOne(TenantLookAndFeelEntity, {tenantid: tenantId});
        return entity ? Promise.resolve(entity?.toModel()) : Promise.resolve(null);
    }

    public async createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        const em = connection.em.fork();
        const entity: TenantLookAndFeelEntity = new TenantLookAndFeelEntity(tenantLookAndFeel);
        await em.persistAndFlush(entity);
        return Promise.resolve(tenantLookAndFeel);
    }

    public async updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        const em = connection.em.fork();
        const entity: TenantLookAndFeelEntity = new TenantLookAndFeelEntity(tenantLookAndFeel);
        await em.upsert(entity);
        await em.flush()
        return Promise.resolve(tenantLookAndFeel);
    }

    public async deleteTenantLookAndFeel(tenantId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(TenantLookAndFeelEntity, {
            tenantid: tenantId
        });
        return Promise.resolve();
    }

    public async getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {
        const em = connection.em.fork();
        const entity: TenantLegacyUserMigrationConfigEntity | null = await em.findOne(TenantLegacyUserMigrationConfigEntity, {tenantId: tenantId});
        return entity ? Promise.resolve(entity) : Promise.resolve(null);
    }

    public async setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        const em = connection.em.fork();
        const entity: TenantLegacyUserMigrationConfigEntity = new TenantLegacyUserMigrationConfigEntity(tenantLegacyUserMigrationConfig);
        await em.upsert(entity);
        return Promise.resolve(tenantLegacyUserMigrationConfig);
    }

    public async getDomainsForTenantRestrictedAuthentication(tenantId: string): Promise<Array<TenantRestrictedAuthenticationDomainRel>> {
        const em = connection.em.fork();
        const entities: Array<TenantRestrictedAuthenticationDomainRelEntity> = await em.find(
            TenantRestrictedAuthenticationDomainRelEntity, 
            {
                tenantId: tenantId
            }
        );
        
        return Promise.resolve(entities);
    }

    public async addDomainToTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<TenantRestrictedAuthenticationDomainRel> {
        const em = connection.em.fork();
        const entity: TenantRestrictedAuthenticationDomainRelEntity = new TenantRestrictedAuthenticationDomainRelEntity();
        entity.domain = domain;
        entity.tenantId = tenantId;
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);
    }

    public async removeDomainFromTenantRestrictedAuthentication(tenantId: string, domain: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(TenantRestrictedAuthenticationDomainRelEntity,
            {
                tenantId: tenantId,
                domain: domain
            }
        );
    }
       

}

export default DBTenantDao;