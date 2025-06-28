import { TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import { DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED } from "./consts";




/**
 * 
 * @param pword 
 * @param tenantPasswordConfig 
 * @returns 
 */
export function validatePasswordFormat(password: string, tenantPasswordConfig: TenantPasswordConfig): {result: boolean, errorMessage: string, password: string} {

    
    let retVal = {result: true, errorMessage: "", password: password};   

    if(password.length < tenantPasswordConfig.passwordMinLength || password.length > tenantPasswordConfig.passwordMaxLength){
        retVal.result = false;
        retVal.errorMessage = "ERROR_PASSWORD_INVALID_LENGTH";
        return retVal;
    }
    if(password[0] === " " || password[password.length - 1] === " "){
        retVal.result = false;
        retVal.errorMessage = "ERROR_PASSWORD_HAS_LEADING_OR_TRAILING_SPACES";
        return retVal;
    }
    if(!containsAcceptableCodePoints(password)){
        retVal.result = false;
        retVal.errorMessage = "ERROR_PASSWORD_HAS_INVALID_CHARACTERS";
        return retVal;
    }
    if(tenantPasswordConfig.requireNumbers && !containsNumericCharacters(password)){
        retVal.result = false;
        retVal.errorMessage = "ERROR_PASSWORD_CONTAINS_NO_NUMERIC_CHARACTERS";
        return retVal;
    }
    if(containsAsciiLetterCharacters(password)){
        if(tenantPasswordConfig.requireLowerCase && !containsAsciiLowerCase(password)){
            retVal.result = false;
            retVal.errorMessage = "ERROR_PASSWORD_CONTAINS_NO_LOWERCASE_CHARACTERS";
            return retVal;
        }
        if(tenantPasswordConfig.requireUpperCase && !containsAsciiUpperCase(password)){
            retVal.result = false;
            retVal.errorMessage = "ERROR_PASSWORD_CONTAINS_NO_UPPERCASE_CHARACTERS";
            return retVal;
        }
    }
    if(tenantPasswordConfig.requireSpecialCharacters){
        if(!containsSpecialCharacterInAllowedList(password, tenantPasswordConfig.specialCharactersAllowed || DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED)){
            retVal.result = false;
            retVal.errorMessage = "ERROR_PASSWORD_CONTAINS_NO_ALLOWED_SPECIAL_CHARACTERS";
            return retVal;
        }
    }
    if(tenantPasswordConfig.maxRepeatingCharacterLength){
        if(!satisfiesMaxRepeatingCharLength(password, tenantPasswordConfig.maxRepeatingCharacterLength)){
            retVal.result = false;
            retVal.errorMessage = "ERROR_PASSWORD_CONTAINS_REPEATING_CHARACTERS";
            return retVal;
        }
    }

    return retVal;

}

export function getUnicodeCategory(char: string): string {
    if (/\p{Letter}/u.test(char)) {
        return "Letter";
    } 
    else if(/\p{Number}/u.test(char)){
        return "Number";
    }
    else if (/\p{Symbol}/u.test(char)) {
        return "Symbol";
    } 
    else if (/\p{Punctuation}/u.test(char)){
        return "Punctuation";
    }
    else if(/\p{Separator}/u.test(char)){
        return "Separator";
    }
    else {
        return "Other";
    }
}

export function containsSpecialCharacterInAllowedList(password: string, specialCharactersAllowed: string): boolean {
    let bRetVal = false;
    for(let i = 0; i < password.length; i++){
        if(specialCharactersAllowed.includes(password.charAt(i))){
            bRetVal = true;
            break;
        }
    }
    return bRetVal;
}

export function containsAcceptableCodePoints(password: string): boolean {
    let bRetVal = true;
    for(let i = 0; i < password.length; i++){
        const codePoint: number | undefined = password.codePointAt(i);
        if(codePoint === undefined){
            bRetVal = false;
            break;
        }
        if(codePoint < 32){
            bRetVal = false;
            break;
        }
        if(codePoint > 126){
            const codePointCategory = getUnicodeCategory(password.charAt(i));
            if(codePointCategory !== "Letter"){
                bRetVal = false;
                break;
            }
        }
    }
    return bRetVal;
}

export function satisfiesMaxRepeatingCharLength(password: string, maxRepeatingCharLength: number): boolean {
    let bRetVal = true;
    for(let i = 0; i < password.length - maxRepeatingCharLength; i++){
        const codePoint: number | undefined = password.codePointAt(i);
        if(codePoint === undefined){
            bRetVal = false;
            break;
        }
        const arrNextCodePoints: Array<number> = [];
        for(let j = i + 1; j <= i + maxRepeatingCharLength; j++){
            const nextCodePoint: number | undefined = password.codePointAt(j);
            if(nextCodePoint === undefined){
                bRetVal = false;
                break;
            }
            arrNextCodePoints.push(nextCodePoint);            
        }
        let allMatch: boolean = true;
        for(let j = 0; j < arrNextCodePoints.length; j++){
            if(codePoint !== arrNextCodePoints[j]){
                allMatch = false;
                break;
            }
        }
        if(allMatch === true){
            bRetVal = false;
            break;
        }
    }

    return bRetVal;
}

/**
 * Are there numeric ascii characters? (ascii codes from 48 to 57)
 * @param password 
 */
export function containsNumericCharacters(password: string): boolean {
    let bRetVal = false;
    for(let i = 0; i < password.length; i++){
        const charCode: number = password.charCodeAt(i);
        if(charCode >= 48 && charCode <= 57){
            bRetVal = true;
            break;
        }
    }
    return bRetVal;
}

/**
 * 
 * @param password 
 * @returns 
 */
export function containsAsciiLowerCase(password: string): boolean {
    let bRetVal = false;
    for(let i = 0; i < password.length; i++){
        const charCode: number = password.charCodeAt(i);
        if(charCode >= 97 && charCode <= 122){
            bRetVal = true;
            break;
        }
    }
    return bRetVal;
}

export function containsAsciiUpperCase(password: string): boolean {
    let bRetVal = false;
    for(let i = 0; i < password.length; i++){
        const charCode: number = password.charCodeAt(i);
        if(charCode >= 65 && charCode <= 90){
            bRetVal = true;
            break;
        }
    }
    return bRetVal;
}

/**
 * if there are ascii characters from character code 65 to 90 and from 97 to 122.
 * @param password 
 */
export function containsAsciiLetterCharacters(password: string): boolean {
    let bRetVal = false;
    for(let i = 0; i < password.length; i++){
        const charCode: number = password.charCodeAt(i);
        if((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) ){
            bRetVal = true;
            break;
        }
    }
    return bRetVal;
}