import { Tenant, TenantManagementDomainRel } from "@/graphql/generated/graphql-types";
import TenantDAO from "../../tenant-dao";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from 'crypto'; 
import { GraphQLError } from "graphql";
import { ROOT_TENANT_FILE, TENANT_FILE, TENANT_MANAGEMENT_DOMAIN_REL_FILE } from "@/utils/consts";
import { getFileContents } from "@/utils/dao-utils";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);
class FSBasedTenantDao extends TenantDAO {


    public async addDomainToTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        const rels: Array<TenantManagementDomainRel> = await this.getDomainTenantManagementRels(); 
        const newRel: TenantManagementDomainRel = {
            tenantId: tenantId,
            domain: domain
        }
        rels.push(newRel);
        writeFileSync(`${dataDir}/${TENANT_MANAGEMENT_DOMAIN_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve(newRel);

    }
    public async removeDomainFromTenantManagement(tenantId: string, domain: string): Promise<TenantManagementDomainRel | null> {
        let rels: Array<TenantManagementDomainRel> = await this.getDomainTenantManagementRels(); 
        rels = rels.filter(
            (rel: TenantManagementDomainRel) => rel.tenantId === tenantId && rel.domain === domain
        );
        writeFileSync(`${dataDir}/${TENANT_MANAGEMENT_DOMAIN_REL_FILE}`, JSON.stringify(rels), {encoding: "utf-8"});
        return Promise.resolve({
            tenantId: tenantId,
            domain: domain
        });
    }

    public async getDomainTenantManagementRels(tenantId?: string): Promise<Array<TenantManagementDomainRel>>{
        let rels: Array<TenantManagementDomainRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_MANAGEMENT_DOMAIN_REL_FILE}`, "[]"));
        if(tenantId){
            rels = rels.filter(
                (rel: TenantManagementDomainRel) => rel.tenantId === tenantId
            )
        }
        return Promise.resolve(rels);
    }

    public async getRootTenant(): Promise<Tenant> {
        const tenant: Tenant = JSON.parse(getFileContents(`${dataDir}/${ROOT_TENANT_FILE}`, "{}"));
        if(!tenant?.tenantId){
            throw new GraphQLError("ERROR_ROOT_TENANT_DOES_NOT_EXIST");
        }
        return Promise.resolve(tenant);
    }
    public async createRootTenant(tenant: Tenant): Promise<Tenant> {
        tenant.tenantId = randomUUID().toString();
        writeFileSync(`${dataDir}/${ROOT_TENANT_FILE}`, JSON.stringify(tenant), {encoding: "utf-8"});
        return Promise.resolve(tenant);
        
    }
    public async updateRootTenant(tenant: Tenant): Promise<Tenant> {
        
        const rootTenant: Tenant = await this.getRootTenant();
        rootTenant.allowUnlimitedRate = tenant.allowUnlimitedRate;
        rootTenant.claimsSupported = tenant.claimsSupported;
        
        // TODO - check to make sure that any email domains do not already belong to
        // another tenant
        rootTenant.enabled = tenant.enabled;
        rootTenant.tenantDescription = tenant.tenantDescription;
        rootTenant.tenantName = tenant.tenantName;
        
        writeFileSync(`${dataDir}/${ROOT_TENANT_FILE}`, JSON.stringify(rootTenant), {encoding: "utf-8"});
        return Promise.resolve(rootTenant);       

    }
        
    public async getTenants(): Promise<Array<Tenant>> {
        const tenants: Array<Tenant> = JSON.parse(getFileContents(`${dataDir}/${TENANT_FILE}`, "[]"));
        return Promise.resolve(tenants);        
    }

    public async getTenantById(tenantId: string): Promise<Tenant | null> {
        const tenants: Array<Tenant> = await this.getTenants();
        const tenant: Tenant | undefined = tenants.find(
            (tenant: Tenant) => tenant.tenantId === tenantId
        )
        return tenant === undefined ? Promise.resolve(null) : Promise.resolve(tenant);
    }


    public async createTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant | null> {
        const tenants: Array<Tenant> = await this.getTenants();
        tenant.tenantId = randomUUID().toString();
        tenants.push(tenant);
        writeFileSync(`${dataDir}/${TENANT_FILE}`, JSON.stringify(tenants), {encoding: "utf-8"});
        return Promise.resolve(tenant);
    }

    public async updateTenant(tenant: Tenant, externalOIDCProviderId?: string, domains?: Array<string>): Promise<Tenant> {
        const tenants: Array<Tenant> = await this.getTenants();
        const tenantToUpdate: Tenant | undefined = tenants.find(
            (t: Tenant) => t.tenantId === tenant.tenantId
        )
        if(!tenantToUpdate){
            throw new GraphQLError("ERROR_TENANT_NOT_FOUND");
        }
        tenantToUpdate.tenantName = tenant.tenantName;
        tenantToUpdate.tenantDescription = tenant.tenantDescription;
        tenantToUpdate.allowUnlimitedRate = tenant.allowUnlimitedRate;
        tenantToUpdate.claimsSupported = tenant.claimsSupported;
        tenantToUpdate.enabled = tenant.enabled;

        writeFileSync(`${dataDir}/${TENANT_FILE}`, JSON.stringify(tenants), {encoding: "utf-8"});

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
        // delete tenant
        throw new Error("Method not implemented.");
    }
    

}

export default FSBasedTenantDao;