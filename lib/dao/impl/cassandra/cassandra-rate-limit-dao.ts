import { RateLimitServiceGroup, TenantRateLimitRelView, TenantRateLimitRel, Tenant } from "@/graphql/generated/graphql-types";
import RateLimitDao from "../../rate-limit-dao";
import CassandraDriver from "@/lib/data-sources/cassandra";
import cassandra from "cassandra-driver";

class CassandraRateLimitDao extends RateLimitDao {

    public async getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("rate_limit_service_group");
        if(tenantId){
            const arr: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId, null);
            const ids = arr.map((rel: TenantRateLimitRel) => rel.servicegroupid);
            const results = await mapper.find({
                servicegroupid: cassandra.mapping.q.in_(ids)
            });
            return results.toArray();
        }
        else{
            return (await mapper.findAll()).toArray();
        }
    }

    public async getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("rate_limit_service_group");
        return mapper.get({
            servicegroupid: serviceGroupId
        });
    }

    public async getRateLimitTenantRelViews(rateLimitServiceGroupId: string | null, tenantId: string | null): Promise<Array<TenantRateLimitRelView>> {
        const arr: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId, rateLimitServiceGroupId);
        const tenantIds = arr.map(
            (rel: TenantRateLimitRel) => rel.tenantId
        );

        const tenantMapper = await CassandraDriver.getInstance().getModelMapper("tenant");
        const tenantResults = await tenantMapper.find({
            tenantId: cassandra.mapping.q.in_(tenantIds)
        });
        const tenants: Array<Tenant> = tenantResults.toArray();

        // *******************************************
        const serviceGroupIds = arr.map(
            (rel: TenantRateLimitRel) => rel.servicegroupid
        );
        const serviceGroupMapper = await CassandraDriver.getInstance().getModelMapper("rate_limit_service_group");
        const serviceGroupResults = await serviceGroupMapper.find({
            servicegroupid: cassandra.mapping.q.in_(serviceGroupIds)
        });
        const serviceGroups: Array<RateLimitServiceGroup> = serviceGroupResults.toArray();
        

        const arrRetVal: Array<TenantRateLimitRelView> = [];
        arr.forEach(
            (rel: TenantRateLimitRel) => {
                const relView: TenantRateLimitRelView = {
                    servicegroupid: rel.servicegroupid,
                    servicegroupname: this.findMatchingServiceGroup(rel.servicegroupid, serviceGroups)?.servicegroupname || "",
                    tenantId: rel.tenantId,
                    tenantName: this.findMatchingTenant(rel.tenantId, tenants)?.tenantName ||  "",
                    allowUnlimitedRate: rel.allowUnlimitedRate,
                    rateLimit: rel.rateLimit,
                    rateLimitPeriodMinutes: rel.rateLimitPeriodMinutes
                }
                arrRetVal.push(relView)
            }
        );


        arrRetVal.sort(
            (a: TenantRateLimitRelView, b: TenantRateLimitRelView) => {
                if(a.tenantName === b.tenantName){
                    return a.servicegroupname.localeCompare(b.servicegroupname)
                }
                else{
                    return a.tenantName.localeCompare(b.tenantName);
                }                
            }
        );
        return arrRetVal;        
    }

    protected findMatchingTenant(tenantId: string, tenants: Array<Tenant>): Tenant | undefined {
        const tenant = tenants.find(
            (t: Tenant) => t.tenantId === tenantId
        );
        return tenant
    }

    protected findMatchingServiceGroup(serviceGroupId: string, serviceGroups: Array<RateLimitServiceGroup>): RateLimitServiceGroup | undefined {
        const group = serviceGroups.find(
            (g: RateLimitServiceGroup) => g.servicegroupid === serviceGroupId
        );
        return group;
    }

    public async createRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("rate_limit_service_group");
        await mapper.insert(rateLimitServiceGroup);
        return rateLimitServiceGroup;
    }

    public async updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("rate_limit_service_group");
        await mapper.update(rateLimitServiceGroup);
        return rateLimitServiceGroup;
    }

    public async deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void> {
        const rateLimitTenantRelMapper = await CassandraDriver.getInstance().getModelMapper("tenant_rate_limit_rel");
        const arr: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(null, serviceGroupId);
        for(let i = 0; i < arr.length; i++){
            rateLimitTenantRelMapper.remove({
                servicegroupid: arr[i].servicegroupid,
                tenantId: arr[i].tenantId
            });
        }

        const serviceGroupMapper = await CassandraDriver.getInstance().getModelMapper("rate_limit_service_group");
        await serviceGroupMapper.remove({
            servicegroupid: serviceGroupId
        });

        return;

    }

    public async getRateLimitTenantRel(tenantId: string | null, rateLimitServiceGroupId: string | null): Promise<Array<TenantRateLimitRel>> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_rate_limit_rel");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: any = {};
        if(tenantId){
            queryParams.tenantId = tenantId;
        }
        if(rateLimitServiceGroupId){
            queryParams.servicegroupid = rateLimitServiceGroupId
        }

        const results = (await mapper.find(queryParams)).toArray();
        return results;
    }

    public async assignRateLimitToTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null): Promise<TenantRateLimitRel> {

        const rel: TenantRateLimitRel = {
            tenantId: tenantId,
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            rateLimit: limit,
            rateLimitPeriodMinutes: rateLimitPeriodMinutes
        };
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_rate_limit_rel");
        await mapper.insert(rel);
        return rel;
    }

    public async updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null): Promise<TenantRateLimitRel> {
        const rel: TenantRateLimitRel = {
            tenantId: tenantId,
            servicegroupid: serviceGroupId,
            allowUnlimitedRate: allowUnlimited,
            rateLimit: limit,
            rateLimitPeriodMinutes: rateLimitPeriodMinutes
        };
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_rate_limit_rel");
        await mapper.update(rel);
        return rel;
    }

    public async removeRateLimitFromTenant(tenantId: string, serviceGroupId: string): Promise<void> {
        const mapper = await CassandraDriver.getInstance().getModelMapper("tenant_rate_limit_rel");
        await mapper.remove({
            tenantId: tenantId,
            servicegroupid: serviceGroupId
        });
        return;
    }

}

export default CassandraRateLimitDao;