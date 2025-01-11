"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { Container, Stack } from "@mui/material";
import React from "react";

export interface AuthenticationHeaderProps {
    tenantMetaData: TenantMetaData
}

// style={{backgroundColor: "#0313fc", width: "100%", height: "5vh", color: "white"}}
const AuthenticationHeader: React.FC<AuthenticationHeaderProps> = ({
    tenantMetaData
}) => {


    return (
        <div 
            style={{
                backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor || "#1976d2", 
                width: "100%", 
                height: "8vh", 
                color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor || "white"
            }}

        >
            <Container
                maxWidth="xl"
                sx={{height: "100%", alignItems: "center", display: "flex"}}
                
            >
                <Stack 
                    direction={"row"}
                    justifyItems={"center"}
                    alignItems={"center"}
                    
                >
                    {tenantMetaData.tenantLookAndFeel?.authenticationlogo &&
                        <div style={{verticalAlign: "center"}}><img style={{display: "block"}} src={tenantMetaData.tenantLookAndFeel.authenticationlogo} height="32px" ></img></div>
                    }
                    {tenantMetaData.tenantLookAndFeel?.authenticationheadertext &&
                        
                        <div style={{verticalAlign: "center", fontWeight: "bold", marginLeft: "16px", fontSize: "1.2em"}}>{tenantMetaData.tenantLookAndFeel?.authenticationheadertext}</div>
                        
                    }
                </Stack>
            </Container>
        </div>
        
    )
}

export default AuthenticationHeader;

