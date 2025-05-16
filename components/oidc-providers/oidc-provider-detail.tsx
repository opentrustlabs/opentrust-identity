"use client";
import { FederatedOidcProvider, FederatedOidcProviderUpdateInput, MarkForDeleteObjectType, SecretObjectType } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import React, { useContext } from "react";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, OIDC_CLIENT_AUTH_TYPE_DISPLAY, OIDC_CLIENT_AUTH_TYPE_NONE, OIDC_EMAIL_SCOPE, OIDC_OFFLINE_ACCESS_SCOPE, OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, SOCIAL_OIDC_PROVIDERS, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import { AccordionSummary, AccordionDetails, Stack, Button, Backdrop, CircularProgress, Snackbar, Alert, Select, MenuItem, Autocomplete, InputAdornment } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { useMutation } from "@apollo/client";
import { FEDERATED_OIDC_PROVIDER_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { FEDERATED_OIDC_PROVIDER_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import FederatedOIDCProviderDomainConfiguration from "./oidc-provider-domain-configuration";
import FederatedOIDCProviderTenantConfiguration from "./oidc-provider-tenant-configuration";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import SecretViewerDialog from "../dialogs/secret-viewer-dialog";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";

export interface FederatedOIDCProviderDetailProps {
    federatedOIDCProvider: FederatedOidcProvider
}

const FederatedOIDCProviderDetail: React.FC<FederatedOIDCProviderDetailProps> = ({ federatedOIDCProvider }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

    // STATE VARIABLES
    let initInput: FederatedOidcProviderUpdateInput = {
        clientAuthType: federatedOIDCProvider.clientAuthType,
        federatedOIDCProviderClientId: federatedOIDCProvider.federatedOIDCProviderClientId,
        federatedOIDCProviderId: federatedOIDCProvider.federatedOIDCProviderId,
        federatedOIDCProviderName: federatedOIDCProvider.federatedOIDCProviderName,
        federatedOIDCProviderType: federatedOIDCProvider.federatedOIDCProviderType,
        federatedOIDCProviderWellKnownUri: federatedOIDCProvider.federatedOIDCProviderWellKnownUri,
        refreshTokenAllowed: federatedOIDCProvider.refreshTokenAllowed,
        scopes: federatedOIDCProvider.scopes,
        usePkce: federatedOIDCProvider.usePkce,
        federatedOIDCProviderDescription: federatedOIDCProvider.federatedOIDCProviderDescription,
        socialLoginProvider: federatedOIDCProvider.socialLoginProvider,
        federatedOIDCProviderClientSecret: ""
    };    
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [oidcProviderInput, setOIDCProviderInput] = React.useState<FederatedOidcProviderUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [changeClientSecret, setChangeClientSecret] = React.useState<boolean>(false);
    const [secretDialogOpen, setSecretDialogOpen] = React.useState<boolean>(false);
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(federatedOIDCProvider.markForDelete);
    
    // GRAPHQL FUNCTIONS
    const [oidcProviderUpdateMutation] = useMutation(FEDERATED_OIDC_PROVIDER_UPDATE_MUTATION, {
        variables: {
            oidcProviderInput: oidcProviderInput
        },
        onCompleted() {
            setMarkDirty(false);
            setChangeClientSecret(false);
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [FEDERATED_OIDC_PROVIDER_DETAIL_QUERY]
    });


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
                   {secretDialogOpen &&                    
                        <SecretViewerDialog 
                            open={secretDialogOpen}
                            onClose={() => setSecretDialogOpen(false)}
                            objectId={federatedOIDCProvider.federatedOIDCProviderId}
                            secretObjectType={SecretObjectType.OidcProviderClientSecret}                     
                        />
                    }
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={11}>Overview</Grid2>
                            <Grid2 size={1} display={"flex"} >
                                {isMarkedForDelete !== true && 
                                    <SubmitMarkForDelete 
                                        objectId={federatedOIDCProvider.federatedOIDCProviderId}
                                        objectType={MarkForDeleteObjectType.FederatedOidcProvider}
                                        confirmationMessage={`Confirm deletion of OIDC provider: ${federatedOIDCProvider.federatedOIDCProviderName}. Once submitted the operation cannot be undone.`}
                                        onDeleteEnd={(successful: boolean, errorMessage?: string) => {
                                            setShowMutationBackdrop(false);
                                            if(successful){
                                                setShowMutationSnackbar(true);
                                                setIsMarkedForDelete(true);
                                            }
                                            else{
                                                setErrorMessage(errorMessage || "ERROR");
                                            }
                                        }}
                                        onDeleteStart={() => setShowMutationBackdrop(true)}
                                    />
                                }
                            </Grid2>
                        </Grid2>
                        <Grid2 size={12}>
                            {errorMessage &&
                                <Grid2 size={12} marginBottom={"8px"}>
                                    <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                </Grid2>
                            }
                            {isMarkedForDelete === true &&
                                <MarkForDeleteAlert 
                                    message={"This OIDC provider has been marked for deletion. No changes to the provider are permitted."}
                                />
                            }
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>                                        
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Provider Name</div>
                                            <TextField
                                                disabled={isMarkedForDelete}
                                                required name="providerName" id="providerName"
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderName = evt?.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true); }}
                                                value={oidcProviderInput.federatedOIDCProviderName}
                                                fullWidth={true}
                                                size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Provider Description</div>
                                            <TextField
                                                disabled={isMarkedForDelete}
                                                name="providerDescription" id="providerDescription"
                                                value={oidcProviderInput.federatedOIDCProviderDescription}
                                                fullWidth={true}
                                                size="small"
                                                multiline={true}
                                                rows={2}
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderDescription = evt?.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true);  }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Provider Type</div>
                                            <Select                                                
                                                size="small"
                                                fullWidth={true}
                                                value={oidcProviderInput.federatedOIDCProviderType}
                                                name="providerType"
                                                onChange={(evt) => {
                                                    oidcProviderInput.federatedOIDCProviderType = evt.target.value;
                                                    if (evt.target.value === FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE) {
                                                        oidcProviderInput.socialLoginProvider = "";
                                                    }
                                                    setOIDCProviderInput({ ...oidcProviderInput });
                                                    setMarkDirty(true); 
                                                }}
                                                disabled={true}
                                            >
                                                <MenuItem value={FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE} >{FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE)}</MenuItem>
                                                <MenuItem value={FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL} >{FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL)}</MenuItem>
                                            </Select>
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>Object ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2  size={11}>
                                                    {federatedOIDCProvider.federatedOIDCProviderId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            copyContentToClipboard(federatedOIDCProvider.federatedOIDCProviderId, "OIDC Provider ID copied to clipboard");
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                        {oidcProviderInput.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL &&
                                            <Grid2 marginBottom={"16px"}>
                                                <div>Social Provider (Requires an account with the provider)</div>
                                                <Autocomplete
                                                    disabled={isMarkedForDelete}
                                                    id="socialLoginProvider"
                                                    size="small"
                                                    options={SOCIAL_OIDC_PROVIDERS}
                                                    renderInput={(params) => (
                                                        <TextField {...params} variant="outlined" />
                                                    )}
                                                    onChange={(_, value) => {
                                                        oidcProviderInput.socialLoginProvider = value;
                                                        setOIDCProviderInput({ ...oidcProviderInput });
                                                    }}
                                                    value={oidcProviderInput.socialLoginProvider}                                                    
                                                />
                                            </Grid2>
                                        }
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Provider Client ID</div>
                                            <TextField name="clientId" id="clientId"
                                                disabled={isMarkedForDelete}
                                                value={oidcProviderInput.federatedOIDCProviderClientId || ""}
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderClientId = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true); }}
                                                fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}} >Provider Client Secret</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                {changeClientSecret === true &&
                                                    <Grid2 size={12}>
                                                        <TextField type="password" name="clientSecret" id="clientSecret"
                                                            disabled={isMarkedForDelete}
                                                            value={oidcProviderInput.federatedOIDCProviderClientSecret}
                                                            onChange={(evt) => { 
                                                                oidcProviderInput.federatedOIDCProviderClientSecret = evt.target.value; 
                                                                setOIDCProviderInput({ ...oidcProviderInput }); 
                                                                setMarkDirty(true);
                                                            }}
                                                            fullWidth={true} size="small" 
                                                            slotProps={{
                                                                input: {
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            <CloseOutlinedIcon
                                                                                sx={{ cursor: "pointer" }}
                                                                                onClick={() => { 
                                                                                    oidcProviderInput.federatedOIDCProviderClientSecret = "";
                                                                                    setOIDCProviderInput({...oidcProviderInput});
                                                                                    setChangeClientSecret(false);
                                                                                }}
                                                                            />
                                                                        </InputAdornment>
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    </Grid2>
                                                }
                                                {changeClientSecret !== true &&
                                                    <>
                                                        <Grid2 size={10}>
                                                            <div>*******************************************</div>
                                                        </Grid2>
                                                        
                                                        <Grid2 size={1}>
                                                            {!isMarkedForDelete &&
                                                                <EditOutlinedIcon
                                                                    sx={{cursor: "pointer"}}
                                                                    onClick={() => {
                                                                        setChangeClientSecret(true);
                                                                    }}
                                                                />
                                                            }
                                                        </Grid2>
                                                        <Grid2 size={1}>
                                                            <VisibilityOutlinedIcon 
                                                                sx={{cursor: "pointer"}}
                                                                onClick={() => setSecretDialogOpen(true)}
                                                            />
                                                        </Grid2>
                                                    </>
                                                        
                                                }                                                
                                                
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>                                        
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Well Known URI</div>
                                            <TextField name="providerWellKnownUri" id="providerWellKnownUri"
                                                disabled={isMarkedForDelete}
                                                value={oidcProviderInput.federatedOIDCProviderWellKnownUri}
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderWellKnownUri = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true); }}
                                                fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Authentication Type</div>
                                            <Select
                                                disabled={isMarkedForDelete}
                                                size="small"
                                                fullWidth={true}
                                                value={oidcProviderInput.clientAuthType}
                                                name="providerType"
                                                onChange={(evt) => { oidcProviderInput.clientAuthType = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true);}}
                                            >
                                                <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST)}</MenuItem>
                                                <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT)}</MenuItem>
                                                <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC)}</MenuItem>
                                                <MenuItem disabled={oidcProviderInput.usePkce === false} value={OIDC_CLIENT_AUTH_TYPE_NONE} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_NONE)}</MenuItem>
                                            </Select>
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Scope</div>
                                            <Autocomplete
                                                disabled={isMarkedForDelete}
                                                id="scopes"
                                                multiple={true}
                                                size="small"
                                                sx={{ paddingTop: "8px" }}
                                                renderInput={(params) => <TextField {...params} label="" />}
                                                options={[
                                                    { id: OIDC_OPENID_SCOPE, label: OIDC_OPENID_SCOPE },
                                                    { id: OIDC_EMAIL_SCOPE, label: OIDC_EMAIL_SCOPE },
                                                    { id: OIDC_PROFILE_SCOPE, label: OIDC_PROFILE_SCOPE },
                                                    { id: OIDC_OFFLINE_ACCESS_SCOPE, label: OIDC_OFFLINE_ACCESS_SCOPE }
                                                ]}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                value={oidcProviderInput.scopes.map(
                                                    (s: string) => {
                                                        return {
                                                            id: s,
                                                            label: s
                                                        }
                                                    }
                                                )}
                                                onChange={(_, value: any) => {                                                    
                                                    oidcProviderInput.scopes = value.map((v: any) => v.id);
                                                    setOIDCProviderInput({ ...oidcProviderInput });
                                                    setMarkDirty(true);
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <Grid2 paddingLeft={"8px"} marginBottom={"16px"} container size={12}>                                                
                                                <Grid2 alignContent={"center"} size={10}>Use PKCE</Grid2>
                                                <Grid2 size={2}>
                                                    <Checkbox
                                                        disabled={isMarkedForDelete}
                                                        checked={oidcProviderInput.usePkce}
                                                        onChange={(_, checked: boolean) => {
                                                            oidcProviderInput.usePkce = checked;
                                                            if (!checked && oidcProviderInput.clientAuthType === OIDC_CLIENT_AUTH_TYPE_NONE) {
                                                                oidcProviderInput.clientAuthType = OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST;
                                                            }
                                                            setOIDCProviderInput({ ...oidcProviderInput });
                                                            setMarkDirty(true);
                                                        }}
                                                    />                                                    
                                                </Grid2>
                                                <Grid2 alignContent={"center"} size={10}>Refresh Token Allowed</Grid2>
                                                <Grid2 size={2}>
                                                    <Checkbox
                                                        disabled={isMarkedForDelete}
                                                        id="refreshTokensAllowed"
                                                        checked={oidcProviderInput.refreshTokenAllowed}
                                                        onChange={(_, checked: boolean) => {
                                                            oidcProviderInput.refreshTokenAllowed = checked;
                                                            setOIDCProviderInput({ ...oidcProviderInput });
                                                            setMarkDirty(true);
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setOIDCProviderInput(initInput);
                                        setMarkDirty(false);
                                        setChangeClientSecret(false);
                                    }}
                                    onUpdateClickedHandler={() => {
                                        setShowMutationBackdrop(true);
                                        oidcProviderUpdateMutation();  
                                    }}
                                    markDirty={markDirty}
                                />                                  
                            </Paper>
                        </Grid2>
                        
                        <Grid2 size={12} marginBottom={"16px"}>
                            {!isMarkedForDelete &&
                                <Accordion defaultExpanded={true}  >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        id={"domain-configuration"}
                                        sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                    >
                                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                            <AlternateEmailIcon /><div style={{marginLeft: "8px"}}>Domains</div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FederatedOIDCProviderDomainConfiguration
                                            federatedOIDCProviderId={federatedOIDCProvider.federatedOIDCProviderId}
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
                                    </AccordionDetails>
                                </Accordion>
                            }
                        </Grid2>
                        
                        <Grid2 size={12} marginBottom={"16px"}>
                            {!isMarkedForDelete &&
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
                                        <FederatedOIDCProviderTenantConfiguration
                                            federatedOIDCProviderId={federatedOIDCProvider.federatedOIDCProviderId}
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
                                        
                                    </AccordionDetails>
                                </Accordion>
                            }
                        </Grid2>
                    </Grid2>
                </DetailPageMainContentContainer>
            </DetailPageContainer>
            <DetailPageRightNavContainer><div></div></DetailPageRightNavContainer>


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
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            >
                <Alert sx={{fontSize: "1em"}}
                    onClose={() => setShowMutationSnackbar(false)}
                >
                    Provider Updated
                </Alert>
            </Snackbar>            
        </Typography>


    )
}

export default FederatedOIDCProviderDetail;