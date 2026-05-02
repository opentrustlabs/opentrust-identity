import { Client } from '@/graphql/generated/graphql-types';
import { OIDCContext } from '@/graphql/graphql-context';
import { containsScope } from '@/utils/authz-utils';
import { CLIENT_CREATE_SCOPE, CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE } from '@/utils/consts';

/**
 * TArgs   — type of the operation's input argument(s)
 * TResult — type of the value returned by the operation
 *
 * Caller flow — all methods are required; factories supply no-ops for unused steps:
 *   1. rule.checkScope(ctx)               — scope presence; rootOnlyRule also checks tenant tier
 *   2. rule.checkArgConstraint(args, ctx) — tenant check on the input object before the DAO call
 *   3. rule.restrictArgs(args, ctx)       — rewrite args before the DAO call (no-op by default)
 *   4. [caller performs the operation]
 *   5. rule.checkConstraint(result, ctx)  — tenant check on the loaded result
 *   6. rule.redactResult(result, ctx)     — strip sensitive fields before returning
 */
export interface PolicyRule<TArgs = unknown, TResult = unknown> {
    checkScope(oidcContext: OIDCContext): boolean;
    checkArgConstraint(args: TArgs, oidcContext: OIDCContext): boolean;
    restrictArgs(args: TArgs, oidcContext: OIDCContext): TArgs;
    checkConstraint(resource: TResult, ctx: OIDCContext): boolean;
    redactResult(result: TResult, oidcContext: OIDCContext): TResult;
}

/**
 * Reusable tenant-match check for any object that carries a tenantId.
 * Root tenant principals pass unconditionally; member tenant principals must match.
 * Suitable for both checkArgConstraint and checkConstraint.
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
 * checkArgConstraint and checkConstraint default to no-ops — override via spread when needed.
 */
export function tenantScopedRule<TArgs = unknown, TResult = unknown>(
    scopes: string | string[]
): PolicyRule<TArgs, TResult> {
    return {
        checkScope: (ctx) => containsScope(scopes, ctx.portalUserProfile?.scope),
        checkArgConstraint: () => true,
        restrictArgs: (args) => args,
        checkConstraint: () => true,
        redactResult: (result) => result,
    };
}

/**
 * Factory for operations exclusive to root tenant members.
 * checkScope fails immediately for any non-root principal, regardless of their scopes.
 * checkArgConstraint and checkConstraint are no-ops — root membership confirmed in checkScope.
 */
export function rootOnlyRule<TArgs = unknown, TResult = unknown>(
    scopes: string | string[]
): PolicyRule<TArgs, TResult> {
    return {
        checkScope: (ctx) =>
            ctx.portalUserProfile?.managementAccessTenantId === ctx.rootTenant.tenantId
            && containsScope(scopes, ctx.portalUserProfile?.scope),
        checkArgConstraint: () => true,
        restrictArgs: (args) => args,
        checkConstraint: () => true,
        redactResult: (result) => result,
    };
}

// --- Rules ---
// One-liners for the common case. Spread + override only for non-default behavior.

export const AUTH_RULE_GET_CLIENT_BY_ID: PolicyRule<string, Client | null> = {
    ...tenantScopedRule([CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE]),
    checkConstraint: (resource, ctx) => !resource || tenantMatchCheck(resource, ctx),
    redactResult: (result) => {
        if (result) result.clientSecret = '';
        return result;
    },
};

export const AUTH_RULE_CREATE_CLIENT: PolicyRule<Client, Client> = {
    ...tenantScopedRule(CLIENT_CREATE_SCOPE),
    checkArgConstraint(args, oidcContext) {
        return tenantMatchCheck(args, oidcContext);
    }
}
