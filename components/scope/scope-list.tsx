"use client";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import Typography from "@mui/material/Typography";
import { Divider, Grid2 } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import Link from "next/link";
import { ResultListProps } from "../layout/search-result-list-layout";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";


const ScopeList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    

    // HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

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


    /*
        TODO
        For users who belong to the root tenant, create a link to the scope detail page and
        for those who have scope delete permissions show a delete icon for those APPLICATION_MANAGEMENT
        use-types of scope

        For non-root tenants, do NOT create a link to the scope detail page.
        If a non-root user tries to access a scope detail page, return an access error message.
    */
    return (
        
        <main>  
            {!c.isMedium &&
                <>
                    <Typography  component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container spacing={2} marginBottom={"16px"}>                            
                            <Grid2 size={2.3}>Name</Grid2>
                            <Grid2 size={4}>Description</Grid2>
                            <Grid2 size={2}>Use</Grid2>
                            <Grid2 size={2.7}>Object ID</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No scope values to display
                            </Grid2>
                        </Typography>
                    }
                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={item.objectid} component={"div"} fontSize={"0.9em"} noWrap>
                                <Divider></Divider>
                                <Grid2 padding={"8px 0px 8px 0px"} container size={12} spacing={1}>                                    
                                    <Grid2 sx={{textOverflow: "ellipsis", overflow: "hidden", fontWeight: "bold"}} size={2.3}><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={4}>{item.description}</Grid2>
                                    <Grid2 size={2}>{item.subtype}</Grid2>
                                    <Grid2 sx={{textOverflow: "ellipsis", overflow: "hidden"}}  size={2.7}>{item.objectid}</Grid2>
                                    <Grid2 size={1}>
                                        <ContentCopyIcon 
                                            sx={{cursor: "pointer"}}
                                            onClick={() => {
                                                copyContentToClipboard(item.objectid, "Scope ID copied to clipboard");
                                            }}
                                        />
                                    </Grid2>
                                </Grid2>
                            </Typography>
                        )
                    )}
            
                </>
            }
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={11}>Name</Grid2>                                    
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No scope values to display
                            </Grid2>
                        </Typography>
                    }
                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    
                                    <Grid2 size={11} sx={{fontWeight: "bold"}}><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${item.objectid}`}>{item.name}</Link></Grid2>                                            
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
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Use</Grid2>
                                            <Grid2 size={12}>{item.subtype}</Grid2>
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{item.objectid}</div>
                                                <ContentCopyIcon 
                                                    sx={{cursor: "pointer"}}
                                                    onClick={() => {
                                                        copyContentToClipboard(item.objectid, "Scope ID copied to clipboard");
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
        </main>
    )
}

export default ScopeList;