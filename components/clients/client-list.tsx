"use client";
import React, { useContext } from "react";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import { Divider, Grid2, Typography } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { ResultListProps } from "../layout/search-result-list-layout";



const ClientResultList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());

    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

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
            {

                c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={1}></Grid2>
                            <Grid2 size={8}>Client Name</Grid2>
                            <Grid2 size={2}>Enabled</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No clients to display
                            </Grid2>
                        </Typography>
                    }

                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={8}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/clients/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={2}>
                                        {item.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
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
                                            <Grid2 size={12}>{item.description}</Grid2>

                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Client Type</Grid2>
                                            <Grid2 size={12}>{item.subtype}</Grid2>

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
            {
                !c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={0.3}></Grid2>
                            <Grid2 size={2.7}>Client Name</Grid2>
                            <Grid2 size={3}>Description</Grid2>
                            <Grid2 size={2}>Client Type</Grid2>
                            <Grid2 size={1}>Enabled</Grid2>
                            <Grid2 size={3}>Object ID</Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No clients to display
                            </Grid2>
                        </Typography>
                    }

                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={2.7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/clients/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={3}>{item.description}</Grid2>
                                    <Grid2 size={2}>{item.subtype}</Grid2>
                                    <Grid2 size={1}>
                                        {item.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={3} display={"inline-flex"} columnGap={1} ><div>{item.objectid}</div><div><ContentCopyIcon /></div></Grid2>
                                </Grid2>
                            </Typography>

                        )
                    )}
                </>
            }
        </div>
    )

}

export default ClientResultList;