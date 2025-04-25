"use client";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { ObjectSearchResultItem, SearchResultType } from "@/graphql/generated/graphql-types";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { Typography,  Divider, Grid2 } from "@mui/material";
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import UnfoldLessOutlinedIcon from '@mui/icons-material/UnfoldLessOutlined';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { ResultListProps } from "../layout/search-result-list-layout";
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import PolicyIcon from '@mui/icons-material/Policy';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import SpeedIcon from '@mui/icons-material/Speed';

const SearchResultList: React.FC<ResultListProps> = ({
    searchResults
}) => {

    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);

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

    const getUriSection = (objectType: SearchResultType): string => {
        switch (objectType) {            
            case SearchResultType.AccessControl : {
                return "scope-access-control";                                
            }
            case SearchResultType.AuthenticationGroup : {
                return "authentication-groups";
            }
            case SearchResultType.AuthorizationGroup: {
                return "authorization-groups"
            }
            case SearchResultType.Client : {
                return "clients";
            }
            case SearchResultType.Key : {
                return "signing-keys"
            }
            case SearchResultType.OidcProvider : {
                return "oidc-providers";
            }
            case SearchResultType.RateLimit : {
                return "rate-limits";
            }
            case SearchResultType.Tenant : {
                return "tenants"
            }
            case SearchResultType.User : {
                return "users"
            }
            default: {
                return ""
            }

        }
    }

    const getObjectTypeIcon = (objectType: SearchResultType) => {
        if(objectType === SearchResultType.AccessControl){
            return (
                <PolicyIcon />
            )
        }
        else if(objectType === SearchResultType.AuthenticationGroup){
            return (
                <GroupIcon />
            )
        }
        else if(objectType === SearchResultType.AuthorizationGroup){
            return (
                <PeopleIcon />
            )
        }
        else if(objectType === SearchResultType.Client){
            return (
                <SettingsSystemDaydreamIcon />
            )
        }
        else if(objectType === SearchResultType.Key){
            return (
                <KeyIcon />
            )
        }
        else if(objectType === SearchResultType.OidcProvider){
            return (
                <AutoAwesomeMosaicIcon />
            )
        }
        else if(objectType === SearchResultType.RateLimit){
            return (
                <SpeedIcon />
            )
        }
        else if(objectType === SearchResultType.Tenant){
            return (
                <SettingsApplicationsIcon />
            )
        }
        else if(objectType === SearchResultType.User){
            return (
                <PersonIcon />
            )
        }
        else {
            return (
                <></>
            )
        }
    }

    return (
        <>
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
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No records to display
                            </Grid2>
                        </Typography>
                    }

                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={8}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/${getUriSection(item.objecttype)}/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={2}>{item.subtype}</Grid2>
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
                            <Grid2 size={0.3}></Grid2>
                            <Grid2 size={2.7}>Name</Grid2>
                            <Grid2 size={3}>Description</Grid2>
                            <Grid2 size={2}>Type</Grid2>
                            <Grid2 size={2.6}>Object ID</Grid2>
                            <Grid2 size={0.4}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
                    {searchResults.total < 1 &&
                        <Typography component={"div"} fontSize={"0.9em"}>
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No records to display
                            </Grid2>
                        </Typography>
                    }

                    {searchResults.resultlist.map(
                        (item: ObjectSearchResultItem) => (
                            <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>
                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={0.3}>{getObjectTypeIcon(item.objecttype)}</Grid2>
                                    <Grid2 size={2.7}><Link style={{ color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/${getUriSection(item.objecttype)}/${item.objectid}`}>{item.name}</Link></Grid2>
                                    <Grid2 size={3}>{item.description}</Grid2>
                                    <Grid2 size={2}>{item.subtype}</Grid2>
                                    <Grid2 size={2.6}>{item.objectid}</Grid2>
                                    <Grid2 size={0.4}><ContentCopyIcon /></Grid2>
                                </Grid2>
                            </Typography>
                        )
                    )}
                </>
            }

        </>

    )
}

export default SearchResultList;