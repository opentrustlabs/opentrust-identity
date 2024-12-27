import { Maybe, Scope } from "@/graphql/generated/graphql-types";
import { PrimaryKey, Property } from "@mikro-orm/core";


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
    scopeDescription?: Maybe<string> | undefined;
}

export default ScopeEntity;
