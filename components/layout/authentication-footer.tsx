"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import Container from "@mui/material/Container";
import React from "react";


export interface AuthenticationFooterProps {
    tenantMetaData: TenantMetaData
}

const AuthenticationFooter: React.FC<AuthenticationFooterProps> = ({
    tenantMetaData
}) => {


    return (
        <div 
            style={{
                backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor || "#1976d2", 
                width: "100%", 
                minHeight: "5vh", 
                color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor || "white"
            }}

        >
        
            <Container
                maxWidth="xl"
            >
                <div style={{fontSize: "0.8em", padding: "8px"}}>                    
                </div>
            </Container>
        </div>


        
    )
}

export default AuthenticationFooter;