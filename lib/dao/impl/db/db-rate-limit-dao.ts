import { RateLimitServiceGroup, TenantRateLimitRel } from "@/graphql/generated/graphql-types";
import RateLimitDao from "../../rate-limit-dao";
import connection  from "@/lib/data-sources/db";
import TenantRateLimitRelEntity from "@/lib/entities/tenant-rate-limit-rel-entity";
import RateLimitServiceGroupEntity from "@/lib/entities/rate-limit-service-group-entity";
import { QueryOrder } from "@mikro-orm/core";

class DBRateLimitDao extends RateLimitDao {


    public async getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>> {
        const em = connection.em.fork();        

        if(tenantId){
            const rels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId);
            const ids: Array<string> = rels.map((r: TenantRateLimitRel) => r.servicegroupid);
            const arr: Array<RateLimitServiceGroup> = await em.find(RateLimitServiceGroupEntity, 
                {
                    servicegroupid: ids
                },
                {
                    orderBy: {servicegroupname: QueryOrder.ASC}
                }
            );
            return Promise.resolve(arr);
        }
        else{
            const arr: Array<RateLimitServiceGroup> = await em.findAll(RateLimitServiceGroupEntity, {
                orderBy: {servicegroupname: QueryOrder.ASC}
            });
            return Promise.resolve(arr);
        }
    }

    public async getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null> {
        const em = connection.em.fork();
        const r: RateLimitServiceGroupEntity | null = await em.findOne(RateLimitServiceGroupEntity, {
            servicegroupid: serviceGroupId
        });
        return Promise.resolve(r);
    }

    public async createRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const em = connection.em.fork();
        const entity: RateLimitServiceGroupEntity = new RateLimitServiceGroupEntity(rateLimitServiceGroup);
        await em.persistAndFlush(entity);
        return Promise.resolve(rateLimitServiceGroup);
        
    }

    public async updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const em = connection.em.fork();
        const entity: RateLimitServiceGroupEntity = new RateLimitServiceGroupEntity(rateLimitServiceGroup);
        await em.upsert(entity);
        await em.flush();
        return Promise.resolve(rateLimitServiceGroup);
    }

    public async deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }


    public async getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>> {
        const em = connection.em.fork();
        const entities = await em.find(TenantRateLimitRelEntity, {
            tenantId: tenantId
        });
        return Promise.resolve(entities);
    }

    public async assignRateLimitToTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const em = connection.em.fork();
        const entity: TenantRateLimitRelEntity = new TenantRateLimitRelEntity({
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        });
        await em.persistAndFlush(entity);
        return Promise.resolve(entity);
    }
    
    public async updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const em = connection.em.fork();
        const entity: TenantRateLimitRelEntity = new TenantRateLimitRelEntity({
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        });
        await em.upsert(entity);
        await em.flush()
        return Promise.resolve(entity);
    }

    public async removeRateLimitFromTenant(tenantId: string, serviceGroupId: string): Promise<void> {
        const em = connection.em.fork();
        await em.nativeDelete(TenantRateLimitRelEntity, {
            tenantId: tenantId,
            servicegroupid: serviceGroupId
        });
        return Promise.resolve();
    }    
}

export default DBRateLimitDao;