"use client";
import React, { useContext } from "react";
import { AuthorizationGroup } from "@/graphql/generated/graphql-types";
import { AUTHORIZATION_GROUPS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { CircularProgress, Divider, Grid2, InputAdornment, Stack, TextField, Typography } from "@mui/material";
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


const AuthorizationGroupList: React.FC = () => {

    // STATE VARIABLES
    const [mapViewExpanded, setMapViewExpanded] = React.useState(new Map());
    const [filterValue, setFilerValue] = React.useState("");
    // HOOKS
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);
    
    // GRAPHQL FUNCTION
    const {data, error, loading } = useQuery(AUTHORIZATION_GROUPS_QUERY, {

    });

    // HANDLER FUNCTIONS

    const handleFilterChange = (evt: any) => {
        setFilerValue(evt.target.value);
    }

    const isExpanded = (section: string): boolean => {
        console.log("is expanded")
        if(mapViewExpanded.has(section)){
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

    if(loading) return <CircularProgress />
    if(error) return <div>There was an error. ${error.stack}</div>
    if(data) return (
      
        <main >
            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                <div style={{display: "inline-flex", alignItems: "center"}}>    
                    <AddBoxIcon sx={{marginRight: "8px", cursor: "pointer"}} />
                    <span>New Authorization Group</span>
                </div>                
            </Stack>
            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                <div style={{display: "inline-flex", alignItems: "center"}}>    
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
                                            sx={{cursor: "pointer"}}
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
            
                    {data.getAuthorizationGroups.map(
                        (authorizationGroup: AuthorizationGroup) => (
                            <Typography key={`${authorizationGroup.groupId}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>                        
                                <Grid2  margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={8}><Link style={{color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authorization-groups/${authorizationGroup.groupId}`}>{authorizationGroup.groupName}</Link></Grid2>
                                    <Grid2 size={2}>
                                        {authorizationGroup.default &&                                         
                                            <CheckOutlinedIcon />
                                        }</Grid2>
                                    <Grid2 size={1}>
                                        {mapViewExpanded.has(authorizationGroup.groupId) && 
                                            <UnfoldLessOutlinedIcon 
                                                sx={{cursor: "pointer"}}
                                                onClick={() => removeExpanded(authorizationGroup.groupId)}
                                            />
                                        }
                                        {!mapViewExpanded.has(authorizationGroup.groupId) &&
                                            <UnfoldMoreOutlinedIcon 
                                                sx={{cursor: "pointer"}}
                                                onClick={() => setExpanded(authorizationGroup.groupId)}
                                            />
                                        }                                        
                                    </Grid2>
                                </Grid2>
                                {mapViewExpanded.has(authorizationGroup.groupId) &&
                                    <Grid2 container size={12} spacing={0.5} marginBottom={"8px"}>
                                        <Grid2 size={1}></Grid2>
                                        <Grid2 size={11} container>
                                            <Grid2 sx={{textDecoration: "underline"}} size={12}>Tenant</Grid2>
                                            <Grid2 size={12}><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authorization-groups/${authorizationGroup.groupId}`}>{authorizationGroup.tenantId}</Link></Grid2>
                                            <Grid2 sx={{textDecoration: "underline"}}  size={12}>Object ID</Grid2>
                                            <Grid2 size={12} display={"inline-flex"}><div style={{marginRight: "8px"}}>{authorizationGroup.groupId}</div><ContentCopyIcon /></Grid2>
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
                                <Grid2 size={2.7}>Group Name</Grid2>
                                <Grid2 size={3}>Is Default</Grid2>
                                <Grid2 size={2}>Tenant</Grid2>                                
                                <Grid2 size={3}>Object ID</Grid2>
                                <Grid2 size={1}></Grid2>
                        </Grid2>
                    </Typography>
                    <Divider></Divider>
            
                    {data.getAuthorizationGroups.map(
                        (authorizationGroup: AuthorizationGroup) => (
                            <Typography key={`${authorizationGroup.groupId}`} component={"div"} fontSize={"0.9em"}>
                                <Divider></Divider>                        
                                <Grid2  margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                    <Grid2 size={0.3}><DeleteForeverOutlinedIcon /></Grid2>
                                    <Grid2 size={2.7}><Link style={{color: "", fontWeight: "bold", textDecoration: "underline" }} href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authorization-groups/${authorizationGroup.groupId}`}>{authorizationGroup.groupName}</Link></Grid2>
                                    <Grid2 size={3}>
                                        {authorizationGroup.default &&                                         
                                            <CheckOutlinedIcon />
                                        }
                                    </Grid2>
                                    <Grid2 size={2}><Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${authorizationGroup.tenantId}`}>{authorizationGroup.tenantId}</Link></Grid2>
                                    <Grid2 size={3} display={"inline-flex"} columnGap={1} ><div>{authorizationGroup.groupId}</div><div><ContentCopyIcon /></div></Grid2>
                                    <Grid2 size={1}></Grid2>
                                </Grid2>
                            </Typography>
                                
                        )
                    )}
                </>
            }

        </main>
    )
}

export default AuthorizationGroupList;