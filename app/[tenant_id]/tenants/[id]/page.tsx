"use client";
import ErrorComponent from '@/components/error/error-component';
import TenantDetail from '@/components/tenants/tenant-detail';
import { useParams } from 'next/navigation';
import React from "react";

const TenantDetailPage: React.FC = () => {

    const params = useParams();
    const tenantId = params?.id as string;
    
    if(!tenantId) return <ErrorComponent message={"Tenant not found"} componentSize='lg' />    
    return (
        <TenantDetail tenantId={tenantId} />
    )
}

export default TenantDetailPage;