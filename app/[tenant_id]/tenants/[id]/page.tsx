"use client";
import TenantDetail from '@/components/tenants/tenant-detail';
import { useParams } from 'next/navigation';
import React from "react";

const TenantDetailPage: React.FC = () => {

    const params = useParams();
    const tenantId = params?.id as string;

    return (
        <TenantDetail tenantId={tenantId} />
    )
}

export default TenantDetailPage;