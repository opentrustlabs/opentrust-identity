import { UserCredential } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class UserCredentialEntity {

    constructor(userCredential?: UserCredential){
        if(userCredential){
            this.userId = userCredential.userId;
            this.dateCreated = new Date(parseInt(userCredential.dateCreated));
            this.hashedPassword = userCredential.hashedPassword;
            this.salt = userCredential.salt;
            this.hashingAlgorithm = userCredential.hashingAlgorithm;
        }
    }
    __typename?: "UserCredential" | undefined;

    @PrimaryKey({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "datecreated"})
    dateCreated: Date;
    
    @Property({fieldName: "hashedpassword"})
    hashedPassword: string;
    
    @Property({fieldName: "hashingalgorithm"})
    hashingAlgorithm: string;
   
    @Property({fieldName: "salt"})
    salt: string;

    public toModel(): UserCredential{
        return {
            __typename: "UserCredential",
            dateCreated: this.dateCreated.getTime().toString(),
            hashedPassword: this.hashedPassword,
            hashingAlgorithm: this.hashingAlgorithm,
            userId: this.userId,
            salt: this.salt
        }
    }

}

export default UserCredentialEntity;