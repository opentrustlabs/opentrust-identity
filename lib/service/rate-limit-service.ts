import { OIDCContext } from "@/graphql/graphql-context";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import RateLimitDao from "../dao/rate-limit-dao";
import { ObjectSearchResultItem, RateLimitServiceGroup, RelSearchResultItem, SearchResultType, Tenant, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import TenantDao from "../dao/tenant-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { DEFAULT_RATE_LIMIT_PERIOD_MINUTES, MAX_RATE_LIMIT_PERIOD_MINUTES, MIN_RATE_LIMIT_PERIOD_MINUTES, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH } from "@/utils/consts";
import { getOpenSearchClient } from "../data-sources/search";


const rateLimitDao: RateLimitDao = DaoFactory.getInstance().getRateLimitDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient = getOpenSearchClient();

class RateLimitService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>> {
        return rateLimitDao.getRateLimitServiceGroups(tenantId);
    }

    public async getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null> {
        return rateLimitDao.getRateLimitServiceGroupById(serviceGroupId);
    }

    public async createRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        rateLimitServiceGroup.servicegroupid = randomUUID().toString();
        await rateLimitDao.createRateLimitServiceGroup(rateLimitServiceGroup)
        await this.updateSearchIndex(rateLimitServiceGroup);
        return Promise.resolve(rateLimitServiceGroup);
    }

    public async updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const existing: RateLimitServiceGroup | null = await rateLimitDao.getRateLimitServiceGroupById(rateLimitServiceGroup.servicegroupid);
        if(!existing){
            throw new GraphQLError("ERROR_RATE_LIMIT_SERVICE_GROUP_DOES_NOT_EXIST");
        }
        await rateLimitDao.updateRateLimitServiceGroup(rateLimitServiceGroup);
        await this.updateSearchIndex(rateLimitServiceGroup);
        // TODO
        // Update the rel index if the name or description of the group has changed.
        return Promise.resolve(rateLimitServiceGroup);
    }

    public async deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void>{
        return rateLimitDao.deleteRateLimitServiceGroup(serviceGroupId);
    }
        
    public async getRateLimitTenantRel(tenantId: string | null, rateLimitServiceGroupId: string | null): Promise<Array<TenantRateLimitRel>> {
        const rels: Array<TenantRateLimitRel> = await rateLimitDao.getRateLimitTenantRel(tenantId, rateLimitServiceGroupId);        
        return rels;        
    }
    

    protected async updateSearchIndex(rateLimitServiceGroup: RateLimitServiceGroup): Promise<void> {
        
        const document: ObjectSearchResultItem = {
            name: rateLimitServiceGroup.servicegroupname,
            description: rateLimitServiceGroup.servicegroupdescription,
            objectid: rateLimitServiceGroup.servicegroupid,
            objecttype: SearchResultType.RateLimit,
            owningtenantid: "",
            email: "",
            enabled: true,
            owningclientid: "",
            subtype: "",
            subtypekey: ""
        }
        
        await searchClient.index({
            id: rateLimitServiceGroup.servicegroupid,
            index: SEARCH_INDEX_OBJECT_SEARCH,
            body: document
        });        
    }

    
    public async assignRateLimitToTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const tenant = await tenantDao.getTenantById(tenantId);

        if(!tenant){
            throw new GraphQLError("ERROR_CANNOT_FIND_TENANT_TO_ASSIGN_RATE_LIMIT");
        }
        const rateLimitServiceGroup: RateLimitServiceGroup | null = await this.getRateLimitServiceGroupById(serviceGroupId);
        if(!rateLimitServiceGroup){
            throw new GraphQLError("ERROR_CANNOT_FIND_RATE_LIMIT_TO_ASSIGN_TO_TENANT");
        }
        
        let existingRels: Array<TenantRateLimitRel> = await rateLimitDao.getRateLimitTenantRel(tenantId, null);
        const existingRateLimitRel = existingRels.find(
            (r: TenantRateLimitRel) => r.servicegroupid === rateLimitServiceGroup.servicegroupid
        )
        if(existingRateLimitRel){
            throw new GraphQLError("ERROR_TENENT_IS_ALREADY_ASSIGNED_RATE_LIMIT");
        }
        if(!allowUnlimited){
            const totalLimitValid: boolean = this.checkTotalLimitNotExceeded(tenant, limit, allowUnlimited, rateLimitPeriodMinutes, existingRels);
            if(!totalLimitValid){
                throw new GraphQLError("ERROR_TOTAL_RATE_LIMIT_EXCEEDED");
            }
        }

        const rateLimit = allowUnlimited ? null : limit < 0 ? 15 : limit > 1000000 ? 15 : limit;
        const minutes = allowUnlimited ? null : DEFAULT_RATE_LIMIT_PERIOD_MINUTES; //rateLimitPeriodMinutes > MAX_RATE_LIMIT_PERIOD_MINUTES ? DEFAULT_RATE_LIMIT_PERIOD_MINUTES : rateLimitPeriodMinutes < MIN_RATE_LIMIT_PERIOD_MINUTES ? DEFAULT_RATE_LIMIT_PERIOD_MINUTES : rateLimitPeriodMinutes;

        const r: TenantRateLimitRel = await rateLimitDao.assignRateLimitToTenant(tenantId, serviceGroupId, allowUnlimited, rateLimit, minutes);        
        await this.updateRelSearchIndex(tenant, rateLimitServiceGroup);
        return r;
    }

    public async updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null): Promise<TenantRateLimitRel> {
                
        const existingRels: Array<TenantRateLimitRel> = await rateLimitDao.getRateLimitTenantRel(tenantId, null); 
        const existingRel: TenantRateLimitRel | undefined = existingRels.find(
            (r: TenantRateLimitRel) => r.servicegroupid === serviceGroupId && r.tenantId === tenantId
        );
        if(!existingRel){
            throw new GraphQLError("ERROR_CANNOT_FIND_EXISTING_TENANT_RATE_LIMIT_REL_TO_UPDATE");
        }
        if(!allowUnlimited){
            const tenant = await tenantDao.getTenantById(tenantId);
            if(!tenant){
                throw new GraphQLError("ERROR_TENANT_NOT_FOUND");
            }
            const totalLimitValid: boolean = this.checkTotalLimitNotExceeded(tenant, limit, allowUnlimited, rateLimitPeriodMinutes, existingRels);
            if(!totalLimitValid){
                throw new GraphQLError("ERROR_TOTAL_RATE_LIMIT_EXCEEDED");
            }
        }
        existingRel.allowUnlimitedRate = allowUnlimited;
        existingRel.rateLimit = allowUnlimited ? null : limit && limit < 0 ? 15 : limit && limit > 1000000 ? 15 : limit;
        existingRel.rateLimitPeriodMinutes = allowUnlimited ? null : DEFAULT_RATE_LIMIT_PERIOD_MINUTES;    // rateLimitPeriodMinutes > MAX_RATE_LIMIT_PERIOD_MINUTES ? DEFAULT_RATE_LIMIT_PERIOD_MINUTES : rateLimitPeriodMinutes < MIN_RATE_LIMIT_PERIOD_MINUTES ? DEFAULT_RATE_LIMIT_PERIOD_MINUTES : rateLimitPeriodMinutes;
        
        rateLimitDao.updateRateLimitForTenant(tenantId, serviceGroupId, allowUnlimited, existingRel.rateLimit, existingRel.rateLimitPeriodMinutes);

        return Promise.resolve(existingRel);
    }

    public async getRateLimitTenantRelViews(rateLimitServiceGroupId: string): Promise<Array<TenantRateLimitRelView>>{
        const rels = await rateLimitDao.getRateLimitTenantRelViews(rateLimitServiceGroupId);
        return rels;
    }

    protected async updateRelSearchIndex(tenant: Tenant, rateLimitServiceGroup: RateLimitServiceGroup): Promise<void> {

        const document: RelSearchResultItem = {
            childid: rateLimitServiceGroup.servicegroupid,
            childname: rateLimitServiceGroup.servicegroupname,
            childtype: SearchResultType.RateLimit,
            owningtenantid: tenant.tenantId,
            parentid: tenant.tenantId,
            parenttype: SearchResultType.Tenant,
            childdescription: rateLimitServiceGroup.servicegroupdescription
        }
        await searchClient.index({
            id: `${tenant.tenantId}::${rateLimitServiceGroup.servicegroupid}`,
            index: SEARCH_INDEX_REL_SEARCH,
            body: document,
            refresh: "wait_for"
        });
    }


    public async removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<void> {
        await rateLimitDao.removeRateLimitFromTenant(tenantId, rateLimitId);
        await searchClient.delete({
            id: `${tenantId}::${rateLimitId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            refresh: "wait_for"
        });

        return Promise.resolve();
    }

    protected checkTotalLimitNotExceeded(tenant: Tenant, limit: number | null, allowUnlimited: boolean, rateLimitPeriodMinutes: number | null, existingRels: Array<TenantRateLimitRel>): boolean {
        
        if(allowUnlimited === true){
            return true;
        }
        if(tenant.allowUnlimitedRate === true){
            return true;
        }
        if(!allowUnlimited && !tenant.defaultRateLimit){
            return false;
        }
        if(tenant.defaultRateLimit){
            if(!limit){
                return false;
            }

            if(rateLimitPeriodMinutes !== tenant.defaultRateLimitPeriodMinutes){
                return false;
            }
            
            let existingTotal = 0;
            for(let i = 0; i < existingRels.length; i++){
                const rel: TenantRateLimitRel = existingRels[i];
                if(!rel.allowUnlimitedRate){
                    existingTotal += rel.rateLimit || 0;
                }
            }

            if(tenant.defaultRateLimit < (limit + existingTotal)){
                return false;
            }

            return true;
        }
        return true;
    }

    
}

export default RateLimitService;