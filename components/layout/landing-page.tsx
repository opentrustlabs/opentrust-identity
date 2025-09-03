"use client";
import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import React, { useContext } from "react";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { NAME_ORDER_WESTERN, TENANT_READ_ALL_SCOPE, TENANT_READ_SCOPE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Typography } from "@mui/material";
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Link from "next/link";


/**
 * For future development. Show a welcome widget and some analytics (integrated with external 
 * analytical tools via a common API). These analytics could encompass things such as:
 *  Failed login attempts
 *  Locked accounts
 *  Notifications
 *  Secrets viewed and by whom.
 * 
 *  
 * This would be the components included in the top-level page.tsx file.
 *  
 * @returns 
 */
const LandingPage: React.FC = () => {

    // CONTEXT 
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    return (
        <Grid2
            container
            spacing={1}
            alignItems={"center"}
            justifyContent={"center"}
            sx={{ minHeight: "90vh" }}
            size={12}
        >
            <Grid2 >
                <Paper
                    elevation={4}
                    sx={{ padding: 2, height: "100%", maxWidth: "650px", minWidth: "350px"}}
                >                    
                    {profile !== null && containsScope([TENANT_READ_SCOPE, TENANT_READ_ALL_SCOPE], profile.scope) &&
                        <Typography component={"div"}>
                            <Grid2 container size={12} spacing={1}>
                                <Grid2 marginBottom={"16px"} fontSize={"1.2em"} fontWeight={"bold"} size={12}>Welcome {profile.nameOrder === NAME_ORDER_WESTERN ? `${profile.firstName} ${profile.lastName}` : `${profile.lastName} ${profile.firstName}`}   </Grid2>
                                <Grid2 sx={{textDecoration: "underline"}} fontWeight={"bold"} size={12}>Quick Links</Grid2>
                                
                                    <Link href={""}>
                                        <Grid2 container borderRadius={"4px"} padding={"4px"} marginBottom={"16px"} minWidth={"300px"} size={{md: 12, lg: 6}}>
                                            <Grid2 size={1}>
                                                <SettingsApplicationsIcon />
                                            </Grid2>
                                            <Grid2 size={11}>
                                                {tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                                    <>{tenantBean.getTenantMetaData().tenant.tenantName}</>
                                                }
                                                {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                                    <>Tenants</>
                                                }
                                            </Grid2>
                                        </Grid2>
                                    </Link>
                                
                                
                                <Grid2 border={"solid 1px lightgrey"} borderRadius={"4px"} padding={"4px"} marginBottom={"16px"} minWidth={"300px"} size={{md: 12, lg: 6}}>
                                    Settings
                                </Grid2>
                            </Grid2>
                        </Typography>
                    }
                </Paper>
            </Grid2>
        </Grid2>
    )
}


export default LandingPage;