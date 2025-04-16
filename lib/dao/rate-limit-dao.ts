import { RateLimitServiceGroup, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";

abstract class RateLimitDao {

    /////////////////   RATE LIMITS   ///////////////////////
    abstract getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>>;

    abstract getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null>;

    abstract getRateLimitTenantRelViews(rateLimitServiceGroupId: string): Promise<Array<TenantRateLimitRelView>> ;

    abstract createRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup>;

    abstract updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup>;

    abstract deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void>;
    
    abstract getRateLimitTenantRel(tenantId: string | null, rateLimitServiceGroupId: string | null): Promise<Array<TenantRateLimitRel>>;

    abstract assignRateLimitToTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null): Promise<TenantRateLimitRel>;

    abstract updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null): Promise<TenantRateLimitRel>;

    abstract removeRateLimitFromTenant(tenantId: string, serviceGroupId: string): Promise<void>;
    
}

export default RateLimitDao;