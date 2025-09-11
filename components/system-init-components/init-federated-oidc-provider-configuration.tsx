"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { FederatedOidcProviderCreateInput } from "@/graphql/generated/graphql-types";
import { FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, OIDC_EMAIL_SCOPE, OIDC_OFFLINE_ACCESS_SCOPE, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, OIDC_CLIENT_AUTH_TYPE_DISPLAY, OIDC_CLIENT_AUTH_TYPE_NONE } from "@/utils/consts";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";


const InitFederatedOIDCProviderConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onError,
    onNext,
    systemInitInput

}) => {
    
    // STATE VARIABLES
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
    };        
    const [oidcProviderInput, setOIDCProviderInput] = React.useState<FederatedOidcProviderCreateInput>(initInput);

    // HANDLER FUNCTIONS
    const isValidInput = (): boolean => {

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
        if (!oidcProviderInput.federatedOIDCProviderWellKnownUri || oidcProviderInput.federatedOIDCProviderWellKnownUri === "") {
            return false;
        }

        return true;
    }

    return (
        <Typography component="div">
            <Paper
                elevation={1}
                sx={{ padding: "8px", border: "solid 1px lightgrey" }}
            >
                <Grid2 container size={12} spacing={1}>
                    <Grid2 fontWeight={"bold"} size={12} marginBottom={"8px"}>
                        Optional - Configure your enterprise OIDC provider if you want to use SSO to access the IAM tool. 
                        This will require a test to make sure SSO works.
                    </Grid2>
                </Grid2>
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
                    <div>Provider Client Secret</div>
                    <TextField type="password" name="clientSecret" id="clientSecret"
                        value={oidcProviderInput.federatedOIDCProviderClientSecret}
                        onChange={(evt) => { oidcProviderInput.federatedOIDCProviderClientSecret = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
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
                <Grid2 marginBottom={"16px"}>
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(_, value: any) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            oidcProviderInput.scopes = value.map((v: any) => v.id);
                            setOIDCProviderInput({ ...oidcProviderInput });
                        }}
                    />
                </Grid2>
                <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                    <Button
                        onClick={() => {                            
                            systemInitInput.rootFederatedOIDCProviderInput = oidcProviderInput;
                            onNext(systemInitInput);
                        }}
                        disabled={!isValidInput()}
                    >
                        Test
                    </Button>                    
                    <Button
                        onClick={() => {
                            onNext(systemInitInput);
                        }}
                    >
                        Skip
                    </Button>                    
                    <Button
                        onClick={() => {
                            onBack();
                        }}
                    >
                        Back
                    </Button>
                </Stack>
            </Paper>
        </Typography>
    )
}

export default InitFederatedOIDCProviderConfiguration;