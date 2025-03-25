"use client";
import React, { useContext } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Backdrop, Button, Checkbox, CircularProgress, MenuItem, Paper, Select, Snackbar, Stack, TextField } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS, CLIENT_TYPE_SERVICE_ACCOUNT_ONLY, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY, CLIENT_TYPES_DISPLAY, DEFAULT_BACKGROUND_COLOR, DEFAULT_END_USER_TOKEN_TTL_SECONDS, DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, MAX_END_USER_TOKEN_TTL_SECONDS, MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, MIN_END_USER_TOKEN_TTL_SECONDS, MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Client, ClientUpdateInput } from "@/graphql/generated/graphql-types";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncIcon from '@mui/icons-material/Sync';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TenantHighlight from "../tenants/tenant-highlight";
import ContactConfiguration from "../contacts/contact-configuration";
import { useMutation } from "@apollo/client";
import { CLIENT_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import ClientRedirectUriConfiguration from "./client-redirect-uri-configuration";
import ClientAuthenticationGroupConfiguration from "./client-authentication-group-configuration";

export interface ClientDetailProps {
    client: Client
}
const ClientDetail: React.FC<ClientDetailProps> = ({ client }) => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);


    const initInput: ClientUpdateInput = {
        clientId: client.clientId,
        clientName: client.clientName,
        clientType: client.clientType,
        tenantId: client.tenantId,
        clientDescription: client.clientDescription,
        clientTokenTTLSeconds: client.clientTokenTTLSeconds || DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
        enabled: client.enabled,
        maxRefreshTokenCount: client.maxRefreshTokenCount,
        oidcEnabled: client.oidcEnabled,
        pkceEnabled: client.pkceEnabled,
        userTokenTTLSeconds: client.userTokenTTLSeconds || DEFAULT_END_USER_TOKEN_TTL_SECONDS
    };

    const [clientUpdateInput, setClientUpdateInput] = React.useState<ClientUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);

    const [clientUpdateMutation] = useMutation(CLIENT_UPDATE_MUTATION, {
        variables: {
            clientInput: clientUpdateInput
        },
        onCompleted() {
            setMarkDirty(false);
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setErrorMessage(error.message);
            setShowMutationBackdrop(false);
        },
    })

    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={[
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
                    linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
                },
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=clients`,
                    linkText: "Clients"
                },
                {
                    href: null,
                    linkText: client.clientName
                }
            ]} />
            {/**  If we are in the root tenant, then show the owning tenant for this client */}
            {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                <div style={{marginBottom: "16px"}}>
                    <TenantHighlight tenantId={client.tenantId} />
                </div>
            }
            <Grid2 container size={12} spacing={3} marginBottom={"16px"}>
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Grid2 container size={12} spacing={2}>                        
                        <Grid2 className="detail-page-subheader" sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} size={12}>Overview</Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            {errorMessage &&
                                <Alert severity={"error"} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                            }
                            <Paper elevation={1} sx={{ padding: "8px" }}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Name</div>
                                            <TextField name="clientName" id="clientName" value={clientUpdateInput.clientName} fullWidth={true} size="small" 
                                                onChange={(evt) => {clientUpdateInput.clientName = evt.target.value; console.log(clientUpdateInput.clientName); setClientUpdateInput({...clientUpdateInput}); setMarkDirty(true);}}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Descripton</div>
                                            <TextField name="clientDescription" id="clientDescription" value={clientUpdateInput.clientDescription} fullWidth={true} size="small" multiline={true} rows={2} 
                                                onChange={(evt) => {clientUpdateInput.clientDescription = evt.target.value; setClientUpdateInput({...clientUpdateInput}); setMarkDirty(true); }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Type</div>
                                            <Select
                                                size="small"
                                                fullWidth={true}
                                                value={clientUpdateInput.clientType}
                                                name="clientType"
                                                onChange={(evt) => {clientUpdateInput.clientType = evt.target.value; setClientUpdateInput({...clientUpdateInput}); setMarkDirty(true);}}
                                            >
                                                <MenuItem value={CLIENT_TYPE_SERVICE_ACCOUNT_ONLY} >{CLIENT_TYPES_DISPLAY.get(CLIENT_TYPE_SERVICE_ACCOUNT_ONLY)}</MenuItem>
                                                <MenuItem value={CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS} >{CLIENT_TYPES_DISPLAY.get(CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS)}</MenuItem>
                                                <MenuItem value={CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY} >{CLIENT_TYPES_DISPLAY.get(CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY)}</MenuItem>                                                
                                            </Select>                                            
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>Client ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2  size={11}>
                                                    {client.clientId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon sx={{cursor: "pointer"}} />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>Client Secret</div>                                            
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2 size={10}>
                                                    <span>*******************************************</span>
                                                </Grid2>
                                                <Grid2 size={1}></Grid2>
                                                <Grid2 size={1}>
                                                    {/* 
                                                        TODO:
                                                        1.  Only show for those users enabled to see the secret - i.e. and admin
                                                        2.  onclick hander to retrieve the client secret. this handler should first
                                                            show a dialog indicating the the viewing of the secret will be logged
                                                    */}
                                                    <VisibilityOutlinedIcon sx={{cursor: "pointer"}} />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 borderLeft={"dotted 1px lightgrey"} paddingLeft={"8px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={10}>Enabled</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={clientUpdateInput.enabled} 
                                                    onChange={(_, checked: boolean) => {clientUpdateInput.enabled = checked; setClientUpdateInput({...clientUpdateInput}); setMarkDirty(true);}}
                                                />
                                            </Grid2>

                                            <Grid2 alignContent={"center"} size={10}>OIDC (SSO) Enabled</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={clientUpdateInput.oidcEnabled}
                                                    onChange={(_, checked: boolean) => {clientUpdateInput.oidcEnabled = checked; setClientUpdateInput({...clientUpdateInput}); setMarkDirty(true);}}
                                                />
                                            </Grid2>
                                            
                                            <Grid2 alignContent={"center"} size={10}>PKCE Enabled</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={clientUpdateInput.pkceEnabled}
                                                    onChange={(_, checked: boolean) => {clientUpdateInput.pkceEnabled = checked; setClientUpdateInput({...clientUpdateInput}); setMarkDirty(true);}}
                                                />
                                            </Grid2>

                                            <Grid2 marginTop={"16px"} alignContent={"center"} size={12}>User Token TTL (Seconds) - Max: {MAX_END_USER_TOKEN_TTL_SECONDS}, Min: {MIN_END_USER_TOKEN_TTL_SECONDS}</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField type="number" name="userTokenTTL" id="userTokenTTL" 
                                                    value={
                                                        clientUpdateInput.userTokenTTLSeconds || ""
                                                    }
                                                    error={                                                        
                                                        clientUpdateInput.userTokenTTLSeconds ? 
                                                            (clientUpdateInput.userTokenTTLSeconds < MIN_END_USER_TOKEN_TTL_SECONDS || clientUpdateInput.userTokenTTLSeconds > MAX_END_USER_TOKEN_TTL_SECONDS) : 
                                                            false                                                            
                                                    }                                                    
                                                    onChange={(evt) => {                                                        
                                                        if(!Number.isNaN(evt.target.value)){
                                                            const v: number = parseInt(evt.target.value);
                                                            clientUpdateInput.userTokenTTLSeconds = v;
                                                            setClientUpdateInput({...clientUpdateInput});
                                                            setMarkDirty(true);
                                                        }
                                                    }}
                                                    fullWidth={true} size="small" />
                                            </Grid2>

                                            <Grid2 alignContent={"center"} size={12}>Client Token TTL (Seconds) - Max: {MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS}, Min: {MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS}</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField type="number" name="clientTokenTTLSeconds" id="clientTokenTTLSeconds" 
                                                    value={
                                                        clientUpdateInput.clientTokenTTLSeconds || ""
                                                    }
                                                    error={                                                        
                                                        clientUpdateInput.clientTokenTTLSeconds ? 
                                                            (clientUpdateInput.clientTokenTTLSeconds < MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS || clientUpdateInput.clientTokenTTLSeconds > MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS) : 
                                                            false                                                            
                                                    }                                                    
                                                    onChange={(evt) => {                                                        
                                                        if(!Number.isNaN(evt.target.value)){
                                                            const v: number = parseInt(evt.target.value);
                                                            clientUpdateInput.clientTokenTTLSeconds = v;
                                                            setClientUpdateInput({...clientUpdateInput});
                                                            setMarkDirty(true);
                                                        }
                                                    }}                                                    
                                                    fullWidth={true} size="small" />
                                            </Grid2>
                                            
                                            <Grid2 alignContent={"center"} size={12}>Max Refresh Token Count</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField type="number" name="maxRefreshTokenCount" id="maxRefreshTokenCount" 
                                                    value={
                                                        clientUpdateInput.maxRefreshTokenCount || ""
                                                    }                                                   
                                                    onChange={(evt) => {                                                        
                                                        if(!Number.isNaN(evt.target.value)){
                                                            const v: number = parseInt(evt.target.value);
                                                            clientUpdateInput.maxRefreshTokenCount = v;
                                                            setClientUpdateInput({...clientUpdateInput});
                                                            setMarkDirty(true);
                                                        }
                                                    }}                                                    
                                                    fullWidth={true} size="small" />
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>

                                <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    
                                    <Button  
                                        onClick={() => {setShowMutationBackdrop(true); clientUpdateMutation(); }}
                                        disabled={!markDirty} 
                                        sx={{ border: "solid 1px lightgrey", borderRadius: "4px" }} 
                                    >
                                        Update
                                    </Button>
                                    
                                        <Button
                                            disabled={!markDirty}
                                            sx={{marginRight: "8px"}}
                                            onClick={() => {setClientUpdateInput(initInput); setMarkDirty(false); }}
                                        >Cancel</Button>
                                    
                                </Stack>
                            </Paper>
                        </Grid2>


                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion defaultExpanded={true}  >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"redirect-uri-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                >
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <SyncIcon /><div style={{ marginLeft: "8px" }}>Redirect URI Configuration</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <ClientRedirectUriConfiguration 
                                        clientId={client.clientId} 
                                        onUpdateStart={() => setShowMutationBackdrop(true)}
                                        onUpdateEnd={(success: boolean) => {
                                            setShowMutationBackdrop(false);
                                            if(success){
                                                setShowMutationSnackbar(true);
                                            }
                                        }}
                                    />                                    
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>


                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"redirect-uri-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                >
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <GroupIcon /><div style={{ marginLeft: "8px" }}>Authentication Groups</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <ClientAuthenticationGroupConfiguration
                                        tenantId={client.tenantId}
                                        clientId={client.clientId}
                                        onUpdateEnd={(success: boolean) => {
                                            setShowMutationBackdrop(false);
                                            if(success){
                                                setShowMutationSnackbar(true);
                                            }
                                        }}
                                        onUpdateStart={() => setShowMutationBackdrop(true)}
                                    />
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>
                    </Grid2>
                </Grid2>
                    <Grid2 spacing={2} size={{ xs: 12, sm: 12, md: 12, lg: 3, xl: 3 }}>
                        <Grid2 container spacing={2} size={12}>
                            <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >                            
                                <Paper elevation={3} >
                                    
                                    <ContactConfiguration
                                        contactForId={client.clientId}
                                        contactForType={"client"}
                                        onUpdateEnd={(success: boolean) => {
                                            setShowMutationBackdrop(false);
                                            if(success){
                                                setShowMutationSnackbar(true);
                                            }
                                        }}
                                        onUpdateStart={() => {
                                            setShowMutationBackdrop(true);
                                        }}
                                    />
                                </Paper>
                            </Grid2>
                        </Grid2>
                    </Grid2>

            </Grid2>
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
                message="Client Updated"
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            />
        </Typography >
    )
}

export default ClientDetail;