"use client";
import React, { useContext } from "react";
import { useParams } from 'next/navigation';
import AuthorizationGroupDetail from "@/components/authorization-groups/authorization-group-detail";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import { AUTHORIZATION_GROUP_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { AUTHORIZATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { ERROR_CODES } from "@/lib/models/error";


const AuthorizationGroupDetailPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    const params = useParams();
    const authorizationGroupId = params?.id as string;

    const {data, loading, error} = useQuery(
        AUTHORIZATION_GROUP_DETAIL_QUERY,
        {
            skip: !containsScope([TENANT_READ_ALL_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE], profile?.scope || []) || authorizationGroupId === null || authorizationGroupId === undefined,
            variables: {
                groupId: authorizationGroupId
            },
            fetchPolicy: "no-cache"
        }        
    )

    if(!containsScope([TENANT_READ_ALL_SCOPE, AUTHORIZATION_GROUP_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={ERROR_CODES.EC00184.errorMessage} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='lg' />
    if (data && data.getAuthorizationGroupById === null) return <ErrorComponent message={ERROR_CODES.EC00028.errorMessage} componentSize='lg' />

    return (
        <AuthorizationGroupDetail authorizationGroup={data.getAuthorizationGroupById} />
    )

}

export default AuthorizationGroupDetailPage