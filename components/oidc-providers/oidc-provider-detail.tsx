"use client";
import { FederatedOidcProvider } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import React, { useContext } from "react";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import { AccordionSummary, AccordionDetails, Stack, Divider, Button } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

export interface FederatedOIDCProviderDetailProps {
    federatedOIDCProvider: FederatedOidcProvider
}

const FederatedOIDCProviderDetail: React.FC<FederatedOIDCProviderDetailProps> = ({ federatedOIDCProvider }) => {


    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    arrBreadcrumbs.push({
        linkText: "OIDC Providers",
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=oidc-providers`
    });
    arrBreadcrumbs.push({
        linkText: federatedOIDCProvider.federatedOIDCProviderName,
        href: null
    })


    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs}></BreadcrumbComponent>
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
                                            <div>Provider Name</div>
                                            <TextField name="providerName" id="providerName" value={federatedOIDCProvider.federatedOIDCProviderName} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Provider Description</div>
                                            <TextField 
                                                name="providerDescription" 
                                                id="providerDescription" 
                                                value={federatedOIDCProvider.federatedOIDCProviderDescription || ""} 
                                                fullWidth={true} 
                                                size="small" 
                                                multiline={true}
                                                rows={2}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Provider Type</div>
                                            <TextField name="providerType" id="provider" value={federatedOIDCProvider.federatedOIDCProviderType || ""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Provider Client ID</div>
                                            <TextField name="clientId" id="clientId" value={federatedOIDCProvider.federatedOIDCProviderClientId || ""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Provider Client Secret</div>
                                            <TextField name="clientSecret" id="clientSecret" value={"*******************"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Provider Tenant ID</div>
                                            <TextField name="federatedOIDCProviderTenantId" id="federatedOIDCProviderTenantId" value={federatedOIDCProvider.federatedOIDCProviderTenantId || ""} fullWidth={true} size="small" />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>                                        
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Well Known URI</div>
                                            <TextField name="providerWellKnownUri" id="providerWellKnownUri" value={federatedOIDCProvider.federatedOIDCProviderWellKnownUri || ""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Authentication Type</div>
                                            <TextField name="clientAuthType" id="clientAuthType" value={federatedOIDCProvider.clientAuthType} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Scope</div>
                                            <TextField name="scope" id="scope" value={federatedOIDCProvider.scopes || ""} fullWidth={true} size="small" />
                                        </Grid2>                                        
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Social Login Icon</div>
                                            <TextField name="socialLoginIcon" id="socialLoginIcon" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Social Login Display Name</div>
                                            <TextField name="socialLoginDisplayName" id="socialLoginDisplayName" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <Grid2 paddingLeft={"8px"} marginBottom={"16px"} container size={12}>
                                                <Grid2 alignContent={"center"} size={10}>Refresh Token Allowed</Grid2>
                                                <Grid2 size={2}><Checkbox /></Grid2>
                                                <Grid2 alignContent={"center"} size={10}>Use PKCE</Grid2>
                                                <Grid2 size={2}><Checkbox /></Grid2>
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                                <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    <Button sx={{ border: "solid 1px lightgrey", borderRadius: "4px" }} >Update</Button>
                                </Stack>
                            </Paper>
                        </Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion defaultExpanded={true}  >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"login-failure-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <AlternateEmailIcon /><div style={{marginLeft: "8px"}}>Domains</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add Domain</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    <Divider />                                        
                                    {["pfizer.com", "pfizer.net", "pfizer-biohaven.com", "pfizer-gbt.com"].map(                                            
                                        (name: string) => (
                                            <Typography key={`${name}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={11}>{name}</Grid2>                                                    
                                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>                                                
                                        )
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion defaultExpanded={false}  >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"login-failure-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <SettingsApplicationsIcon /><div style={{marginLeft: "8px"}}>Tenants</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add Tenant</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    <Divider />                                        
                                    {["Pfizer Production Tenant", "Pfizer QA Tenant", "Biohaven QA Tenant", "GBT QA Tenant", "MilliporeSigma"].map(                                            
                                        (name: string) => (
                                            <Typography key={`${name}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={11}>{name}</Grid2>                                                    
                                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>                                                
                                        )
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>



                    </Grid2>


                </DetailPageMainContentContainer>

            </DetailPageContainer>
            <DetailPageRightNavContainer><div></div></DetailPageRightNavContainer>





        </Typography>
        // <>{JSON.stringify(federatedOIDCProvider)}</>


    )
}

export default FederatedOIDCProviderDetail;