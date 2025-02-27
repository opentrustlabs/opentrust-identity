import type { FooterLink, Maybe, TenantLookAndFeel } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_look_and_feel"
})
class TenantLookAndFeelEntity {

    constructor(m?: TenantLookAndFeel){
        if(m){
            this.tenantid = m.tenantid;
            this.adminheaderbackgroundcolor = m.adminheaderbackgroundcolor;
            this.adminheadertext = m.adminheadertext;
            this.adminheadertextcolor = m.adminheadertextcolor;
            this.adminlogo = Buffer.from(m.adminlogo || "");
            this.authenticationheaderbackgroundcolor = m.authenticationheaderbackgroundcolor;
            this.authenticationheadertext = m.authenticationheadertext;
            this.authenticationheadertextcolor = m.authenticationheadertextcolor;
            this.authenticationlogo = Buffer.from(m.authenticationlogo || "");
            this.authenticationlogomimetype = m.authenticationlogomimetype;
        }
    }
    __typename?: "TenantLookAndFeel" | undefined;

    @PrimaryKey({fieldName: "tenantid"})
    tenantid: string;

    @Property({fieldName: "adminheaderbackgroundcolor"})
    adminheaderbackgroundcolor?: Maybe<string> | undefined;

    @Property({fieldName: "adminheadertext"})
    adminheadertext?: Maybe<string> | undefined;

    @Property({fieldName: "adminheadertextcolor"})
    adminheadertextcolor?: Maybe<string> | undefined;

    @Property({fieldName: "adminlogo"})
    adminlogo?: Buffer | undefined;
    
    @Property({fieldName: "authenticationheaderbackgroundcolor"})
    authenticationheaderbackgroundcolor?: Maybe<string> | undefined;

    @Property({fieldName: "authenticationheadertext"})
    authenticationheadertext?: Maybe<string> | undefined;

    @Property({fieldName: "authenticationheadertextcolor"})
    authenticationheadertextcolor?: Maybe<string> | undefined;

    @Property({fieldName: "authenticationlogo"})
    authenticationlogo?: Buffer | undefined;

    @Property({fieldName: "authenticationlogomimetype"})
    authenticationlogomimetype: Maybe<string> | undefined;
    
    footerlinks?: Maybe<Maybe<FooterLink>[]> | undefined;
    
    public toModel(): TenantLookAndFeel{
        const m: TenantLookAndFeel = {
            __typename: "TenantLookAndFeel",
            tenantid: this.tenantid,
            adminheaderbackgroundcolor: this.adminheaderbackgroundcolor,
            adminheadertext: this.adminheadertext,
            adminheadertextcolor: this.adminheadertextcolor,
            adminlogo: this.adminlogo?.toString("utf-8"),
            authenticationheaderbackgroundcolor: this.authenticationheaderbackgroundcolor,
            authenticationheadertext: this.authenticationheadertext,
            authenticationheadertextcolor: this.authenticationheadertextcolor,
            authenticationlogo: this.authenticationlogo?.toString("utf-8"),
            authenticationlogomimetype: this.authenticationlogomimetype    
        };
        return m;
    }
    
}

export default TenantLookAndFeelEntity;