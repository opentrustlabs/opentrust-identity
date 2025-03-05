"use client";
import { Client, ClientCreateInput, FederatedOidcProviderCreateInput } from "@/graphql/generated/graphql-types";
import { CLIENT_CREATE_MUTATION, FEDERATED_OIDC_PROVIDER_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS, CLIENT_TYPE_SERVICE_ACCOUNT_ONLY, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY, CLIENT_TYPES_DISPLAY, DEFAULT_END_USER_TOKEN_TTL_SECONDS, DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, FEDERATED_AUTHN_CONSTRAINT_DISPLAY, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED, FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY, MFA_AUTH_TYPE_DISPLAY, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, OIDC_CLIENT_AUTH_TYPE_DISPLAY, OIDC_CLIENT_AUTH_TYPE_NONE, OIDC_EMAIL_SCOPE, OIDC_OFFLINE_ACCESS_SCOPE, OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, SOCIAL_OIDC_PROVIDERS, TENANT_TYPE_IDENTITY_MANAGEMENT, TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES, TENANT_TYPE_ROOT_TENANT, TENANT_TYPE_SERVICES, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { Alert, Autocomplete, AutocompleteChangeReason, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


export interface NewOIDCProviderDialogProps {
    onCancel: () => void,
    onClose: () => void
}

const NewOIDCProviderDialog: React.FC<NewOIDCProviderDialogProps> = ({
    onCancel,
    onClose
}) => {

    const initInput: FederatedOidcProviderCreateInput = {
        federatedOIDCProviderName: "",
        federatedOIDCProviderDescription: "",
        federatedOIDCProviderTenantId: "",
        federatedOIDCProviderClientId: "",
        federatedOIDCProviderClientSecret: "",
        federatedOIDCProviderWellKnownUri: "",
        refreshTokenAllowed: false,
        usePkce: false,
        federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE,
        federatedoidcprovidertypeid: "",
        clientAuthType: OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST,
        clientauthtypeid: "",
        scopes: [OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, OIDC_EMAIL_SCOPE],
        socialLoginProvider: ""
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES    
    const [oidcProviderInput, setOIDCProviderInput] = React.useState<FederatedOidcProviderCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    

    // GRAPHQL FUNCTIONS
    const [createClientMutation] = useMutation(
        FEDERATED_OIDC_PROVIDER_CREATE_MUTATION,
        {
            variables: {
                oidcProviderInput: oidcProviderInput
            },
            onCompleted(data) {                
                
            },
            onError(error) {
                setErrorMessage(error.message)
            },
        }
    );

    // HANDLER FUNCTIONS
    const isValidInput = (oidcProviderInput: FederatedOidcProviderCreateInput): boolean => {
        return false;
    }


    return (
        <>
            <DialogContent>
                <Typography component={"div"}>
                        <Grid2 container size={12} spacing={3} marginBottom={"16px"} >
                            <Grid2 size={12}>
                                {errorMessage &&
                                    <Grid2 size={{ xs: 12 }} textAlign={"center"}>
                                        <Stack
                                            direction={"row"}
                                            justifyItems={"center"}
                                            alignItems={"center"}
                                            sx={{ width: "100%" }}
                                        >
                                            <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                        </Stack>
                                    </Grid2>
                                }
                                <Grid2 marginBottom={"8px"}>
                                    <div>Provider Name</div>
                                    <TextField 
                                        required name="providerName" id="providerName" 
                                        onChange={(evt) => { oidcProviderInput.federatedOIDCProviderName = evt?.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }} 
                                        value={oidcProviderInput.federatedOIDCProviderName} 
                                        fullWidth={true} 
                                        size="small" />
                                </Grid2>
                                <Grid2 marginBottom={"8px"}>
                                    <div>Provider Descripton</div>
                                    <TextField
                                        name="providerDescription" id="providerDescription"
                                        value={oidcProviderInput.federatedOIDCProviderDescription} 
                                        fullWidth={true} 
                                        size="small" 
                                        multiline={true} 
                                        rows={2}
                                        onChange={(evt) => { oidcProviderInput.federatedOIDCProviderDescription = evt?.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
                                    />
                                </Grid2>
                                <Grid2 marginBottom={"8px"}>
                                    <div>Provider Type</div>
                                    <Select
                                        size="small"
                                        fullWidth={true}
                                        value={oidcProviderInput.federatedOIDCProviderType}
                                        name="providerType"
                                        onChange={(evt) => { 
                                            oidcProviderInput.federatedOIDCProviderType = evt.target.value; 
                                            if(evt.target.value === FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE){
                                                oidcProviderInput.socialLoginProvider = "";
                                            }
                                            setOIDCProviderInput({ ...oidcProviderInput }); 
                                        }}
                                    >
                                        <MenuItem value={FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE} >{FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE)}</MenuItem>
                                        <MenuItem value={FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL} >{FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL)}</MenuItem>                                        
                                    </Select>
                                </Grid2>
                                {oidcProviderInput.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL &&
                                    <Grid2 marginBottom={"8px"}>
                                        <div>Social Provider (Requires an account with the provider)</div>
                                        <Autocomplete
                                            id="socialLoginProvider"
                                            size="small"
                                            options={SOCIAL_OIDC_PROVIDERS}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Select or type..." variant="outlined" />
                                              )}
                                        />
                                    </Grid2>
                                }
                                <Grid2 marginBottom={"8px"}>
                                <div>Well Known URI</div>
                                    <TextField name="providerWellKnownUri" id="providerWellKnownUri" 
                                        value={oidcProviderInput.federatedOIDCProviderWellKnownUri} 
                                        onChange={(evt) => { oidcProviderInput.federatedOIDCProviderWellKnownUri = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
                                        fullWidth={true} size="small" />
                                </Grid2>
                                <Grid2 marginBottom={"8px"}>
                                    <div>Provider Client ID</div>
                                    <TextField name="clientId" id="clientId" 
                                        value={oidcProviderInput.federatedOIDCProviderClientId || ""} 
                                        onChange={(evt) => { oidcProviderInput.federatedOIDCProviderClientId = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
                                        fullWidth={true} size="small" />
                                </Grid2>
                                <Grid2 container marginBottom={"8px"}>
                                    <Grid2 alignContent={"center"} size={11}>
                                        Use PKCE
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Checkbox 
                                            checked={oidcProviderInput.usePkce}
                                            onChange={(_, checked: boolean) => {
                                                oidcProviderInput.usePkce = checked;  
                                                if(!checked && oidcProviderInput.clientAuthType === OIDC_CLIENT_AUTH_TYPE_NONE){
                                                    oidcProviderInput.clientAuthType = OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST;
                                                }
                                                setOIDCProviderInput({ ...oidcProviderInput }); 
                                            }}
                                        />
                                    </Grid2>
                                </Grid2>
                                <Grid2 marginBottom={"8px"}>
                                    <div>Authentication Type</div>
                                    <Select
                                        size="small"
                                        fullWidth={true}
                                        value={oidcProviderInput.clientAuthType}
                                        name="providerType"
                                        onChange={(evt) => { oidcProviderInput.clientAuthType = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
                                    >
                                        <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST)}</MenuItem>
                                        <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT)}</MenuItem>
                                        <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC)}</MenuItem>
                                        <MenuItem disabled={oidcProviderInput.usePkce === false} value={OIDC_CLIENT_AUTH_TYPE_NONE} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_NONE)}</MenuItem>
                                    </Select>
                                </Grid2>
                                <Grid2 marginBottom={"8px"}>
                                    <div>Provider Client Secret (Not required if using PCKE)</div>
                                    <TextField type="password" name="clientSecret" id="clientSecret" 
                                        value={oidcProviderInput.federatedOIDCProviderClientSecret} 
                                        onChange={(evt) => { oidcProviderInput.federatedOIDCProviderClientSecret = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
                                        fullWidth={true} size="small" />
                                </Grid2>
                                <Grid2 marginBottom={"8px"}>
                                    <div>Scope</div>
                                    <Autocomplete
                                        id="scopes"                                        
                                        multiple={true}
                                        size="small"
                                        sx={{ paddingTop: "8px" }}
                                        renderInput={(params) => <TextField {...params} label="" />}
                                        options={[
                                            {id: OIDC_OPENID_SCOPE, label: OIDC_OPENID_SCOPE},
                                            {id: OIDC_EMAIL_SCOPE, label: OIDC_EMAIL_SCOPE},
                                            {id: OIDC_PROFILE_SCOPE, label: OIDC_PROFILE_SCOPE},
                                            {id: OIDC_OFFLINE_ACCESS_SCOPE, label: OIDC_OFFLINE_ACCESS_SCOPE}
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
                                            console.log("value is: " + JSON.stringify(value));
                                            oidcProviderInput.scopes = value.map((v: any) => v.id);
                                            setOIDCProviderInput({...oidcProviderInput});
                                        }}                                        
                                    />
                                </Grid2>


                            </Grid2>
                        </Grid2>
                    
                </Typography>
            </DialogContent>
            
                <DialogActions>
                    <Button onClick={() => { onCancel();  }}>Cancel</Button>
                    <Button
                        onClick={() => createClientMutation()}
                        disabled={
                            isValidInput(oidcProviderInput)
                        }
                    >                            
                        Create
                    </Button>
                </DialogActions>
            
        </>
    )
}

export default NewOIDCProviderDialog;