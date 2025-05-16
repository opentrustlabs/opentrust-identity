"use client";
import AuthenticationGroupDetail from "@/components/authentication-groups/authentication-group-detail";
import ErrorComponent from "@/components/error/error-component";
import DataLoading from "@/components/layout/data-loading";
import { AUTHENTICATION_GROUP_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React from "react";

const AuthenticationGroupDetailPage: React.FC = () => {

    const params = useParams();
    const authenticationGroupId = params?.id as string;

    
    const {data, loading, error} = useQuery(
        AUTHENTICATION_GROUP_DETAIL_QUERY,
        {
            skip: authenticationGroupId === null || authenticationGroupId === undefined,
            variables: {
                authenticationGroupId: authenticationGroupId
            }
        }        
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !authenticationGroupId) return <ErrorComponent message={error ? error.message : "No authentication group with this ID can be found"} componentSize='lg' />
    if (data && data.getAuthenticationGroupById === null) return <ErrorComponent message={"Authentication Group Not Found"} componentSize='lg' />

    return (
        <AuthenticationGroupDetail authenticationGroup={data.getAuthenticationGroupById} />
    )
}

export default AuthenticationGroupDetailPage;