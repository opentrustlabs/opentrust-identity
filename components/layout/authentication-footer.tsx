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
                height: "8vh", 
                color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor || "white"
            }}

        >
        
            <Container
                maxWidth="xl"
            >
                <div>
                    {
                        /* TODO
                            Add footer links
                        */
                    }
                </div>
            </Container>
        </div>


        
    )
}

export default AuthenticationFooter;