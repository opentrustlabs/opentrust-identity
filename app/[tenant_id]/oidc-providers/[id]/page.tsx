"use client";
import React from "react";
import { useParams } from 'next/navigation';
import { FEDERATED_OIDC_PROVIDER_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import FederatedOIDCProviderDetail from "@/components/oidc-providers/oidc-provider-detail";


const FederatedOIDCProviderDetailPage: React.FC = () => {

    const params = useParams();
    const federatedOIDCProviderId = params?.id as string;

    const {data, loading, error} = useQuery(
        FEDERATED_OIDC_PROVIDER_DETAIL_QUERY,
        {
            skip: federatedOIDCProviderId === null || federatedOIDCProviderId === undefined,
            variables: {
                federatedOIDCProviderId: federatedOIDCProviderId
            },
            fetchPolicy: "no-cache"
        }
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !federatedOIDCProviderId) return <ErrorComponent message={error ? error.message : "There was an unexpected error retrieving the OIDC provider details."} componentSize='lg' />
    if (data && data.getFederatedOIDCProviderById === null) return <ErrorComponent message={"OIDC Provider Not Found"} componentSize='lg' />

    return (
        <FederatedOIDCProviderDetail federatedOIDCProvider={data.getFederatedOIDCProviderById} />
    )

}

export default FederatedOIDCProviderDetailPage;