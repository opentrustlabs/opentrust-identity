"use client";
import { SigningKey, SigningKeyUpdateInput } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import React, { useContext } from "react";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import { SIGNING_KEY_STATUS_ACTIVE, SIGNING_KEY_STATUS_REVOKED, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Backdrop, Button, CircularProgress, Grid2, MenuItem, Paper, Select, Snackbar, Stack, TextField } from "@mui/material";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ContactConfiguration from "../contacts/contact-configuration";
import TenantHighlight from "../tenants/tenant-highlight";

export interface SigningKeyDetailProps {
    signingKey: SigningKey
}
const SigningKeyDetail: React.FC<SigningKeyDetailProps> = ({ signingKey }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // STATE VARIABLES
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);

    const initInput: SigningKeyUpdateInput = {
        keyId: signingKey.keyId,
        status: signingKey.status,
        keyName: signingKey.keyName,
        keyUse: signingKey.keyUse
    };
    const [keyUpdateInput, setKeyUpdateInput] = React.useState<SigningKeyUpdateInput>(initInput);
    

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
            {/**  If we are in the root tenant, then show the owning tenant for this client */}
            {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                <div style={{marginBottom: "16px"}}>
                    <TenantHighlight tenantId={signingKey.tenantId} />
                </div>
            }

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
                                            <TextField name="keyName" id="keyName" value={keyUpdateInput.keyName} fullWidth={true} size="small" />
                                        </Grid2>                                        
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Key Type</div>
                                            <TextField name="keyType" id="keyType" value={signingKey.keyType} disabled={true} fullWidth={true} size="small" />
                                        </Grid2>                                        
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Status</div>
                                            {signingKey.status === SIGNING_KEY_STATUS_REVOKED &&
                                                <TextField 
                                                    name="keyStatus" 
                                                    id="keyStatus" 
                                                    value={keyUpdateInput.status} 
                                                    disabled={true} fullWidth={true} size="small" />
                                            }
                                            {signingKey.status !== SIGNING_KEY_STATUS_REVOKED &&
                                                <Select
                                                    size="small"
                                                    fullWidth={true}
                                                    value={keyUpdateInput.status}
                                                    name="keyStatus"
                                                    onChange={(evt) => {
                                                        keyUpdateInput.status = evt.target.value;                                        
                                                        setKeyUpdateInput({ ...keyUpdateInput });
                                                    }}
                                                >                                                    
                                                    <MenuItem value={SIGNING_KEY_STATUS_ACTIVE} >{SIGNING_KEY_STATUS_ACTIVE}</MenuItem>
                                                    <MenuItem value={SIGNING_KEY_STATUS_REVOKED} >{SIGNING_KEY_STATUS_REVOKED}</MenuItem>
                                                </Select>
                                            }                                            
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Expires</div>
                                            <TextField name="keyExpiration" id="keyExpiration" value={signingKey.expiresAtMs} disabled={true} fullWidth={true} size="small" />
                                        </Grid2>                                       
                                    </Grid2>
                                </Grid2>
                                <Stack sx={{marginTop: "8px"}} direction={"row"} flexDirection={"row-reverse"} >
                                    <Button sx={{border: "solid 1px lightgrey", borderRadius: "4px"}} >Update</Button>
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
                <DetailPageRightNavContainer>
                    <Paper elevation={3} >
                        <ContactConfiguration 
                            contactForType={"signing-key"} 
                            contactForId={signingKey.keyId} 
                            onUpdateEnd={(success: boolean) =>{
                                setShowMutationBackdrop(false);
                                if(success){
                                    setShowMutationSnackbar(true);
                                }
                            }}
                            onUpdateStart={() =>{
                                setShowMutationBackdrop(true);
                            }}
                        />                        
                    </Paper>
                </DetailPageRightNavContainer>

            </DetailPageContainer>
            <Backdrop
                sx={{ color: '#fff'}}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
            <Snackbar
                open={showMutationSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowMutationSnackbar(false)}
                message="Provider Updated"
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            />
        </Typography>
    )

}

export default SigningKeyDetail;