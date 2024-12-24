import { Tenant, TenantManagementDomainRel, AnonymousUserConfiguration, TenantLookAndFeel, FederatedAuthenticationConstraint, TenantType } from "@/graphql/generated/graphql-types";
import TenantDao from "../../tenant-dao";
import { TenantEntity } from "@/lib/entities/tenant-entity";
import connection  from "@/lib/data-sources/db";
import { getKeyByValue } from "@/utils/dao-utils";






class DBTenantDao extends TenantDao {

    constructor(){
        super();
        console.log("constructing db tenant dao");
    }
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
                const t: Tenant = {
                    tenantId: e.tenantid,
                    allowAnonymousUsers: e.allowanonymoususers,
                    allowSocialLogin: e.allowsociallogin,
                    allowUnlimitedRate: e.allowunlimitedrate,
                    allowUserSelfRegistration: e.allowuserselfregistration,
                    claimsSupported: e.claimssupported ? e.claimssupported.split(",") : [],
                    enabled: e.enabled,
                    federatedAuthenticationConstraint: FederatedAuthenticationConstraint[getKeyByValue(FederatedAuthenticationConstraint, e.federatedauthenticationconstraint)],
                    markForDelete: e.markfordelete,
                    tenantName: e.tenantname,
                    tenantType: TenantType[getKeyByValue(TenantType, e.tenanttype)],
                    verifyEmailOnSelfRegistration: e.verifyemailonselfregistration
                }                
                return t;
            }
        );
        return Promise.resolve(tenants);
    }
    getTenantById(tenantId: string): Promise<Tenant | null> {
        throw new Error("Method not implemented.");
    }
    public async createTenant(tenant: Tenant): Promise<Tenant | null> {
        const em = connection.em.fork();
        const e: TenantEntity = new TenantEntity();
        e.tenantid = tenant.tenantId;
        e.tenantname = tenant.tenantName;
        e.enabled = tenant.enabled;
        e.allowunlimitedrate = tenant.allowUnlimitedRate;
        e.allowuserselfregistration = tenant.allowUserSelfRegistration;
        e.allowanonymoususers = tenant.allowAnonymousUsers;
        e.allowsociallogin = tenant.allowSocialLogin;
        e.verifyemailonselfregistration = tenant.verifyEmailOnSelfRegistration;
        e.federatedauthenticationconstraint = tenant.federatedAuthenticationConstraint;
        e.markfordelete = tenant.markForDelete;
        e.tenanttype = tenant.tenantType;
        e.claimssupported = tenant.claimsSupported.join(","),
        e.tenantdescription = tenant.tenantDescription || "";
        em.persist(e);
        await em.flush();
        return Promise.resolve(tenant);
    }
    updateTenant(tenant: Tenant): Promise<Tenant> {
        throw new Error("Method not implemented.");
    }
    deleteTenant(tenantId: string): Promise<void> {
        throw new Error("Method not implemented.");
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