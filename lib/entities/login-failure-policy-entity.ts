import type { LoginFailurePolicy } from "@/graphql/generated/graphql-types";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";


@Entity({
    tableName: "login_failure_policy"
})
class LoginFailurePolicyEntity {

    constructor(loginFailurePolicy?: LoginFailurePolicy){
        if(loginFailurePolicy){
            this.loginfailurepolicytype = loginFailurePolicy.loginFailurePolicyType;
            this.failurethreshold = loginFailurePolicy.failureThreshold;
            this.pausedurationminutes = loginFailurePolicy.pauseDurationMinutes || undefined;
            this.initbackoffdurationminutes = loginFailurePolicy.initBackoffDurationMinutes || undefined;
            this.numberofpausecyclesbeforelocking = loginFailurePolicy.numberOfPauseCyclesBeforeLocking || undefined;
            this.initbackoffdurationminutes = loginFailurePolicy.initBackoffDurationMinutes || undefined;
            this.numberofbackoffcyclesbeforelocking = loginFailurePolicy.numberOfBackoffCyclesBeforeLocking || undefined;
        }
    }

    @PrimaryKey()
    loginfailurepolicytype: string;

    @Property()
    failurethreshold: number;

    @Property()
    pausedurationminutes?: number;
    
    @Property()
    numberofpausecyclesbeforelocking?: number;

    @Property()
    initbackoffdurationminutes?: number;

    @Property()
    numberofbackoffcyclesbeforelocking?: number;

    toModel(): LoginFailurePolicy{
        const l: LoginFailurePolicy = {
            failureThreshold: this.failurethreshold,
            loginFailurePolicyType: this.loginfailurepolicytype,
            initBackoffDurationMinutes: this.initbackoffdurationminutes,
            numberOfBackoffCyclesBeforeLocking: this.numberofbackoffcyclesbeforelocking,
            numberOfPauseCyclesBeforeLocking: this.numberofpausecyclesbeforelocking,
            pauseDurationMinutes: this.pausedurationminutes
        }
        return l;
    }

}

export default LoginFailurePolicyEntity;