import { RateLimitServiceGroup, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import RateLimitDao from "../../rate-limit-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { DataSource, In } from "typeorm";
import TenantRateLimitRelEntity from "@/lib/entities/tenant-rate-limit-rel-entity";
import TenantEntity from "@/lib/entities/tenant-entity";

class DBRateLimitDao extends RateLimitDao {


    // rateLimitServiceGroup
    public async getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>> {
        const rateLimitServiceGroupRepo = await RDBDriver.getInstance().getRateLimitServiceGroupRepository();
        
        if(tenantId){
            const rels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId, null);
            const ids: Array<string> = rels.map((r: TenantRateLimitRel) => r.servicegroupid);
            const arr = await rateLimitServiceGroupRepo.find({
                where: {
                    servicegroupid: In(ids)
                },
                order: {
                    servicegroupname: "ASC"
                }
            });
            return arr;
        }
        else{
            const arr = await rateLimitServiceGroupRepo.find({
                order: {
                    servicegroupname: "ASC"
                }
            });
            return arr;
        }
    }

    public async getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null> {
        const rateLimitServiceGroupRepo = await RDBDriver.getInstance().getRateLimitServiceGroupRepository();
        const result = await rateLimitServiceGroupRepo.findOne({
            where: {
                servicegroupid: serviceGroupId
            }
        });
        return result;
    }

    public async getRateLimitTenantRelViews(rateLimitServiceGroupId: string | null, tenantId: string | null): Promise<Array<TenantRateLimitRelView>> {

        const d: DataSource = await RDBDriver.getConnection();
        let q = d
            .createQueryBuilder(TenantRateLimitRelEntity, "tenantRateLimitRel")
            .innerJoin("tenant", "tenant", "tenant.tenantId = tenantRateLimitRel.tenantId")
            .innerJoin("rate_limit_service_group", "rateLimitServiceGroup", "rateLimitServiceGroup.servicegroupid = tenantRateLimitRel.servicegroupid");
        
        


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClauses: Array<{queryString: string, vars: any}> = [];
        
        const bindVars: any = {};
        if(rateLimitServiceGroupId){
            whereClauses.push({
                queryString: "tenantRateLimitRel.servicegroupid = :servicegroupid",
                vars: {servicegroupid: rateLimitServiceGroupId}
            });
        }
        if(tenantId){
            whereClauses.push({
                queryString: "tenant.tenantId = :tenantId",
                vars: {tenantId: tenantId}
            });
        }
        if(whereClauses.length > 0){
            const first = whereClauses[0];            
            q = q.where(first.queryString, first.vars);
            if(whereClauses.length > 1){
                const second = whereClauses[1];
                q = q.andWhere(second.queryString, second.vars);
            }
        }
        q = q.select([
            "tenantRateLimitRel.*",
            "tenant.tenantName",
            "rateLimitServiceGroup.servicegroupname"
        ]);

        const rawResults = await q.getRawMany();
        
        return rawResults.map(            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => {
                const view: TenantRateLimitRelView = {
                    servicegroupid: item.servicegroupid,
                    servicegroupname: item.servicegroupname,
                    tenantId: item.tenantid,
                    tenantName: item.tenantname,
                    allowUnlimitedRate: item.allowunlimitedrate,
                    rateLimit: item.ratelimit,
                    rateLimitPeriodMinutes: item.ratelimitperiodminutes
                }
                return view;
            }
        );        
    }

    
    public async createRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const rateLimitServiceGroupRepo = await RDBDriver.getInstance().getRateLimitServiceGroupRepository();
        await rateLimitServiceGroupRepo.insert(rateLimitServiceGroup);
        return Promise.resolve(rateLimitServiceGroup);
        
    }

    public async updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const rateLimitServiceGroupRepo = await RDBDriver.getInstance().getRateLimitServiceGroupRepository();
        await rateLimitServiceGroupRepo.update(
            {
                servicegroupid: rateLimitServiceGroup.servicegroupid
            },
            rateLimitServiceGroup
        );
        return Promise.resolve(rateLimitServiceGroup);
    }

    public async deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void> {

        const serviceGroupTenantRelRepo = await RDBDriver.getInstance().getTenantRateLimitRelRepository();
        await serviceGroupTenantRelRepo.delete({
            servicegroupid: serviceGroupId
        });

        const rateLimitServiceGroupRepo = await RDBDriver.getInstance().getRateLimitServiceGroupRepository();
        await rateLimitServiceGroupRepo.delete({
            servicegroupid: serviceGroupId
        });

        return Promise.resolve();
    }

    
    public async getRateLimitTenantRel(tenantId: string | null, rateLimitServiceGroupId: string | null): Promise<Array<TenantRateLimitRel>> {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if(tenantId){
            where.tenantId = tenantId
        }
        if(rateLimitServiceGroupId){
            where.servicegroupid = rateLimitServiceGroupId
        }
        const serviceGroupTenantRelRepo = await RDBDriver.getInstance().getTenantRateLimitRelRepository();
        const results = await serviceGroupTenantRelRepo.find({
            where: where
        });
        
        const retVal = results.map(
            (entity: TenantRateLimitRel) => {
                return {
                    allowUnlimitedRate: entity.allowUnlimitedRate,
                    rateLimit: entity.rateLimit,
                    rateLimitPeriodMinutes: entity.rateLimitPeriodMinutes,
                    servicegroupid: entity.servicegroupid,
                    tenantId: entity.tenantId,
                    tenantName: ""
                }
            }
        );

        return Promise.resolve(retVal);
    }

    public async assignRateLimitToTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {

        const serviceGroupTenantRelRepo = await RDBDriver.getInstance().getTenantRateLimitRelRepository();
        const tenantRateLimitRel: TenantRateLimitRel = {
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        };
        await serviceGroupTenantRelRepo.insert(tenantRateLimitRel);        
        return Promise.resolve(tenantRateLimitRel);
    }
    
    public async updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const serviceGroupTenantRelRepo = await RDBDriver.getInstance().getTenantRateLimitRelRepository();
        const tenantRateLimitRel: TenantRateLimitRel = {
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        };
        await serviceGroupTenantRelRepo.update(
            {
                servicegroupid: serviceGroupId
            },
            tenantRateLimitRel
        );
        return Promise.resolve(tenantRateLimitRel);
    }

    public async removeRateLimitFromTenant(tenantId: string, serviceGroupId: string): Promise<void> {
        const serviceGroupTenantRelRepo = await RDBDriver.getInstance().getTenantRateLimitRelRepository();
        await serviceGroupTenantRelRepo.delete({
            tenantId: tenantId,
            servicegroupid: serviceGroupId
        });
        return Promise.resolve();
    }    
}

export default DBRateLimitDao;