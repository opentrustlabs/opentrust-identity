import { RateLimit, RateLimitServiceGroup, TenantRateLimitRel } from "@/graphql/generated/graphql-types";



abstract class RateLimitDao {

    
    /////////////////   RATE LIMITS   ///////////////////////
    // abstract getRateLimits(tenantId?: string): Promise<Array<RateLimit>>;

    // abstract createRateLimit(rateLimit: RateLimit): Promise<RateLimit>;

    // abstract getRateLimitById(rateLimitId: string): Promise<RateLimit | null>;

    // abstract updateRateLimit(rateLimit: RateLimit): Promise<RateLimit>;

    // abstract deleteRateLimit(rateLimitId: string): Promise<void>;

    abstract getRateLimitServiceGroups(tenantId: string): Promise<RateLimitServiceGroup>;

    abstract getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null>;

    abstract createRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup>;

    abstract deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void>;
    
    abstract getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>>;

    abstract assignRateLimitToTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel>;

    abstract updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel>;

    abstract removeRateLimitFromTenant(tenantId: string, serviceGroupId: string): Promise<void>;
    
}

export default RateLimitDao;