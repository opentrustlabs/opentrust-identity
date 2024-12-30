import type { FooterLink } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "footer_link"
})
class FooterLinkEntity implements FooterLink {

    constructor(m?: FooterLink){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "FooterLink";

    @PrimaryKey({fieldName: ""})
    footerlinkid: string;
    
    @Property({fieldName: "linktext"})
    linktext: string;

    @Property({fieldName: "tenantid"})
    tenantid: string;

    @Property({fieldName: "uri"})
    uri: string;
    
    
}

export default FooterLinkEntity;