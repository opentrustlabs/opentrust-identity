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
    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        return tenantDao.createRootTenant(tenant);
        
    }
    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        return tenantDao.updateRootTenant(tenant);
    }
        
    public async getTenants(): Promise<Array<Tenant>> {
        return tenantDao.getTenants();    
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        return tenantDao.getTenantById(tenantId);
    }

    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        return tenantDao.createTenant(tenant);
    }
    
    public async updateTenant(tenant: Tenant): Promise<Tenant> {
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
        // delete tenant
        throw new Error("Method not implemented.");
    }

}

export default TenantService;