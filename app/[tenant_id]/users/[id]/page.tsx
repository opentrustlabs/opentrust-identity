"use client";
import ErrorComponent from "@/components/error/error-component";
import DataLoading from "@/components/layout/data-loading";
import UserDetail from "@/components/users/user-detail";
import { USER_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React, { useContext } from "react";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { TENANT_READ_ALL_SCOPE, USER_READ_SCOPE } from "@/utils/consts";


const UserDetailPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    
    const params = useParams();
    const userId = params?.id as string;

    const {data, loading, error} = useQuery(
        USER_DETAIL_QUERY,
        {
            skip: !containsScope([TENANT_READ_ALL_SCOPE, USER_READ_SCOPE], profile?.scope || []) || userId === null || userId === undefined,
            variables: {
                userId: userId
            },
        }
        
    )

    if(!containsScope([TENANT_READ_ALL_SCOPE, USER_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={"You do not have sufficient permission to view this page."} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !userId) return <ErrorComponent message={error ? error.message : "No user with this ID can be found"} componentSize='lg' />
    if (data && data.getUserById === null) return <ErrorComponent message={"User Not Found"} componentSize='lg' />

    return (
        <UserDetail user={data.getUserById} />
    )

}

export default UserDetailPage