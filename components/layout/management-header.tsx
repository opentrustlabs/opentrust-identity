"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { Container, Stack } from "@mui/material";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";

export interface ManagementHeaderProps {
    tenantMetaData: TenantMetaData
}

const ManagementHeader: React.FC<ManagementHeaderProps> = ({
    tenantMetaData
}) => {

    const responsiveBreakpoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
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
                maxWidth={responsiveBreakpoints.isGreaterThanExtraLarge ? "xl" : "xl"}
                disableGutters={true}
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
                        <div style={{verticalAlign: "center", fontWeight: "bold", marginLeft: "8px"}}>{tenantMetaData.tenantLookAndFeel?.adminheadertext}</div>                        
                    }
                    {!tenantMetaData.tenantLookAndFeel?.adminheadertext &&                        
                        <div style={{verticalAlign: "center", fontWeight: "bold", padding: "8px"}}>OpenTrust Identity</div>                        
                    }
                </Stack>
            </Container>
        </div>
        
    )
}

export default ManagementHeader;