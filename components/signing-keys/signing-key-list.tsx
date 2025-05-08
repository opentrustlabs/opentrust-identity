"use client";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { KEY_USE_DISPLAY } from "@/utils/consts";
import Typography from "@mui/material/Typography";
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import UnfoldMoreOutlinedIcon from "@mui/icons-material/UnfoldMoreOutlined";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Divider from "@mui/material/Divider";
import Grid2 from "@mui/material/Grid2";
import Link from "next/link";
import { ObjectSearchResultItem, SigningKey } from "@/graphql/generated/graphql-types";

import { ResultListProps } from "../layout/search-result-list-layout";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";


const SigningKeyList: React.FC<ResultListProps> = ({
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

    return (

        <main > 
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 size={1}></Grid2>
                            <Grid2 size={7}>Key Name</Grid2>
                            <Grid2 size={3}>Key Type</Grid2>                                
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No keys to display
                            </Grid2>
                        </Typography>
                    }
                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/signing-keys/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={3}>{item.subtype}</Grid2>
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

                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Status</Grid2>
                                            <Grid2 size={12}>{item.enabled === true ? "ACTIVE" : "REVOKED"}</Grid2>

                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Key Use</Grid2>
                                            <Grid2 size={12}>{item.description}</Grid2>


                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{item.objectid}</div>
                                                <ContentCopyIcon 
                                                    sx={{cursor: "pointer"}}
                                                    onClick={() => {
                                                        copyContentToClipboard(item.objectid, "Key ID copied to clipboard");
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
                            <Grid2 size={3}>Key Name</Grid2>
                            <Grid2 size={2}>Key Type</Grid2>
                            <Grid2 size={2}>Key Use</Grid2>
                            <Grid2 size={1}>Status</Grid2>
                            <Grid2 size={3}>Object ID</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>

                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>                                    
                                    <Grid2 size={3}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/signing-keys/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={2}>{item.subtypekey}</Grid2>
                                    <Grid2 size={2}>{KEY_USE_DISPLAY.get(item.description || "")}</Grid2>
                                    <Grid2 size={1}>{item.enabled === true ? "ACTIVE" : "REVOKED"}</Grid2>
                                    <Grid2 size={3}>{item.objectid}</Grid2>                                    
                                    <Grid2 size={1}>
                                        <ContentCopyIcon 
                                            sx={{cursor: "pointer"}}
                                            onClick={() => {
                                                copyContentToClipboard(item.objectid, "Key ID copied to clipboard");
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

export default SigningKeyList