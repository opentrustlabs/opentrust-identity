"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import { CLIENT_TYPE_SERVICE_ACCOUNT, CLIENT_TYPES_DISPLAY, DEFAULT_END_USER_TOKEN_TTL_SECONDS, DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS } from "@/utils/consts";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { ClientCreateInput } from "@/graphql/generated/graphql-types";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";


const RootClientConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onNext,
    systemInitInput

}) => {

    // STATE VARIABLES
    const initInput: ClientCreateInput = {
        clientName: systemInitInput.rootClientInput.clientName,
        clientType: CLIENT_TYPE_SERVICE_ACCOUNT,
        tenantId: "",
        clientDescription: systemInitInput.rootClientInput.clientDescription,
        clientTokenTTLSeconds: DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
        enabled: true,
        maxRefreshTokenCount: null,
        oidcEnabled: false,
        pkceEnabled: false,
        userTokenTTLSeconds: DEFAULT_END_USER_TOKEN_TTL_SECONDS,
        audience: null
    };
    const [clientInput, setClientInput] = React.useState<ClientCreateInput>(initInput);
    
    return (
        <Typography component="div">
            <Paper
                elevation={1}
                sx={{ padding: "8px", border: "solid 1px lightgrey" }}
            >
                <Grid2 container size={12} spacing={1}>
                    <Grid2 fontWeight={"bold"} size={12} marginBottom={"8px"}>
                        Configure the Root Client
                    </Grid2>
                    <Grid2 size={12} marginBottom={"8px"}>
                        <div>Client Name (Should include your organization name and environment. Example: MyOrg PROD Root Client)</div>
                        <TextField required name="clientName" id="clientName" onChange={(evt) => { clientInput.clientName = evt?.target.value; setClientInput({ ...clientInput }) }} value={clientInput.clientName} fullWidth={true} size="small" />
                    </Grid2>
                    <Grid2 size={12}  marginBottom={"8px"}>
                        <div>Client Descripton</div>
                        <TextField
                            name="clientDescription" id="clientDescription"
                            value={clientInput.clientDescription} fullWidth={true} size="small" multiline={true} rows={2}
                            onChange={(evt) => { clientInput.clientDescription = evt?.target.value; setClientInput({ ...clientInput }) }}
                        />
                    </Grid2>
                    <Grid2 size={12}  marginBottom={"8px"}>
                        <div>Client Type</div>
                        <TextField
                            disabled={true}
                            name="clientType" id="tenantDescription"
                            value={CLIENT_TYPES_DISPLAY.get(CLIENT_TYPE_SERVICE_ACCOUNT)} fullWidth={true} size="small"                          
                        />
                    </Grid2>
                </Grid2>
                <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                    <Button
                        onClick={() => {
                            systemInitInput.rootClientInput = clientInput;
                            onNext(systemInitInput);
                        }}
                        disabled={clientInput.clientName.length < 4 || !clientInput.clientDescription || clientInput.clientDescription?.length < 4}
                    >
                        Next
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

export default RootClientConfiguration;