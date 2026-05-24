import { ErrorDetail } from '@/graphql/generated/graphql-types';
import { OIDCContext } from '@/graphql/graphql-context';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { logWithDetails } from '@/lib/logging/logger';
import { ERROR_CODES } from '@/lib/models/error';
import { PolicyRule } from './authorization-policy';

/**
 * Class for executing and logging access control decisions. 
 */
export class PolicyExecutor {

    /**
     * The arguments are:
     * 
     * rule: Any PolicyRule implementation
     * args: Any primitive or composite object used for the access decision and data retrieval
     * operation: The actual call to the database, search engine, etc.
     * ctx: The OIDCContext
     * conditionCtxLoader: An optional function which can be used to retrieve additional metadata used for access checks
     * for aid in determining access control ("condition" is used in the ABAC specification)
     * 
     * The order of operation is:
     * 1. Check for required scope
     * 2. Check for authorization based on the arg
     * 3. Filter the args (that is, add or change parameter values based on the user or other context)
     * 4. Perform the operation with the filtered args
     * 5. If there is an additional check to be made on the result, then run it.
     * 6. Filter the result and return it to the calling function.
     * 
     * @param rule 
     * @param args  
     * @param operation 
     * @param ctx 
     * @param conditionCtxLoader 
     * @returns 
     */
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
