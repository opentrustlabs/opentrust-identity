import { RateLimitServiceGroup, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import RateLimitDao from "../../rate-limit-dao";
import TenantRateLimitRelEntity from "@/lib/entities/tenant-rate-limit-rel-entity";
import RateLimitServiceGroupEntity from "@/lib/entities/rate-limit-service-group-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "@sequelize/core";

class DBRateLimitDao extends RateLimitDao {


    // rateLimitServiceGroup
    public async getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>> {
        
        if(tenantId){
            const rels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId, null);
            const ids: Array<string> = rels.map((r: TenantRateLimitRel) => r.servicegroupid);

            const arr: Array<RateLimitServiceGroupEntity> = await (await DBDriver.getInstance().getRateLimitServiceGroupEntity()).findAll({
                where: {
                    servicegroupid: { [Op.in]: ids}
                },
                order: [
                    ["servicegroupname", "ASC"]
                ]            
            });
            return arr.map((entity: RateLimitServiceGroupEntity) => entity.dataValues);
        }
        else{
            const arr: Array<RateLimitServiceGroupEntity> = await (await DBDriver.getInstance().getRateLimitServiceGroupEntity()).findAll({
                order: [
                    ["servicegroupname", "ASC"]
                ]
            });
            return arr.map((entity: RateLimitServiceGroupEntity) => entity.dataValues);
        }
    }

    public async getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null> {
        const r: RateLimitServiceGroupEntity | null = await (await DBDriver.getInstance().getRateLimitServiceGroupEntity()).findByPk(serviceGroupId);
        return r ? Promise.resolve(r.dataValues as RateLimitServiceGroup) : Promise.resolve(null);
    }

    public async getRateLimitTenantRelViews(rateLimitServiceGroupId: string | null, tenantId: string | null): Promise<Array<TenantRateLimitRelView>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const whereClauses = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bindVars: any = {};
        if(rateLimitServiceGroupId){
            whereClauses.push("tenant_rate_limit_rel.servicegroupid = $servicegroupid");
            bindVars.servicegroupid = rateLimitServiceGroupId;
        }
        if(tenantId){
            whereClauses.push("tenant.tenantid = $tenantid");
            bindVars.tenantid = tenantId;
        }
        let where = "";
        if(whereClauses.length > 0){
            where = `WHERE ${whereClauses.join(" AND ")}`
        }

        const [resultList] = await sequelize.query(
            "select tenant_rate_limit_rel.*, tenant.tenantname, rate_limit_service_group.servicegroupname " +
            "    FROM tenant_rate_limit_rel " + 
            "    INNER JOIN tenant ON tenant_rate_limit_rel.tenantid = tenant.tenantid " +
            "    INNER JOIN rate_limit_service_group ON tenant_rate_limit_rel.servicegroupid = rate_limit_service_group.servicegroupid " + 
            where +
            "    ORDER BY tenant.tenantname ASC, rate_limit_service_group.servicegroupname ASC ",
            {
                bind: bindVars
            }
        );
        
        
        return resultList.map(            
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
        await (await DBDriver.getInstance().getRateLimitServiceGroupEntity()).create(rateLimitServiceGroup);        
        return Promise.resolve(rateLimitServiceGroup);
        
    }

    public async updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        await (await DBDriver.getInstance().getRateLimitServiceGroupEntity()).update(rateLimitServiceGroup, {
            where: {
                servicegroupid: rateLimitServiceGroup.servicegroupid
            }
        });
        return Promise.resolve(rateLimitServiceGroup);
    }

    public async deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void> {
        await (await DBDriver.getInstance().getTenantRateLimitRelEntity()).destroy({
            where: {
                servicegroupid: serviceGroupId
            }
        });

        await (await DBDriver.getInstance().getRateLimitServiceGroupEntity()).destroy({
            where: {
                servicegroupid: serviceGroupId
            }
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
        const entities: Array<TenantRateLimitRelEntity> = await (await DBDriver.getInstance().getTenantRateLimitRelEntity()).findAll({
            where: where
        });
        const retVal = entities.map(
            (entity: TenantRateLimitRelEntity) => {
                return {
                    allowUnlimitedRate: entity.getDataValue("allowUnlimitedRate"),
                    rateLimit: entity.getDataValue("rateLimit"),
                    rateLimitPeriodMinutes: entity.getDataValue("rateLimitPeriodMinutes"),
                    servicegroupid: entity.getDataValue("servicegroupid"),
                    tenantId: entity.getDataValue("tenantId"),
                    tenantName: ""
                }
            }
        );

        return Promise.resolve(retVal);
    }

    public async assignRateLimitToTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {

        const tenantRateLimitRel: TenantRateLimitRel = {
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        };
        await (await DBDriver.getInstance().getTenantRateLimitRelEntity()).create(tenantRateLimitRel);
        
        return Promise.resolve(tenantRateLimitRel);
    }
    
    public async updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {

        const tenantRateLimitRel: TenantRateLimitRel = {
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        };
        await (await DBDriver.getInstance().getTenantRateLimitRelEntity()).update(tenantRateLimitRel, {
            where: {
                servicegroupid: serviceGroupId,
                tenantId: tenantId
            }
        });
        return Promise.resolve(tenantRateLimitRel);
    }

    public async removeRateLimitFromTenant(tenantId: string, serviceGroupId: string): Promise<void> {

        await (await DBDriver.getInstance().getTenantRateLimitRelEntity()).destroy({
            where: {
                tenantId: tenantId,
                servicegroupid: serviceGroupId
            }
        });
        return Promise.resolve();
    }    
}

export default DBRateLimitDao;