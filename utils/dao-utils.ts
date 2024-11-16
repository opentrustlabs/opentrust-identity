import ClientDao from "@/lib/dao/client-dao";
import FSBasedClientDao from "@/lib/dao/impl/fs/fs-based-client-dao";
import FSBasedTenantDao from "@/lib/dao/impl/fs/fs-based-tenant-dao";
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