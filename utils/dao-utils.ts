import { readFileSync, existsSync } from "node:fs";
import { randomBytes, hash, createHash, pbkdf2Sync, scryptSync, createHmac } from "node:crypto";
import bcrypt from "bcrypt";
import { UserCredential } from "@/graphql/generated/graphql-types";
import { PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, PASSWORD_HASH_ITERATION_64K, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASH_ITERATION_128K, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASH_ITERATION_256K, PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS, PASSWORD_HASH_ITERATION_32K, PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS } from "./consts";
import { ValueTransformer } from "typeorm";


export function base64Decode(s: string): string {
    return Buffer.from(s, "base64").toString("utf-8");
}

export function base64Encode(s: string): string {
    return Buffer.from(s, "utf-8").toString("base64");
}

/**
 * 
 * @param fileName 
 * @param defaultContents 
 * @returns 
 */
export function getFileContents(fileName: string, defaultContents?: string): any {
    let fileContents; 

    if(!existsSync(fileName)){
        throw new Error("ERROR_FILE_DOES_NOT_EXIST");
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
 * @param lengthInBytes
 * @param encoding defaults to base64url
 * @returns 
 */
export function generateRandomToken(lengthInBytes: number, encoding?: TokenEncodingType){
    if(!encoding){
        encoding = "base64url";
    }    
    return randomBytes(lengthInBytes).toString(encoding);
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

/**
 * 
 * @returns 
 */
export function generateSalt(): string {
    return generateRandomToken(16, "base64");
}

/**
 * @deprecated SHA-256 is NOT suitable for password hashing. Use Scrypt, Bcrypt, or PBKDF2 instead.
 * This function is retained only for verifying existing passwords. New passwords should NOT use this algorithm.
 * 
 * SECURITY WARNING: SHA-256 is fast and optimized for GPUs/ASICs, making it vulnerable to brute-force attacks.
 * A single GPU can test millions of passwords per second even with 128K iterations.
 * 
 * @param password 
 * @param salt 
 * @param iterations 
 */
export function sha256HashPassword(password: string, salt: string, iterations: number): string {
    // Use HMAC for proper key derivation
    const hmac = createHmac('sha256', salt);
    hmac.update(password);
    let hash = hmac.digest(); // Binary, not base64
    
    // Re-hash the binary data, not base64 string
    for(let i = 1; i < iterations; i++){
        const hmac2 = createHmac('sha256', salt);
        hmac2.update(hash);
        hash = hmac2.digest();
    }
    
    return hash.toString('base64');
    
    // let hash = createHash("sha256").update(`${password}${salt}`).digest("base64");
    // for(let i = 1; i < iterations; i++){
    //     hash = createHash("sha256").update(hash).digest("base64");
    // }
    // return hash;
}

/**
 * 
 * @param password 
 * @param rounds 
 * @returns 
 */
export function bcryptHashPassword(password: string, rounds: number): string {
    const hashedPassword = bcrypt.hashSync(password, rounds);
    return hashedPassword;
}

/**
 * 
 * @param password 
 * @param hash 
 * @returns 
 */
export function bcryptValidatePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

/**
 * 
 * @param password 
 * @param salt 
 * @param keyLength 
 * @param cost 
 * @returns 
 */
export function scryptHashPassword(password: string, salt: string, cost: number): string {
    const b: Buffer = scryptSync(password, salt, 64, {
        blockSize: 8,
        cost: cost,
        parallelization: 1,
        maxmem: 128 * cost * 9
    });
    return b.toString("base64");
}

/**
 * 
 * @param password 
 * @param salt 
 * @param iterations 
 * @returns 
 */
export function pbkdf2HashPassword(password: string, salt: string, iterations: number): string {
    const hashed: Buffer = pbkdf2Sync(password, salt, iterations, 32, "sha256");
    return hashed.toString("base64");
}

/**
 * To retrieve the key in an enum. This can then be used as an index into the enum
 * 
 * @param enumObj 
 * @param value 
 * @returns 
 */
export function getKeyByValue<T extends Record<string, string>>(enumObj: T, value: string): keyof T {
    for (const key in enumObj) {
        if (enumObj[key] === value) {
            return key as keyof T;
        }
    }
    return enumObj[""];
}

export function getDomainFromEmail(email: string): string {
    const domain: string = email.substring(
        email.indexOf("@") + 1
    );
    return domain;
}

/**
 * Performs an additional check on the redirect URI during the authorization 
 * call of a client application in case none of the strict comparisons of
 * redirect URIs match.
 * 
 * For some applications, the actual redirect URI for localhost (or other loopback URI) 
 * may vary depending on what ports are available. For those applications we can ignore 
 * differences in port number and just check to make sure that the hostnames match and
 * the paths match.
 * 
 * @param uris 
 * @param redirectUri 
 * @returns 
 */
export function hasValidLoopbackRedirectUri(uris: Array<string>, redirectUri: string): boolean {
    let bRetVal: boolean = false;
    try{
        const rUrl: URL = new URL(redirectUri);
        if(rUrl.hostname === "localhost" || rUrl.hostname === "127.0.0.1"){
            for(let i = 0; i < uris.length; i++){
                try{
                    const tUrl = new URL(uris[i]);
                    if(
                        tUrl.hostname === rUrl.hostname && 
                        tUrl.protocol === rUrl.protocol &&
                        tUrl.pathname === rUrl.pathname
                    ){                        
                        bRetVal = true;
                        break;                        
                    }
                }
                catch(e){
                    // Ignore, although there really shouldn't be any misconfigured URIs stored 
                    // for the client
                }
            }
        }
    }
    catch(ignore: any){
        // In case any parsing of the supplied redirectUri by the client
        // we do not need to do anything but return false.
    }
    return bRetVal;
}

export function generateUserCredential(userId: string, password: string, hashAlgorithm: string): UserCredential {
    // For the Bcrypt hashing algorithm, the salt value is included in the final salted password
    // so we can just leave it as the empty string.
    let salt = "";
    let hashedPassword = "";

    if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS) {
        hashedPassword = bcryptHashPassword(password, 10);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS) {
        hashedPassword = bcryptHashPassword(password, 11);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS) {
        hashedPassword = bcryptHashPassword(password, 12);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS) {
        salt = generateSalt();
        hashedPassword = sha256HashPassword(password, salt, PASSWORD_HASH_ITERATION_64K);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS) {
        salt = generateSalt();
        hashedPassword = sha256HashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS) {
        salt = generateSalt();
        hashedPassword = pbkdf2HashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS) {
        salt = generateSalt();
        hashedPassword = pbkdf2HashPassword(password, salt, PASSWORD_HASH_ITERATION_256K);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_32K_ITERATIONS) {
        salt = generateSalt();
        hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_32K);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_64K_ITERATIONS) {
        salt = generateSalt();
        hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_64K);
    }
    else if (hashAlgorithm === PASSWORD_HASHING_ALGORITHM_SCRYPT_128K_ITERATIONS) {
        salt = generateSalt();
        hashedPassword = scryptHashPassword(password, salt, PASSWORD_HASH_ITERATION_128K);
    }

    return {
        dateCreatedMs: Date.now(),
        hashedPassword: hashedPassword,
        salt: salt,
        hashingAlgorithm: hashAlgorithm,
        userId: userId
    }
} 

// postgres | mysql | oracle | mssql
type BlobType = "blob" | "bytea" | "varbinary"
export function getBlobTypeForDriver(dbType: string): BlobType {
    switch (dbType) {
        case "mysql":
        case "mariadb":
            return "blob"; // or "longblob" if you expect very large data
        case "postgres":
            return "bytea";
        case "mssql":
            return "varbinary"; // use { length: "MAX" } if needed
        case "oracle":
            return "blob";
        case "sqlite":
        case "better-sqlite3":
            return "blob";
        default:
            throw new Error(`Unsupported database type for BLOB: ${dbType}`);
    }
}



/**
 * Converts between string and binary (Buffer) for BLOB-like columns.
 * 
 * @param encoding - Optional encoding ("utf8" by default)
 */
export function stringToBlobTransformer(encoding: BufferEncoding = "utf8"): ValueTransformer {
    return {
        to(value: string | null): Buffer | null {
            if (value == null) return null;
            return Buffer.from(value, encoding);
        },
        from(value: Buffer | null): string | null {
            if (value == null) return null;
            return value.toString(encoding);
        },
    };
}

export type BooleanType = "number" | "boolean"
export function getBooleanTypeForDriver(dbType: string): BooleanType {
    switch (dbType) {
        case "mysql":
        case "mariadb":
        case "postgres":
        case "mssql":
        case "sqlite":
        case "better-sqlite3":
            return "boolean"; // or "longblob" if you expect very large data
        case "oracle":
            return "number";
        default:
            throw new Error(`Unsupported database type for boolean: ${dbType}`);
    }
}

export const BooleanTransformer: ValueTransformer = {
    // Converts from JS → DB
    to: (value: boolean | null) => {
        if (value === null || value === undefined) return null;
        return value ? 1 : 0; // Stored as 1 or 0 in DBs that lack native boolean
    },
    // Converts from DB → JS
    from: (value: any) => {
        if (value === null || value === undefined) return null;

        // PostgreSQL returns boolean directly
        if (typeof value === "boolean") return value;

        // MySQL/MSSQL may return numbers or strings
        if (typeof value === "number") return value === 1;
        if (typeof value === "string") return value === "1" || value.toUpperCase() === "TRUE";

        return false;
    }
};

export type BigIntType = "bigint" | "number";
export function getBigIntTypeForDriver(dbType: string): BigIntType{
    switch (dbType) {
        case "mysql":
        case "mariadb":
        case "postgres":
        case "mssql":
        case "sqlite":
        case "better-sqlite3":
            return "bigint"; // or "longblob" if you expect very large data
        case "oracle":
            return "number";
        default:
            throw new Error(`Unsupported database type for bigint: ${dbType}`);
    }
}

export type IntType = "int" | "number";
export function getIntTypeForDriver(dbType: string): IntType {
switch (dbType) {
        case "mysql":
        case "mariadb":
        case "postgres":
        case "mssql":
        case "sqlite":
        case "better-sqlite3":
            return "int"; // or "longblob" if you expect very large data
        case "oracle":
            return "number";
        default:
            throw new Error(`Unsupported database type for int: ${dbType}`);
    }
}
