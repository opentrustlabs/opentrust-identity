import { RateLimitServiceGroup, TenantRateLimitRel } from "@/graphql/generated/graphql-types";

abstract class RateLimitDao {

    /////////////////   RATE LIMITS   ///////////////////////
    abstract getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>>;

    abstract getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null>;

    abstract createRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup>;

    abstract updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup>;

    abstract deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void>;
    
    abstract getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>>;

    abstract assignRateLimitToTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel>;

    abstract updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel>;

    abstract removeRateLimitFromTenant(tenantId: string, serviceGroupId: string): Promise<void>;
    
}

export default RateLimitDao;