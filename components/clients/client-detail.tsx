"use client";
import React, { useContext } from "react";
import { Divider, List, ListItem, Paper, Stack } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";

export interface ClientDetailProps {
    clientId: string
}
const ClientDetail: React.FC<ClientDetailProps> = ({ clientId }) => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    return (
        <Typography component={"div"} fontSize={"0.9em"}>
            <BreadcrumbComponent  breadCrumbs={[
                    {
                        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
                        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
                    },
                    {
                        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=clients`,
                        linkText: "Clients"
                    },
                    {
                        href: null,
                        linkText: "Prod Client For Amgen"
                    }
                ]} />
            <Grid2 container size={12} spacing={3} marginBottom={"16px"}>
                <Grid2 size={9}>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" size={12}>Basic Information</Grid2>
                        <Grid2 size={12}>
                            <Paper elevation={0} sx={{ padding: "8px" }}>
                                <div>Tenant Name</div>
                                <div>Pfizer Prod Tenant</div>
                                <div>Tenant Description</div>
                                <div>Pfizer Prod Tenant</div>
                                <div>Tenant Type</div>
                                <div>Services and User delegated permissions</div>
                                <div>Enabled</div>
                                <div>true</div>
                                <div>federated OIDC Constraint</div>
                                <div>Permissive</div>

                            </Paper>
                        </Grid2>
                        
                        <Grid2 className="detail-page-subheader" size={12}>Redirect URIs</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                            
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Access Control</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Authentication Groups</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                        </Grid2>

                    </Grid2>
                </Grid2>

                <Grid2 spacing={2} size={3}>
                    
                </Grid2>

            </Grid2>
        </Typography >
    )
}

export default ClientDetail;