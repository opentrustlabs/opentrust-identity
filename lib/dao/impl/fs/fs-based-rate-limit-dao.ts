import RateLimitDao from "../../rate-limit-dao";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { getFileContents } from "@/utils/dao-utils";
import { RATE_LIMIT_FILE, TENANT_RATE_LIMIT_REL_FILE } from "@/utils/consts";
import { RateLimit, TenantRateLimitRel } from "@/graphql/generated/graphql-types";
import { GraphQLError } from "graphql/error/GraphQLError";

const dataDir = process.env.FS_BASED_DATA_DIR ?? path.join(__dirname);

class FSBasedRateLimitDao extends RateLimitDao {

   
    public async getRateLimits(tenantId?: string): Promise<Array<RateLimit>> {

        let rateLimits: Array<RateLimit> = JSON.parse(getFileContents(`${dataDir}/${RATE_LIMIT_FILE}`, "[]"));
        if(tenantId){
            const tenantRateLimts: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId);
            rateLimits = rateLimits.filter(
                (r: RateLimit) => tenantRateLimts.find( (t: TenantRateLimitRel ) => t.rateLimitId === r.rateLimitId)
            )
        }
        return Promise.resolve(rateLimits);
    }

    public async createRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
        const rateLimits: Array<RateLimit> = await this.getRateLimits();
        rateLimits.push(rateLimit);
        writeFileSync(`${dataDir}/${RATE_LIMIT_FILE}`, JSON.stringify(rateLimits), {encoding: "utf-8"});
        return Promise.resolve(rateLimit);
    }

    public async getRateLimitById(rateLimitId: string): Promise<RateLimit | null> {
        const rateLimits: Array<RateLimit> = await this.getRateLimits();
        const rateLimit = rateLimits.find(
            (r: RateLimit) => r.rateLimitId === rateLimitId
        )
        return rateLimit === undefined ? Promise.resolve(null) : Promise.resolve(rateLimit);
    }

    public async updateRateLimit(rateLimit: RateLimit): Promise<RateLimit> {
        const rateLimits: Array<RateLimit> = await this.getRateLimits();
        const rateLimitToUpdate = rateLimits.find( (r: RateLimit) => r.rateLimitId === rateLimit.rateLimitId);
        if(!rateLimitToUpdate){
            throw new GraphQLError("ERROR_RATE_LIMIT_NOT_FOUND");
        }
        rateLimitToUpdate.rateLimitDescription = rateLimit.rateLimitDescription;
        rateLimitToUpdate.rateLimitDomain = rateLimit.rateLimitDomain;
        writeFileSync(`${dataDir}/${RATE_LIMIT_FILE}`, JSON.stringify(rateLimits), {encoding: "utf-8"});
        return Promise.resolve(rateLimit);
    }

    public async deleteRateLimit(rateLimitId: string): Promise<void> {
        // delete TenantRateLimitRel
        // delete RateLimit
        throw new Error("Method not implemented.");
    } 
    
        
    public async getRateLimitTenantRel(tenantId: string): Promise<Array<TenantRateLimitRel>> {
        let tenantRateLimitRels = JSON.parse(getFileContents(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, "[]"));
        tenantRateLimitRels = tenantRateLimitRels.filter(
            (t: TenantRateLimitRel) => t.tenantId === tenantId
        )
        return Promise.resolve(tenantRateLimitRels);
    }

    
    public async assignRateLimitToTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        
        let existingRels: Array<TenantRateLimitRel> = await this.getRateLimitTenantRel(tenantId);
        const existingRateLimitRel = existingRels.find(
            (r: TenantRateLimitRel) => r.rateLimitId === rateLimitId
        )
        if(existingRateLimitRel){
            throw new GraphQLError("ERROR_TENENT_IS_ALREADY_ASSIGNED_RATE_LIMIT");
        }
        const a: Array<TenantRateLimitRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, "[]"));
        const rel: TenantRateLimitRel = {
            tenantId: tenantId,
            rateLimitId: rateLimitId,
            rateLimit: limit < 0 ? 15 : limit > 1000000 ? 15 : limit,
            rateLimitPeriodMinutes: rateLimitPeriodMinutes,
            allowUnlimitedRate: allowUnlimited
        };
        a.push(rel);
        writeFileSync(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, JSON.stringify(a), {encoding: "utf-8"});
        return Promise.resolve(rel);        
    }

    public async updateRateLimitForTenant(tenantId: string, rateLimitId: string, allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number): Promise<TenantRateLimitRel> {
        const tenantRateLimitRels: Array<TenantRateLimitRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, "[]"))
        const existingRel: TenantRateLimitRel | undefined = tenantRateLimitRels.find(
            (r: TenantRateLimitRel) => r.rateLimitId === rateLimitId && r.tenantId === tenantId
        );
        if(!existingRel){
            throw new GraphQLError("ERROR_CANNOT_FIND_EXISTING_TENANT_RATE_LIMIT_REL_TO_UPDATE");
        }
        existingRel.allowUnlimitedRate = allowUnlimited;
        existingRel.rateLimit = limit;
        existingRel.rateLimitPeriodMinutes = rateLimitPeriodMinutes;
        writeFileSync(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, JSON.stringify(tenantRateLimitRels), {encoding: "utf-8"});
        return Promise.resolve(existingRel);
    }

    public async removeRateLimitFromTenant(tenantId: string, rateLimitId: string): Promise<void> {
        let tenantRateLimitRels: Array<TenantRateLimitRel> = JSON.parse(getFileContents(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, "[]"));
        const existingRel: TenantRateLimitRel | undefined = tenantRateLimitRels.find(
            (r: TenantRateLimitRel) => r.rateLimitId === rateLimitId && r.tenantId === tenantId
        );
        if(existingRel){
            tenantRateLimitRels = tenantRateLimitRels.filter(
                (rel: TenantRateLimitRel) => !(rel.rateLimitId === rateLimitId && rel.tenantId === tenantId)
            )
            writeFileSync(`${dataDir}/${TENANT_RATE_LIMIT_REL_FILE}`, JSON.stringify(tenantRateLimitRels), {encoding: "utf-8"});
        }
    }

}

export default FSBasedRateLimitDao;