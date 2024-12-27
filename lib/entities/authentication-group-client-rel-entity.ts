import { AuthenticationGroupClientRel } from "@/graphql/generated/graphql-types";
import { PrimaryKey } from "@mikro-orm/core";

class AuthenticationGroupClientRelEntity implements AuthenticationGroupClientRel {

    constructor(authenticationGroupClientRel?: AuthenticationGroupClientRel){
        if(authenticationGroupClientRel){
            Object.assign(this, authenticationGroupClientRel);
        }
    }

    __typename?: "AuthenticationGroupClientRel" | undefined;

    @PrimaryKey({fieldName: "authenticationgroupid"})
    authenticationGroupId: string;

    @PrimaryKey({fieldName: "clientid"})
    clientId: string;
    
}

export default AuthenticationGroupClientRelEntity;