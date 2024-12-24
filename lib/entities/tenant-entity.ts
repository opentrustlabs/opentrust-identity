import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({
    tableName: "tenant"
})
export class TenantEntity {    
    
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

}