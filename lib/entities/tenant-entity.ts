import type { Tenant } from '@/graphql/generated/graphql-types';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
    tableName: "tenant"
})
export class TenantEntity {
    
      constructor(tenant?: Tenant){
        if(tenant){
            this.allowanonymoususers = tenant.allowAnonymousUsers;
            this.allowsociallogin = tenant.allowSocialLogin;
            this.allowunlimitedrate = tenant.allowUnlimitedRate
            this.allowuserselfregistration = tenant.allowUserSelfRegistration;
            this.claimssupported = tenant.claimsSupported ? tenant.claimsSupported.join(",") : "";
            this.enabled = tenant.enabled;
            this.federatedauthenticationconstraint = tenant.federatedAuthenticationConstraint;
            this.markfordelete = tenant.markForDelete;
            this.tenantid = tenant.tenantId;
            this.tenantname = tenant.tenantName;
            this.tenanttype = tenant.tenantType;
            this.verifyemailonselfregistration = tenant.verifyEmailOnSelfRegistration;
            this.tenantdescription = tenant.tenantDescription || "";
            this.federatedauthenticationconstraint = tenant.federatedAuthenticationConstraint;
            this.migrateLegacyUsers = tenant.migrateLegacyUsers;         
        }
    }
    
    @PrimaryKey()
    tenantid: string;

    @Property()
    tenantname: string;

    @Property()
    tenantdescription?: string;

    @Property()
    enabled: boolean;

    @Property()
    claimssupported?: string;

    @Property()
    allowunlimitedrate: boolean;

    @Property()
    allowuserselfregistration: boolean;

    @Property()
    allowanonymoususers: boolean;

    @Property()
    allowsociallogin: boolean;

    @Property()
    verifyemailonselfregistration: boolean;

    @Property()
    federatedauthenticationconstraint: string;

    @Property()
    markfordelete: boolean;

    @Property()
    tenanttype: string;

    @Property()
    migrateLegacyUsers: boolean

    public toModel(): Tenant {
        const t: Tenant = {
            allowAnonymousUsers: this.allowanonymoususers,
            allowSocialLogin: this.allowsociallogin,
            allowUnlimitedRate: this.allowunlimitedrate,
            allowUserSelfRegistration: this.allowuserselfregistration,
            claimsSupported: this.claimssupported ? this.claimssupported.split(",") : [],
            enabled: this.enabled,
            federatedAuthenticationConstraint: this.federatedauthenticationconstraint,
            markForDelete: this.markfordelete,
            tenantId: this.tenantid,
            tenantName: this.tenantname,
            tenantType: this.tenanttype,
            verifyEmailOnSelfRegistration: this.verifyemailonselfregistration,
            tenantDescription: this.tenantdescription,
            federatedauthenticationconstraintid: "",
            tenanttypeid: "",
            migrateLegacyUsers: this.migrateLegacyUsers
        }
        return t;
    }

}