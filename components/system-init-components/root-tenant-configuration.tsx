"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";


const RootTenantConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onError,
    onNext,
    systemInitInput

}) => {
    
    return (
        <Typography component="div">
            <Paper
                elevation={1}
                sx={{padding: "8px", border: "solid 1px lightgrey"}}
                
            >
            <Grid2 container size={12} spacing={1}>
                <Grid2 marginBottom={"16px"} size={12}>
                    <div>Select your private key file (in PKCS#8 format)</div>
                     
                </Grid2>
                <Grid2 marginBottom={"16px"} size={12}>
                    <div>Passphrase (if the private key is encrypted)</div>
                    <TextField
                        size="small"
                        fullWidth={true}
                        onChange={(evt) => {
                        }}
                        type="password"
                    />
                </Grid2>
            </Grid2>
            <Stack sx={{width: "100%"}} direction={"row-reverse"}>
                <Button
                    onClick={() => {
                        onNext(systemInitInput);
                    }}
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

export default RootTenantConfiguration;