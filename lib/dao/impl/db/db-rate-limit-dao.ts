import { RateLimitServiceGroup, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import RateLimitDao from "../../rate-limit-dao";
import TenantRateLimitRelEntity from "@/lib/entities/tenant-rate-limit-rel-entity";
import RateLimitServiceGroupEntity from "@/lib/entities/rate-limit-service-group-entity";
import DBDriver from "@/lib/data-sources/sequelize-db";
import { Op, Sequelize } from "sequelize";

class DBRateLimitDao extends RateLimitDao {


    // rateLimitServiceGroup
    public async getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>> {
        const sequelize: Sequelize = await DBDriver.getConnection();        

        if(tenantId){
            const rels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId, null);
            const ids: Array<string> = rels.map((r: TenantRateLimitRel) => r.servicegroupid);

            const arr: Array<RateLimitServiceGroupEntity> = await sequelize.models.rateLimitServiceGroup.findAll({
                where: {
                    servicegroupid: { [Op.in]: ids}
                },
                order: [
                    ["servicegroupname", "ASC"]
                ], 
                raw: true                
            });
            return arr.map((entity: RateLimitServiceGroupEntity) => entity.dataValues);
        }
        else{
            const arr: Array<RateLimitServiceGroupEntity> = await sequelize.models.rateLimitServiceGroup.findAll({
                order: [
                    ["servicegroupname", "ASC"]
                ],
                raw: true
            });
            return arr.map((entity: RateLimitServiceGroupEntity) => entity.dataValues);
        }
    }

    public async getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const r: RateLimitServiceGroupEntity | null = await sequelize.models.rateLimitServiceGroup.findByPk(serviceGroupId, {raw: true});
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [resultList, _] = await sequelize.query(
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.rateLimitServiceGroup.create(rateLimitServiceGroup);        
        return Promise.resolve(rateLimitServiceGroup);
        
    }

    public async updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.rateLimitServiceGroup.update(rateLimitServiceGroup, {
            where: {
                servicegroupid: rateLimitServiceGroup.servicegroupid
            }
        });
        return Promise.resolve(rateLimitServiceGroup);
    }

    public async deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        await sequelize.models.tenantRateLimitRel.destroy({
            where: {
                servicegroupid: serviceGroupId
            }
        });

        await sequelize.models.rateLimitServiceGroup.destroy({
            where: {
                servicegroupid: serviceGroupId
            }
        });

        return Promise.resolve();
    }

    
    public async getRateLimitTenantRel(tenantId: string | null, rateLimitServiceGroupId: string | null): Promise<Array<TenantRateLimitRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if(tenantId){
            where.tenantId = tenantId
        }
        if(rateLimitServiceGroupId){
            where.servicegroupid = rateLimitServiceGroupId
        }
        const entities: Array<TenantRateLimitRelEntity> = await sequelize.models.tenantRateLimitRel.findAll({
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
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantRateLimitRel: TenantRateLimitRel = {
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        };
        await sequelize.models.tenantRateLimitRel.create(tenantRateLimitRel);
        
        return Promise.resolve(tenantRateLimitRel);
    }
    
    public async updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const tenantRateLimitRel: TenantRateLimitRel = {
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            tenantId,
            rateLimit: limit,
            rateLimitPeriodMinutes
        };
        await sequelize.models.tenantRateLimitRel.update(tenantRateLimitRel, {
            where: {
                servicegroupid: serviceGroupId,
                tenantId: tenantId
            }
        });
        return Promise.resolve(tenantRateLimitRel);
    }

    public async removeRateLimitFromTenant(tenantId: string, serviceGroupId: string): Promise<void> {
        const sequelize: Sequelize = await DBDriver.getConnection();

        await sequelize.models.tenantRateLimitRel.destroy({
            where: {
                tenantId: tenantId,
                servicegroupid: serviceGroupId
            }
        });
        return Promise.resolve();
    }    
}

export default DBRateLimitDao;