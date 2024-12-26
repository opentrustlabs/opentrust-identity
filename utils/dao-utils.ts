import ClientDao from "@/lib/dao/client-dao";
import GroupDao from "@/lib/dao/authorization-group-dao";
import FSBasedClientDao from "@/lib/dao/impl/fs/fs-based-client-dao";
import FSBasedGroupDao from "@/lib/dao/impl/fs/fs-based-authorization-group-dao";
import FSBasedSigningKeysDao from "@/lib/dao/impl/fs/fs-based-signing-keys-dao";
import FSBasedRateLimitDao from "@/lib/dao/impl/fs/fs-based-rate-limit-dao";
import FSBasedScopeDao from "@/lib/dao/impl/fs/fs-based-scope-dao";
import FSBasedTenantDao from "@/lib/dao/impl/fs/fs-based-tenant-dao";
import SigningKeysDao from "@/lib/dao/signing-keys-dao";
import RateLimitDao from "@/lib/dao/rate-limit-dao";
import ScopeDao from "@/lib/dao/scope-dao";
import TenantDao from "@/lib/dao/tenant-dao";
import IdentityDao from "@/lib/dao/identity-dao";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes, hash } from "node:crypto";
import AuthenticationGroupDao from "@/lib/dao/authentication-group-dao";
import FSBasedAuthenticationGroupDao from "@/lib/dao/impl/fs/fs-based-authentication-group-dao";
import FederatedOIDCProviderDao from "@/lib/dao/federated-oidc-provider-dao";
import FSBasedFederatedOidcProviderDao from "@/lib/dao/impl/fs/fs-based-federated-oidc-provider-dao";
import AuthDao from "@/lib/dao/auth-dao";
import FSBasedAuthDao from "@/lib/dao/impl/fs/fs-based-auth-dao";
import FSBasedIdentityDao from "@/lib/dao/impl/fs/fs-based-identity-dao";
import DBTenantDao from "@/lib/dao/impl/db/db-tenant-dao";
import DBFederatedOIDCProviderDao from "@/lib/dao/impl/db/db-federated-oidc-provider-dao";


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

export type TokenEncodingType = "hex" | "base64" | "base64url";
export type HashAlgorithm = "sha256" | "sha384" | "sha512"; 
/**
 * 
 * @param length 
 * @param encoding defaults to base64url
 * @returns 
 */
export function generateRandomToken(length: number, encoding?: TokenEncodingType){
    if(!encoding){
        encoding = "base64url";
    }
    return randomBytes(length).toString(encoding);
}

/**
 * 
 * @returns 
 */
export function generateCodeVerifierAndChallenge(): {verifier: string, challenge: string} {
    const verifier: string = generateRandomToken(32);
    const challenge = generateHash(verifier); 
    return ({
        verifier,
        challenge
    });
}

/**
 * 
 * @param data
 * @param hashAlgorithm optional defaults to sha256
 * @param encoding optional defaults to base64url
 * @returns 
 */
export function generateHash(data: string, hashAlgorithm?: HashAlgorithm, encoding?: TokenEncodingType): string {
    if(!encoding){
        encoding = "base64url";
    }
    if(!hashAlgorithm){
        hashAlgorithm = "sha256"
    }
    return hash(hashAlgorithm, data, encoding);
}

export function getTenantDaoImpl(): TenantDao {
    console.log('getting tenant dao impl')
    // DAO_STRATEGY is one of filesystem | postgresql | mysql | mssql | oracle | cassandra | mongodb
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedTenantDao();        
    }
    else if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
        return new DBTenantDao();
    }
    return new FSBasedTenantDao();
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

export function getFederatedOIDCProvicerDaoImpl(): FederatedOIDCProviderDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedFederatedOidcProviderDao();
    }
    else if(daoStrategy === "postgresql" || daoStrategy === "mysql" || daoStrategy === "mssql"){
        return new DBFederatedOIDCProviderDao();
    }
    return new FSBasedFederatedOidcProviderDao();
}

export function getAuthDaoImpl(): AuthDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedAuthDao();
    }
    return new FSBasedAuthDao();
}

export function getIdentityDaoImpl(): IdentityDao {
    const daoStrategy = process.env.DAO_STRATEGY ?? "filesystem";
    if(daoStrategy === "filesystem"){
        return new FSBasedIdentityDao();
    }
    return new FSBasedIdentityDao();
}



// To retrieve the key in an enum. This can then be used as an index into the enum
export function getKeyByValue<T extends Record<string, string>>(enumObj: T, value: string): keyof T {
    for (const key in enumObj) {
        if (enumObj[key] === value) {
            return key as keyof T;
        }
    }
    return enumObj[""];
}