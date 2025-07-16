"use client";
import React, { useContext } from "react";
import { useParams } from 'next/navigation';
import ClientDetail from "@/components/clients/client-detail";
import { CLIENT_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE } from "@/utils/consts";

const ClientDetailPage: React.FC = () => {


    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    const params = useParams();
    const clientId = params?.id as string;

    const {data, loading, error} = useQuery(
        CLIENT_DETAIL_QUERY,
        {
            skip: !containsScope([TENANT_READ_ALL_SCOPE, CLIENT_READ_SCOPE], profile?.scope || []) || clientId === null || clientId === undefined,
            variables: {
                clientId: clientId
            }
        }        
    )

    if(!containsScope([TENANT_READ_ALL_SCOPE, CLIENT_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={"You do not have sufficient permission to view this page."} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='lg' />
    if (data && data.getClientById === null) return <ErrorComponent message={"Client Not Found"} componentSize='lg' />

    return (
        <ClientDetail client={data.getClientById} />
    )

}

export default ClientDetailPage;