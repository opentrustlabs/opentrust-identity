import { Tenant, TenantManagementDomainRel, AnonymousUserConfiguration, TenantLookAndFeel, Contact } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { TenantEntity } from "@/lib/entities/tenant-entity";
import connection  from "@/lib/data-sources/db";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { GraphQLError } from "graphql";
import TenantManagementDomainRelEntity from "@/lib/entities/tenant-management-domain-rel-entity";
import AnonymousUserConfigurationEntity from "@/lib/entities/anonymous-user-configuration-entity";
import TenantAnonymousUserConfigurationRelEntity from "@/lib/entities/tenant-anonymous-user-configuration-rel-entity";

class DBTenantDao extends TenantDao {


    public async assignContactsToTenant(tenantId: string, contactList: Array<Contact>): Promise<Array<Contact>> {
        throw new Error("Method not implemented.");
    }

    public async getRootTenant(): Promise<Tenant> {
        const em = connection.em.fork();
        const entity: TenantEntity | null = await em.findOne(
            TenantEntity,
            {
                tenanttype: TENANT_TYPE_ROOT_TENANT
            }
        );
        if(!entity){
            throw new GraphQLError("ERROR_UNABLE_TO_FIND_A_ROOT_TENANT");
        }
        return Promise.resolve(entity.toModel());
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const entity: TenantEntity = new TenantEntity(tenant);
        const em = connection.em.fork();
        em.persist(entity);
        await em.flush();
        return Promise.resolve(tenant);
    }

    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantType = TENANT_TYPE_ROOT_TENANT;
        const em = connection.em.fork();
        const entity: TenantEntity = new TenantEntity(tenant);
        em.upsert(entity);
        await em.flush();
        return Promise.resolve(tenant);
    }

    public async getTenants(): Promise<Array<Tenant>> {
        const em = connection.em.fork();
        const tenantEntities: Array<TenantEntity> = await em.findAll(TenantEntity);
        const tenants: Array<Tenant> = tenantEntities.map(
            (e: TenantEntity) => {
                return e.toModel();
            }
        );
        return Promise.resolve(tenants);
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const em = connection.em.fork();
        const tenantEntity: TenantEntity | null = await em.findOne(TenantEntity, {tenantid: tenantId});
        if(tenantEntity){
            return tenantEntity.toModel();
        }
        else{
            return null;
        }
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const em = connection.em.fork();
        const e: TenantEntity = new TenantEntity(tenant);        
        em.persist(e);
        await em.flush();
        return Promise.resolve(tenant);
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const em = connection.em.fork();
        const e: TenantEntity = new TenantEntity(tenant);
        em.upsert(e);
        await em.flush();
        return Promise.resolve(tenant);    
    }

    public async deleteTenant(tenantId: string): Promise<void> {
        const em = connection.em.fork();
        const tenantEntity: TenantEntity | null = await em.findOne(TenantEntity, {tenantid: tenantId});
        if(tenantEntity){
            tenantEntity.markfordelete = true;
            em.persist(tenantEntity);
            await em.flush();
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
    
    public async createAnonymousUserConfiguration(tenantId: string, anonymousUserConfiguration: AnonymousUserConfiguration): Promise<AnonymousUserConfiguration> {
        const em = connection.em.fork();
        const configEntity: AnonymousUserConfigurationEntity = new AnonymousUserConfigurationEntity(anonymousUserConfiguration);
        await em.persistAndFlush(configEntity);

        const relEntity: TenantAnonymousUserConfigurationRelEntity = new TenantAnonymousUserConfigurationRelEntity({
            tenantid: tenantId,
            anonymoususerconfigurationid: anonymousUserConfiguration.anonymoususerconfigurationid
        });
        em.persistAndFlush(relEntity);
        return Promise.resolve(anonymousUserConfiguration);
    }

    public async updateAnonymousUserConfiguration(anonymousUserConfiguration: AnonymousUserConfiguration): Promise<AnonymousUserConfiguration> {
        const em = connection.em.fork();
        const e: AnonymousUserConfigurationEntity = new AnonymousUserConfigurationEntity(anonymousUserConfiguration);
        em.upsert(e);
        await em.flush();
        return Promise.resolve(e);
    }

    public async deleteAnonymousUserConfiguration(configurationId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(TenantAnonymousUserConfigurationRelEntity, {
            anonymoususerconfigurationid: configurationId
        });
        await em.flush();
        await em.nativeDelete(AnonymousUserConfigurationEntity, {
            anonymoususerconfigurationid: configurationId
        })
        return Promise.resolve();
    }


    public async createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        throw new Error("Method not implemented.");
    }

    public async updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel> {
        throw new Error("Method not implemented.");
    }

    public async deleteTenantLookAndFeel(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export default DBTenantDao;