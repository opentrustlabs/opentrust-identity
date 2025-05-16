"use client";
import React from "react";
import { useParams } from 'next/navigation';
import { SIGNING_KEY_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import SigningKeyDetail from "@/components/signing-keys/signing-key-detail";


const SigningKeyDetailPage: React.FC = () => {

    const params = useParams();
    const signingKeyId = params?.id as string;

    const {data, loading, error} = useQuery(
        SIGNING_KEY_DETAIL_QUERY,
        {
            skip: signingKeyId === null || signingKeyId === undefined,
            variables: {
                signingKeyId: signingKeyId
            },
        }
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !signingKeyId) return <ErrorComponent message={error ? error.message : "There was an unexpected error retrieving the signing key details."} componentSize='lg' />
    if (data && data.getSigningKeyById === null) return <ErrorComponent message={"Signing Key Not Found"} componentSize='lg' />

    return (
        <SigningKeyDetail signingKey={data.getSigningKeyById} />
    )



}

export default SigningKeyDetailPage;