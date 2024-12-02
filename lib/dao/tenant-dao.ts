import { Tenant } from "@/graphql/generated/graphql-types";


abstract class TenantDao {


    abstract getRootTenant(): Promise<Tenant>;

    abstract createRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract updateRootTenant(tenant: Tenant): Promise<Tenant>;

    abstract getTenants(): Promise<Array<Tenant>>;
 
    abstract getTenantById(tenantId: string): Promise<Tenant | null>;

    abstract createTenant(tenant: Tenant): Promise<Tenant | null>;

    abstract updateTenant(tenant: Tenant): Promise<Tenant>;

    abstract deleteTenant(tenantId: string): Promise<void>;
  

}

export default TenantDao;