import { Tenant } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import TenantDao from "@/lib/dao/tenant-dao";
import { getTenantDaoImpl } from "@/utils/dao-utils";


const tenantDao: TenantDao = getTenantDaoImpl();

class TenantService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getRootTenant(): Promise<Tenant> {
        return tenantDao.getRootTenant();
    }
    public async createRootTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant> {
        return tenantDao.createRootTenant(tenant, externalOIDCProviderId, domains);
        
    }
    public async updateRootTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant> {
        return tenantDao.updateRootTenant(tenant, externalOIDCProviderId, domains);
    }
        
    public async getTenants(): Promise<Array<Tenant>> {
        return tenantDao.getTenants();    
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        return tenantDao.getTenantById(tenantId);
    }

    public async createTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant | null> {
        return tenantDao.createTenant(tenant, externalOIDCProviderId, domains);
    }
    
    public async updateTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant> {
        return tenantDao.updateTenant(tenant, externalOIDCProviderId, domains);
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
        // delete tenant
        throw new Error("Method not implemented.");
    }

}

export default TenantService;