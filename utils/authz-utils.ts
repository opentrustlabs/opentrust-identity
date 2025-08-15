import { ErrorDetail, Scope } from "@/graphql/generated/graphql-types";
import { OIDCContext } from "@/graphql/graphql-context";
import { ERROR_CODES } from "@/lib/models/error";
import { GraphQLError } from "graphql/error/GraphQLError";


export function containsScope(allowedScope: string | Array<string>, availableScopes: Array<Scope> | undefined | null): boolean {
    let hasScope: boolean = false;
    if(availableScopes){
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
    }
    return hasScope;
}


export function authorizeByScopeAndTenant(oidcContext: OIDCContext, allowedScope: string | Array<string>, targetTenantId: string | null): { isAuthorized: boolean, errorDetail: ErrorDetail} {
    if (!oidcContext.portalUserProfile || !oidcContext.portalUserProfile.scope) {
        return { isAuthorized: false, errorDetail: ERROR_CODES.EC00002};
    }
    const b: boolean = containsScope(allowedScope, oidcContext.portalUserProfile.scope);
    if (!b) {
        return { isAuthorized: false, errorDetail: ERROR_CODES.EC00003};
    }

    if (oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
        if (targetTenantId) {
            if (oidcContext.portalUserProfile.managementAccessTenantId !== targetTenantId) {
                return { isAuthorized: false, errorDetail: ERROR_CODES.EC00004}
            }
        }
        else {
            return { isAuthorized: false, errorDetail: ERROR_CODES.EC00005}
        }
    }

    return { isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR }
}

export function WithAuthorizationByScopeAndTenant<TResult>(
    options: {
        performOperation: (oidcContext: OIDCContext) => Promise<TResult | null>
    }
){
    return async (oidcContext: OIDCContext, allowedScope: string | Array<string>, targetTenantId: string | null): Promise<TResult | null> => {
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(oidcContext, allowedScope, targetTenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail: errorDetail}});
        }
        return options.performOperation(oidcContext);
    }
       
}

export function filterResultsByTenant<T>(results: Array<T>, oidcContext: OIDCContext, getTenantId: (item: T) => string){

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
 * preProcess can be used for setting or overring input parameters which are then passed to...
 * retrieveData, which is called for all users.
 * additionalConstraintCheck is called (if provided) for users who do NOT belong to the root tenant
 * postProcess (if provided) is finally called to update any of the values or properties that are part of the result.
 * 
 * @param fn 
 * @param options 
 * @returns 
 */


export function ServiceAuthorizationWrapper<TArgs extends any[], TResult>(
    options: {
        preProcess?: (oidcContext: OIDCContext, ...args: TArgs) => Promise<Partial<TArgs>>; 
        performOperation: (oidcContext: OIDCContext, ...args: TArgs) => Promise<TResult | null>;
        additionalConstraintCheck?: (oidcContext: OIDCContext, result: TResult | null) => Promise<{isAuthorized: boolean, errorDetail: ErrorDetail}>;
        postProcess?: (oidcContext: OIDCContext, result: TResult | null) => Promise<TResult | null>;
    })
    {
        return async (oidcContext: OIDCContext, allowedScope: string | Array<string>, ...args: TArgs): Promise<TResult | null> => {
            if(!oidcContext.portalUserProfile){
                throw new GraphQLError(ERROR_CODES.EC00002.errorMessage, {extensions: {errorDetail: ERROR_CODES.EC00002}});
            }

            const b: boolean = containsScope(allowedScope, oidcContext.portalUserProfile.scope);        
            if(!b){
                throw new GraphQLError(ERROR_CODES.EC00003.errorMessage, {extensions: {errorDetail: ERROR_CODES.EC00003}});
            }

            const overrides = options.preProcess ? await options.preProcess(oidcContext, ...args) : args || {};
            const finalArgs = args.map((arg, i) => (overrides[i] !== undefined ? overrides[i] : arg)) as TArgs;

            const result = await options.performOperation(oidcContext, ...finalArgs);
            if(oidcContext.portalUserProfile.managementAccessTenantId !== oidcContext.rootTenant.tenantId && options.additionalConstraintCheck){                        
                const postProcessResult = await options.additionalConstraintCheck(oidcContext, result);
                if(!postProcessResult.isAuthorized){
                    throw new GraphQLError(postProcessResult.errorDetail.errorMessage, {extensions: {errorDetail: postProcessResult.errorDetail}});
                }
            }
            if(options.postProcess){
                options.postProcess(oidcContext, result);
            }
            return result;        
        };
}
