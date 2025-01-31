"use client";
import React, { useContext } from "react";
import { AuthenticationGroup } from "@/graphql/generated/graphql-types";
import { AUTHENTICATION_GROUPS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { Divider, Grid2, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";


const AuthenticationGroupList: React.FC = () => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    const [filterValue, setFilerValue] = React.useState("");
    // HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // GRAPHQL FUNCTION
    const { data, error, loading } = useQuery(AUTHENTICATION_GROUPS_QUERY, {

    });

    // HANDLER FUNCTIONS

    const handleFilterChange = (evt: any) => {
        setFilerValue(evt.target.value);
    }

    const isExpanded = (section: string): boolean => {
        console.log("is expanded")
        if (mapViewExpanded.has(section)) {
            return true;
        }
        return false;
    }

    const setExpanded = (section: string): void => {
        console.log("set is expanded")
        mapViewExpanded.set(section, true);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    const removeExpanded = (section: string): void => {
        console.log("remove is expanded")
        mapViewExpanded.delete(section);
        const newMap = new Map(mapViewExpanded)
        setMapViewExpanded(newMap);
    }

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />
    if (data) return (

        <main >
            <Typography component={"div"}>
                <BreadcrumbComponent breadCrumbs={[
                    {
                        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
                        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
                    },
                    {
                        href: null,
                        linkText: "Authentication Groups"
                    }
                ]} />
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                        <span>New Authentication Group</span>
                    </div>
                </Stack>
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <TextField
                            label={"Filter"}
                            size={"small"}
                            name={"filter"}
                            value={filterValue}
                            onChange={handleFilterChange}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CloseOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => setFilerValue("")}
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
                                <Grid2 size={8}>Group Name</Grid2>
                                <Grid2 size={2}>Default</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>

                        {data.getAuthenticationGroups.map(
                            (authenticationGroup: AuthenticationGroup) => (
                                <Typography key={`${authenticationGroup.authenticationGroupId}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={8}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authentication-groups/${authenticationGroup.authenticationGroupId}`}>{authenticationGroup.authenticationGroupName}</Link></Grid2>
                                        <Grid2 size={2}>
                                            {authenticationGroup.defaultGroup &&
                                                <CheckOutlinedIcon />
                                            }</Grid2>
                                        <Grid2 size={1}>
                                            {mapViewExpanded.has(authenticationGroup.authenticationGroupId) &&
                                                <UnfoldLessOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => removeExpanded(authenticationGroup.authenticationGroupId)}
                                                />
                                            }
                                            {!mapViewExpanded.has(authenticationGroup.authenticationGroupId) &&
                                                <UnfoldMoreOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => setExpanded(authenticationGroup.authenticationGroupId)}
                                                />
                                            }
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(authenticationGroup.authenticationGroupId) &&
                                        <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                            <Grid2 size={1}></Grid2>
                                            <Grid2 size={11} container>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Description</Grid2>
                                                <Grid2 size={12}>{authenticationGroup.authenticationGroupDescription || "No description provided"}</Grid2>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Tenant</Grid2>
                                                <Grid2 size={12}><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authentication-groups/${authenticationGroup.authenticationGroupId}`}>{authenticationGroup.tenantId}</Link></Grid2>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                                <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{authenticationGroup.authenticationGroupId}</div><ContentCopyIcon /></Grid2>
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
                                <Grid2 size={2.3}>Group Name</Grid2>
                                <Grid2 size={3.4}>Description</Grid2>
                                <Grid2 size={1}>Is Default</Grid2>
                                <Grid2 size={2}>Tenant</Grid2>
                                <Grid2 size={2.5}>Object ID</Grid2>
                                <Grid2 size={0.5}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>

                        {data.getAuthenticationGroups.map(
                            (authenticationGroup: AuthenticationGroup) => (
                                <Typography key={`${authenticationGroup.authenticationGroupId}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={2.3}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authentication-groups/${authenticationGroup.authenticationGroupId}`}>{authenticationGroup.authenticationGroupName}</Link></Grid2>
                                        <Grid2 size={3.4}>{authenticationGroup.authenticationGroupDescription}</Grid2>
                                        <Grid2 size={1}>
                                            {authenticationGroup.defaultGroup &&
                                                <CheckOutlinedIcon />
                                            }
                                        </Grid2>
                                        <Grid2 size={2}><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${authenticationGroup.tenantId}`}>{authenticationGroup.tenantId}</Link></Grid2>
                                        <Grid2 size={2.5}>{authenticationGroup.authenticationGroupId}</Grid2>
                                        <Grid2 size={0.5}><ContentCopyIcon /></Grid2>
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

export default AuthenticationGroupList;