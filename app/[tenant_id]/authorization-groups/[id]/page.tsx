"use client";
import React from "react";
import { useParams } from 'next/navigation';
import AuthorizationGroupDetail from "@/components/authorization-groups/authorization-group-detail";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import { AUTHORIZATION_GROUP_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";



const AuthorizationGroupDetailPage: React.FC = () => {

    const params = useParams();
    const authorizationGroupId = params?.id as string;
    console.log("authorization group id is: " + authorizationGroupId)

    const {data, loading, error} = useQuery(
        AUTHORIZATION_GROUP_DETAIL_QUERY,
        {
            skip: authorizationGroupId === null || authorizationGroupId === undefined,
            variables: {
                groupId: authorizationGroupId
            }
        }        
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='lg' />
    

    return (
        <AuthorizationGroupDetail authorizationGroup={data.getAuthorizationGroupById} />
    )

}

export default AuthorizationGroupDetailPage