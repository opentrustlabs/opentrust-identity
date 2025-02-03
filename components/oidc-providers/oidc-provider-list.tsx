"use client";
import { useQuery } from "@apollo/client";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import page from "@/app/page";
import { Client, FederatedOidcProvider, SearchResultType } from "@/graphql/generated/graphql-types";
import { FEDERATED_OIDC_PROVIDERS_QUERY } from "@/graphql/queries/oidc-queries";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { CLIENT_TYPES_DISPLAY, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Typography, Stack, TextField, InputAdornment, Divider, Grid2 } from "@mui/material";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import AddBoxIcon from '@mui/icons-material/AddBox';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

const FederatedOIDCProviderList: React.FC = () => {

    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());

    const { data, loading, error } = useQuery(FEDERATED_OIDC_PROVIDERS_QUERY, {
        variables: {
            tenantId: tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT ? tenantBean.getTenantMetaData().tenant.tenantId : null
        }
    });

    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);

    arrBreadcrumbs.push({
        linkText: "Federated OIDC Providers",
        href: null
    });


    // HANDLER FUNCTIONS
    const setExpanded = (section: string): void => {
        mapViewExpanded.set(section, true);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    const removeExpanded = (section: string): void => {
        mapViewExpanded.delete(section);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />

    return (
        <main >
            <Typography component={"div"}>
                <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                        <span>New Federated OIDC Provider</span>
                    </div>
                </Stack>
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <TextField
                            label={"Filter"}
                            size={"small"}
                            name={"filter"}                            
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CloseOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </div>
                </Stack>
                {c.isMedium &&
                    <>
                        <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                            <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                <Grid2 size={1}></Grid2>
                                <Grid2 size={8}>Name</Grid2>
                                <Grid2 size={2}>Type</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>
                        {data.getFederatedOIDCProviders.length < 1 &&
                            <Typography component={"div"} fontSize={"0.9em"}>
                                <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                    No OIDC providers to display
                                </Grid2>
                            </Typography>
                        }

                        {data.getFederatedOIDCProviders.map(
                            (oidcProvider: FederatedOidcProvider) => (
                                <Typography key={`${oidcProvider.federatedOIDCProviderId}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={8}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/oidc-providers/${oidcProvider.federatedOIDCProviderId}`}>{oidcProvider.federatedOIDCProviderName}</Link></Grid2>
                                        <Grid2 size={2}>
                                            
                                        </Grid2>
                                        <Grid2 size={1}>
                                            {mapViewExpanded.has(oidcProvider.federatedOIDCProviderId) &&
                                                <UnfoldLessOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => removeExpanded(oidcProvider.federatedOIDCProviderId)}
                                                />
                                            }
                                            {!mapViewExpanded.has(oidcProvider.federatedOIDCProviderId) &&
                                                <UnfoldMoreOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => setExpanded(oidcProvider.federatedOIDCProviderId)}
                                                />
                                            }
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(oidcProvider.federatedOIDCProviderId) &&
                                        <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                            <Grid2 size={1}></Grid2>
                                            <Grid2 size={11} container>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Description</Grid2>
                                                <Grid2 size={12}>{oidcProvider.federatedOIDCProviderDescription}</Grid2>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                                <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{oidcProvider.federatedOIDCProviderId}</div><ContentCopyIcon /></Grid2>
                                            </Grid2>
                                        </Grid2>
                                    }
                                </Typography>
                            )
                        )}
                    </>
                }
                {!c.isMedium &&
                    <>
                        <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                            <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                <Grid2 size={0.3}></Grid2>
                                <Grid2 size={2.7}>Name</Grid2>
                                <Grid2 size={3}>Description</Grid2>
                                <Grid2 size={2}>Type</Grid2>
                                <Grid2 size={2.6}>Object ID</Grid2>
                                <Grid2 size={0.4}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>
                        {data.getFederatedOIDCProviders.length < 1 &&
                            <Typography component={"div"} fontSize={"0.9em"}>
                                <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                    No OIDC providers to display
                                </Grid2>
                            </Typography>
                        }

                        {data.getFederatedOIDCProviders.map(
                            (oidcProvider: FederatedOidcProvider) => (
                                <Typography key={`${oidcProvider.federatedOIDCProviderId}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={2.7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/oidc-providers/${oidcProvider.federatedOIDCProviderId}`}>{oidcProvider.federatedOIDCProviderName}</Link></Grid2>
                                        <Grid2 size={3}>{oidcProvider.federatedOIDCProviderDescription}</Grid2>
                                        <Grid2 size={2}>{oidcProvider.federatedOIDCProviderType}</Grid2>                                        
                                        <Grid2 size={2.6}>{oidcProvider.federatedOIDCProviderId}</Grid2>
                                        <Grid2 size={0.4}><ContentCopyIcon /></Grid2>
                                    </Grid2>
                                </Typography>
                            )
                        )}
                    </>
                }

            </Typography>
        </main>

    )
}

export default FederatedOIDCProviderList;