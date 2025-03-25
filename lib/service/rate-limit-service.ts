import { OIDCContext } from "@/graphql/graphql-context";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import RateLimitDao from "../dao/rate-limit-dao";
import { RateLimitServiceGroup, Tenant, TenantRateLimitRel } from "@/graphql/generated/graphql-types";
import TenantDao from "../dao/tenant-dao";
import { DaoImpl } from "../data-sources/dao-impl";
import { DEFAULT_RATE_LIMIT_PERIOD_MINUTES, MAX_RATE_LIMIT_PERIOD_MINUTES, MIN_RATE_LIMIT_PERIOD_MINUTES } from "@/utils/consts";



const rateLimitDao: RateLimitDao = DaoImpl.getInstance().getRateLimitDao();
const tenantDao: TenantDao = DaoImpl.getInstance().getTenantDao();

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
        return rateLimitDao.createRateLimitServiceGroup(rateLimitServiceGroup);        
    }

    public async updateRateLimitServiceGroup(rateLimitServiceGroup: RateLimitServiceGroup): Promise<RateLimitServiceGroup> {
        return rateLimitDao.updateRateLimitServiceGroup(rateLimitServiceGroup);
    }

    public async deleteRateLimitServiceGroup(serviceGroupId: string): Promise<void>{
        return rateLimitDao.deleteRateLimitServiceGroup(serviceGroupId);
    }
        
    public async getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>> {
        return rateLimitDao.getRateLimitTenantRel(tenantId);        
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
        let existingRels: Array<TenantRateLimitRel> = await rateLimitDao.getRateLimitTenantRel(tenantId);
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

        const rateLimit = limit < 0 ? 15 : limit > 1000000 ? 15 : limit;
        const minutes = rateLimitPeriodMinutes > MAX_RATE_LIMIT_PERIOD_MINUTES ? 
                            DEFAULT_RATE_LIMIT_PERIOD_MINUTES : 
                                rateLimitPeriodMinutes < MIN_RATE_LIMIT_PERIOD_MINUTES ? 
                                DEFAULT_RATE_LIMIT_PERIOD_MINUTES : 
                                rateLimitPeriodMinutes;

        return rateLimitDao.assignRateLimitToTenant(tenantId, serviceGroupId, allowUnlimited, rateLimit, minutes);        
    }

    public async updateRateLimitForTenant(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
                
        const existingRels: Array<TenantRateLimitRel> = await rateLimitDao.getRateLimitTenantRel(tenantId); 
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
        existingRel.rateLimit = limit < 0 ? 15 : limit > 1000000 ? 15 : limit;
        existingRel.rateLimitPeriodMinutes = rateLimitPeriodMinutes > MAX_RATE_LIMIT_PERIOD_MINUTES ? 
                                                DEFAULT_RATE_LIMIT_PERIOD_MINUTES : 
                                                    rateLimitPeriodMinutes < MIN_RATE_LIMIT_PERIOD_MINUTES ? 
                                                    DEFAULT_RATE_LIMIT_PERIOD_MINUTES : 
                                                    rateLimitPeriodMinutes;
        
        rateLimitDao.updateRateLimitForTenant(tenantId, serviceGroupId, allowUnlimited, existingRel.rateLimit, existingRel.rateLimitPeriodMinutes);

        return Promise.resolve(existingRel);
    }

    public async removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<void> {
        return rateLimitDao.removeRateLimitFromTenant(tenantId, rateLimitId);
    }

    protected checkTotalLimitNotExceeded(tenant: Tenant, limit: number, allowUnlimited: boolean, rateLimitPeriodMinutes: number, existingRels: Array<TenantRateLimitRel>): boolean {
        
        if(allowUnlimited === true){
            return true;
        }
        if(tenant.allowUnlimitedRate === true){
            return true;
        }
        if(!tenant.defaultRateLimit){
            return true;
        }
        if(tenant.defaultRateLimit){
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