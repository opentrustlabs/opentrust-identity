import { readFileSync, existsSync } from "node:fs";
import { randomBytes, hash, createHash, pbkdf2Sync, scryptSync } from "node:crypto";
import bcrypt from "bcrypt";


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
 * AI Overview Implementation?
 * @param password 
 * @param salt 
 * @param iterations 
 */
export function sha256HashPassword(password: string, salt: string, iterations: number): string {
    let hash = createHash("sha256").update(`${password}${salt}`).digest("base64");
    for(let i = 1; i < iterations; i++){
        hash = createHash("sha256").update(hash).digest("base64");
    }
    return hash;
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
