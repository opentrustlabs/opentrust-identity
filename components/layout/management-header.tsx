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
                backgroundColor: "#1976d2", 
                backgroundImage: "linear-gradient(#34111194, #1976d2)",
                width: "100%", 
                height: responsiveBreakpoints.isMedium ? "0vh" : "6vh", 
                color: "white",
                borderBottom: "1px solid lightgray",
                boxShadow: "0px 0px 2vh 0px grey",
                display: responsiveBreakpoints.isMedium ? "none" : "inherit", 
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