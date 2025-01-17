"use client";
import React from "react";

export interface TenantDetailProps {
    tenantId: string
}
const TenantDetail: React.FC<TenantDetailProps> = ({tenantId}) => {


    return (
        <div>Tenant Id is {tenantId}</div>
    )
}

export default TenantDetail;