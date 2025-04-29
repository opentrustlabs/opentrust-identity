"use client";
import React, { useContext } from "react";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import { Divider, Grid2, Typography } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { ResultListProps } from "../layout/search-result-list-layout";


const AuthenticationGroupList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);


    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());

    
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

    // Only show the owning tenant link when we are in the root tenant. 
    const isRootTenant = tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT;

    return (
        <>
            

            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={11}>Group Name</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No groups to display
                            </Grid2>
                        </Typography>
                    }

                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (

                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={11}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authentication-groups/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={1}>
                                        {mapViewExpanded.has(item.objectid) &&
                                            <UnfoldLessOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => removeExpanded(item.objectid)}
                                            />
                                        }
                                        {!mapViewExpanded.has(item.objectid) &&
                                            <UnfoldMoreOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => setExpanded(item.objectid)}
                                            />
                                        }
                                    </Grid2>
                                </Grid2>
                                {mapViewExpanded.has(item.objectid) &&
                                    <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Description</Grid2>
                                            <Grid2 size={12}>{item.description || "No description provided"}</Grid2>
                                            {isRootTenant &&
                                                <>
                                                    <Grid2 sx={{ textDecoration: "underline" }} size={12}>Tenant</Grid2>
                                                    <Grid2 size={12}>
                                                        <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${item.owningtenantid}`} target="_blank">
                                                            <OpenInNewOutlinedIcon
                                                                sx={{cursor: "pointer"}}
                                                            />
                                                        </Link>
                                                    </Grid2>
                                                </>
                                            }
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{item.objectid}</div><ContentCopyIcon /></Grid2>
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
                            <Grid2 size={3}>Group Name</Grid2>
                            <Grid2 size={isRootTenant ? 4.5 : 5.5}>Description</Grid2>
                            {isRootTenant &&
                                <>
                                    <Grid2 size={1}>Tenant</Grid2>
                                </>
                            }
                            <Grid2 size={3}>Object ID</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No groups to display
                            </Grid2>
                        </Typography>
                    }

                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={3}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authentication-groups/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={isRootTenant ? 4.5 : 5.5}>{item.description}</Grid2>
                                    {isRootTenant &&
                                        <>
                                            <Grid2 size={1}>
                                                <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${item.owningtenantid}`} target="_blank">
                                                    <OpenInNewOutlinedIcon
                                                        sx={{cursor: "pointer"}}
                                                    />
                                                </Link>
                                            </Grid2>
                                        </>
                                    }
                                    <Grid2 size={3}>{item.objectid}</Grid2>
                                    <Grid2 size={0.5}><ContentCopyIcon /></Grid2>
                                </Grid2>
                            </Typography>

                        )
                    )}
                </>
            }
        </>
    )
}

export default AuthenticationGroupList;