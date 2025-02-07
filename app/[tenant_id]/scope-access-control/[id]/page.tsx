"use client";
import ErrorComponent from "@/components/error/error-component";
import DataLoading from "@/components/layout/data-loading";
import ScopeDetail from "@/components/scope/scope-detail";
import { SCOPE_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React from "react";


const ScopeDetailPage: React.FC = () => {

    const params = useParams();
    const scopeId = params?.id as string;

    const {data, loading, error} = useQuery(
        SCOPE_DETAIL_QUERY,
        {
            skip: scopeId === null || scopeId === undefined,
            variables: {
                scopeId: scopeId
            }
        }
        
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !scopeId) return <ErrorComponent message={error ? error.message : "No scope detail could be found."} componentSize='lg' />

    return (
        <ScopeDetail scope={data.getScopeById} />
    )
}

export default ScopeDetailPage;