import type { Maybe, TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({
    tableName: "tenant_password_config"
})
class TenantPasswordConfigEntity implements TenantPasswordConfig {

    constructor(tenantPasswordConfig?: TenantPasswordConfig){
        if(tenantPasswordConfig){
            Object.assign(this, tenantPasswordConfig)
        }
    }
    
    __typename?: "TenantPasswordConfig";

    @PrimaryKey({fieldName: "tenantid"})
    tenantId: string;

    @Property({fieldName: "passwordhashingalgorithm"})
    passwordHashingAlgorithm: string;

    @Property({fieldName: "passwordmaxlength"})
    passwordMaxLength: number;

    @Property({fieldName: "passwordminlength"})
    passwordMinLength: number;

    @Property({fieldName: "requirelowercase"})
    requireLowerCase: boolean;

    @Property({fieldName: "requirenumbers"})
    requireNumbers: boolean;

    @Property({fieldName: "requirespecialcharacters"})
    requireSpecialCharacters: boolean;

    @Property({fieldName: "requireuppercase"})
    requireUpperCase: boolean;

    @Property({fieldName: "specialcharactersallowed"})
    specialCharactersAllowed?: Maybe<string> | undefined;

    @Property({fieldName: "allowmfa"})
    allowMfa: boolean;

    @Property({fieldName: "mfatypesallowed"})
    mfaTypesAllowed?: Maybe<string> | undefined;

    @Property({fieldName: "requiremfa"})
    requireMfa: boolean;

    @Property({fieldName: "mfatypesrequired"})
    mfaTypesRequired?: Maybe<string> | undefined;

    @Property({fieldName: "maxrepeatingcharacterlength"})
    maxRepeatingCharacterLength?: Maybe<number> | undefined;

    @Property({fieldName: "passwordrotationperioddays"})
    passwordRotationPeriodDays?: Maybe<number> | undefined;    

}

export default TenantPasswordConfigEntity;