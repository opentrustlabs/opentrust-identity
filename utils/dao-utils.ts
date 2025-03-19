import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes, hash, createHash, pbkdf2Sync } from "node:crypto";
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

export function bcryptHashPassword(password: string, rounds: number): string {
    const hashedPassword = bcrypt.hashSync(password, rounds);
    return hashedPassword;
}

export function bcryptValidatePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

export function pbkdf2HashPassword(password: string, salt: string, iterations: number): string {
    const hashed: Buffer = pbkdf2Sync(password, salt, iterations, 32, "sha256");
    return hashed.toString("base64");
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

