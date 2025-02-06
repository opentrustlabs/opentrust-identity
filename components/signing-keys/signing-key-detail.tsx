"use client";
import { SigningKey } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import React, { useContext } from "react";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Button, Divider, Grid2, Paper, Stack, TextField } from "@mui/material";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

export interface SigningKeyDetailProps {
    signingKey: SigningKey
}
const SigningKeyDetail: React.FC<SigningKeyDetailProps> = ({ signingKey }) => {

    // CONTEXT VARS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={[
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
                    linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
                },
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=signing-keys`,
                    linkText: "Signing Keys"
                },
                {
                    href: null,
                    linkText: signingKey.keyName
                }
            ]} />

            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2
                            className="detail-page-subheader"
                            sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }}
                            fontWeight={"bold"}
                            size={12}
                        >
                            Overview
                        </Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>                                    
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Key Name / Alias</div>
                                            <TextField name="keyName" id="keyName" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Key Use</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Key Type</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={""} fullWidth={true} size="small" />
                                        </Grid2>                                        
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Status</div>
                                            <TextField name="keyName" id="keyName" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Expires</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={""} fullWidth={true} size="small" />
                                        </Grid2> 
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Owning Tenant</div> {/* TODO Make this conditional: if we are in the root tenant then show, otherwise hide */}
                                            <TextField name="tenantDescription" id="tenantDescription" value={""} fullWidth={true} size="small" />
                                        </Grid2>                                         
                                    </Grid2>
                                </Grid2>
                                <Stack sx={{marginTop: "8px"}} direction={"row"} flexDirection={"row-reverse"} >
                                    <Button sx={{border: "solid 1px lightgrey", borderRadius: "4px", color: "black"}} >Update</Button>
                                </Stack>
                            </Paper>
                        </Grid2>
                        <Grid2 size={12}>
                            {/* 
                                TODO Display logic based on the value of the private key. Is it encrypted? Then show the key and
                                hide the password. Show an "eye" icon for the password, which the user can click if they have
                                permissions to see it.

                                If not encrypted, then show an "eye" icon which will allow the user to view the private based
                                on their permissions and which will require a service call.

                            */}
                            <Paper sx={{ padding: "8px", marginBottom: "16px"}}  elevation={1}>
                                <Grid2 container size={12} spacing={2}>                                    
                                    <Grid2 size={{xs: 12, sm: 2, md: 2, lg: 2, xl: 2}} sx={{textDecoration: breakPoints.isSmall ? "underline": "none"}}>
                                        <Grid2 container>                                            
                                            <Grid2 size={9}>Private Key</Grid2>
                                            <Grid2 size={3}><ContentCopyIcon /></Grid2>                                            
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{xs: 12, sm: 10, md: 10, lg: 10, xl: 10}}>
                                        <pre style={{fontSize: breakPoints.isSmall ? "0.8em" : "1.0em"}}>{signingKey.privateKeyPkcs8}</pre>
                                    </Grid2>
                                </Grid2>
                            </Paper>

                            <Paper sx={{ padding: "8px", marginBottom: "16px"}}  elevation={1}>
                                <Grid2 container size={12} spacing={2}> 
                                    <Grid2 size={{xs: 3, sm: 3, md: 2, lg: 2, xl: 2}}>
                                        Password
                                    </Grid2>
                                    <Grid2 size={{xs: 9, sm: 9, md: 10, lg: 10, xl: 10}}><VisibilityOutlinedIcon /><><pre>{signingKey.password}</pre></></Grid2>
                                </Grid2>
                            </Paper>

                            <Paper sx={{ padding: "8px", marginBottom: "16px"}} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{xs: 12, sm: 2, md: 2, lg: 2, xl: 2}} sx={{textDecoration: breakPoints.isSmall ? "underline": "none"}}>
                                        <Grid2 container>
                                            <Grid2 size={9}>
                                                {signingKey.certificate &&
                                                    <>Certificate</>
                                                }
                                                {signingKey.publicKey &&
                                                    <>Public Key</>
                                                }  
                                            </Grid2>
                                            <Grid2 size={3}><ContentCopyIcon /></Grid2>
                                        </Grid2>                                                                              
                                    </Grid2>
                                    <Grid2 size={{xs: 12, sm: 10, md: 10, lg: 10, xl: 10}}>
                                        <pre style={{fontSize: breakPoints.isSmall ? "0.8em" : "1.0em"}}>{signingKey.certificate ? signingKey.certificate : signingKey.publicKey}</pre>
                                    </Grid2>                                    
                                </Grid2>
                            </Paper>                            
                        </Grid2>
                    </Grid2>
                </DetailPageMainContentContainer>
                <DetailPageRightNavContainer><div></div></DetailPageRightNavContainer>


            </DetailPageContainer>
        </Typography>
    )

}

export default SigningKeyDetail;