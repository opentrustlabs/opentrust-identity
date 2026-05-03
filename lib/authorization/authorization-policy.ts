import { Client, Tenant } from '@/graphql/generated/graphql-types';
import { OIDCContext } from '@/graphql/graphql-context';
import { containsScope } from '@/utils/authz-utils';
import { CLIENT_CREATE_SCOPE, CLIENT_READ_SCOPE, TENANT_CREATE_SCOPE, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, TENANT_UPDATE_SCOPE } from '@/utils/consts';

/**
 * TArgs          — type of the operation's input argument(s)
 * TResult        — type of the value returned by the operation
 * TConditionCtx  — optional pre-loaded data passed to checkCondition (defaults to void)
 *
 * Caller flow — all methods are required; factories supply no-ops for unused steps:
 *   1. rule.checkScope(ctx)                          — scope presence; rootOnlyRule also checks tenant tier
 *   2. rule.authorizeArgs(args, ctx)                 — authorization check on input args before the DAO call
 *   3. rule.filterArgs(args, ctx)                    — transform/restrict args before the DAO call
 *   4. [caller performs the operation]
 *   5. rule.checkCondition(result, ctx, conditionCtx) — evaluate ABAC condition on the loaded result
 *   6. rule.filterResult(result, ctx)                — strip or transform the result before returning
 */
export interface PolicyRule<TArgs = unknown, TResult = unknown, TConditionCtx = void> {
    checkScope(oidcContext: OIDCContext): boolean;
    authorizeArgs(args: TArgs, oidcContext: OIDCContext): Promise<boolean> | boolean;
    filterArgs(args: TArgs, oidcContext: OIDCContext): TArgs;
    checkCondition(resource: TResult, ctx: OIDCContext, conditionCtx: TConditionCtx): Promise<boolean> | boolean;
    filterResult(result: TResult, oidcContext: OIDCContext): TResult;
}

/**
 * Reusable tenant-match condition for any object that carries a tenantId.
 * Root tenant principals pass unconditionally; member tenant principals must match.
 * Suitable for both authorizeArgs and checkCondition.
 */
export function tenantMatchCheck<T extends { tenantId: string }>(resource: T, ctx: OIDCContext): boolean {
    if (ctx.portalUserProfile?.managementAccessTenantId === ctx.rootTenant.tenantId) {
        return true;
    }
    return resource.tenantId === ctx.portalUserProfile?.managementAccessTenantId;
}

/**
 * Factory for operations accessible to any tenant.
 * checkScope passes for any principal that holds the required scope.
 * authorizeArgs, filterArgs, checkCondition, and filterResult are all no-ops by default.
 * Override individual methods via spread when non-default behavior is needed.
 */
export function tenantScopedRule<TArgs = unknown, TResult = unknown, TConditionCtx = void>(
    scopes: string | string[]
): PolicyRule<TArgs, TResult, TConditionCtx> {
    return {
        checkScope:     (ctx) => containsScope(scopes, ctx.portalUserProfile?.scope),
        authorizeArgs:  () => true,
        filterArgs:     (args) => args,
        checkCondition: () => true,
        filterResult:   (result) => result,
    };
}

/**
 * Factory for operations exclusive to root tenant members.
 * checkScope fails immediately for any non-root principal, regardless of their scopes.
 * All other steps are no-ops — root membership is confirmed in checkScope.
 */
export function rootOnlyRule<TArgs = unknown, TResult = unknown, TConditionCtx = void>(
    scopes: string | string[]
): PolicyRule<TArgs, TResult, TConditionCtx> {
    return {
        checkScope: (ctx) =>
            ctx.portalUserProfile?.managementAccessTenantId === ctx.rootTenant.tenantId
            && containsScope(scopes, ctx.portalUserProfile?.scope),
        authorizeArgs:  () => true,
        filterArgs:     (args) => args,
        checkCondition: () => true,
        filterResult:   (result) => result,
    };
}

// --- Rules ---
// One-liners for the common case. Spread + override only for non-default behavior.

// ******************************************************************* //
//
// The following are rules that apply to both root tenant members and non-root
// tenant members, since there are many object types which can be manged 
// globally by a root tenant member, or for a specific tenant for members
// who belong to that tenant.
//
// ******************************************************************* //

export const AUTH_RULE_GET_TENANT_BY_ID: PolicyRule<string, Tenant | null> = {
    ...tenantScopedRule([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE]),
    authorizeArgs: (args, ctx) => tenantMatchCheck({tenantId: args}, ctx)
}
/**
 * checkCondition enforces that the loaded client belongs to the caller's tenant (root tenant bypasses).
 * filterResult clears clientSecret before the result is returned.
 */
export const AUTH_RULE_GET_CLIENT_BY_ID: PolicyRule<string, Client | null> = {
    ...tenantScopedRule([CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE]),
    checkCondition: (resource, ctx) => !resource || tenantMatchCheck(resource, ctx),
    filterResult: (result) => {
        if (result) {
            result.clientSecret = '';
        }
        return result;
    },
};

/**
 * createClient — principal must hold CLIENT_CREATE_SCOPE and the incoming client's tenantId
 * must match the caller's tenant (root tenant bypasses the tenantId check).
 */
export const AUTH_RULE_CREATE_CLIENT: PolicyRule<Client, Client> = {
    ...tenantScopedRule(CLIENT_CREATE_SCOPE),
    authorizeArgs: (args, ctx) => tenantMatchCheck(args, ctx),
};




// ******************************************************************* //
// 
// The following rules are for root-tenant-only operations. That is,
// for creating new tenants, creating new OIDC providers, system settings
// management, and so on.
//
// ******************************************************************* //
export const AUTH_RULE_UPDATE_TENANT: PolicyRule<Tenant, Tenant> = rootOnlyRule(TENANT_UPDATE_SCOPE);
export const AUTH_RULE_CREATE_TENANT: PolicyRule<Tenant, Tenant> = rootOnlyRule(TENANT_CREATE_SCOPE);


