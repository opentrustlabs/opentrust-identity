import { FederatedOidcProvider, Tenant, TenantManagementDomainRel } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { getFederatedOIDCProvicerDaoImpl, getTenantDaoImpl } from "@/utils/dao-utils";
import { GraphQLError } from "graphql";
import { randomUUID } from 'crypto'; 
import FederatedOIDCProviderDao from "../dao/federated-oidc-provider-dao";


const tenantDao: TenantDao = getTenantDaoImpl();
const federatedOIDCProviderDao: FederatedOIDCProviderDao = getFederatedOIDCProvicerDaoImpl();

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
        return tenantDao.createRootTenant(tenant);
        
    }
    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        const {valid, errorMessage} = await this.validateTenantInput(tenant);
        if(!valid){
            throw new GraphQLError(errorMessage);
        }
        return tenantDao.updateRootTenant(tenant);
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
        return tenantDao.createTenant(tenant);
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
        return tenantDao.updateTenant(tenant);
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


}

export default TenantService;