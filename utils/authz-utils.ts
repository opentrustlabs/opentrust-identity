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
    if(oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
        if(targetTenantId){            
            if(oidcContext.portalUserProfile.managementAccessTenantId !== targetTenantId){
                return {isAuthorized: false, errorMessage: "ERROR_INVALID_PERMISSION_FOR_TENANT"}
            }
        }
        else{
            return {isAuthorized: false, errorMessage: "ERROR_MISSING_TENANT_ID"}
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
    if(oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
        if(targetTenantId){            
            if(oidcContext.portalUserProfile.managementAccessTenantId !== targetTenantId){
                return {isAuthorized: false, errorMessage: "ERROR_INVALID_PERMISSION_FOR_TENANT"}
            }
        }
        else{
            return {isAuthorized: false, errorMessage: "ERROR_MISSING_TENANT_ID"}
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
    if(oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
        if(targetTenantId){            
            if(oidcContext.portalUserProfile.managementAccessTenantId !== targetTenantId){
                return {isAuthorized: false, errorMessage: "ERROR_INVALID_PERMISSION_FOR_TENANT"}
            }
        }
        else{
            return {isAuthorized: false, errorMessage: "ERROR_MISSING_TENANT_ID"}
        }
    }
    return {isAuthorized: true, errorMessage: ""}
}

export function authorizeRead(oidcContext: OIDCContext, allowedScope: string | Array<string>, targetTenantId: string | null): {isAuthorized: boolean, errorMessage: string | null} {
    if(!oidcContext.portalUserProfile || !oidcContext.portalUserProfile.scope){
        return {isAuthorized: false, errorMessage: "ERROR_INVALID_OR_MISSING_SUBJECT"};
    }
    const b: boolean = containsScope(allowedScope, oidcContext.portalUserProfile.scope);
    if(!b){
        return {isAuthorized: false, errorMessage: "ERROR_NO_PERMISSION"};
    }
    
    if(oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId){
        if(targetTenantId){            
            if(oidcContext.portalUserProfile.managementAccessTenantId !== targetTenantId){
                return {isAuthorized: false, errorMessage: "ERROR_INVALID_PERMISSION_FOR_TENANT"}
            }
        }
        else{
            return {isAuthorized: false, errorMessage: "ERROR_MISSING_TENANT_ID"}
        }
    }

    return {isAuthorized: true, errorMessage: ""}
}

export function filterResults<T>(results: Array<T>, oidcContext: OIDCContext, getTenantId: (item: T) => string){

    if(oidcContext.portalUserProfile?.managementAccessTenantId === oidcContext.rootTenant.tenantId){
        return results;
    }

    const filteredResults = results.filter(
        (item: T) => {
            const tenantId = getTenantId(item);
            if(tenantId !== oidcContext.portalUserProfile?.managementAccessTenantId){
                return false;
            }
            return true;
        }
    );
    return filteredResults;

}



/**
 * preProcess is called for users who are NOT members of the root tenant.
 * retrieveData is called for all users
 * postProcess is called for users who are NOT members of the root tenant.
 * 
 * @param fn 
 * @param options 
 * @returns 
 */
export function readWithInputFilterAndAuthorization<TArgs extends any[], TResult>(
    options: {
        preProcess?: (oidcContext: OIDCContext, ...args: TArgs) => Promise<Partial<TArgs>>; // Promise<TArgs>;
        retrieveData: (oidcContext: OIDCContext, ...args: TArgs) => Promise<TResult | null>;
        postProcess?: (oidcContext: OIDCContext, result: TResult | null) => Promise<{isAuthorized: boolean, errorMessage: string | null, result: TResult | null}>;
    }
){ 
    return async (oidcContext: OIDCContext, allowedScope: string | Array<string>, ...args: TArgs): Promise<TResult | null> => {
        if(!oidcContext.portalUserProfile){
            throw new GraphQLError("ERROR_INVALID_OR_MISSING_SUBJECT");
        }

        const b: boolean = containsScope(allowedScope, oidcContext.portalUserProfile.scope);        
        if(!b){
            throw new GraphQLError("ERROR_NO_PERMISSION");
        }

        const overrides = options.preProcess ? await options.preProcess(oidcContext, ...args) : args || {};
        const finalArgs = args.map((arg, i) => (overrides[i] !== undefined ? overrides[i] : arg)) as TArgs;

        if(oidcContext.portalUserProfile.managementAccessTenantId === oidcContext.rootTenant.tenantId){            
            const result = await options.retrieveData(oidcContext, ...finalArgs);
            return result;
        }
        else{
            let result: TResult | null = await options.retrieveData(oidcContext, ...finalArgs);
            if(options.postProcess){
                const postProcessResult = await options.postProcess(oidcContext, result);
                if(!postProcessResult.isAuthorized){
                    throw new GraphQLError(postProcessResult.errorMessage || "ERROR");
                }
                return postProcessResult.result;
            }
            else{
                return result;
            }            
        }
    };
}