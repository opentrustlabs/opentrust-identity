import { RateLimit, TenantRateLimitRel } from "@/graphql/generated/graphql-types";
import RateLimitDao from "../../rate-limit-dao";
import connection  from "@/lib/data-sources/db";
import RateLimitEntity from "@/lib/entities/rate-limit-entity";
import TenantRateLimitRelEntity from "@/lib/entities/tenant-rate-limit-rel-entity";

class DBRateLimitDao extends RateLimitDao {

    public async getRateLimits(tenantId?: string): Promise<Array<RateLimit>> {
        const em = connection.em.fork();
        const queryParams: any = {};
        if(tenantId){
            const rels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId);
            queryParams.inClause = rels.map(r => r.rateLimitId);
            return await em.find(RateLimitEntity, {
                ratelimitid: queryParams.inClause
            });
        }
        else{
            return await em.findAll(RateLimitEntity);
        }
    }

    public async createRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
        const em = connection.em.fork();
        const entity: RateLimitEntity = new RateLimitEntity(rateLimit);
        await em.persistAndFlush(entity);
        return Promise.resolve(rateLimit);
    }

    public async getRateLimitById(rateLimitId: string): Promise<RateLimit | null> {
        const em = connection.em.fork();
        const entity: RateLimitEntity | null = await em.findOne(RateLimitEntity, {
            ratelimitid: rateLimitId
        });
        return Promise.resolve(entity);
    }

    public async updateRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
        const em = connection.em.fork();
        const entity: RateLimitEntity = new RateLimitEntity(rateLimit);
        em.upsert(entity);
        await em.flush();
        return Promise.resolve(entity);
    }

    public async deleteRateLimit(rateLimitId: string): Promise<void> {
        const em = connection.em.fork();
        // TODO
        // DELETE relationships
        return Promise.resolve();
    }

    public async getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>> {
        const em = connection.em.fork();
        const entities = await em.find(TenantRateLimitRelEntity, {
            tenantId: tenantId
        });
        return Promise.resolve(entities);
    }

    public async assignRateLimitToTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const em = connection.em.fork();
        const entity: TenantRateLimitRelEntity = new TenantRateLimitRelEntity({
            rateLimitId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        });
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);
    }
    
    public async updateRateLimitForTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const em = connection.em.fork();
        const entity: TenantRateLimitRelEntity = new TenantRateLimitRelEntity({
            rateLimitId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        });
        await em.upsert(entity);
        await em.flush()
        return Promise.resolve(entity);
    }

    public async removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(TenantRateLimitRelEntity, {
            tenantId: tenantId,
            rateLimitId: rateLimitId
        });
        return Promise.resolve();
    }    
}

export default DBRateLimitDao;