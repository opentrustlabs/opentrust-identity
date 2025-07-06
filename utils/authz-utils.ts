import { Scope } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { GraphQLError } from "graphql/error/GraphQLError";


export function containsScope(allowedScope: string | Array<string>, availableScopes: Array<Scope>): boolean {
    let hasScope: boolean = false;
    if (!Array.isArray(allowedScope)) {
        const scope: Scope | undefined = availableScopes.find(
            (s: Scope) => s.scopeName === allowedScope
        )
        hasScope = scope !== undefined;
    }
    else {
        for (let i = 0; i < allowedScope.length; i++) {
            const scope: Scope | undefined = availableScopes.find(
                (s: Scope) => s.scopeName === allowedScope[i]
            )
            if(scope !== undefined){
                hasScope = true;
                break;
            }
        }
    }
    return hasScope;
}



export function authorizeCreateObject(oidcContext: OIDCContext, allowedScope: string | Array<string>, targetTenantId: string | null): {isAuthorized: boolean, errorMessage: string | null} {
    if(!oidcContext.portalUserProfile || !oidcContext.portalUserProfile.scope){
        return {isAuthorized: false, errorMessage: "ERROR_INVALID_OR_MISSING_SUBJECT"};
    }
    const b: boolean = containsScope(allowedScope, oidcContext.portalUserProfile.scope);
    if(!b){
        return {isAuthorized: false, errorMessage: "ERROR_NO_PERMISSION"};
    }
    if(targetTenantId){
        if(oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
            if(oidcContext.portalUserProfile.managementAccessTenantId !== targetTenantId){
                return {isAuthorized: false, errorMessage: "ERROR_INVALID_PERMISSION_FOR_TENANT"}
            }
        }
    }
    return {isAuthorized: true, errorMessage: ""}
}

export function authorizeUpdateObject(oidcContext: OIDCContext, allowedScope: string | Array<string>, targetTenantId: string | null): {isAuthorized: boolean, errorMessage: string | null} {
    if(!oidcContext.portalUserProfile || !oidcContext.portalUserProfile.scope){
        return {isAuthorized: false, errorMessage: "ERROR_INVALID_OR_MISSING_SUBJECT"};
    }
    const b: boolean = containsScope(allowedScope, oidcContext.portalUserProfile.scope);
    if(!b){
        return {isAuthorized: false, errorMessage: "ERROR_NO_PERMISSION"};
    }
    if(targetTenantId){
        if(oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
            if(oidcContext.portalUserProfile.managementAccessTenantId !== targetTenantId){
                return {isAuthorized: false, errorMessage: "ERROR_INVALID_PERMISSION_FOR_TENANT"}
            }
        }
    }
    return {isAuthorized: true, errorMessage: ""}
}

export function authorizeDeleteObject(oidcContext: OIDCContext, allowedScope: string | Array<string>, targetTenantId: string | null): {isAuthorized: boolean, errorMessage: string | null} {
    if(!oidcContext.portalUserProfile || !oidcContext.portalUserProfile.scope){
        return {isAuthorized: false, errorMessage: "ERROR_INVALID_OR_MISSING_SUBJECT"};
    }
    const b: boolean = containsScope(allowedScope, oidcContext.portalUserProfile.scope);
    if(!b){
        return {isAuthorized: false, errorMessage: "ERROR_NO_PERMISSION"};
    }
    if(targetTenantId){
        if(oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
            if(oidcContext.portalUserProfile.managementAccessTenantId !== targetTenantId){
                return {isAuthorized: false, errorMessage: "ERROR_INVALID_PERMISSION_FOR_TENANT"}
            }
        }
    }
    return {isAuthorized: true, errorMessage: ""}
}

export function readWithInputFilterAndAuthorization<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => Promise<TResult | null>,
    options: {
        preProcess?: (oidcContext: OIDCContext, ...args: TArgs) => Promise<TArgs>;
        authorize: (oidcContext: OIDCContext, ...args: TArgs) => Promise<{isAuthorized: boolean, errorMessage: string | null, result: TResult | null}>;
    }
){
    return async (oidcContext: OIDCContext, allowedScope: string | Array<string>, ...args: TArgs): Promise<TResult | null> => {
        if(!oidcContext.portalUserProfile){
            throw new GraphQLError("ERROR_INVALID_OR_MISSING_SUBJECT")
        }

        const b: boolean = containsScope(allowedScope, oidcContext.portalUserProfile.scope);        
        if(!b){
            throw new GraphQLError("ERROR_NO_PERMISSION");
        }

        const finalArgs = options.preProcess ? await options.preProcess(oidcContext, ...args) : args;
        if(oidcContext.portalUserProfile.managementAccessTenantId === oidcContext.rootTenant.tenantId){            
            const result = await fn(...finalArgs);
            return result;
        }
        else{
            const {isAuthorized, errorMessage, result } = await options.authorize(oidcContext, ...finalArgs);
            if(!isAuthorized){
                throw new GraphQLError(errorMessage || "");
            }
            return result; //fn(...finalArgs);
        }
    };
}