"use client";
import React, { Context, ReactNode } from "react";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/graphql/queries/oidc-queries";
import DataLoading from "../layout/data-loading";
import { useAuthSessionContext } from "./auth-session-context";

export interface AuthContextProps {
    children: ReactNode
}

const DEFAULT_PROFILE = null;
export const AuthContext: Context<PortalUserProfile | null> = React.createContext<PortalUserProfile | null>(DEFAULT_PROFILE);

const AuthContextProvider: React.FC<AuthContextProps> = ({
    children
}) => {
    
    const sessionProps = useAuthSessionContext();

    const {data, loading, previousData} = useQuery(ME_QUERY, {          
            pollInterval: 900000,
            fetchPolicy: "no-cache",
            notifyOnNetworkStatusChange: true,
            nextFetchPolicy: "no-cache",
            skip: sessionProps.getTokenTtlMs() < 0
        }
    );

    if(loading && !previousData && !data) return (<div><DataLoading dataLoadingSize="xl" color={null}/></div>)
    if(loading && previousData) return (
        <AuthContext.Provider 
            value={previousData.me}
        >{children}</AuthContext.Provider>
    )
    if(!loading && previousData && sessionProps.getTokenTtlMs() < 0) return (
        <AuthContext.Provider 
            value={previousData.me}
        >{children}</AuthContext.Provider>
    )
    if(data) return (
        <AuthContext.Provider 
            value={data.me}
        >{children}</AuthContext.Provider>
    )
    return (
        <AuthContext.Provider 
            value={DEFAULT_PROFILE}
        >{children}</AuthContext.Provider>
    )
    

}

export default AuthContextProvider;