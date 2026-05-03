import { ErrorDetail } from '@/graphql/generated/graphql-types';
import { OIDCContext } from '@/graphql/graphql-context';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { logWithDetails } from '@/lib/logging/logger';
import { ERROR_CODES } from '@/lib/models/error';
import { PolicyRule } from './authorization-policy';

export interface AuditContext {
    principalId: string;
    displayName: string;
    tenantId: string;
    principalType: string;
}

export class PolicyExecutor {

    static async execute<TArgs, TResult, TConditionCtx = void>(
        rule: PolicyRule<TArgs, TResult, TConditionCtx>,
        args: TArgs,
        operation: (args: TArgs) => Promise<TResult>,
        ctx: OIDCContext,
        conditionCtxLoader?: (result: TResult, ctx: OIDCContext) => Promise<TConditionCtx>
    ): Promise<TResult> {
        if (!rule.checkScope(ctx)) {
            PolicyExecutor.deny('checkScope', ERROR_CODES.EC00003, ctx);
        }

        if (!await rule.authorizeArgs(args, ctx)) {
            PolicyExecutor.deny('authorizeArgs', ERROR_CODES.EC00030, ctx);
        }

        const safeArgs = rule.filterArgs(args, ctx);
        const result = await operation(safeArgs);

        const conditionCtx = conditionCtxLoader
            ? await conditionCtxLoader(result, ctx)
            : undefined as TConditionCtx;

        if (!await rule.checkCondition(result, ctx, conditionCtx as TConditionCtx)) {
            PolicyExecutor.deny('checkCondition', ERROR_CODES.EC00030, ctx);
        }

        PolicyExecutor.allow(ctx);
        return rule.filterResult(result, ctx);
    }

    static auditContext(ctx: OIDCContext): AuditContext {
        const p = ctx.portalUserProfile;
        return {
            principalId:   p?.userId ?? '',
            displayName:   `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim(),
            tenantId:      p?.managementAccessTenantId ?? '',
            principalType: p?.principalType ?? '',
        };
    }

    private static deny(step: string, errorDetail: ErrorDetail, ctx: OIDCContext): never {
        logWithDetails('warn', 'AUTHZ_DECISION', {
            outcome:     'DENIED',
            step,
            principalId: ctx.portalUserProfile?.userId ?? '',
            tenantId:    ctx.portalUserProfile?.managementAccessTenantId ?? '',
        });
        throw new GraphQLError(errorDetail.errorCode, { extensions: { errorDetail } });
    }

    private static allow(ctx: OIDCContext): void {
        logWithDetails('info', 'AUTHZ_DECISION', {
            outcome:     'ALLOWED',
            principalId: ctx.portalUserProfile?.userId ?? '',
        });
    }
}
