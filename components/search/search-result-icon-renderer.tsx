"use client";
import { SearchResultType } from "@/graphql/generated/graphql-types";
import React from "react";
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PeopleIcon from '@mui/icons-material/People';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import PolicyIcon from '@mui/icons-material/Policy';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import SpeedIcon from '@mui/icons-material/Speed';


export interface SearchResultIconRendererProps {
    objectType: SearchResultType
}


export function getUriSection (objectType: SearchResultType): string {
    switch (objectType) {            
        case SearchResultType.AccessControl : {
            return "scope-access-control";                                
        }
        case SearchResultType.AuthenticationGroup : {
            return "authentication-groups";
        }
        case SearchResultType.AuthorizationGroup: {
            return "authorization-groups"
        }
        case SearchResultType.Client : {
            return "clients";
        }
        case SearchResultType.Key : {
            return "signing-keys"
        }
        case SearchResultType.OidcProvider : {
            return "oidc-providers";
        }
        case SearchResultType.RateLimit : {
            return "rate-limits";
        }
        case SearchResultType.Tenant : {
            return "tenants"
        }
        case SearchResultType.User : {
            return "users"
        }
        default: {
            return ""
        }
    }
}

export function displaySearchCategory(objectType: SearchResultType): string {
    switch (objectType) {            
        case SearchResultType.AccessControl : {
            return "Access Control".toUpperCase();                                
        }
        case SearchResultType.AuthenticationGroup : {
            return "Authentication Groups".toUpperCase();
        }
        case SearchResultType.AuthorizationGroup: {
            return "Authorization Groups".toUpperCase();
        }
        case SearchResultType.Client : {
            return "Clients".toUpperCase();
        }
        case SearchResultType.Key : {
            return "Signing Keys".toUpperCase();
        }
        case SearchResultType.OidcProvider : {
            return "OIDC Providers".toUpperCase();
        }
        case SearchResultType.RateLimit : {
            return "Rate Limits".toUpperCase();
        }
        case SearchResultType.Tenant : {
            return "Tenants".toUpperCase();
        }
        case SearchResultType.User : {
            return "Users".toUpperCase();
        }
        default: {
            return ""
        }
    }
}


const SearchResultIconRenderer: React.FC<SearchResultIconRendererProps> = ({
    objectType
}) => {


    if(objectType === SearchResultType.AccessControl){
        return (
            <PolicyIcon />
        )
    }
    else if(objectType === SearchResultType.AuthenticationGroup){
        return (
            <VerifiedUserOutlinedIcon />
        )
    }
    else if(objectType === SearchResultType.AuthorizationGroup){
        return (
            <PeopleIcon />
        )
    }
    else if(objectType === SearchResultType.Client){
        return (
            <SettingsSystemDaydreamIcon />
        )
    }
    else if(objectType === SearchResultType.Key){
        return (
            <KeyIcon />
        )
    }
    else if(objectType === SearchResultType.OidcProvider){
        return (
            <AutoAwesomeMosaicIcon />
        )
    }
    else if(objectType === SearchResultType.RateLimit){
        return (
            <SpeedIcon />
        )
    }
    else if(objectType === SearchResultType.Tenant){
        return (
            <BusinessIcon />
        )
    }
    else if(objectType === SearchResultType.User){
        return (
            <PersonIcon />
        )
    }
    else {
        return (
            <></>
        )
    }

}

export default SearchResultIconRenderer;