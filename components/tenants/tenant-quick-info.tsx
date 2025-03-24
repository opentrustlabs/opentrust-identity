"use client";
import { TENANT_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { Divider } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import React from "react";



export interface TenantQuickInfoProps {
    tenantId: string | null
}

const TenantQuickInfo: React.FC<TenantQuickInfoProps> = ({
    tenantId
}) => {

    const {data, loading, error} = useQuery(TENANT_DETAIL_QUERY, {
        variables: {
            tenantId: tenantId
        },
        skip: tenantId === null
    });

    return (
        <Grid2 container size={12}>
            {tenantId === null &&
                <Grid2 size={12}>
                    <Grid2>Unable to retrieve tenant information</Grid2>
                </Grid2>
            }
            {data &&
                <Grid2 size={12}>
                    <Typography component={"div"}>
                        <Grid2 fontWeight={"bold"} marginBottom={"8px"} container size={12} spacing={2}>
                            <Grid2 size={5}>Tenant Name</Grid2>
                            <Grid2 size={7}>Tenant Description</Grid2>
                        </Grid2>
                        <Divider />
                        <Grid2 marginTop={"8px"} container size={12} spacing={2}>                            
                            <Grid2 size={5}>{data.getTenantById.tenantName}</Grid2>
                            <Grid2 size={7}>{data.getTenantById.tenantDescription}</Grid2>
                        </Grid2>
                    </Typography>
                </Grid2>
            }
            {error &&
                <Grid2 size={12}>
                    <Grid2>Unable to retrieve tenant information</Grid2>
                </Grid2>
            }
            {loading &&
                <div>...</div>
            }
        </Grid2>
    )
}

export default TenantQuickInfo;