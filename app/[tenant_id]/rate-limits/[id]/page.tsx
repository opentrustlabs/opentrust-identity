"use client";
import React from "react";
import { useParams } from 'next/navigation';
import { RATE_LIMIT_BY_ID_QUERY, SIGNING_KEY_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import RateLimitDetail from "@/components/rate-limits/rate-limit-detail";



const RateLimitServiceGroupDetailPage: React.FC = () => {

    const params = useParams();
    const rateLimitServiceGroupId = params?.id as string;

    const {data, loading, error} = useQuery(
        RATE_LIMIT_BY_ID_QUERY,
        {
            skip: rateLimitServiceGroupId === null || rateLimitServiceGroupId === undefined,
            variables: {
                serviceGroupId: rateLimitServiceGroupId
            },
        }
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !rateLimitServiceGroupId) return <ErrorComponent message={error ? error.message : "There was an unexpected error retrieving the signing key details."} componentSize='lg' />
    if (data && data.getRateLimitServiceGroupById === null) return <ErrorComponent message={"Rate Limit Not Found"} componentSize='lg' />

    return (
        <RateLimitDetail rateLimitDetail={data.getRateLimitServiceGroupById} />
    )



}

export default RateLimitServiceGroupDetailPage;