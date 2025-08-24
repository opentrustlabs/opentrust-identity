import { OIDCContext } from "@/graphql/graphql-context";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import RateLimitDao from "../dao/rate-limit-dao";
import { ObjectSearchResultItem, RateLimitServiceGroup, RelSearchResultItem, SearchResultType, Tenant, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import TenantDao from "../dao/tenant-dao";
import { DaoFactory } from "../data-sources/dao-factory";
import { CHANGE_EVENT_CLASS_RATE_LIMIT, CHANGE_EVENT_CLASS_TENANT_RATE_LIMIT_REL, CHANGE_EVENT_TYPE_CREATE, CHANGE_EVENT_TYPE_CREATE_REL, CHANGE_EVENT_TYPE_REMOVE_REL, CHANGE_EVENT_TYPE_UPDATE, CHANGE_EVENT_TYPE_UPDATE_REL, DEFAULT_RATE_LIMIT_PERIOD_MINUTES, RATE_LIMIT_CREATE_SCOPE, RATE_LIMIT_READ_SCOPE, RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE, RATE_LIMIT_UPDATE_SCOPE, SEARCH_INDEX_OBJECT_SEARCH, SEARCH_INDEX_REL_SEARCH, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { getOpenSearchClient } from "../data-sources/search";
import { authorizeByScopeAndTenant, ServiceAuthorizationWrapper } from "@/utils/authz-utils";
import { ERROR_CODES } from "../models/error";
import ChangeEventDao from "../dao/change-event-dao";


const rateLimitDao: RateLimitDao = DaoFactory.getInstance().getRateLimitDao();
const tenantDao: TenantDao = DaoFactory.getInstance().getTenantDao();
const searchClient = getOpenSearchClient();
const changeEventDao: ChangeEventDao = DaoFactory.getInstance().getChangeEventDao();

class RateLimitService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    public async getRateLimitServiceGroups(tenantId: string | null): Promise<Array<RateLimitServiceGroup>> {
        const getData = ServiceAuthorizationWrapper(
            {
                async preProcess(oidcContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [oidcContext.portalUserProfile?.managementAccessTenantId || ""];
                    }
                    return args;
                },
                async performOperation(_, ...args): Promise<Array<RateLimitServiceGroup> | null> {
                    const arr: Array<RateLimitServiceGroup> = await rateLimitDao.getRateLimitServiceGroups(args[0]);
                    return arr;                    
                }
            }
        );

        const serviceGroups = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE], tenantId);
        return serviceGroups || [];
    }

    public async getRateLimitServiceGroupById(serviceGroupId: string): Promise<RateLimitServiceGroup | null> {
        const getData = ServiceAuthorizationWrapper(
            {
                async performOperation(): Promise<RateLimitServiceGroup | null> {
                    const result: RateLimitServiceGroup | null = await rateLimitDao.getRateLimitServiceGroupById(serviceGroupId)
                    return result;
                },
                async additionalConstraintCheck(oidcContext, result: RateLimitServiceGroup | null) {
                    if(result){
                        const rels = await rateLimitDao.getRateLimitTenantRel(oidcContext.portalUserProfile?.managementAccessTenantId || "", null);
                        if(!rels || rels.length === 0){
                            return {isAuthorized: false, errorDetail: ERROR_CODES.EC00041};
                        }
                        return {isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR};
                    }
                    return {isAuthorized: true, errorDetail: ERROR_CODES.NULL_ERROR}
                },
            }
        );
        const serviceGroup = getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE]);
        return serviceGroup;
    }

    public async createRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, RATE_LIMIT_CREATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        rateLimitServiceGroup.servicegroupid = randomUUID().toString();
        await rateLimitDao.createRateLimitServiceGroup(rateLimitServiceGroup)
        await this.updateSearchIndex(rateLimitServiceGroup);

        changeEventDao.addChangeEvent({
            objectId: rateLimitServiceGroup.servicegroupid,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_RATE_LIMIT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...rateLimitServiceGroup})
        });

        return Promise.resolve(rateLimitServiceGroup);
    }

    public async updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {

        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, RATE_LIMIT_UPDATE_SCOPE, null);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        const existing: RateLimitServiceGroup | null = await rateLimitDao.getRateLimitServiceGroupById(rateLimitServiceGroup.servicegroupid);
        if(!existing){
            throw new GraphQLError(ERROR_CODES.EC00042.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00042}});
        }
        await rateLimitDao.updateRateLimitServiceGroup(rateLimitServiceGroup);
        await this.updateSearchIndex(rateLimitServiceGroup);
        
        changeEventDao.addChangeEvent({
            objectId: rateLimitServiceGroup.servicegroupid,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_RATE_LIMIT,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE,
            changeTimestamp: Date.now(),
            data: JSON.stringify({...rateLimitServiceGroup})
        });

        if(rateLimitServiceGroup.servicegroupname !== existing.servicegroupname || rateLimitServiceGroup.servicegroupdescription !== existing.servicegroupdescription){
            this.bulkUpdateRelSearchIndex(rateLimitServiceGroup);
        }
        
        return Promise.resolve(rateLimitServiceGroup);
    }

    
    public async getRateLimitTenantRel(tenantId: string | null, rateLimitServiceGroupId: string | null): Promise<Array<TenantRateLimitRel>> {
        const getData = ServiceAuthorizationWrapper(
            {
                async preProcess(oidcContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [oidcContext.portalUserProfile?.managementAccessTenantId || "", args[1]];
                    }
                    return args;
                },
                async performOperation(_, ...args): Promise<Array<TenantRateLimitRel> | null> {
                    const arr: Array<TenantRateLimitRel> = await rateLimitDao.getRateLimitTenantRel(args[0], args[1]);
                    return arr;                    
                }
            }
        );

        const rels = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE], tenantId, rateLimitServiceGroupId);
        return rels || [];
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
        
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, RATE_LIMIT_TENANT_ASSIGN_SCOPE, tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        
        const tenant = await tenantDao.getTenantById(tenantId);

        if(!tenant){
            throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
        }
        const rateLimitServiceGroup: RateLimitServiceGroup | null = await this.getRateLimitServiceGroupById(serviceGroupId);
        if(!rateLimitServiceGroup){
            throw new GraphQLError(ERROR_CODES.EC00042.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00042}});
        }
        
        const existingRels: Array<TenantRateLimitRel> = await rateLimitDao.getRateLimitTenantRel(tenantId, null);
        const existingRateLimitRel = existingRels.find(
            (r: TenantRateLimitRel) => r.servicegroupid === rateLimitServiceGroup.servicegroupid
        )
        if(existingRateLimitRel){
            throw new GraphQLError(ERROR_CODES.EC00043.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00043}});
        }
        if(!allowUnlimited){
            const totalLimitValid: boolean = this.checkTotalLimitNotExceeded(tenant, limit, allowUnlimited, rateLimitPeriodMinutes, existingRels);
            if(!totalLimitValid){
                throw new GraphQLError(ERROR_CODES.EC00044.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00044}});
            }
        }

        const rateLimit = allowUnlimited ? null : limit < 0 ? 15 : limit > 1000000 ? 15 : limit;
        const minutes = allowUnlimited ? null : DEFAULT_RATE_LIMIT_PERIOD_MINUTES; //rateLimitPeriodMinutes > MAX_RATE_LIMIT_PERIOD_MINUTES ? DEFAULT_RATE_LIMIT_PERIOD_MINUTES : rateLimitPeriodMinutes < MIN_RATE_LIMIT_PERIOD_MINUTES ? DEFAULT_RATE_LIMIT_PERIOD_MINUTES : rateLimitPeriodMinutes;

        const r: TenantRateLimitRel = await rateLimitDao.assignRateLimitToTenant(tenantId, serviceGroupId, allowUnlimited, rateLimit, minutes);        
        await this.addTenantRateLimtRelToRelSearchIndex(tenant, rateLimitServiceGroup);
        changeEventDao.addChangeEvent({
            objectId: rateLimitServiceGroup.servicegroupid,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_RATE_LIMIT_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_CREATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, serviceGroupId, allowUnlimited, rateLimit, minutes})
        });
        return r;
    }

    public async updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null): Promise<TenantRateLimitRel> {
        
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, RATE_LIMIT_TENANT_UPDATE_SCOPE, tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }
        const existingRels: Array<TenantRateLimitRel> = await rateLimitDao.getRateLimitTenantRel(tenantId, null); 
        const existingRel: TenantRateLimitRel | undefined = existingRels.find(
            (r: TenantRateLimitRel) => r.servicegroupid === serviceGroupId && r.tenantId === tenantId
        );
        if(!existingRel){
            throw new GraphQLError(ERROR_CODES.EC00045.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00045}});
        }
        if(!allowUnlimited){
            const tenant = await tenantDao.getTenantById(tenantId);
            if(!tenant){
                throw new GraphQLError(ERROR_CODES.EC00008.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00008}});
            }
            const totalLimitValid: boolean = this.checkTotalLimitNotExceeded(tenant, limit, allowUnlimited, rateLimitPeriodMinutes, existingRels);
            if(!totalLimitValid){
                throw new GraphQLError(ERROR_CODES.EC00044.errorCode, {extensions: {errorDetail: ERROR_CODES.EC00044}});
            }
        }
        existingRel.allowUnlimitedRate = allowUnlimited;
        existingRel.rateLimit = allowUnlimited ? null : limit && limit < 0 ? 15 : limit && limit > 1000000 ? 15 : limit;
        existingRel.rateLimitPeriodMinutes = allowUnlimited ? null : DEFAULT_RATE_LIMIT_PERIOD_MINUTES;   
        
        rateLimitDao.updateRateLimitForTenant(tenantId, serviceGroupId, allowUnlimited, existingRel.rateLimit, existingRel.rateLimitPeriodMinutes);
        changeEventDao.addChangeEvent({
            objectId: serviceGroupId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_RATE_LIMIT_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_UPDATE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, serviceGroupId, allowUnlimited, rateLimit: limit, minutes: rateLimitPeriodMinutes})
        });

        return Promise.resolve(existingRel);
    }

    public async getRateLimitTenantRelViews(rateLimitServiceGroupId: string | null, tenantId: string | null): Promise<Array<TenantRateLimitRelView>>{
        const getData = ServiceAuthorizationWrapper(
            {
                async preProcess(oidcContext, ...args) {
                    if (oidcContext.portalUserProfile?.managementAccessTenantId !== oidcContext.rootTenant.tenantId) {
                        return [args[0], oidcContext.portalUserProfile?.managementAccessTenantId || ""];
                    }
                    return args;
                },
                async performOperation(_, ...args): Promise<Array<TenantRateLimitRelView> | null> {
                    const arr: Array<TenantRateLimitRelView> = await rateLimitDao.getRateLimitTenantRelViews(args[0], args[1]);
                    return arr;                    
                }
            }
        );

        const rels = await getData(this.oidcContext, [TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE], rateLimitServiceGroupId, tenantId);
        return rels || [];
    }

    protected async addTenantRateLimtRelToRelSearchIndex(tenant: Tenant, rateLimitServiceGroup: RateLimitServiceGroup): Promise<void> {

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

    protected async bulkUpdateRelSearchIndex(rateLimitServiceGroup: RateLimitServiceGroup): Promise<void>{
        searchClient.updateByQuery({
            index: SEARCH_INDEX_REL_SEARCH,
            body: {
                query: {
                    term: {
                        childid: rateLimitServiceGroup.servicegroupid
                    }
                },
                script: {
                    source: "ctx._source.childname = params.childname; ctx._source.childdescription = params.childdescription",
                    lang: "painless",
                    params: {
                        childname: rateLimitServiceGroup.servicegroupname,
                        childdescription: rateLimitServiceGroup.servicegroupdescription
                    }
                }
            },
            conflicts: "proceed",
            requests_per_second: 25
        });
    }

    public async removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<void> {
        const {isAuthorized, errorDetail} = authorizeByScopeAndTenant(this.oidcContext, RATE_LIMIT_TENANT_REMOVE_SCOPE, tenantId);
        if(!isAuthorized){
            throw new GraphQLError(errorDetail.errorCode, {extensions: {errorDetail}});
        }

        await rateLimitDao.removeRateLimitFromTenant(tenantId, rateLimitId);
        await searchClient.delete({
            id: `${tenantId}::${rateLimitId}`,
            index: SEARCH_INDEX_REL_SEARCH,
            refresh: "wait_for"
        });
        changeEventDao.addChangeEvent({
            objectId: rateLimitId,
            changedBy: `${this.oidcContext.portalUserProfile?.firstName} ${this.oidcContext.portalUserProfile?.lastName}`,
            changeEventClass: CHANGE_EVENT_CLASS_TENANT_RATE_LIMIT_REL,
            changeEventId: randomUUID().toString(),
            changeEventType: CHANGE_EVENT_TYPE_REMOVE_REL,
            changeTimestamp: Date.now(),
            data: JSON.stringify({tenantId, serviceGroupId: rateLimitId})
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