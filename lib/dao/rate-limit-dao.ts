import { RateLimit, TenantRateLimitRel } from "@/graphql/generated/graphql-types";



abstract class RateLimitDao {

    
    /////////////////   RATE LIMITS   ///////////////////////
    abstract getRateLimits(tenantId?: string): Promise<Array<RateLimit>>;

    abstract createRateLimit(rateLimit: RateLimit): Promise<RateLimit>;

    abstract getRateLimitById(rateLimitId: string): Promise<RateLimit | null>;

    abstract updateRateLimit(rateLimit: RateLimit): Promise<RateLimit>;

    abstract deleteRateLimit(rateLimitId: string): Promise<void>;

    abstract getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>>;

    abstract assignRateLimitToTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel>;

    abstract updateRateLimitForTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel>;

    abstract removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<void>;
    
}

export default RateLimitDao;