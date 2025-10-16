import { RateLimitServiceGroup, Tenant, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import RateLimitDao from "../../rate-limit-dao";
import RDBDriver from "@/lib/data-sources/rdb";
import { In } from "typeorm";

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

        const retVal: Array<TenantRateLimitRelView> = [];

        const arr: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId, rateLimitServiceGroupId);
        if(arr.length > 0){

            // Need this round-about approach because TypeORM does not play well with Oracle using
            // .createQueryBuilder() and .innerJoin(), so we must do this the hard way.

            const tenantIds: Array<string> = arr.map((rel: TenantRateLimitRel) => rel.tenantId);
            const serviceGroupIds: Array<string> = arr.map((rel: TenantRateLimitRel) => rel.servicegroupid);

            const tenantRepo = await RDBDriver.getInstance().getTenantRepository();

            const tenants: Array<Tenant> = await tenantRepo.find({
                where: {
                    tenantId: In(tenantIds)
                }
            });

            const serviceGroupRepo = await RDBDriver.getInstance().getRateLimitServiceGroupRepository();
            const serviceGroups: Array<RateLimitServiceGroup> = await serviceGroupRepo.find({
                where: {
                    servicegroupid: In(serviceGroupIds)
                }
            });
            
            arr.forEach(
                (rel: TenantRateLimitRel) => {
                    const tenant = this.findMatchingTenant(tenants, rel.tenantId);
                    const serviceGroup = this.findMatchingServiceGroup(serviceGroups, rel.servicegroupid);
                    const view: TenantRateLimitRelView = {
                        servicegroupid: rel.servicegroupid,
                        servicegroupname: serviceGroup ? serviceGroup.servicegroupname : "",
                        tenantId: rel.tenantId,
                        tenantName: tenant ? tenant.tenantName : "",
                        allowUnlimitedRate: rel.allowUnlimitedRate,
                        rateLimit: rel.rateLimit,
                        rateLimitPeriodMinutes: rel.rateLimitPeriodMinutes
                    }
                    retVal.push(view);
                }
            );
        }
        return retVal;              
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
                servicegroupid: serviceGroupId,
                tenantId: tenantId
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

    protected findMatchingTenant(tenants: Array<Tenant>, tenantId: string): Tenant | null {
        const t: Tenant | undefined = tenants.find(
            (ten: Tenant) => ten.tenantId === tenantId
        );
        return t || null;
    }

    protected findMatchingServiceGroup(serviceGroups: Array<RateLimitServiceGroup>, serviceGroupId: string): RateLimitServiceGroup | null {
        const s: RateLimitServiceGroup | undefined = serviceGroups.find(
            (g: RateLimitServiceGroup) => g.servicegroupid === serviceGroupId
        );
        return s || null;
    }
}

export default DBRateLimitDao;