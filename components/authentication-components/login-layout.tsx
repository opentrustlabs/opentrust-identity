"use client";
import { TenantLookAndFeel } from "@/graphql/generated/graphql-types";
import { LAYOUT_TYPE_SINGLE_COLUMN, LAYOUT_TYPE_TWO_COLUMN } from "@/utils/consts";
import Grid2 from "@mui/material/Grid2";
import React from "react";

export interface LoginLayoutProps {
    tenantLookAndFeel: TenantLookAndFeel,
    children: React.ReactNode
}

const LoginLayout: React.FC<LoginLayoutProps> = ({
    tenantLookAndFeel,
    children
}) => {

    return (
        <React.Fragment>
            {tenantLookAndFeel.layouttype === LAYOUT_TYPE_TWO_COLUMN &&
                <Grid2 spacing={3} container size={12} height="100%">
                    {tenantLookAndFeel.imagepanelposition === "LEFT" &&
                        <>
                            <Grid2 size={{md: 6, lg: 6}} sx={{ display: { xs: "none", sm: "none", md: "flex", lg: "flex" }, alignItems: "center" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                                    <div style={{ marginBottom: "16px", fontWeight: "bolder" }}>
                                        {tenantLookAndFeel.marketingtext}
                                    </div>
                                    <div>
                                        {tenantLookAndFeel.marketingimageuri &&
                                            <img
                                                src={tenantLookAndFeel.marketingimageuri}
                                                style={{ maxWidth: "95%", objectFit: "contain" }}
                                            />
                                        }
                                    </div>
                                </div>
                            </Grid2>
                            <Grid2 display={"flex"} alignItems={"center"} size={{xs: 12, sm: 12, md: 6, lg: 6}}>
                                {children}
                            </Grid2>
                        </>
                    }
                    {tenantLookAndFeel.imagepanelposition === "RIGHT" && 
                        <>
                            <Grid2 display={"flex"} alignItems={"center"} size={{xs: 12, sm: 12, md: 6, lg: 6}}>
                                {children}
                            </Grid2>
                            <Grid2 size={{md: 6, lg: 6}} sx={{ display: { xs: "none", sm: "none", md: "flex", lg: "flex" }, alignItems: "center" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                                    <div style={{ marginBottom: "16px", fontWeight: "bolder" }}>
                                        {tenantLookAndFeel.marketingtext}
                                    </div>
                                    <div>
                                        {tenantLookAndFeel.marketingimageuri &&
                                            <img
                                                src={tenantLookAndFeel.marketingimageuri}
                                                style={{ maxWidth: "95%", objectFit: "contain" }}
                                            />
                                        }
                                    </div>
                                </div>
                            </Grid2>                            
                        </>

                    }                    
                </Grid2>
            }
            {(!tenantLookAndFeel.layouttype || tenantLookAndFeel.layouttype === LAYOUT_TYPE_SINGLE_COLUMN) &&
                <>{children}</>
            }
        </React.Fragment>
    )
}


export default LoginLayout;