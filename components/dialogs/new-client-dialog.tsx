"use client";
import { Client, ClientCreateInput } from "@/graphql/generated/graphql-types";
import { CLIENT_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS, CLIENT_TYPE_SERVICE_ACCOUNT_ONLY, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY, CLIENT_TYPES_DISPLAY, DEFAULT_END_USER_TOKEN_TTL_SECONDS, DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, FEDERATED_AUTHN_CONSTRAINT_DISPLAY, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED, FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, TENANT_TYPE_IDENTITY_MANAGEMENT, TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES, TENANT_TYPE_ROOT_TENANT, TENANT_TYPE_SERVICES, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { Alert, Button, DialogActions, DialogContent, DialogTitle, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";


export interface NewClientDialogProps {
    tenantId: string,
    onCancel: () => void,
    onClose: () => void,
    onCreateStart: () => void,
    onCreateEnd: (success: boolean) => void
}

const NewClientDialog: React.FC<NewClientDialogProps> = ({
    tenantId,
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {

    const initInput: ClientCreateInput = {
        clientName: "",
        clientType: CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS,
        tenantId: tenantId,
        clientDescription: "",
        clientTokenTTLSeconds: DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
        enabled: true,
        maxRefreshTokenCount: 0,
        oidcEnabled: true,
        pkceEnabled: false,
        userTokenTTLSeconds: DEFAULT_END_USER_TOKEN_TTL_SECONDS
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

    // STATE VARIABLES    
    const [clientInput, setClientInput] = React.useState<ClientCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [createdClient, setCreatedClient] = React.useState<Client | null>(null);

    // GRAPHQL FUNCTIONS
    const [createClientMutation] = useMutation(
        CLIENT_CREATE_MUTATION,
        {
            variables: {
                clientInput: clientInput
            },
            onCompleted(data) {
                onCreateEnd(true);
                setCreatedClient(data.createClient);
            },
            onError(error) {
                onCreateEnd(false);
                setErrorMessage(error.message)
            },
        }
    );

    const tenantIdForFinishSetup =
        tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ?
            tenantBean.getTenantMetaData().tenant.tenantId :
            tenantId; 

    return (
        <>
            {createdClient !== null &&
                <DialogTitle fontWeight={"bold"}>Client Successfully Created</DialogTitle>
            }
            {createdClient === null &&
                <DialogTitle >New Client</DialogTitle>
            }
            <DialogContent>
                <Typography component={"div"}>
                    {createdClient !== null &&
                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                            <Grid2 container size={12}>
                                <Grid2 size={0.5}>
                                    <PriorityHighOutlinedIcon sx={{color: "red"}}/>
                                </Grid2>
                                <Grid2 size={11.5}>
                                    Copy the client id and client secret values to secure storage
                                </Grid2>
                            </Grid2>
                            <Grid2 size={12}>
                                <div style={{ textDecoration: "underline" }}>Client ID</div>
                            </Grid2>
                            <Grid2 container display={"inline-flex"} size={12}>
                                <Grid2 size={11}>
                                    {createdClient.clientId}
                                </Grid2>
                                <Grid2 size={1}>
                                    <ContentCopyIcon 
                                        sx={{ cursor: "pointer" }} 
                                        onClick={() => {
                                            copyContentToClipboard(createdClient.clientId, "Client ID copied to clipboard");
                                        }}    
                                    />
                                </Grid2>
                            </Grid2>
                            <Grid2 size={12} marginBottom={"8px"}>
                                <div style={{ textDecoration: "underline" }}>Client Secret (Base64 Encoded)</div>
                            </Grid2>
                            <Grid2 container display={"inline-flex"} size={12}>
                                <Grid2 size={11}>
                                    {createdClient.clientSecret}
                                </Grid2>
                                <Grid2 size={1}>
                                    <ContentCopyIcon 
                                        sx={{ cursor: "pointer" }} 
                                        onClick={() => {
                                            copyContentToClipboard(createdClient.clientSecret, "Client secret copied to clipboard");
                                        }} 
                                    />
                                </Grid2>
                            </Grid2>                            
                        </Grid2>
                    }
                    {createdClient === null &&
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
                                <Grid2 marginBottom={"16px"}>
                                    <div>Client Type</div>
                                    <Select
                                        size="small"
                                        fullWidth={true}
                                        value={clientInput.clientType}
                                        name="clientType"
                                        onChange={(evt) => { clientInput.clientType = evt.target.value; setClientInput({ ...clientInput }); }}
                                    >
                                        <MenuItem value={CLIENT_TYPE_SERVICE_ACCOUNT_ONLY} >{CLIENT_TYPES_DISPLAY.get(CLIENT_TYPE_SERVICE_ACCOUNT_ONLY)}</MenuItem>
                                        <MenuItem value={CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS} >{CLIENT_TYPES_DISPLAY.get(CLIENT_TYPE_SERVICE_ACCOUNT_AND_USER_DELEGATED_PERMISSIONS)}</MenuItem>
                                        <MenuItem value={CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY} >{CLIENT_TYPES_DISPLAY.get(CLIENT_TYPE_USER_DELEGATED_PERMISSIONS_ONLY)}</MenuItem>
                                    </Select>
                                </Grid2>
                                <Grid2 marginBottom={"16px"}>
                                    <div>Client Name</div>
                                    <TextField required name="clientName" id="clientName" onChange={(evt) => { clientInput.clientName = evt?.target.value; setClientInput({ ...clientInput }) }} value={clientInput.clientName} fullWidth={true} size="small" />
                                </Grid2>
                                <Grid2 marginBottom={"16px"}>
                                    <div>Client Descripton</div>
                                    <TextField
                                        name="tenantDescription" id="tenantDescription"
                                        value={clientInput.clientDescription} fullWidth={true} size="small" multiline={true} rows={2}
                                        onChange={(evt) => { clientInput.clientDescription = evt?.target.value; setClientInput({ ...clientInput }) }}
                                    />
                                </Grid2>
                                
                            </Grid2>
                        </Grid2>
                    }
                </Typography>
            </DialogContent>
            {createdClient !== null &&
                <DialogActions>
                    <Button onClick={() => {                        
                        router.push(`/${tenantIdForFinishSetup}/clients/${createdClient.clientId}`);
                        onClose();
                    }} >
                        Finish Setup
                    </Button>
                </DialogActions>
            }
            {createdClient === null &&
                <DialogActions>
                    <Button onClick={() => { onCancel(); setClientInput(initInput); }}>Cancel</Button>
                    <Button
                        onClick={() => {onCreateStart(); createClientMutation(); }}
                        disabled={
                            clientInput.clientName === null || clientInput.clientName === "" || clientInput.clientType === null || clientInput.clientType === ""}
                    >
                        Create
                    </Button>
                </DialogActions>
            }
        </>
    )
}

export default NewClientDialog;