"use client";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import ErrorComponent from "@/components/error/error-component";
import DataLoading from "@/components/layout/data-loading";
import ScopeDetail from "@/components/scope/scope-detail";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { SCOPE_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { containsScope } from "@/utils/authz-utils";
import { SCOPE_READ_SCOPE, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React, { useContext } from "react";


const ScopeDetailPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    
    const params = useParams();
    const scopeId = params?.id as string;
    
    const {data, loading, error} = useQuery(
        SCOPE_DETAIL_QUERY,
        {
            skip: !containsScope([TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], profile?.scope || []) || scopeId === null || scopeId === undefined,
            variables: {
                scopeId: scopeId
            }
        }
        
    )

    if(!containsScope([TENANT_READ_ALL_SCOPE, SCOPE_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={"You do not have sufficient permission to view this page."} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !scopeId) return <ErrorComponent message={error ? error.message : "No scope detail could be found."} componentSize='lg' />
    if (data && data.getScopeById === null) return <ErrorComponent message={"Scope Not Found"} componentSize='lg' />

    return (
        <ScopeDetail scope={data.getScopeById} />
    )
}

export default ScopeDetailPage;