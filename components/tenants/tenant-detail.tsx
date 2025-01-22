"use client";
import React, { useContext } from "react";
import { Checkbox, Divider, List, ListItem, Paper, Stack, TextField } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Tenant } from "@/graphql/generated/graphql-types";
import { useQuery } from "@apollo/client";
import { TENANT_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";

export interface TenantDetailProps {
    tenantId: string
}
const TenantDetail: React.FC<TenantDetailProps> = ({ tenantId }) => {


    const { data, loading, error } = useQuery(
        TENANT_DETAIL_QUERY,
        {
            skip: tenantId === null || tenantId === undefined,
            variables: {
                tenantId: tenantId
            },
            onError(error) {

            },
        }

    );

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='lg' />

    return <InnerComponent tenant={data.getTenantById} />
}

interface InnerComponentProps {
    tenant: Tenant
}

const InnerComponent: React.FC<InnerComponentProps> = ({
    tenant
}) => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    const arrBreadcrumbs = [];
    if (tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT) {
        arrBreadcrumbs.push({
            href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
            linkText: `Tenant List`
        })
    }
    arrBreadcrumbs.push({
        linkText: tenant.tenantName,
        href: null
    });

    return (

        <Typography component={"div"} fontSize={"0.9em"}>
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />

            <Grid2 container size={12} spacing={3} marginBottom={"16px"}>
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" size={12}>Basic Information</Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={3}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Name</div>
                                            <TextField name="tenantName" id="tenantName" value={tenant.tenantName} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Descripton</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={tenant.tenantDescription} fullWidth={true} size="small" multiline={true} rows={2} />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Type</div>
                                            <TextField name="tenantType" id="tenantType" value={tenant.tenantType} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>External OIDC Provider Constraint</div>
                                            <TextField name="tenantType" id="tenantType" value={tenant.tenantType} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Claims supported</div>
                                            <TextField name="tenantType" id="tenantType" value={tenant.tenantType} fullWidth={true} size="small" />
                                        </Grid2>

                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 borderLeft={"dotted 1px lightgrey"} paddingLeft={"8px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={6}>Enabled</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Mark for delete</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Allow unlimited rate</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Allow user self-registration</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Allow anonymous users</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Allow social login</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Verify email on registration</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Migrate legacy users</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Allow login by phone number</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={6}>Allow password recovery</Grid2>
                                            <Grid2 size={6}><Checkbox /></Grid2>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                            </Paper>
                        </Grid2>


                        <Grid2 className="detail-page-subheader" size={12}>Login Failure Configuration</Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={3}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 marginBottom={"16px"} size={{sm: 12, xs: 12, md: 12, lg: 6, xl: 6}} >
                                        <div>Login Failure Policy Type</div>
                                        <TextField name="tenantType" id="tenantType" value={"Lock"} fullWidth={true} size="small" />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"} size={{sm: 12, xs: 12, md: 12, lg: 6, xl: 6}} >
                                        <div>Failure Threshold</div>
                                        <TextField name="tenantType" id="tenantType" value={"6"} fullWidth={true} size="small" />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"} size={{sm: 12, xs: 12, md: 12, lg: 6, xl: 6}} >
                                        <div>Pause Duration (in minutes)</div>
                                        <TextField name="tenantType" id="tenantType" value={"30"} fullWidth={true} size="small" />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"} size={{sm: 12, xs: 12, md: 12, lg: 6, xl: 6}} >
                                        <div>Number of pause cycles before locking</div>
                                        <TextField name="tenantType" id="tenantType" value={"5"} fullWidth={true} size="small" />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"} size={{sm: 12, xs: 12, md: 12, lg: 6, xl: 6}} >
                                        <div>Initial backoff duration (in minutes)</div>
                                        <TextField name="tenantType" id="tenantType" value={"4"} fullWidth={true} size="small" />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"} size={{sm: 12, xs: 12, md: 12, lg: 6, xl: 6}} >
                                        <div>Number of backoff cycles before locking</div>
                                        <TextField name="tenantType" id="tenantType" value={"4"} fullWidth={true} size="small" />
                                    </Grid2>
                                </Grid2>

                            </Paper>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Password Configuration</Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={3}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                            </Paper>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Anonymous User Configuration</Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={3}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                            </Paper>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Legacy User Migration Configuration</Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={3}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                            </Paper>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Tenant Look And Feel</Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={3}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                            </Paper>
                        </Grid2>
                    </Grid2>
                </Grid2>

                <Grid2 spacing={2} size={{ xs: 12, sm: 12, md: 12, lg: 3, xl: 3 }}>
                    <Grid2 container spacing={2} size={12}>
                        <Grid2 size={12} >
                            <div className="detail-page-subheader">Tenant Management Domains</div>
                            <Paper elevation={3} sx={{ padding: "8px" }}>
                                <List>
                                    <ListItem disablePadding>opentrust.org</ListItem>
                                    <ListItem disablePadding>opentrust.com</ListItem>
                                    <ListItem disablePadding>megacorp.com</ListItem>
                                    <ListItem disablePadding><MoreHorizOutlinedIcon /></ListItem>
                                </List>

                                <Divider />
                                <Stack direction={"row"} flexDirection={"row-reverse"} >
                                    <EditOutlinedIcon />
                                </Stack>
                            </Paper>

                        </Grid2>


                        <Grid2 size={12}>
                            <div className="detail-page-subheader">Tenant Authentication Domains</div>
                            <Paper elevation={3} sx={{ padding: "8px" }}>
                                <List>
                                    <ListItem disablePadding>opentrust.org</ListItem>
                                    <ListItem disablePadding>opentrust.com</ListItem>
                                    <ListItem disablePadding>megacorp.com</ListItem>
                                </List>

                                <Divider />
                                <Stack direction={"row"} flexDirection={"row-reverse"} >
                                    <EditOutlinedIcon />
                                </Stack>
                            </Paper>
                        </Grid2>


                        <Grid2 size={12}>
                            <div className="detail-page-subheader">Federated OIDC Providers</div>
                            <Paper elevation={3} sx={{ padding: "8px" }}>
                                <List>
                                    <ListItem disablePadding>opentrust.org</ListItem>
                                    <ListItem disablePadding>opentrust.com</ListItem>
                                    <ListItem disablePadding>megacorp.com</ListItem>
                                </List>

                                <Divider />
                                <Stack direction={"row"} flexDirection={"row-reverse"} >
                                    <EditOutlinedIcon />
                                </Stack>
                            </Paper>
                        </Grid2>


                        <Grid2 size={12}>
                            <div className="detail-page-subheader">Social Identity Providers</div>
                            <Paper elevation={3} sx={{ padding: "8px" }}>
                                <List>
                                    <ListItem disablePadding>opentrust.org</ListItem>
                                    <ListItem disablePadding>opentrust.com</ListItem>
                                    <ListItem disablePadding>megacorp.com</ListItem>
                                </List>

                                <Divider />
                                <Stack direction={"row"} flexDirection={"row-reverse"} paddingTop={"8px"} >
                                    <EditOutlinedIcon />
                                </Stack>
                            </Paper>
                        </Grid2>
                    </Grid2>
                </Grid2>

            </Grid2>
        </Typography >
    )
}

export default TenantDetail;