"use client";
import React, { useContext } from "react";
import { useParams } from 'next/navigation';
import { RATE_LIMIT_BY_ID_QUERY, SIGNING_KEY_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import RateLimitDetail from "@/components/rate-limits/rate-limit-detail";
import { ERROR_CODES } from "@/lib/models/error";
import { containsScope } from "@/utils/authz-utils";
import { AuthContextProps, AuthContext } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE } from "@/utils/consts";



const RateLimitServiceGroupDetailPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    
    const params = useParams();
    const rateLimitServiceGroupId = params?.id as string;

    const {data, loading, error} = useQuery(
        RATE_LIMIT_BY_ID_QUERY,
        {
            skip: !containsScope([TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE], profile?.scope || []) || rateLimitServiceGroupId === null || rateLimitServiceGroupId === undefined,
            variables: {
                serviceGroupId: rateLimitServiceGroupId
            },
            fetchPolicy: "no-cache"
        }
    )

    if(!containsScope([TENANT_READ_ALL_SCOPE, RATE_LIMIT_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={ERROR_CODES.EC00184.errorMessage} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !rateLimitServiceGroupId) return <ErrorComponent message={error ? error.message : "There was an unexpected error retrieving the signing key details."} componentSize='lg' />
    if (data && data.getRateLimitServiceGroupById === null) return <ErrorComponent message={ERROR_CODES.EC00042.errorMessage} componentSize='lg' />

    return (
        <RateLimitDetail rateLimitDetail={data.getRateLimitServiceGroupById} />
    )



}

export default RateLimitServiceGroupDetailPage;

