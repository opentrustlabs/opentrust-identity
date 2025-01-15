"use client";
import { Tenant } from "@/graphql/generated/graphql-types";
import { TENANTS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { CircularProgress, Divider, Grid2, Stack, Typography } from "@mui/material";
import React from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';
import Link from "next/link";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const TenantList: React.FC = () => {

    const {data, error, loading } = useQuery(TENANTS_QUERY, {

    });

    if(loading) return <CircularProgress />
    if(error) return <div>There was an error. ${error.stack}</div>
    if(data) return (
      
        <main >
            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                <div style={{display: "inline-flex", alignItems: "center"}}>    
                    <AddBoxIcon sx={{marginRight: "8px", cursor: "pointer"}} />
                    <span>New Tenant</span>
                </div>                
            </Stack>
            <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                <Grid2 container size={12} spacing={1} marginBottom={"16px"} >                
                        <Grid2 size={2}>Tenant Name</Grid2>
                        <Grid2 size={4}>Tenant Description</Grid2>
                        <Grid2 size={2}>Tenant Type</Grid2>
                        <Grid2 size={1}>Is Enabled</Grid2>
                        <Grid2 size={3}>Object ID</Grid2>
                </Grid2>
            </Typography>
            <Divider></Divider>
            
            {data.getTenants.map(
                (tenant: Tenant) => (
                    <Typography key={`${tenant.tenantId}`} component={"div"} fontSize={"0.9em"}>
                        <Divider></Divider>                        
                        <Grid2  margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                            <Grid2 size={2}><Link style={{color: ""}} href={`tenants/${tenant.tenantId}`}>{tenant.tenantName}</Link></Grid2>
                            <Grid2 size={4}>{tenant.tenantDescription}{tenant.tenantDescription}{tenant.tenantDescription}{tenant.tenantDescription}</Grid2>
                            <Grid2 size={2}>{tenant.tenantType}</Grid2>
                            <Grid2 size={1}>{tenant.enabled ? "true" : "false"}</Grid2>
                            <Grid2 size={3} display={"inline-flex"} columnGap={1} ><div>{tenant.tenantId}</div><div><ContentCopyIcon /></div></Grid2>
                        </Grid2>
                    </Typography>
                          
                )
            )}
            {data.getTenants.map(
                (tenant: Tenant) => (
                    <Typography key={`${tenant.tenantId}asdfasdf`} component={"div"} fontSize={"0.9em"}>
                        <Divider></Divider>                        
                        <Grid2  margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                            <Grid2 size={2}><Link style={{color: ""}} href={`tenants/${tenant.tenantId}`}>{tenant.tenantName}</Link></Grid2>
                            <Grid2 size={4}>{tenant.tenantDescription}{tenant.tenantDescription}{tenant.tenantDescription}{tenant.tenantDescription}</Grid2>
                            <Grid2 size={2}>{tenant.tenantType}</Grid2>
                            <Grid2 size={1}>{tenant.enabled ? "true" : "false"}</Grid2>
                            <Grid2 size={3} display={"inline-flex"} columnGap={1} ><div>{tenant.tenantId}</div><div><ContentCopyIcon /></div></Grid2>
                        </Grid2>
                    </Typography>
                    
                )
            )}            
            

        </main>
    )
}

export default TenantList;