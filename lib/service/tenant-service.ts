import { TenantAnonymousUserConfiguration, Contact, ObjectSearchResultItem, SearchResultType, Tenant, TenantLegacyUserMigrationConfig, TenantLookAndFeel, TenantManagementDomainRel, TenantMetaData, TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { getTenantDaoImpl } from "@/utils/dao-utils";
import { GraphQLError } from "graphql";
import { randomUUID } from 'crypto'; 
import { CONTACT_TYPE_FOR_TENANT, DEFAULT_TENANT_META_DATA, SEARCH_INDEX_OBJECT_SEARCH, TENANT_TYPE_ROOT_TENANT, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { Client } from "@opensearch-project/opensearch";
import { getOpenSearchClient } from "@/lib/data-sources/search";

const searchClient: Client = getOpenSearchClient();
const tenantDao: TenantDao = getTenantDaoImpl();

class TenantService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getRootTenant(): Promise<Tenant> {
        return tenantDao.getRootTenant();
    }

    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantId = randomUUID().toString();
        await tenantDao.createRootTenant(tenant);
        await this.updateSearchIndex(tenant);

        return Promise.resolve(tenant);        
    }

    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        const {valid, errorMessage} = await this.validateTenantInput(tenant);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        await tenantDao.updateRootTenant(tenant);
        await this.updateSearchIndex(tenant);
        return Promise.resolve(tenant);
    }
        
    public async getTenants(): Promise<Array<Tenant>> {
        return tenantDao.getTenants();    
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        return tenantDao.getTenantById(tenantId);
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const {valid, errorMessage} = await this.validateTenantInput(tenant);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        
        tenant.tenantId = randomUUID().toString();
        await tenantDao.createTenant(tenant);
        await this.updateSearchIndex(tenant);

        return Promise.resolve(tenant);
    }
    
    protected async updateSearchIndex(tenant: Tenant): Promise<void> {
        let owningTenantId: string | null = null;
        if(tenant.tenantType !== TENANT_TYPE_ROOT_TENANT){
            const rootTenant: Tenant = await this.getRootTenant();
            owningTenantId = rootTenant.tenantId;
        }
        const document: ObjectSearchResultItem = {
            name: tenant.tenantName,
            description: tenant.tenantDescription,
            objectid: tenant.tenantId,
            objecttype: SearchResultType.Tenant,
            owningtenantid: owningTenantId,
            email: "",
            enabled: tenant.enabled,
            owningclientid: "",
            subtype: TENANT_TYPES_DISPLAY.get(tenant.tenantType),
            subtypekey: tenant.tenantType
        }
        
        await searchClient.index({
            id: tenant.tenantId,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });        
    }
    
    protected async validateTenantInput(tenant: Tenant): Promise<{valid: boolean, errorMessage: string}> {
        // if(tenant.federatedAuthenticationConstraint === FederatedAuthenticationConstraint.Exclusive && (!tenant.federatedOIDCProviderId || "" === tenant.federatedOIDCProviderId)){
        //     return {valid: false, errorMessage: "ERROR_MISSING_EXTERNAL_OIDC_PROVIDER"};
        // }
        // if(tenant.federatedOIDCProviderId && "" !== tenant.federatedOIDCProviderId){
        //     const oidcProvider: FederatedOidcProvider | null = await federatedOIDCProviderDao.getFederatedOidcProviderById(tenant.federatedOIDCProviderId || "");
        //     if(!oidcProvider){
        //         return {valid: false, errorMessage: "ERROR_INVALID_OIDC_PROVIDER"};
        //     }
        // }
        return {valid: true, errorMessage: ""};
    }

    public async updateTenant(tenant: Tenant): Promise<Tenant> {
        const {valid, errorMessage} = await this.validateTenantInput(tenant);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        await tenantDao.updateTenant(tenant);
        await this.updateSearchIndex(tenant);
        return Promise.resolve(tenant);
    }

    public async deleteTenant(tenantId: string): Promise<void> {
        // delete all clients
        // delete all groups
        // delete all users
        // delete all login groups
        // delete all LoginGroupClientRel
        // delete all LoginGroupUserRel
        // delete all UserGroupRel
        // UserCredential
        // UserCredentialHistory
        // Key
        // TenantRateLimitRel
        // TenantScopeRel
        // ClientTenantScopeRel
        // TenantManagementDomainRel
        // delete tenant
        throw new Error("Method not implemented.");
    }


    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const tenant: Tenant | null = await this.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        // if this exists, there should be at most 1. If the tenant id is different, then delete the existing record
        // and insert a new one, since the domain needs to be a unique key in this relationship.
        const relsByDomain: Array<TenantManagementDomainRel> = await this.getDomainTenantManagementRels(undefined, domain);
        if(!relsByDomain || relsByDomain.length === 0){
            return tenantDao.addDomainToTenantManagement(tenantId, domain);
        }
        else{    
            const rel: TenantManagementDomainRel = relsByDomain[0];
            // if equal to existing record, just return it
            if(rel.tenantId === tenantId){
                return Promise.resolve({tenantId, domain});
            }
            // else delete the existing relationship and add new
            await this.removeDomainFromTenantManagement(tenantId, domain);
            return tenantDao.addDomainToTenantManagement(tenantId, domain);
        }        
    }

    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        return tenantDao.removeDomainFromTenantManagement(tenantId, domain);
    }

    public async getDomainTenantManagementRels(tenantId?: string, domain?: string): Promise<Array<TenantManagementDomainRel>>{
        return tenantDao.getDomainTenantManagementRels(tenantId, domain);
    }

    public async assignContactsToTenant(tenantId: string, contactList: Array<Contact>): Promise<Array<Contact>>{
        contactList.forEach(
            (c: Contact) => {
                c.objectid = tenantId;
                c.objecttype = CONTACT_TYPE_FOR_TENANT
            }
        );
        const invalidContacts = contactList.filter(
            (c: Contact) => {
                if(c.email === null || c.email === "" || c.email.length < 3 || c.email.indexOf("@") < 0){
                    return true;
                }
                if(c.name === null || c.name === "" || c.name.length < 3){
                    return true;
                }
                return false;
            }
        );
        if(invalidContacts.length > 0){
            throw new GraphQLError("ERROR_INVALID_CONTACT_INFORMATION");
        }
        return tenantDao.assignContactsToTenant(tenantId, contactList);
    }

    public async createAnonymousUserConfiguration(tenantId: string, anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>{
        return tenantDao.createAnonymousUserConfiguration(tenantId, anonymousUserConfiguration);
    }

    public async updateAnonymousUserConfiguration(anonymousUserConfiguration: TenantAnonymousUserConfiguration): Promise<TenantAnonymousUserConfiguration>{
        return tenantDao.updateAnonymousUserConfiguration(anonymousUserConfiguration);
    }

    public async deleteAnonymousUserConfiguration(tenantId: string): Promise<void>{
        return tenantDao.deleteAnonymousUserConfiguration(tenantId);
    }

    public async getTenantMetaData(tenantId: string): Promise<TenantMetaData | null> {
        const tenant: Tenant | null = await this.getTenantById(tenantId);
        if(!tenant){
            throw new GraphQLError("ERROR_TENANT_DOES_NOT_EXIST");
        }
        const tenantLookAndFeel: TenantLookAndFeel | null = await tenantDao.getTenantLookAndFeed(tenantId);
        return Promise.resolve(
            {
                tenant: tenant,
                tenantLookAndFeel: tenantLookAndFeel ? tenantLookAndFeel : DEFAULT_TENANT_META_DATA.tenantLookAndFeel
            }
        );
    }

    public async createTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>{
        return tenantDao.createTenantLookAndFeel(tenantLookAndFeel);
    }

    public async updateTenantLookAndFeel(tenantLookAndFeel: TenantLookAndFeel): Promise<TenantLookAndFeel>{
        return tenantDao.updateTenantLookAndFeel(tenantLookAndFeel);
    }

    public async deleteTenantLookAndFeel(tenantId: string): Promise<void>{
        return tenantDao.deleteTenantLookAndFeel(tenantId);
    }

    public async getTenantPasswordConfig(tenantId: string): Promise<TenantPasswordConfig | null> {
        return tenantDao.getTenantPasswordConfig(tenantId);
    }

    public async assignPasswordConfigToTenant(tenantId: string, tenantPasswordConfig: TenantPasswordConfig): Promise<TenantPasswordConfig>{
        return tenantDao.assignPasswordConfigToTenant(tenantId, tenantPasswordConfig);
    }

    public async removePasswordConfigFromTenant(tenantId: string): Promise<void>{
        return tenantDao.removePasswordConfigFromTenant(tenantId);
    }

    public async getLegacyUserMigrationConfiguration(tenantId: string): Promise<TenantLegacyUserMigrationConfig | null> {
        return tenantDao.getLegacyUserMigrationConfiguration(tenantId);
    }

    public async setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig: TenantLegacyUserMigrationConfig): Promise<TenantLegacyUserMigrationConfig | null> {
        return tenantDao.setTenantLegacyUserMigrationConfiguration(tenantLegacyUserMigrationConfig)
    }


}

export default TenantService;