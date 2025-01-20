"use client";
import React, { ReactNode, useContext } from "react";
import Container from "@mui/material/Container";
import { Box, Grid2 } from "@mui/material";
import ManagementHeader from "./management-header";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import TenantLeftNavigation from "../left-navigation/tenant-left-navigation";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { useSearchParams } from "next/navigation";


interface Props {
    children: ReactNode
}
const ManagementLayout: React.FC<Props> = ({children}) => {
  

    // CONTEXT OBJECTS
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // QUERY PARAMS
    const params = useSearchParams();
    const section = params?.get("section");

    return (
        <div
            style={{ }}
        >
            <ManagementHeader
                tenantMetaData={
                    tenantBean.getTenantMetaData()
                }
            />             
            <Container
                maxWidth={breakPoints.isGreaterThanExtraLarge ? "xl" : "lg"}
                disableGutters={true}
                sx={{minHeight: "94vh"}}
            >
                <Box sx={{ flexGrow: 1,  }}>
                    <Grid2 size={12} container spacing={1} sx={{}}>                
                        <Grid2 
                            size={{xs: 12, sm: 12, md: 3, lg: 2, xl: 2}} 
                            sx={{
                                backgroundColor: "#fefefe", 
                                padding: "8px",
                                borderBottom: breakPoints.isMedium ? "solid 1px lightgrey" : "",
                                borderRight: !breakPoints.isMedium? "solid 1px lightgrey" : ""
                            }}
                        >
                            <TenantLeftNavigation 
                                section={section || "tenants"} 
                                tenantMetaData={tenantBean.getTenantMetaData()}
                                breakPoints={breakPoints}

                            />                    
                        </Grid2>
                        
                        <Grid2  
                            size={{xs: 12, sm: 12, md: 9, lg: 10, xl: 10}} 
                            sx={{padding: breakPoints.isMedium ? "8px" : "8px 0px 0px 8px", minHeight: breakPoints.isMedium ? "86vh" : "94vh"}}
                        >                            
                            <Grid2>{children}</Grid2>                            
                        </Grid2>                        
                    </Grid2>
                </Box>
            </Container>
        </div>
    )
}

export default ManagementLayout;