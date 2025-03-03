import type { Contact, Maybe } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "contact"
})
class  ContactEntity implements Contact {

    constructor(m?: Contact){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "Contact";

    @PrimaryKey({fieldName: "contactid"})
    contactid: string;

    @Property({fieldName: "objectid"})
    objectid: string;

    @Property({fieldName: "email"})
    email: string;

    @Property({fieldName: "objecttype"})
    objecttype: string;
    
    @Property({fieldName: "contactname", nullable: true})
    name: Maybe<string> | undefined;
    
    @Property({fieldName: "userid", nullable: true})
    userid?: Maybe<string> | undefined;
   
}

export default ContactEntity;