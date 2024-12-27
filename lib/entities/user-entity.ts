import { Maybe, User } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class UserEntity implements User {

    constructor(user?: User){
        if(user){
            Object.assign(this, user);
        }
    }

    __typename?: "User" | undefined;
    
    @PrimaryKey({fieldName: "userid"})
    userId: string;

    @Property({fieldName: "address"})
    address?: Maybe<string> | undefined;

    @Property({fieldName: "countrycode"})
    countryCode?: Maybe<string> | undefined;

    @Property({fieldName: "domain"})
    domain: string;

    @Property({fieldName: "email"})
    email: string;

    @Property({fieldName: "emailverified"})
    emailVerified: boolean;

    @Property({fieldName: "enabled"})
    enabled: boolean;

    @Property({fieldName: "federatedoidcprovidersubjectid"})
    federatedOIDCProviderSubjectId?: Maybe<string> | undefined;

    @Property({fieldName: "firstname"})
    firstName: string;

    @Property({fieldName: "lastname"})
    lastName: string;

    @Property({fieldName: "locked"})
    locked: boolean;

    @Property({fieldName: "middlename"})
    middleName?: Maybe<string> | undefined;

    @Property({fieldName: "nameorder"})
    nameOrder: string;

    @Property({fieldName: "phonenumber"})
    phoneNumber?: Maybe<string> | undefined;

    @Property({fieldName: "preferredlanguagecode"})
    preferredLanguageCode?: Maybe<string> | undefined;

    @Property({fieldName: "twofactorauthtype"})
    twoFactorAuthType?: Maybe<string> | undefined;

}

export default UserEntity;