"use client";
import React, { useContext } from "react";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import { Divider, Grid2, Typography } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { ResultListProps } from "../layout/search-result-list-layout";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";


const TenantResultList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

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

    return (
        <div>
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={9}>Tenant Name</Grid2>
                            <Grid2 size={2}>Enabled</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>

                    {searchResults.resultlist.map(
                        (tenant: ObjectSearchResultItem) => (
                            <Typography key={`${tenant.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={9}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${tenant.objectid}`}>{tenant.name}</Link></Grid2>
                                    <Grid2 size={2}>
                                        {tenant.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={1}>
                                        {mapViewExpanded.has(tenant.objectid) &&
                                            <UnfoldLessOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => removeExpanded(tenant.objectid)}
                                            />
                                        }
                                        {!mapViewExpanded.has(tenant.objectid) &&
                                            <UnfoldMoreOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => setExpanded(tenant.objectid)}
                                            />
                                        }
                                    </Grid2>
                                </Grid2>
                                {mapViewExpanded.has(tenant.objectid) &&
                                    <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Description</Grid2>
                                            <Grid2 size={12}>{tenant.description}</Grid2>

                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Tenant Type</Grid2>
                                            <Grid2 size={12}>{tenant.subtype}</Grid2>

                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{tenant.objectid}</div>
                                                <ContentCopyIcon 
                                                    onClick={() => {
                                                        copyContentToClipboard(tenant.objectid, "Tenant ID copied to clipboard");
                                                    }}
                                                />
                                            </Grid2>
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
                            <Grid2 size={2}>Tenant Name</Grid2>
                            <Grid2 size={3.6}>Tenant Description</Grid2>
                            <Grid2 size={2}>Tenant Type</Grid2>
                            <Grid2 size={1}>Enabled</Grid2>
                            <Grid2 size={3}>Object ID</Grid2>
                            <Grid2 size={0.4}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>

                    {searchResults.resultlist.map(
                        (tenant: ObjectSearchResultItem) => (
                            <Typography key={`${tenant.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={2}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${tenant.objectid}`}>{tenant.name}</Link></Grid2>
                                    <Grid2 size={3.6}>{tenant.description}</Grid2>
                                    <Grid2 size={2}>{tenant.subtype}</Grid2>
                                    <Grid2 size={1}>
                                        {tenant.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={3} columnGap={1} >{tenant.objectid}</Grid2>
                                    <Grid2 size={0.4}>
                                        <ContentCopyIcon 
                                            sx={{cursor: "pointer"}}
                                            onClick={() => {
                                                copyContentToClipboard(tenant.objectid, "Tenant ID copied to clipboard");
                                            }}
                                        
                                        />
                                    </Grid2>
                                </Grid2>
                            </Typography>
                        )
                    )}
                </>
            }
        </div>

    )
}

export default TenantResultList;