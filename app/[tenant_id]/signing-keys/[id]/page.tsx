"use client";
import React, { useContext } from "react";
import { useParams } from 'next/navigation';
import { SIGNING_KEY_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import SigningKeyDetail from "@/components/signing-keys/signing-key-detail";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { CLIENT_READ_SCOPE, TENANT_READ_ALL_SCOPE } from "@/utils/consts";
import { ERROR_CODES } from "@/lib/models/error";


const SigningKeyDetailPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    
    const params = useParams();
    const signingKeyId = params?.id as string;

    const {data, loading, error} = useQuery(
        SIGNING_KEY_DETAIL_QUERY,
        {
            skip: !containsScope([TENANT_READ_ALL_SCOPE, CLIENT_READ_SCOPE], profile?.scope || []) || signingKeyId === null || signingKeyId === undefined,
            variables: {
                signingKeyId: signingKeyId
            },
            fetchPolicy: "no-cache"
        }
    )

    if(!containsScope([TENANT_READ_ALL_SCOPE, CLIENT_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={ERROR_CODES.EC00184.errorMessage} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error || !signingKeyId) return <ErrorComponent message={error ? error.message : ERROR_CODES.EC00015.errorMessage} componentSize='lg' />
    if (data && data.getSigningKeyById === null) return <ErrorComponent message={ERROR_CODES.EC00015.errorMessage} componentSize='lg' />

    return (
        <SigningKeyDetail signingKey={data.getSigningKeyById} />
    )



}

export default SigningKeyDetailPage;