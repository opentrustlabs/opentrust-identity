"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "@/utils/consts";
import Container from "@mui/material/Container";
import React from "react";


export interface AuthenticationFooterProps {
    tenantMetaData: TenantMetaData,
    isAuthenticateToPortal: boolean
}

const AuthenticationFooter: React.FC<AuthenticationFooterProps> = ({
    tenantMetaData,
    isAuthenticateToPortal
}) => {

    let backgroundColor = DEFAULT_BACKGROUND_COLOR;
    let textColor = DEFAULT_TEXT_COLOR;
    if(!isAuthenticateToPortal){
        backgroundColor = tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
        textColor = tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor || DEFAULT_TEXT_COLOR;
    } 

    return (
        <div 
            style={{
                backgroundColor: backgroundColor,
                width: "100%", 
                minHeight: "5vh", 
                color: textColor
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