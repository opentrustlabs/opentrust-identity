"use client";
import React, { useContext } from "react";
import { useParams } from 'next/navigation';
import { FEDERATED_OIDC_PROVIDER_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import FederatedOIDCProviderDetail from "@/components/oidc-providers/oidc-provider-detail";
import { ERROR_CODES } from "@/lib/models/error";
import { containsScope } from "@/utils/authz-utils";
import { FEDERATED_OIDC_PROVIDER_READ_SCOPE, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { AuthContextProps, AuthContext } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";


const FederatedOIDCProviderDetailPage: React.FC = () => {


    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    const params = useParams();
    const federatedOIDCProviderId = params?.id as string;

    const {data, loading, error} = useQuery(
        FEDERATED_OIDC_PROVIDER_DETAIL_QUERY,
        {
            skip: !containsScope([TENANT_READ_ALL_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE], profile?.scope || []) || federatedOIDCProviderId === null || federatedOIDCProviderId === undefined,
            variables: {
                federatedOIDCProviderId: federatedOIDCProviderId
            },
            fetchPolicy: "no-cache"
        }
    )

    if(!containsScope([TENANT_READ_ALL_SCOPE, FEDERATED_OIDC_PROVIDER_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={ERROR_CODES.EC00184.errorMessage} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !federatedOIDCProviderId) return <ErrorComponent message={error ? error.message : "There was an unexpected error retrieving the OIDC provider details."} componentSize='lg' />
    if (data && data.getFederatedOIDCProviderById === null) return <ErrorComponent message={ERROR_CODES.EC00023.errorMessage} componentSize='lg' />

    return (
        <FederatedOIDCProviderDetail federatedOIDCProvider={data.getFederatedOIDCProviderById} />
    )

}

export default FederatedOIDCProviderDetailPage;