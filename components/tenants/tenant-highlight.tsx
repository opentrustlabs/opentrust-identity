"use client";
import { TENANT_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React, { useContext } from "react";
import { TenantDetailProps } from "./tenant-detail";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";

const TenantHighlight: React.FC<TenantDetailProps> = ({tenantId}) => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    const { data, loading, error } = useQuery(
        TENANT_DETAIL_QUERY,
        {
            variables: {
                tenantId: tenantId
            }
        }
    );

    if (loading) return <div />
    if (error) return <div />
    if(data)
        return (
            <Typography component={"div"} fontWeight={"bold"} >
               <span>Tenant: </span>
                <span><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${data.getTenantById.tenantId}`}>{data.getTenantById.tenantName}</Link></span>
            </Typography>
        )   
    
    return <></>
}

export default TenantHighlight;