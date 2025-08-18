"use client";
import { FederatedOidcProviderCreateInput } from "@/graphql/generated/graphql-types";
import { FEDERATED_OIDC_PROVIDER_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, OIDC_CLIENT_AUTH_TYPE_DISPLAY, OIDC_CLIENT_AUTH_TYPE_NONE, OIDC_EMAIL_SCOPE, OIDC_OFFLINE_ACCESS_SCOPE, OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, SOCIAL_OIDC_PROVIDERS } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { Alert, Autocomplete, Button, Checkbox, DialogActions, DialogContent, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';


export interface NewOIDCProviderDialogProps {
    onCancel: () => void,
    onClose: () => void,
    onCreateStart: () => void,
    onCreateEnd: (success: boolean) => void
}

const NewOIDCProviderDialog: React.FC<NewOIDCProviderDialogProps> = ({
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {

    const initInput: FederatedOidcProviderCreateInput = {
        federatedOIDCProviderName: "",
        federatedOIDCProviderDescription: "",
        federatedOIDCProviderTenantId: "",
        federatedOIDCProviderClientId: "",
        federatedOIDCProviderClientSecret: "",
        federatedOIDCProviderWellKnownUri: "",
        refreshTokenAllowed: true,
        usePkce: false,
        federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE,
        federatedoidcprovidertypeid: "",
        clientAuthType: OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST,
        clientauthtypeid: "",
        scopes: [OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, OIDC_EMAIL_SCOPE, OIDC_OFFLINE_ACCESS_SCOPE],
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
                onCreateEnd(true);                
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}/oidc-providers/${data.createFederatedOIDCProvider.federatedOIDCProviderId}`);
                onClose();
            },
            onError(error) {
                onCreateEnd(false);
                setErrorMessage(error.message);
            },
        }
    );

    // HANDLER FUNCTIONS
    const isValidInput = (oidcProviderInput: FederatedOidcProviderCreateInput): boolean => {

        if (!oidcProviderInput.federatedOIDCProviderName || oidcProviderInput.federatedOIDCProviderName === "") {
            return false;
        }
        if (!oidcProviderInput.federatedOIDCProviderType || oidcProviderInput.federatedOIDCProviderType === "") {
            return false
        }
        if (!oidcProviderInput.federatedOIDCProviderClientId || oidcProviderInput.federatedOIDCProviderClientId === "") {
            return false;
        }
        if (oidcProviderInput.usePkce === false && (!oidcProviderInput.clientAuthType || oidcProviderInput.federatedOIDCProviderClientSecret === OIDC_CLIENT_AUTH_TYPE_NONE)) {
            return false;
        }
        if (oidcProviderInput.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL && (!oidcProviderInput.socialLoginProvider || oidcProviderInput.socialLoginProvider === "")) {
            return false;
        }
        if (!oidcProviderInput.federatedOIDCProviderWellKnownUri || oidcProviderInput.federatedOIDCProviderWellKnownUri === "") {
            return false;
        }

        return true;
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
                                    required name="oidcProviderName" id="oidcProviderName"
                                    onChange={(evt) => { oidcProviderInput.federatedOIDCProviderName = evt?.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
                                    value={oidcProviderInput.federatedOIDCProviderName}
                                    fullWidth={true}
                                    size="small" />
                            </Grid2>
                            <Grid2 marginBottom={"8px"}>
                                <div>Provider Descripton</div>
                                <TextField
                                    name="oidcProviderDescription" id="oidcProviderDescription"
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
                                    name="oidcProviderType"
                                    onChange={(evt) => {
                                        oidcProviderInput.federatedOIDCProviderType = evt.target.value;
                                        if (evt.target.value === FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE) {
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
                                        onChange={(_, value) => {
                                            oidcProviderInput.socialLoginProvider = value;
                                            setOIDCProviderInput({ ...oidcProviderInput });
                                        }}
                                        value={oidcProviderInput.socialLoginProvider}
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
                                    Allow Refresh Tokens
                                </Grid2>
                                <Grid2 size={1}>
                                    <Checkbox
                                        id="refreshTokensAllowed"
                                        checked={oidcProviderInput.refreshTokenAllowed}
                                        onChange={(_, checked: boolean) => {
                                            oidcProviderInput.refreshTokenAllowed = checked;
                                            setOIDCProviderInput({ ...oidcProviderInput });
                                        }}
                                    />
                                </Grid2>
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
                                            if (!checked && oidcProviderInput.clientAuthType === OIDC_CLIENT_AUTH_TYPE_NONE) {
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
                                <div>Provider Client Secret (Not required if using PCKE or you want IdP owner to enter the secret)</div>
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
                                    // @typescript-eslint/no-explicit-any
                                    onChange={(_, value: any) => {
                                        // @typescript-eslint/no-explicit-any
                                        oidcProviderInput.scopes = value.map((v: any) => v.id);
                                        setOIDCProviderInput({ ...oidcProviderInput });
                                    }}
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { onCancel(); }}>Cancel</Button>
                <Button
                    onClick={() => {
                        onCreateStart();
                        createClientMutation();
                    }}
                    disabled={
                        !isValidInput(oidcProviderInput)
                    }
                >
                    Create
                </Button>
            </DialogActions>

        </>
    )
}

export default NewOIDCProviderDialog;