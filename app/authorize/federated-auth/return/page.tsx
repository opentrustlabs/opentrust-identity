"use client";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { AuthSessionProps, useAuthSessionContext } from "@/components/contexts/auth-session-context";
import { HASH_PARAM_AUTH_TOKEN, HASH_PARAM_TENANT_ID, HASH_PARAM_TOKEN_TTL } from "@/utils/consts";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect } from "react";

const Session: React.FC = () => {

    const router = useRouter();
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
        
    // We have only defined ONE value to be placed into the fragment of the URI. If
    // we ever define more than one, then we will need to add a genuine parser
    // to the fragment string and parse it like normal query parameters. In that case
    // we should use the following query parameter key for the access token:
    //      HASH_PARAM_AUTH_TOKEN
    useEffect(() => {        
        if(typeof window !== "undefined"){
            let hashParams = window.location.hash;
            if(hashParams.length > 0){
                hashParams = hashParams.substring(1);
            }
            const searchParams: URLSearchParams = new URLSearchParams(hashParams);
            const accessToken = searchParams.get(HASH_PARAM_AUTH_TOKEN);
            const tokenTtl = searchParams.get(HASH_PARAM_TOKEN_TTL);
            const tenantId = searchParams.get(HASH_PARAM_TENANT_ID);            
            if(!accessToken || !tokenTtl || !tenantId){
                router.push(`/access-error?access_error_code=00076&extended_message=${"Invalid authentication parameters were supplied."}`);
            }
            else{
                // No need to parse the token to determine the expiration. If the token
                // is not valid, then all of the upstream GraphQL queries and mutations
                // will fail.
                authSessionProps.setAuthSessionData(
                    {
                        accessToken: accessToken,
                        expiresAtMs: Date.now() + parseInt(tokenTtl)
                    }
                );
                authContextProps.forceProfileRefetch();
                router.push(`/${tenantId}`);
            }                
        }        
    }, [router, authContextProps, authSessionProps]);

    
    return (
        
        <>    
        </>
    )

}

export default Session
