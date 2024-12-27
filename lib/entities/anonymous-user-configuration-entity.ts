import { AnonymousUserConfiguration, Maybe } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


class AnonymousUserConfigurationEntity implements AnonymousUserConfiguration {

    constructor(m?: AnonymousUserConfiguration){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "AnonymousUserConfiguration";

    @PrimaryKey({fieldName: "anonymoususerconfigurationid"})
    anonymoususerconfigurationid: string;

    @Property({fieldName: "defaultcountrycode"})
    defaultcountrycode: string;

    @Property({fieldName: "defaultlangugecode"})
    defaultlangugecode: string;
    
    @Property({fieldName: "groupids"})
    groupids?: Maybe<Maybe<string>[]> | undefined;

    @Property({fieldName: "scopeids"})
    scopeids?: Maybe<Maybe<string>[]> | undefined;

    @Property({fieldName: "tokenttlseconds"})
    tokenttlseconds: number;

}

export default AnonymousUserConfigurationEntity;