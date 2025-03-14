import { OIDCContext } from "@/graphql/graphql-context";
import { GraphQLError } from "graphql/error/GraphQLError";
import { randomUUID } from 'crypto'; 
import RateLimitDao from "../dao/rate-limit-dao";
import { RateLimit, TenantRateLimitRel } from "@/graphql/generated/graphql-types";
import TenantDao from "../dao/tenant-dao";
import { DaoImpl } from "../data-sources/dao-impl";

const rateLimitDao: RateLimitDao = DaoImpl.getInstance().getRateLimitDao();
const tenantDao: TenantDao = DaoImpl.getInstance().getTenantDao();

class RateLimitService {

    oidcContext: OIDCContext;

    constructor(oidcContext: OIDCContext){
        this.oidcContext = oidcContext;
    }

    // RATE LIMIT METHODS
    // public async getRateLimits(tenantId?: string): Promise<Array<RateLimit>> {
    //     return rateLimitDao.getRateLimits(tenantId);        
    // }

    // public async createRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
    //     const rateLimits: Array<RateLimit> = await this.getRateLimits();
    //     rateLimit.rateLimitId = randomUUID().toString();
    //     return rateLimitDao.createRateLimit(rateLimit);
    // }

    // public async getRateLimitById(rateLimitId: string): Promise<RateLimit | null> {
    //     return rateLimitDao.getRateLimitById(rateLimitId);
    // }

    // public async updateRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
    //     const rateLimitToUpdate: RateLimit | null = await this.getRateLimitById(rateLimit.rateLimitId);
    //     if(!rateLimitToUpdate){
    //         throw new GraphQLError("ERROR_RATE_LIMIT_NOT_FOUND");
    //     }
    //     rateLimitToUpdate.rateLimitDescription = rateLimit.rateLimitDescription;
    //     rateLimitToUpdate.rateLimitDomain = rateLimit.rateLimitDomain;
    //     await rateLimitDao.updateRateLimit(rateLimitToUpdate);
    //     return Promise.resolve(rateLimitToUpdate);
    // }

    // public async deleteRateLimit(rateLimitId: string): Promise<void> {
    //     // delete TenantRateLimitRel
    //     // delete RateLimit
    //     throw new Error("Method not implemented.");
    // } 
    
        
    // public async getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>> {
    //     return rateLimitDao.getRateLimitTenantRel(tenantId);        
    // }

    
    // public async assignRateLimitToTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
    //     const tenant = await tenantDao.getTenantById(tenantId);
    //     if(!tenant){
    //         throw new GraphQLError("ERROR_CANNOT_FIND_TENANT_TO_ASSIGN_RATE_LIMIT");
    //     }
    //     const rateLimit = await this.getRateLimitById(rateLimitId);
    //     if(!rateLimit){
    //         throw new GraphQLError("ERROR_CANNOT_FIND_RATE_LIMIT_TO_ASSIGN_TO_TENANT");
    //     }
    //     let existingRels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId);
    //     const existingRateLimitRel = existingRels.find(
    //         (r: TenantRateLimitRel) => r.rateLimitId === rateLimit.rateLimitId
    //     )
    //     if(existingRateLimitRel){
    //         throw new GraphQLError("ERROR_TENENT_IS_ALREADY_ASSIGNED_RATE_LIMIT");
    //     }
        
    //     return rateLimitDao.assignRateLimitToTenant(tenantId, rateLimitId, allowUnlimited, limit, rateLimitPeriodMinutes);        
    // }

    // public async updateRateLimitForTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
                
    //     const tenantRateLimitRels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId); 
    //     const existingRel: TenantRateLimitRel | undefined = tenantRateLimitRels.find(
    //         (r: TenantRateLimitRel) => r.rateLimitId === rateLimitId && r.tenantId === tenantId
    //     );
    //     if(!existingRel){
    //         throw new GraphQLError("ERROR_CANNOT_FIND_EXISTING_TENANT_RATE_LIMIT_REL_TO_UPDATE");
    //     }
    //     existingRel.allowUnlimitedRate = allowUnlimited;
    //     existingRel.rateLimit = limit < 0 ? 15 : limit > 1000000 ? 15 : limit;
    //     existingRel.rateLimitPeriodMinutes = rateLimitPeriodMinutes > 480 ? 480 : rateLimitPeriodMinutes < 5 ? 480 : rateLimitPeriodMinutes;
        
    //     rateLimitDao.updateRateLimitForTenant(tenantId, rateLimitId, allowUnlimited, existingRel.rateLimit, existingRel.rateLimitPeriodMinutes);

    //     return Promise.resolve(existingRel);
    // }

    // public async removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<void> {
    //     return rateLimitDao.removeRateLimitFromTenant(tenantId, rateLimitId);
    // }

    
}

export default RateLimitService;