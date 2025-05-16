"use client";
import React from "react";
import { useParams } from 'next/navigation';
import ClientDetail from "@/components/clients/client-detail";
import { CLIENT_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";


const ClientDetailPage: React.FC = () => {

    const params = useParams();
    const clientId = params?.id as string;

    const {data, loading, error} = useQuery(
        CLIENT_DETAIL_QUERY,
        {
            skip: clientId === null || clientId === undefined,
            variables: {
                clientId: clientId
            },
            onError(error) {
                
            },
        }
        
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='lg' />
    if (data && data.getClientById === null) return <ErrorComponent message={"Client Not Found"} componentSize='lg' />

    return (
        <ClientDetail client={data.getClientById} />
    )

}

export default ClientDetailPage;