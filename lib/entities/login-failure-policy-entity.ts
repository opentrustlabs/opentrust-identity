import type { LoginFailurePolicy } from "@/graphql/generated/graphql-types";

// @Entity({
//     tableName: "login_failure_policy"
// })
class LoginFailurePolicyEntity {

    constructor(loginFailurePolicy?: LoginFailurePolicy){
        if(loginFailurePolicy){
            this.tenantId = loginFailurePolicy.tenantId;
            this.loginfailurepolicytype = loginFailurePolicy.loginFailurePolicyType;
            this.failurethreshold = loginFailurePolicy.failureThreshold;
            this.pausedurationminutes = loginFailurePolicy.pauseDurationMinutes || undefined;
            this.initbackoffdurationminutes = loginFailurePolicy.initBackoffDurationMinutes || undefined;
            this.numberofpausecyclesbeforelocking = loginFailurePolicy.numberOfPauseCyclesBeforeLocking || undefined;
            this.initbackoffdurationminutes = loginFailurePolicy.initBackoffDurationMinutes || undefined;
            this.numberofbackoffcyclesbeforelocking = loginFailurePolicy.numberOfBackoffCyclesBeforeLocking || undefined;
        }
    }

    tenantId: string;

    loginfailurepolicytype: string;

    failurethreshold: number;

    pausedurationminutes?: number;
    
    numberofpausecyclesbeforelocking?: number;

    initbackoffdurationminutes?: number;

    numberofbackoffcyclesbeforelocking?: number;

    toModel(): LoginFailurePolicy{
        const l: LoginFailurePolicy = {
            tenantId: this.tenantId,
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