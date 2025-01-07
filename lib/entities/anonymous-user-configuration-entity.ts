import type { AnonymousUserConfiguration, Maybe } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "anonymous_user_configuration"
})
class AnonymousUserConfigurationEntity implements AnonymousUserConfiguration {

    constructor(m?: AnonymousUserConfiguration){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "AnonymousUserConfiguration";

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "defaultcountrycode"})
    defaultcountrycode: string;

    @Property({fieldName: "defaultlangugecode"})
    defaultlangugecode: string;
    
    @Property({fieldName: "groupids"})
    groupids?: Maybe<Maybe<string>[]> | undefined;

    @Property({fieldName: "scopeids", nullable: true})
    scopeids?: Maybe<Maybe<string>[]> | undefined;

    @Property({fieldName: "tokenttlseconds"})
    tokenttlseconds: number;

}

export default AnonymousUserConfigurationEntity;