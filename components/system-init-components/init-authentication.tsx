"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import { Button, Grid2, Paper, Stack, TextField, Typography } from "@mui/material";
import { PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER, PKCS8_PRIVATE_KEY_HEADER } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { SYSTEM_INITIALIZATION_AUTHENTICATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { AuthenticationState, UserAuthenticationStateResponse } from "@/graphql/generated/graphql-types";
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";


const InitAuthentication: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onError,
    onNext,
    systemInitInput

}) => {

    // CONTEXT VARIABLES
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    

    // STATE VARIABLES
    const [privateKey, setPrivateKey] = React.useState<string>("");
    const [privateKeyPassword, setPrivateKeyPassword] = React.useState<string | null>("");

    // GRAPHQL FUNCTIONS
    const [initializationAuthenticationMutation] = useMutation(SYSTEM_INITIALIZATION_AUTHENTICATION_MUTATION, {
        variables: {
            privateKey: privateKey,
            password: privateKeyPassword
        },
        onCompleted(data) {
            const response: UserAuthenticationStateResponse = data.systemInitializationAuthentication;
            if(response.userAuthenticationState.authenticationState === AuthenticationState.Error){
                onError(response.authenticationError?.errorKey || "")
            }
            else{
                if(!response.accessToken || !response.tokenExpiresAtMs){
                    onError("ERROR_NO_AUTHORIZATION_TOKEN_WAS_RETURNED_DURING_AUTHENTICATION");
                }
                else{
                    authSessionProps.setAuthSessionData({
                        accessToken: response.accessToken ,
                        expiresAtMs: response.tokenExpiresAtMs
                    });
                }
                onNext(systemInitInput);
            }
        },
        onError(error) {
            onError(error.message);
        },
    })

    const handlePrivateKeyFileUpload = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {     
        changeEvent.preventDefault();   
        const inputElement = changeEvent.target;
        if(inputElement.files && inputElement.files?.length > 0){
            const reader: FileReader = new FileReader();
            reader.onloadend = (
                ( ev: ProgressEvent<FileReader>) => {
                    const result = ev.target?.result;
                    if(result){                        
                        // private pkcs8 files need to start with -----BEGIN PRIVATE KEY-----, or -----BEGIN ENCRYPTED PRIVATE KEY-----
                        const key: string = result.toString();
                        if(
                            key.startsWith(PKCS8_PRIVATE_KEY_HEADER) || privateKey.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER)
                        ){
                            setPrivateKey(key);
                            if(privateKey.startsWith(PKCS8_PRIVATE_KEY_HEADER)){
                                setPrivateKeyPassword("");
                            }
                        }                        
                        else{
                            changeEvent.target.value = "";
                            onError("Incorrect format. The private key file should use the PKCS#8 format.");
                        }
                    }
                    else{
                        changeEvent.target.value = "";
                        onError("Failed to read file");
                    }
                }
            )
            reader.readAsText(inputElement.files[0]);
        }
    }
    
    return (
        <Typography component="div">
            <Paper
                elevation={1}
                sx={{padding: "8px", border: "solid 1px lightgrey"}}                
            >
            <Grid2 container size={12} spacing={1}>
                <Grid2 marginBottom={"16px"} size={12} fontWeight={"bold"}>
                    Authenticate using your private key
                </Grid2>
                <Grid2 marginBottom={"16px"} size={12}>
                    <div>Select your private key file (in PKCS#8 format)</div>
                    <input type="file" accept=".pem, .key" id="privateKey" onChange={(evt) => handlePrivateKeyFileUpload(evt)} />    
                </Grid2>
                <Grid2 marginBottom={"16px"} size={12}>
                    <div>Passphrase (if the private key is encrypted)</div>
                    <TextField
                        size="small"
                        fullWidth={true}
                        onChange={(evt) => {
                            setPrivateKeyPassword(evt.target.value);
                        }}
                        type="password"
                    />
                </Grid2>
            </Grid2>
            <Stack sx={{width: "100%"}} direction={"row-reverse"}>
                <Button
                    onClick={() => {
                        initializationAuthenticationMutation()
                    }}
                    disabled={privateKey === null || privateKey === ""}
                >
                    Authenticate
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

export default InitAuthentication;