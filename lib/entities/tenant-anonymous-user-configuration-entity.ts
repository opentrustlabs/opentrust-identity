import type { Maybe, TenantAnonymousUserConfiguration } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_anonymous_user_configuration"
})
class TenantAnonymousUserConfigurationEntity implements TenantAnonymousUserConfiguration {

    constructor(m?: TenantAnonymousUserConfiguration){
        if(m){
            Object.assign(this, m);
        }
    }
    __typename?: "TenantAnonymousUserConfiguration";

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "defaultcountrycode"})
    defaultcountrycode?: Maybe<string> | undefined;

    @Property({fieldName: "defaultlangugecode"})
    defaultlangugecode?: Maybe<string> | undefined;

    @Property({fieldName: "tokenttlseconds"})
    tokenttlseconds: number;


}

export default TenantAnonymousUserConfigurationEntity;