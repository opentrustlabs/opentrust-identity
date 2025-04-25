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
            return Promise.resolve(arr as any as Array<RateLimitServiceGroup>);
        }
        else{
            const arr: Array<RateLimitServiceGroupEntity> = await sequelize.models.rateLimitServiceGroup.findAll({
                order: [
                    ["servicegroupname", "ASC"]
                ],
                raw: true
            });
            return Promise.resolve(arr as any as Array<RateLimitServiceGroup>);
        }
    }

    public async getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const r: RateLimitServiceGroupEntity | null = await sequelize.models.rateLimitServiceGroup.findByPk(serviceGroupId, {raw: true});
        return r ? Promise.resolve(r as any as RateLimitServiceGroup) : Promise.resolve(null);
    }

    public async getRateLimitTenantRelViews(rateLimitServiceGroupId: string): Promise<Array<TenantRateLimitRelView>> {
        const sequelize: Sequelize = await DBDriver.getConnection();
        const [resultList, _] = await sequelize.query(
            "select tenant_rate_limit_rel.*, tenant.tenantname from tenant_rate_limit_rel INNER JOIN tenant ON tenant_rate_limit_rel.tenantid = tenant.tenantid WHERE tenant_rate_limit_rel.servicegroupid = $servicegroupid ORDER BY tenant.tenantname ASC",
            {
                bind: {
                    servicegroupid: rateLimitServiceGroupId
                }
            }
        );
        
        
        // $servicegroupid
        return resultList.map(
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
        throw new Error("Method not implemented.");
    }


    
    public async getRateLimitTenantRel(tenantId: string | null, rateLimitServiceGroupId: string | null): Promise<Array<TenantRateLimitRel>> {
        const sequelize: Sequelize = await DBDriver.getConnection();

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