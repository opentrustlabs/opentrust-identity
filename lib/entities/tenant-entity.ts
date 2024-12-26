import type { Tenant } from '@/graphql/generated/graphql-types';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
    tableName: "tenant"
})
export class TenantEntity {
    
  

    constructor(tenant?: Tenant){
        if(tenant){

        }
    }
    
    @PrimaryKey("tenantid")
    tenantid: string;

    @Property("tenantame")
    tenantname: string;

    @Property("tenantdescription")
    tenantdescription?: string;

    @Property("enabled")
    enabled: boolean;

    @Property("claimssupported")
    claimssupported?: string;

    @Property("allowunlimitedrate")
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

    toTenantModel(): Tenant {
        const t: Tenant = {
            allowAnonymousUsers: false,
            allowSocialLogin: false,
            allowUnlimitedRate: false,
            allowUserSelfRegistration: false,
            claimsSupported: [],
            enabled: false,
            federatedAuthenticationConstraint: "c:/Users/David/git/open-certs-oidc/graphql/generated/graphql-types",
            markForDelete: false,
            tenantId: '',
            tenantName: '',
            tenantType: "c:/Users/David/git/open-certs-oidc/graphql/generated/graphql-types",
            verifyEmailOnSelfRegistration: false
        }
        return t;
    }

}