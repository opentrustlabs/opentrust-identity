"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { Container, Stack } from "@mui/material";
import React from "react";

export interface ManagementHeaderProps {
    tenantMetaData: TenantMetaData
}

const ManagementHeader: React.FC<ManagementHeaderProps> = ({
    tenantMetaData
}) => {

    console.log("will render the header");
    return (
        <div 
            style={{
                backgroundColor: tenantMetaData.tenantLookAndFeel?.adminheaderbackgroundcolor || "#1976d2", 
                width: "100%", 
                height: "6vh", 
                color: tenantMetaData.tenantLookAndFeel?.adminheadertextcolor || "white",
                borderBottom: "1px solid lightgray"
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
                    {tenantMetaData.tenantLookAndFeel?.adminlogo &&
                        <div style={{verticalAlign: "center"}}>
                            <img style={{display: "block"}} src={`data:image/svg+xml;utf8,${encodeURIComponent(tenantMetaData.tenantLookAndFeel.adminlogo)}`} height="32px" >
                            </img>
                        </div>
                    }
                    {tenantMetaData.tenantLookAndFeel?.adminheadertext &&                        
                        <div style={{verticalAlign: "center", fontWeight: "bold", marginLeft: "24px"}}>{tenantMetaData.tenantLookAndFeel?.adminheadertext}</div>                        
                    }
                </Stack>
            </Container>
        </div>
        
    )
}

export default ManagementHeader;