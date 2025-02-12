"use client";
import { RATE_LIMITS_QUERY } from "@/graphql/queries/oidc-queries";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { useQuery } from "@apollo/client";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import AddBoxIcon from '@mui/icons-material/AddBox';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import { RateLimitServiceGroup } from "@/graphql/generated/graphql-types";


const RateLimitList: React.FC = () => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    const [filterValue, setFilerValue] = React.useState("");

    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // GRAPHQL FUNCTION
    const { data, error, loading } = useQuery(RATE_LIMITS_QUERY, {
        variables: {
            tenantId: tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT ? tenantBean.getTenantMetaData().tenant.tenantId : null
        }
    });

    // HANDLER FUNCTIONS
    const handleFilterChange = (evt: any) => {
        setFilerValue(evt.target.value);
    }

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

    const arrBreadcrumbs = [];
    
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    
    arrBreadcrumbs.push({
        linkText: "Rate Limits",
        href: null
    });

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.stack || "Unknown Error Occurred."} componentSize='lg' />
    if (data) return (

        <main >
            <Typography component={"div"}>
                <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
                    <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                        <span>New Service Group</span>
                    </div>
                </Stack>
                <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"8px 0px 24px 0px"}>
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
                                <Grid2 size={10}>Service Group Name</Grid2>                                
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>
                        {data.getRateLimitServiceGroups.length < 1 &&
                            <Typography component={"div"} fontSize={"0.9em"}>
                                <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                    No service groups to display
                                </Grid2>
                            </Typography>
                        }

                        {data.getRateLimitServiceGroups.map(
                            (rateLimit: RateLimitServiceGroup) => (
                                <Typography key={`${rateLimit.servicegroupid}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={10}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/rate-limits/${rateLimit.servicegroupid}`}>{rateLimit.servicegroupname}</Link></Grid2>
                                        
                                        <Grid2 size={1}>
                                            {mapViewExpanded.has(rateLimit.servicegroupid) &&
                                                <UnfoldLessOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => removeExpanded(rateLimit.servicegroupid)}
                                                />
                                            }
                                            {!mapViewExpanded.has(rateLimit.servicegroupid) &&
                                                <UnfoldMoreOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => setExpanded(rateLimit.servicegroupid)}
                                                />
                                            }
                                        </Grid2>
                                    </Grid2>
                                    {mapViewExpanded.has(rateLimit.servicegroupid) &&
                                        <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                            <Grid2 size={1}></Grid2>
                                            <Grid2 size={11} container>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Description</Grid2>
                                                <Grid2 size={12}>{rateLimit.servicegroupdescription}</Grid2>
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                                <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{rateLimit.servicegroupid}</div><ContentCopyIcon /></Grid2>
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
                                <Grid2 size={2.7}>Service Group Name</Grid2>
                                <Grid2 size={5}>Service Group Description</Grid2>
                                <Grid2 size={3}>Object ID</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>
                        {data.getRateLimitServiceGroups.length < 1 &&
                            <Typography component={"div"} fontSize={"0.9em"}>
                                <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                    No service groups to display
                                </Grid2>
                            </Typography>
                        }

                        {data.getRateLimitServiceGroups.map(
                            (rateLimit: RateLimitServiceGroup) => (
                                <Typography key={`${rateLimit.servicegroupid}`} component={"div"} fontSize={"0.9em"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                        <Grid2 size={2.7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/rate-limits/${rateLimit.servicegroupid}`}>{rateLimit.servicegroupname}</Link></Grid2>
                                        <Grid2 size={5}>{rateLimit.servicegroupdescription}</Grid2>
                                        <Grid2 size={3}>{rateLimit.servicegroupid}</Grid2>                                        
                                        <Grid2 size={1} ><ContentCopyIcon /></Grid2>
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

export default RateLimitList;