"use client";
import React, { Context, ReactNode } from "react";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { useQuery } from "@apollo/client";
import { ME_QUERY } from "@/graphql/queries/oidc-queries";
import DataLoading from "../layout/data-loading";
import { useAuthSessionContext } from "./auth-session-context";



const DEFAULT_PROFILE = null;

export interface AuthContextProps {
    portalUserProfile: PortalUserProfile | null,
    forceProfileRefetch: () => void
}

export const AuthContext: Context<AuthContextProps> = React.createContext<AuthContextProps>(
    {
        portalUserProfile: DEFAULT_PROFILE,
        forceProfileRefetch: () => {}
    }
);

export interface AuthContextProviderProps {
    children: ReactNode
}

const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
    children
}) => {
    
    const sessionProps = useAuthSessionContext();

    const {data, loading, previousData, refetch} = useQuery(ME_QUERY, {          
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
            value={{
                portalUserProfile: previousData.me,
                forceProfileRefetch: () => {refetch()}
            }}
        >{children}</AuthContext.Provider>
    )
    if(!loading && previousData && sessionProps.getTokenTtlMs() < 0) return (
        <AuthContext.Provider 
            value={{
                portalUserProfile: previousData.me,
                forceProfileRefetch: () => {refetch()}
            }}
        >{children}</AuthContext.Provider>
    )
    if(data) return (
        <AuthContext.Provider 
            value={{
                portalUserProfile: data.me,
                forceProfileRefetch: () => {refetch()}
            }}
        >{children}</AuthContext.Provider>
    )
    return (
        <AuthContext.Provider 
            value={{
                portalUserProfile: DEFAULT_PROFILE,
                forceProfileRefetch: () => {refetch()}
            }}
        >{children}</AuthContext.Provider>
    )    

}

export default AuthContextProvider;