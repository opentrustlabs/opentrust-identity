import { RateLimitServiceGroup, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import RateLimitDao from "../../rate-limit-dao";
import connection  from "@/lib/data-sources/db";
import TenantRateLimitRelEntity from "@/lib/entities/tenant-rate-limit-rel-entity";
import RateLimitServiceGroupEntity from "@/lib/entities/rate-limit-service-group-entity";
import { QueryOrder } from "@mikro-orm/core";

class DBRateLimitDao extends RateLimitDao {


    public async getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>> {
        const em = connection.em.fork();        

        if(tenantId){
            const rels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId, null);
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

    public async getRateLimitTenantRelViews(rateLimitServiceGroupId: string): Promise<Array<TenantRateLimitRelView>> {
        const conn = connection.em.fork().getConnection();
        const l = await conn.execute<Array<any>>("select tenant_rate_limit_rel.*, tenant.tenantname from tenant_rate_limit_rel INNER JOIN tenant ON tenant_rate_limit_rel.tenantid = tenant.tenantid WHERE tenant_rate_limit_rel.servicegroupid = ? ORDER BY tenant.tenantname ASC", [
            rateLimitServiceGroupId
        ], "all");
        
        return l.map(
            (item: any) => {
                const view: TenantRateLimitRelView = {
                    servicegroupid: item.servicegroupid,
                    tenantId: item.tenantid,
                    tenantName: item.tenantname,
                    allowUnlimitedRate: item.allowunlimitedrate,
                    rateLimit: item.ratelimit,
                    rateLimitPeriodMinutes: item.ratelimitperiodminutes
                }
                return view;
            }
        )
        
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


    public async getRateLimitTenantRel(tenantId: string | null, rateLimitServiceGroupId: string | null): Promise<Array<TenantRateLimitRel>> {
        const em = connection.em.fork();
        // const conn = connection.em.fork().getConnection();
        // conn.execute("SELECT * FROM ")
        const where: any = {};
        if(tenantId){
            where.tenantId = tenantId
        }
        if(rateLimitServiceGroupId){
            where.servicegroupid = rateLimitServiceGroupId
        }
        const entities: Array<TenantRateLimitRelEntity> = await em.find(TenantRateLimitRelEntity, where);
        const retVal = entities.map(
            (entity: TenantRateLimitRelEntity) => {
                return {
                    allowUnlimitedRate: entity.allowUnlimitedRate,
                    rateLimit: entity.rateLimit,
                    rateLimitPeriodMinutes: entity.rateLimitPeriodMinutes,
                    servicegroupid: entity.servicegroupid,
                    tenantId: entity.tenantId,
                    tenantName: ""
                }
            }
        )

        return Promise.resolve(retVal);
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
        await em.flush();
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