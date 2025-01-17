"use client";
import { useParams } from 'next/navigation';
import React from "react";

const TenantDetail: React.FC = () => {

    const params = useParams();
    const tenantId = params?.id as string;

    return (

        <div>Tenant id is {tenantId}</div>
    )
}

export default TenantDetail;