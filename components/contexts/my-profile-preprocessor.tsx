"use client";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { AuthSessionProps, useAuthSessionContext } from "./auth-session-context";
import { AuthContext, AuthContextProps } from "./auth-context";

export interface ProfilePreProcessorProviderProps {
    children: ReactNode
}


const ProfilePreProcessorContext = createContext<string>("");

const ProfilePreProcessorContextProvider: React.FC<ProfilePreProcessorProviderProps> = ({children}) => {
    
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    
    // We have only defined ONE value to be placed into the fragment of the URI. If
    // we ever define more than one, then we will need to add a genuine parser
    // to the fragment string and parse it like normal query parameters. In that case
    // we should use the following query parameter key for the access token:
    //      HASH_PARAM_AUTH_TOKEN
    useEffect(() => {        
        if(typeof window !== "undefined"){
            const authHashKVPair = window.location.hash;
            if(authHashKVPair){ 
                const kvPair = authHashKVPair.split("=");
                const accessToken = kvPair[1];
                if(accessToken){
                    // No need to parse the token to determine the expiration. If the token
                    // is not valid, then all of the upstream GraphQL queries and mutations
                    // will fail.
                    authSessionProps.setAuthSessionData(
                        {
                            accessToken: accessToken,
                            expiresAtMs: Date.now() + (60 * 60 * 1000)
                        }
                    );
                    authContextProps.forceProfileRefetch();
                }
            }
        }        
    }, [authSessionProps, authContextProps]);


    return (
        <ProfilePreProcessorContext.Provider value={""}>{children}</ProfilePreProcessorContext.Provider>
    )

}

export default ProfilePreProcessorContextProvider;