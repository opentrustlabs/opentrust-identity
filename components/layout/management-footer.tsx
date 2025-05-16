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
                backgroundImage: "linear-gradient(#1976d2, #34111194)",
                backgroundColor: "#1976d2", 
                width: "100%", 
                minHeight: "4vh", 
                color: tenantMetaData.tenantLookAndFeel?.adminheadertextcolor || "white",
                borderTop: "solid 1px lightgray",
                boxShadow: "0px 0px 1vh 0px grey",
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