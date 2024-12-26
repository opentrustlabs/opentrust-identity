import { Tenant, TenantManagementDomainRel, AnonymousUserConfiguration, TenantLookAndFeel } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { TenantEntity } from "@/lib/entities/tenant-entity";
import connection  from "@/lib/data-sources/db";

class DBTenantDao extends TenantDao {

    getRootTenant(): Promise<Tenant> {
        throw new Error("Method not implemented.");
    }
    createRootTenant(tenant: Tenant): Promise<Tenant> {
        throw new Error("Method not implemented.");
    }
    updateRootTenant(tenant: Tenant): Promise<Tenant> {
        throw new Error("Method not implemented.");
    }

    public async getTenants(): Promise<Array<Tenant>> {
        const em = connection.em.fork();
        const tenantEntities: Array<TenantEntity> = await em.findAll(TenantEntity);
        const tenants: Array<Tenant> = tenantEntities.map(
            (e: TenantEntity) => {
                return e.toTenantModel();
            }
        );
        return Promise.resolve(tenants);
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const em = connection.em.fork();
        const tenantEntity: TenantEntity | null = await em.findOne(TenantEntity, {tenantid: tenantId});
        if(tenantEntity){
            return tenantEntity.toTenantModel();
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

    getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>> {
        throw new Error("Method not implemented.");
    }
    addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        throw new Error("Method not implemented.");
    }
    removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        throw new Error("Method not implemented.");
    }
    
    createAnonymousUserConfiguration(tenantId: string, anonymousUserConfiguration: AnonymousUserConfiguration): Promise<AnonymousUserConfiguration> {
        throw new Error("Method not implemented.");
    }
    updateAnonymousUserConfiguration(anonymousUserConfiguration: AnonymousUserConfiguration): Promise<AnonymousUserConfiguration> {
        throw new Error("Method not implemented.");
    }
    deleteAnonymousUserConfiguration(configurationId: string): Promise<void> {
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

}

export default DBTenantDao;