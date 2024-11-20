import ClientDao from "@/lib/dao/client-dao";
import FSBasedClientDao from "@/lib/dao/impl/fs/fs-based-client-dao";
import FSBasedSigningKeysDao from "@/lib/dao/impl/fs/fs-based-keys-dao";
import FSBasedRateLimitDao from "@/lib/dao/impl/fs/fs-based-rate-limit-dao";
import FSBasedScopeDao from "@/lib/dao/impl/fs/fs-based-scope-dao";
import FSBasedTenantDao from "@/lib/dao/impl/fs/fs-based-tenant-dao";
import SigningKeysDao from "@/lib/dao/keys-dao";
import RateLimitDao from "@/lib/dao/rate-limit-dao";
import ScopeDao from "@/lib/dao/scope-dao";
import TenantDao from "@/lib/dao/tenant-dao";
import { readFileSync, writeFileSync, existsSync } from "node:fs";


export function getFileContents(fileName: string, defaultContents?: string): any {
    let fileContents; 

    if(!existsSync(fileName)){
        writeFileSync(fileName, defaultContents ?? "", {encoding: "utf-8"});
        fileContents = defaultContents ?? "";
    }
    else{
        fileContents = readFileSync(fileName, {encoding: "utf-8"});
    }
    return fileContents;
}

export function getTenantDaoImpl(): TenantDao {
    // DAO_STRATEGY is one of filesystem | postgresql | mysql | oracle | mssql | cassandra | mongodb
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";

    if(daoStrategy === "filesystem"){
        return new FSBasedTenantDao();
    }
    else return new FSBasedTenantDao();
}

export function getClientDaoImpl(): ClientDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";

    if(daoStrategy === "filesystem"){
        return new FSBasedClientDao();
    }
    return new FSBasedClientDao();
}

export function getSigningKeysDaoImpl(): SigningKeysDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedSigningKeysDao();
    }
    return new FSBasedSigningKeysDao();
}

export function getRateLimitDaoImpl(): RateLimitDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedRateLimitDao();
    }
    return new FSBasedRateLimitDao();
}

export function getScopeDaoImpl(): ScopeDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedScopeDao();
    }
    return new FSBasedScopeDao();
}