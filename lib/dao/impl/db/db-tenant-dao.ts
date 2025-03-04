import { Tenant, TenantManagementDomainRel, TenantAnonymousUserConfiguration, TenantLookAndFeel, Contact, TenantPasswordConfig, SearchResultType, ObjectSearchResultItem, LoginFailurePolicy, TenantLegacyUserMigrationConfig, TenantRestrictedAuthenticationDomainRel } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { TenantEntity } from "@/lib/entities/tenant-entity";
import connection  from "@/lib/data-sources/db";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { GraphQLError } from "graphql";
import TenantManagementDomainRelEntity from "@/lib/entities/tenant-management-domain-rel-entity";
import TenantAnonymousUserConfigurationEntity from "@/lib/entities/tenant-anonymous-user-configuration-entity";
import TenantPasswordConfigEntity from "@/lib/entities/tenant-password-config-entity";
import TenantLookAndFeelEntity from "@/lib/entities/tenant-look-and-feel-entity";
import ContactEntity from "@/lib/entities/contact-entity";
import TenantLegacyUserMigrationConfigEntity from "@/lib/entities/tenant-legacy-user-migration-config-entity";
import TenantRestrictedAuthenticationDomainRelEntity from "@/lib/entities/tenant-restricted-authentication-domain-rel-entity";
import { QueryOrder } from "@mikro-orm/core";

class DBTenantDao extends TenantDao {

    removeContactFromTenant(tenantId: string, contact: Contact): Promise<void> {
        throw new Error("Method not implemented.");
    }
        
    removeLegacyUserMigrationConfiguration(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    
    public async updateLoginFailurePolicy(loginFailurePolicy: LoginFailurePolicy): Promise<LoginFailurePolicy> {
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
        const em = connection.em.fork();
        const entity: TenantEntity = new TenantEntity(tenant);
        em.upsert(entity);
        await em.flush();        
        return Promise.resolve(tenant);
    }

    public async getTenants(): Promise<Array<Tenant>> {
        const em = connection.em.fork();
        const tenantEntities: Array<TenantEntity> = await em.findAll(TenantEntity, {
            orderBy: {
                tenantname: QueryOrder.ASC
            }
        });
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

    public async assignContactsToTenant(tenantId: string, contactList: Array<Contact>): Promise<Array<Contact>> {
        const em = connection.em.fork();
        await em.nativeDelete(ContactEntity, {
            objectid: tenantId
        });
        for(let i = 0; i < contactList.length; i++){
            const entity: ContactEntity = new ContactEntity(contactList[i]);
            em.persist(entity);
        }
        await em.flush();
        return Promise.resolve(contactList);
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