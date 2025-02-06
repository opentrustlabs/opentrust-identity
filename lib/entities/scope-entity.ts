import type { Maybe, Scope } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "scope"
})
class ScopeEntity implements Scope {

    constructor(scope?: Scope){
        if(scope){
            Object.assign(this, scope);
        }
    }
    __typename?: "Scope" | undefined;

    @PrimaryKey({fieldName: "scopeid"})
    scopeId: string;

    @Property({fieldName: "scopename"})
    scopeName: string;

    @Property({fieldName: "scopedescription"})
    scopeDescription: string;

    @Property({fieldName: "scopeuse"})
    scopeUse: string;

}

export default ScopeEntity;
