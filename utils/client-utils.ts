"use client";
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