"use client";
import { SearchResultType } from "@/graphql/generated/graphql-types";
import { REL_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";



export interface AuthenticationGroupUserConfigurationProps {
    authenticationGroupId: string,
    tenantId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const AuthenticationGroupUserConfiguration: React.FC<AuthenticationGroupUserConfigurationProps> = ({
    authenticationGroupId,
    tenantId,
    onUpdateEnd,
    onUpdateStart
}) => {

    const {data, loading, error} = useQuery(REL_SEARCH_QUERY, {
        variables: {
            relSearchInput: {
                parentid: authenticationGroupId,
                childtype: SearchResultType.User,
                page: 1,
                perPage: 20
            }
        }
    })

    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    
    return <>
        {JSON.stringify(data)}
    </>
}

export default AuthenticationGroupUserConfiguration;