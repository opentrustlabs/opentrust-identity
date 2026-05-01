"use client";
import React from "react";
import { AuthenticationComponentsProps } from "./login";
import { RegistrationComponentsProps } from "./register";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_VALIDATE_PHONE_NUMBER, REGISTER_VALIDATE_PHONE_NUMBER } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useIntl } from 'react-intl';



const AuthenticationValidatePhoneNumber: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {
    
    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [passcode, setPasscode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [authenticateValidateTotp] = useMutation(AUTHENTICATE_VALIDATE_PHONE_NUMBER, {
        onCompleted(data) {
            onUpdateEnd(data.authenticateVerifyPhoneNumber, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        }
    });
    
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
                    <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                        {intl.formatMessage({id: "PHONE_NUMBER_VALIDATION_ENTER_VALIDATION_CODE"})}
                    </div>
                    <TextField name="passcode" id="passcode"
                        value={passcode}
                        onChange={(evt) => setPasscode(evt.target.value)}
                        fullWidth={true}                   
                        required={true}
                        autoFocus={true}
                        label={intl.formatMessage({id: "ONE_TIME_PASSCODE"})}
                        autoComplete="off"
                    />
                </Grid2>
            </Grid2>
            <Stack 
                width={"100%"}
                direction={"row-reverse"}
                spacing={2}
            >
                <Button
                    variant="contained"
                    onClick={() => {
                        onUpdateStart();
                        authenticateValidateTotp({
                            variables: {
                                userId: initialUserAuthenticationState.userId,
                                token: passcode,
                                authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                preAuthToken: initialUserAuthenticationState.preAuthToken
                            }
                        });
                    }}
                    disabled={passcode === null || passcode.length < 6}
                >
                    {intl.formatMessage({id: "CONFIRM"})}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => onAuthenticationCancelled()}
                >
                    {intl.formatMessage({id: "CANCEL"})}
                </Button>
            </Stack>
        </React.Fragment>
    )
}

const RegistrationValidatePhoneNumber: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const [passcode, setPasscode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [registerValidateTOTP] = useMutation(REGISTER_VALIDATE_PHONE_NUMBER, {
        onCompleted(data) {
            onUpdateEnd(data.registerVerifyPhoneNumber, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);            
        },
    })
    
    return (
        <React.Fragment>
            <Grid2 size={12} container spacing={1}>
                <Grid2 marginBottom={"8px"} size={12}>
                    <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                        {intl.formatMessage({id: "PHONE_NUMBER_VALIDATION_ENTER_VALIDATION_CODE"})}
                    </div>
                    <TextField name="passcode" id="passcode"
                        value={passcode}
                        onChange={(evt) => setPasscode(evt.target.value)}
                        fullWidth={true}
                        required={true}
                        autoFocus={true}
                        label={intl.formatMessage({id: "ONE_TIME_PASSCODE"})}
                        autoComplete="off"
                    />
                </Grid2>
            </Grid2>
            <Stack 
                width={"100%"}
                direction={"row-reverse"}
                spacing={2}
            >
                <Button
                    variant="contained"
                    onClick={() => {
                        onUpdateStart();
                        registerValidateTOTP({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                token: passcode,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken
                            }
                        });
                    }}
                    disabled={passcode === null || passcode.length < 6}
                >
                    {intl.formatMessage({id: "CONFIRM"})}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => onRegistrationCancelled()}
                >
                    {intl.formatMessage({id: "CANCEL"})}
                </Button>
            </Stack>
        </React.Fragment>
    )
}

export { AuthenticationValidatePhoneNumber, RegistrationValidatePhoneNumber }