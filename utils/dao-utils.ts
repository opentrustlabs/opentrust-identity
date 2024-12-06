import ClientDao from "@/lib/dao/client-dao";
import GroupDao from "@/lib/dao/group-dao";
import FSBasedClientDao from "@/lib/dao/impl/fs/fs-based-client-dao";
import FSBasedGroupDao from "@/lib/dao/impl/fs/fs-based-group-dao";
import FSBasedSigningKeysDao from "@/lib/dao/impl/fs/fs-based-keys-dao";
import FSBasedRateLimitDao from "@/lib/dao/impl/fs/fs-based-rate-limit-dao";
import FSBasedScopeDao from "@/lib/dao/impl/fs/fs-based-scope-dao";
import FSBasedTenantDao from "@/lib/dao/impl/fs/fs-based-tenant-dao";
import SigningKeysDao from "@/lib/dao/keys-dao";
import RateLimitDao from "@/lib/dao/rate-limit-dao";
import ScopeDao from "@/lib/dao/scope-dao";
import TenantDao from "@/lib/dao/tenant-dao";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes, hash } from "node:crypto";
import AuthenticationGroupDao from "@/lib/dao/authentication-group-dao";
import FSBasedAuthenticationGroupDao from "@/lib/dao/impl/fs/fs-based-authentication-group-dao";
import ExternalOIDCProviderDao from "@/lib/dao/external-oidc-provider-dao";
import FSBasedExternalOIDCProviderDao from "@/lib/dao/impl/fs/fs-based-external-oidc-provider-dao";
import AuthDao from "@/lib/dao/auth-dao";
import FSBasedAuthDao from "@/lib/dao/impl/fs/fs-based-auth-dao";


/**
 * 
 * @param fileName 
 * @param defaultContents 
 * @returns 
 */
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

export type TokenEncodingType = "hex" | "base64"

/**
 * 
 * @param length 
 * @param encoding 
 * @returns 
 */
export function generateRandomToken(length: number, encoding?: TokenEncodingType){
    if(!encoding){
        encoding = "base64";
    }
    return randomBytes(length).toString(encoding);
}

/**
 * 
 * @returns 
 */
export function generateCodeVerifierAndChallenge(): {verifier: string, challenge: string} {
    const verifier: string = generateRandomToken(32, "base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const challenge = hash("sha256", verifier, "base64url");
    return ({
        verifier,
        challenge
    });
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

export function getAuthenticationGroupDaoImpl(): AuthenticationGroupDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedAuthenticationGroupDao();
    }
    return new FSBasedAuthenticationGroupDao();
}

export function getGroupDaoImpl(): GroupDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedGroupDao();
    }
    return new FSBasedGroupDao();
}

export function getExternalOIDCProvicerDaoImpl(): ExternalOIDCProviderDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedExternalOIDCProviderDao();
    }
    return new FSBasedExternalOIDCProviderDao();
}

export function getAuthDaoImpl(): AuthDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedAuthDao();
    }
    return new FSBasedAuthDao();
}