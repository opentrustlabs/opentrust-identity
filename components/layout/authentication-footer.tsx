"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "@/utils/consts";
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
                backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor || DEFAULT_BACKGROUND_COLOR, 
                width: "100%", 
                minHeight: "5vh", 
                color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor || DEFAULT_TEXT_COLOR
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