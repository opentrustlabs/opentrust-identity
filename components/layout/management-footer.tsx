"use client";
import React from "react";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import Container from "@mui/material/Container";


export interface ManagementFooterProps {
    tenantMetaData: TenantMetaData
}

const ManagementFooter: React.FC<ManagementFooterProps> = ({
    tenantMetaData
}) => {


    return (
        <div 
            style={{
                backgroundColor: tenantMetaData.tenantLookAndFeel?.adminheaderbackgroundcolor || "#1976d2", 
                width: "100%", 
                minHeight: "6vh", 
                color: tenantMetaData.tenantLookAndFeel?.adminheadertextcolor || "white",
                borderTop: "solid 1px lightgray"
            }}

        >        
            <Container
                maxWidth={false}
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

export default ManagementFooter;