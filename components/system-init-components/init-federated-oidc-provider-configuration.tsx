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
import { FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, OIDC_EMAIL_SCOPE, OIDC_OFFLINE_ACCESS_SCOPE, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, OIDC_CLIENT_AUTH_TYPE_DISPLAY, OIDC_CLIENT_AUTH_TYPE_NONE, FEDERATED_OIDC_RESPONSE_TYPES, FEDERATED_OIDC_PROVIDER_SUBJECT_TYPES, FEDERATED_OIDC_RESPONSE_TYPE_CODE, FEDERATED_OIDC_PROVIDER_SUBJECT_TYPE_PUBLIC } from "@/utils/consts";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";
import { Alert, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useMutation } from "@apollo/client";
import { CREATE_FEDERATED_AUTH_TEST_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


const InitFederatedOIDCProviderConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onNext,
    systemInitInput

}) => {

    // CONTEXT VARIABLES
    const { copyContentToClipboard } = useClipboardCopyContext();
    
    // STATE VARIABLES
    const initInput: FederatedOidcProviderCreateInput = {
        federatedOIDCProviderName: systemInitInput.rootFederatedOIDCProviderInput?.federatedOIDCProviderName || "",
        federatedOIDCProviderDescription: systemInitInput.rootFederatedOIDCProviderInput?.federatedOIDCProviderDescription || "",
        federatedOIDCProviderTenantId: "",
        federatedOIDCProviderClientId: systemInitInput.rootFederatedOIDCProviderInput?.federatedOIDCProviderClientId || "",
        federatedOIDCProviderClientSecret: systemInitInput.rootFederatedOIDCProviderInput?.federatedOIDCProviderClientSecret || "",
        federatedOIDCProviderWellKnownUri: systemInitInput.rootFederatedOIDCProviderInput?.federatedOIDCProviderWellKnownUri || "",
        refreshTokenAllowed: true,
        usePkce: systemInitInput.rootFederatedOIDCProviderInput?.usePkce || false,
        federatedOIDCProviderType: FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE,
        federatedoidcprovidertypeid: "",
        clientAuthType: systemInitInput.rootFederatedOIDCProviderInput?.clientAuthType || OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST,
        clientauthtypeid: "",
        scopes: systemInitInput.rootFederatedOIDCProviderInput?.scopes ||  [OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, OIDC_EMAIL_SCOPE, OIDC_OFFLINE_ACCESS_SCOPE],
        socialLoginProvider: "",
        federatedOIDCProviderResponseType: FEDERATED_OIDC_RESPONSE_TYPE_CODE,
        federatedOIDCProviderSubjectType: FEDERATED_OIDC_PROVIDER_SUBJECT_TYPE_PUBLIC
    };        
    const [oidcProviderInput, setOIDCProviderInput] = React.useState<FederatedOidcProviderCreateInput>(initInput);
    const [oidcProviderTestDialogOpen, setOidcProviderTestDialogOpen] = React.useState<boolean>(false);
    const [oidcProviderTestUri, setOidcProviderTestUri] = React.useState<string | null>(null);
    const [providerTestErrorMessage, setProviderTestErrorMessage] = React.useState<string | null>(null);
    const [providerTestSucceeded, setProviderTestSucceeded] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    // createFederatedAuthTest(
    //      clientAuthType: $clientAuthType, 
    //      clientId: $clientId, 
    //      scope: $scope, 
    //      usePkce: $usePkce, 
    //      wellKnownUri: $wellKnownUri, clientSecret: $clientSecret)
    const [createFederatedAuthTestMutation] = useMutation(CREATE_FEDERATED_AUTH_TEST_MUTATION, {
        variables: {
            clientAuthType: oidcProviderInput.clientAuthType,
            clientId: oidcProviderInput.federatedOIDCProviderClientId,
            scope: oidcProviderInput.scopes.join(" "),
            usePkce: oidcProviderInput.usePkce,
            wellKnownUri: oidcProviderInput.federatedOIDCProviderWellKnownUri,
            clientSecret: oidcProviderInput.federatedOIDCProviderClientSecret,
            responseType: oidcProviderInput.federatedOIDCProviderResponseType
        },
        onCompleted(data) {
            if(data && data.createFederatedAuthTest){
                setOidcProviderTestUri(data.createFederatedAuthTest);
            }
            else{
                setProviderTestErrorMessage("There was an error creating a test URI for this provider");
            }
        },
        onError(error) {
            setProviderTestErrorMessage(error.message);
        },
    })

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
        if (oidcProviderInput.usePkce === false && (!oidcProviderInput.clientAuthType || oidcProviderInput.federatedOIDCProviderClientSecret === "")) {
            return false;
        }
        if (!oidcProviderInput.federatedOIDCProviderWellKnownUri || oidcProviderInput.federatedOIDCProviderWellKnownUri === "") {
            return false;
        }

        return true;
    }

    return (
        <Typography component="div">
            {oidcProviderTestDialogOpen &&
                <Dialog 
                    maxWidth="sm"
                    fullWidth={true}
                    open={oidcProviderTestDialogOpen}                    
                >
                    <DialogContent>
                        <Typography component="div">
                        {oidcProviderTestUri &&
                            <Grid2 size={12} container spacing={1}>
                                <Grid2 fontWeight={"bold"} size={12}>
                                    Copy and paste the following URI into a new browser tab or window and authenticate with the same
                                    email address that you used in a previous step.
                                </Grid2>
                                <Grid2 container spacing={1} size={12}>
                                    <Grid2 size={11}>{oidcProviderTestUri}</Grid2>
                                    <Grid2 size={1}>
                                        <ContentCopyIcon 
                                            sx={{cursor: "pointer"}}
                                            onClick={() => {
                                                copyContentToClipboard(oidcProviderTestUri, "Test URI copied to clipboard");
                                            }}
                                        />
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        }
                        {providerTestErrorMessage &&
                            <Alert severity="error" onClose={() => setProviderTestErrorMessage(null)}>{providerTestErrorMessage}</Alert>
                        }
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => {
                                setOidcProviderTestDialogOpen(false);
                            }}
                        >
                            Test Failed
                        </Button>
                        <Button
                            disabled={oidcProviderTestUri === null}
                            onClick={() => {
                                setOidcProviderTestDialogOpen(false);
                                setProviderTestSucceeded(true);
                            }}
                        >
                            Test Passed
                        </Button>
                    </DialogActions>
                </Dialog>
            }
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
                <Grid2 marginBottom={"8px"}>
                    <div>Response Type</div>
                    <Select
                        size="small"
                        fullWidth={true}
                        value={oidcProviderInput.federatedOIDCProviderResponseType}
                        name="responseType"
                        onChange={(evt) => { oidcProviderInput.federatedOIDCProviderResponseType = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
                    >
                        {FEDERATED_OIDC_RESPONSE_TYPES.map(
                            (type: string) => (
                                <MenuItem value={type} >{type}</MenuItem>
                            )
                        )}
                    </Select>
                </Grid2>
                <Grid2 marginBottom={"8px"}>
                    <div>Subject Type</div>
                    <Select
                        size="small"
                        fullWidth={true}
                        value={oidcProviderInput.federatedOIDCProviderSubjectType}
                        name="subjectType"
                        onChange={(evt) => { oidcProviderInput.federatedOIDCProviderSubjectType = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); }}
                    >
                        {FEDERATED_OIDC_PROVIDER_SUBJECT_TYPES.map(
                            (type: string) => (
                                <MenuItem value={type} >{type}</MenuItem>
                            )
                        )}
                    </Select>
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
                    {providerTestSucceeded &&
                        <Button 
                            onClick={() => {
                                systemInitInput.rootFederatedOIDCProviderInput = oidcProviderInput;
                                onNext(systemInitInput);
                            }}
                        >
                            Next
                        </Button>
                    }
                    {!providerTestSucceeded &&
                        <Button
                            onClick={() => {                            
                                createFederatedAuthTestMutation();
                                setOidcProviderTestDialogOpen(true);
                            }}
                            disabled={!isValidInput()}
                        >
                            Test
                        </Button>
                    }
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