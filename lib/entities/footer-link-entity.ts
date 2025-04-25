import type { FooterLink } from "@/graphql/generated/graphql-types";


// @Entity({
//     tableName: "footer_link"
// })
class FooterLinkEntity implements FooterLink {

    constructor(m?: FooterLink){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "FooterLink";

    footerlinkid: string;
    linktext: string;

    tenantid: string;

    uri: string;
    
    
}

export default FooterLinkEntity;