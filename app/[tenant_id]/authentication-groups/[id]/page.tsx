"use client";
import AuthenticationGroupDetail from "@/components/authentication-groups/authentication-group-detail";
import ErrorComponent from "@/components/error/error-component";
import DataLoading from "@/components/layout/data-loading";
import { AUTHENTICATION_GROUP_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React, { useContext } from "react";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { AUTHENTICATION_GROUP_READ_SCOPE, TENANT_READ_ALL_SCOPE } from "@/utils/consts";

const AuthenticationGroupDetailPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    
    const params = useParams();
    const authenticationGroupId = params?.id as string;
    
    
    const {data, loading, error} = useQuery(
        AUTHENTICATION_GROUP_DETAIL_QUERY,
        {
            skip: !containsScope([TENANT_READ_ALL_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE], profile?.scope || []) || authenticationGroupId === null || authenticationGroupId === undefined,
            variables: {
                authenticationGroupId: authenticationGroupId
            },
            fetchPolicy: "no-cache"
        }        
    )

    if(!containsScope([TENANT_READ_ALL_SCOPE, AUTHENTICATION_GROUP_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={"You do not have sufficient permission to view this page."} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !authenticationGroupId) return <ErrorComponent message={error ? error.message : "No authentication group with this ID can be found"} componentSize='lg' />
    if (data && data.getAuthenticationGroupById === null) return <ErrorComponent message={"Authentication Group Not Found"} componentSize='lg' />

    return (
        <AuthenticationGroupDetail authenticationGroup={data.getAuthenticationGroupById} />
    )
}

export default AuthenticationGroupDetailPage;