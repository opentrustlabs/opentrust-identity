"use client";
import React from "react";
import { AuthenticationComponentsProps } from "./login";
import { RegistrationComponentsProps } from "./register";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_VALIDATE_TOTP, REGISTER_VALIDATE_TOTP } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";


const AuthentiationValidateTotp: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {
    
    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [passcode, setPasscode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [authenticateValidateTotp] = useMutation(AUTHENTICATE_VALIDATE_TOTP, {
        onCompleted(data) {
            onUpdateEnd(data.authenticateValidateTOTP, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        }
    })
    
    return (
        <React.Fragment>
            {errorMessage !== null &&
                <>
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
                </>
            }
            <Grid2 size={12} container spacing={1}>
                <Grid2 marginBottom={"8px"} size={12}>
                    <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>Enter the code from your authenticator app</div>
                    <TextField name="passcode" id="passcode"
                        value={passcode}
                        onChange={(evt) => setPasscode(evt.target.value)}
                        fullWidth={true}
                        size="small"                        
                        required={true}
                        autoFocus={true}
                        label={"One-time-passcode"}
                    />
                </Grid2>
            </Grid2>
            <Stack 
                width={"100%"}
                direction={"row-reverse"}
                spacing={2}
            >
                <Button
                    onClick={() => {
                        onUpdateStart();
                        authenticateValidateTotp({
                            variables: {
                                userId: initialUserAuthenticationState.userId,
                                totpTokenValue: passcode,
                                authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                preAuthToken: initialUserAuthenticationState.preAuthToken
                            }
                        });
                    }}
                    disabled={passcode === null || passcode.length < 6}
                >
                    Confirm
                </Button>
                <Button
                    onClick={() => onAuthenticationCancelled()}
                >
                    Cancel
                </Button>
            </Stack>
        </React.Fragment>
    )
}

const RegistrationValidateTotp: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // STATE VARIABLES
    const [passcode, setPasscode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [registerValidateTOTP] = useMutation(REGISTER_VALIDATE_TOTP, {
        onCompleted(data) {
            onUpdateEnd(data.registerValidateTOTP, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);            
        },
    })
    
    return (
        <React.Fragment>
            <Grid2 size={12} container spacing={1}>
                <Grid2 marginBottom={"8px"} size={12}>
                    <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>Enter the code from your authenticator app</div>
                    <TextField name="passcode" id="passcode"
                        value={passcode}
                        onChange={(evt) => setPasscode(evt.target.value)}
                        fullWidth={true}
                        size="small"
                        required={true}
                        autoFocus={true}
                        label={"One-time-passcode"}
                    />
                </Grid2>
            </Grid2>
            <Stack 
                width={"100%"}
                direction={"row-reverse"}
                spacing={2}
            >
                <Button
                    onClick={() => {
                        onUpdateStart();
                        registerValidateTOTP({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                totpTokenValue: passcode,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken
                            }
                        });
                    }}
                    disabled={passcode === null || passcode.length < 6}
                >
                    Confirm
                </Button>
                <Button
                    onClick={() => onRegistrationCancelled()}
                >
                    Cancel
                </Button>
            </Stack>
        </React.Fragment>
    )
}

export { AuthentiationValidateTotp, RegistrationValidateTotp }