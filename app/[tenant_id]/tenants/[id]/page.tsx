"use client";
import ErrorComponent from '@/components/error/error-component';
import TenantDetail from '@/components/tenants/tenant-detail';
import { useParams } from 'next/navigation';
import React, { useContext } from "react";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE } from '@/utils/consts';
import { ERROR_CODES } from '@/lib/models/error';

const TenantDetailPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    const params = useParams();
    const tenantId = params?.id as string;
    
    if(!tenantId) return <ErrorComponent message={ERROR_CODES.EC00008.errorMessage} componentSize='lg' />    
    if(!containsScope([TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE], profile?.scope || [])) return <ErrorComponent message={ERROR_CODES.EC00184.errorMessage} componentSize='lg' />
    return (
        <TenantDetail tenantId={tenantId} />
    )
}

export default TenantDetailPage;