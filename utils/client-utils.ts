"use client";
import { AUTH_TOKEN_LOCAL_STORAGE_KEY, MANAGEMENT_TENANT_LOCAL_STORAGE_KEY, TOKEN_EXPIRIES_AT_MS_LOCAL_KEY } from "./consts";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "./i18n";


export function getDefaultCountryCodeDef(countryCode: string) {
    let retVal = {
        id: "",
        label: ""
    };
    
    const ccDef: CountryCodeDef | undefined = COUNTRY_CODES.find(
        (cc: CountryCodeDef) => cc.countryCode === countryCode
    )
    if(ccDef){
        retVal = {
            id: ccDef.countryCode,
            label: ccDef.country
        }
    }
    
    return retVal;        
}

export function getDefaultLanguageCodeDef (languageCode: string) {
    let retVal = {
        id: "",
        label: ""
    }
    
    const lDef: LanguageCodeDef | undefined = LANGUAGE_CODES.find(
        (lc: LanguageCodeDef) => lc.languageCode === languageCode
    );

    if(lDef){
        retVal = {
            id: lDef.languageCode,
            label: lDef.language
        }
    }
    
    return retVal;    
}

export function removeAccessTokenFromLocalStorage(): void {
    localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRIES_AT_MS_LOCAL_KEY);
}

export function getAccessTokenFromLocalStorage(): string | null {
    return localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY);
}

/**
 * returns the number of seconds from when the token was issued
 * that it will expires
 */
export function getAccessTokenExpiresAtMs(): number | null {
    const t: string | null = localStorage.getItem(TOKEN_EXPIRIES_AT_MS_LOCAL_KEY);
    if(t){
        const exp: number = parseInt(t);
        return exp;
    }
    else{
        return null;
    }
}

export function setAccessTokenOnLocalStorage(token: string, expiresAtMs: number): void {
    localStorage.setItem(AUTH_TOKEN_LOCAL_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRIES_AT_MS_LOCAL_KEY, expiresAtMs.toString())
}

export function setManagementTenantAccessId(tenantId: string): void {
    localStorage.setItem(MANAGEMENT_TENANT_LOCAL_STORAGE_KEY, tenantId);
}

export function getManagementTenantAccessId(): string | null {
    return localStorage.getItem(MANAGEMENT_TENANT_LOCAL_STORAGE_KEY);    
}