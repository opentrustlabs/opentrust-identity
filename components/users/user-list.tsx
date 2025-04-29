"use client";
import React, { useContext } from "react";
import { ObjectSearchResultItem } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { ResultListProps } from "../layout/search-result-list-layout";


const UserResultList: React.FC<ResultListProps> = ({
    searchResults
}) => {


    // CONTEXT HOOKS
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
    
    return (
        <div>
            {c.isMedium &&
                <>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >                            
                            <Grid2 size={9}>User Name</Grid2>
                            <Grid2 size={2}>Enabled</Grid2>
                            <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No users to display
                            </Grid2>
                        </Typography>
                    }
                    {searchResults.resultlist.map(
                        (user: ObjectSearchResultItem) => (
                            <Typography key={`${user.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>                                    
                                    <Grid2 size={9}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.objectid}`}>{user.name}</Link></Grid2>
                                    <Grid2 size={2}>
                                        {user.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={1}>
                                        {mapViewExpanded.has(user.objectid) &&
                                            <UnfoldLessOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => removeExpanded(user.objectid)}
                                            />
                                        }
                                        {!mapViewExpanded.has(user.objectid) &&
                                            <UnfoldMoreOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => setExpanded(user.objectid)}
                                            />
                                        }
                                    </Grid2>
                                </Grid2>
                                {mapViewExpanded.has(user.objectid) &&
                                    <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>                                        
                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Email</Grid2>
                                            <Grid2 size={12} >{user.email}</Grid2>
                                        </Grid2>

                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{ textDecoration: "underline" }} size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{ marginRight: "8px" }}>{user.objectid}</div><ContentCopyIcon /></Grid2>
                                        </Grid2>
                                    </Grid2>
                                }
                            </Typography>
                        )
                    )}
                </>
            }
            {!c.isMedium &&
                <Grid2 size={12}>
                    <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >                            
                            <Grid2 size={3.0}>User Name</Grid2>
                            <Grid2 size={4}>Email</Grid2>
                            <Grid2 size={1}>Enabled</Grid2>
                            <Grid2 size={3.5}>Object ID</Grid2>
                            <Grid2 size={0.5}></Grid2>
                            
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No users to display
                            </Grid2>
                        </Typography>
                    }

                    {searchResults.resultlist.map(
                        (user: ObjectSearchResultItem) => (
                            <Typography key={`${user.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>                                
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>                                    
                                    <Grid2 size={3.0}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/users/${user.objectid}`}>{user.name}</Link></Grid2>
                                    <Grid2 size={4}>{user.email}</Grid2>
                                    <Grid2 size={1}>
                                        {user.enabled &&
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={3.5} display={"inline-flex"} columnGap={1} ><div>{user.objectid}</div></Grid2>
                                    <Grid2 size={0.5} ><ContentCopyIcon /></Grid2>
                                </Grid2>
                                                               
                            </Typography>
                        )
                    )}
                    
                </Grid2>
            }
            
        </div>

    )
}

export default UserResultList;
