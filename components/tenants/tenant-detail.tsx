"use client";
import React, { useContext } from "react";
import { Divider, List, ListItem, Paper, Stack } from "@mui/material";
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


    const {data, loading, error} = useQuery(
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

    if(loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if(error) return <ErrorComponent message={error.message} componentSize='lg' /> 

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
    if(tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT){
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
                <Grid2 size={9}>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" size={12}>Basic Information</Grid2>
                        <Grid2 size={12}>
                            <Paper elevation={0} >
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
                                <div>{JSON.stringify(tenant)}</div>
                            </Paper>

                        </Grid2>
                        
                        <Grid2 className="detail-page-subheader" size={12}>Authentication Configuration</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Login Failure Configuration</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                            
                        </Grid2>

                        

                        <Grid2 className="detail-page-subheader" size={12}>Password Configuration</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Anonymous User Configuration</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Legacy User Migration Configuration</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                        </Grid2>

                        <Grid2 className="detail-page-subheader" size={12}>Tenant Look And Feel</Grid2>
                        <Grid2 size={12}>
                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                        </Grid2>
                    </Grid2>
                </Grid2>

                <Grid2 spacing={2} size={3}>
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