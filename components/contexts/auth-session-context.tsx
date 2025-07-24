"use client";
import { getAccessTokenExpiresAtMs, getAccessTokenFromLocalStorage, removeAccessTokenFromLocalStorage, setAccessTokenOnLocalStorage } from "@/utils/client-utils";
import React, { createContext, ReactNode, useContext, useEffect } from "react";

export interface AuthSessionContextProps {
    children: ReactNode
}

export interface AuthSessionData {
    accessToken: string,
    expiresAtMs: number
}

export interface AuthSessionProps {
    setAuthSessionData: (authSessionData: AuthSessionData) => void,
    getAuthSessionData: () => AuthSessionData,
    deleteAuthSessionData: () => void,
    getTokenTtlMs: () => number
    
}

const AuthSessionContext = createContext<AuthSessionProps>({
    setAuthSessionData: () => {},
    getAuthSessionData: () => {return {accessToken: "", expiresAtMs: 0}},
    deleteAuthSessionData: () => {},
    getTokenTtlMs: () => 0
});

const AuthenSessionContextProvider: React.FC<AuthSessionContextProps> = ({children}) => {

    const expMs = getAccessTokenExpiresAtMs();
    const now = Date.now();

    // STATE VARIABLES
    const [ttl, setTtl] = React.useState<number>(expMs ? expMs - now : 0);

    // HANDLER FUNCTIONS
    const scheduleTtlRefresh = () => {
        const delay = 60000;
        setInterval(
            () => {
                const expMs = getAccessTokenExpiresAtMs();
                const now = Date.now();
                const ttl = expMs ? expMs - now : 0;
                setTtl(ttl);
            }, delay);
    };

    useEffect(() => {
        if(typeof window !== "undefined"){
            scheduleTtlRefresh();
        }        
    }, []);

    const setAuthSessionData = (authSessionData: AuthSessionData): void => {        
        setAccessTokenOnLocalStorage(authSessionData.accessToken, authSessionData.expiresAtMs);
        const now = Date.now();
        const ttl = authSessionData.expiresAtMs - now;
        setTtl(ttl);
    }
    const getTokenTtlMs = (): number => {
        return ttl;
    }
    const getAuthSessionData = (): AuthSessionData => {
        const accessToken: string  = getAccessTokenFromLocalStorage() || "";
        const expiresAtMs: number = getAccessTokenExpiresAtMs() || 0;
        return {
            accessToken,
            expiresAtMs
        }
    }
    const deleteAuthSessionData = () => {
        removeAccessTokenFromLocalStorage();
    }

    const value: AuthSessionProps = {
        setAuthSessionData,
        getAuthSessionData,
        deleteAuthSessionData,
        getTokenTtlMs
    }

    return (
        <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
    )

}

const useAuthSessionContext = () => {
    return useContext(AuthSessionContext);
}

export { AuthenSessionContextProvider, useAuthSessionContext };