"use client";
import { Divider, Paper } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import React from "react";

export interface TenantDetailProps {
    tenantId: string
}
const TenantDetail: React.FC<TenantDetailProps> = ({tenantId}) => {


    return (
        <Typography component={"div"} fontSize={"0.9em"}>
        <Grid2 container size={12} spacing={3}>
            <Grid2 size={2.5}>Basic Information</Grid2>
            <Grid2 size={9.5}>
                <Paper elevation={3} sx={{padding: "8px"}}>
                    <div>Tenant Name</div>
                    <div>Pfizer Prod Tenant</div>
                    <div>Tenant Description</div>
                    <div>Pfizer Prod Tenant</div>
                    <div>Tenant Type</div>
                    <div>Services and User delegated permissions</div>
                    <div>Enabled</div>
                    <div>true</div>
                    <div>federated OIDC Constraint</div>
                    <div>Permissive</div>

                </Paper>
            </Grid2>

            <Grid2 size={3}>Login Failure Configuration</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Authentication Configuration</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Password Configuration</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Anonymous User Configuration</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Tenant Mangement Domains</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Tenant Authentication Domains</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Federated OIDC Providers</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Social Identity Providers</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Legacy User Migration Configuration</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>

            <Grid2 size={3}>Tenant Look And Feel</Grid2>
            <Grid2 size={9}>
                <div style={{height: "128px", backgroundColor: "lightgray"}}></div>
            </Grid2>


        </Grid2>
        </Typography>
    )
}

export default TenantDetail;