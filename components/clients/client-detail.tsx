"use client";
import React, { useContext } from "react";
import { Button, Checkbox, Divider, Paper, Stack, TextField } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Client } from "@/graphql/generated/graphql-types";
import AddBoxIcon from '@mui/icons-material/AddBox';

export interface ClientDetailProps {
    client: Client
}
const ClientDetail: React.FC<ClientDetailProps> = ({ client }) => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    return (
        <Typography component={"div"} fontSize={"0.9em"}>
            <BreadcrumbComponent breadCrumbs={[
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
                    linkText: client.clientName
                }
            ]} />
            <Grid2 container size={12} spacing={3} marginBottom={"16px"}>
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" size={12}>Overview</Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            <Paper elevation={1} sx={{ padding: "8px" }}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Name</div>
                                            <TextField name="tenantName" id="tenantName" value={client.clientName} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Descripton</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={client.clientDescription} fullWidth={true} size="small" multiline={true} rows={2} />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Type</div>
                                            <TextField name="tenantType" id="tenantType" value={client.clientType} fullWidth={true} size="small" />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 borderLeft={"dotted 1px lightgrey"} paddingLeft={"8px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={10}>Enabled</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>OIDC (SSO) Enabled</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>PKCE Enabled</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>

                                            <Grid2 marginTop={"16px"} alignContent={"center"} size={12}>User Token TTL (Seconds)</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField name="tenantType" id="tenantType" value={"30"} fullWidth={true} size="small" />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={12}>Client Token TTL (Seconds)</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField name="tenantType" id="tenantType" value={"30"} fullWidth={true} size="small" />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={12}>Max Refresh Token Count</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField name="tenantType" id="tenantType" value={"30"} fullWidth={true} size="small" />
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>

                                <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    <Button sx={{ border: "solid 1px lightgrey", borderRadius: "4px", color: "black" }} >Update</Button>
                                </Stack>
                            </Paper>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Redirect URIs</Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            <Typography component={"div"} fontWeight={"bold"} >
                                <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                    <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                        <div style={{ display: "inline-flex", alignItems: "center" }}>
                                            <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                            <span>New Redirect URI</span>
                                        </div>
                                    </Stack>
                                </Grid2>
                            </Typography>
                            <Divider></Divider>
                            {["http://localhost:8080/oidc/return", "https://qa.opentrust.org/oidc/return"].map(
                                (uri: string) => (
                                    <Typography key={`${uri}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                        <Divider></Divider>
                                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                            <Grid2 size={11}>{uri}</Grid2>
                                            <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                        </Grid2>
                                    </Typography>
                                )
                            )}
                            <Divider></Divider>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Authentication Groups</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Access Control</Grid2>
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