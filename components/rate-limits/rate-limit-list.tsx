"use client";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import Typography from "@mui/material/Typography";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import { ResultListProps } from "../layout/search-result-list-layout";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";


const RateLimitList: React.FC<ResultListProps> = ({
    searchResults
})  => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());

    // CONTEXT HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

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

        <main >
            
                {c.isMedium &&
                    <>
                        <Typography component={"div"} fontWeight={"bold"} >
                            <Grid2 container size={12} spacing={1} marginBottom={"16px"} >                                
                                <Grid2 size={11}>Service Group Name</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>
                        {searchResults.total < 1 &&
                            <Typography component={"div"} fontSize={"0.9em"}>
                                <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                    No service groups to display
                                </Grid2>
                            </Typography>
                        }
                        {searchResults.resultlist.map(
                            (item: ObjectSearchResultItem) => (
                                <Typography key={`${item.objectid}`} component={"div"}>
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={11}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/rate-limits/${item.objectid}`}>{item.name}</Link></Grid2>
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
                                                <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                                <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{item.objectid}</div>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            copyContentToClipboard(item.objectid, "Service Group ID copied to clipboard");
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
                        <Typography component={"div"} fontWeight={"bold"} >
                            <Grid2 container size={12} spacing={1} marginBottom={"16px"} >                                
                                <Grid2 size={3}>Service Group Name</Grid2>
                                <Grid2 size={5}>Service Group Description</Grid2>
                                <Grid2 size={3}>Object ID</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                        </Typography>
                        <Divider></Divider>
                        {searchResults.total < 1 &&
                            <Typography component={"div"} fontSize={"0.9em"}>
                                <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                    No service groups to display
                                </Grid2>
                            </Typography>                         
                        }

                        {searchResults.resultlist.map(
                            (item: ObjectSearchResultItem) => (
                                <Typography key={`${item.objectid}`} component={"div"} >
                                    <Divider></Divider>
                                    <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                        <Grid2 size={3}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/rate-limits/${item.objectid}`}>{item.name}</Link></Grid2>
                                        <Grid2 size={5}>{item.description}</Grid2>
                                        <Grid2 size={3}>{item.objectid}</Grid2>                                        
                                        <Grid2 size={1} >
                                            <ContentCopyIcon 
                                                sx={{cursor: "pointer"}}
                                                onClick={() => {
                                                    copyContentToClipboard(item.objectid, "Service Group ID copied to clipboard");
                                                }}
                                            />
                                        </Grid2>
                                    </Grid2>
                                </Typography>
                            )
                        )}
                    </>
                }

            
        </main>
    )
}

export default RateLimitList;