"use client";
import React from "react";
import { QRCodeSVG } from 'qrcode.react';
import { AuthenticationComponentsProps } from "./portal-login";
import { RegistrationComponentsProps } from "./register";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_CONFIGURE_TOTP, REGISTER_CONFIGURE_TOTP } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { AuthenticationState, RegistrationState, UserAuthenticationStateResponse, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";


const AuthentiationConfigureTotp: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {


    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [configurationPage, setConfigurationPage] = React.useState<number>(1);
    const [nextUserAuthenticationStateResponse, setNextUserAuthenticationStateResponse] = React.useState<UserAuthenticationStateResponse>();

    // GRAPHQL FUNCTIONS
    const [authenticateConfigureTOTP] = useMutation(AUTHENTICATE_CONFIGURE_TOTP, {
        onCompleted(data) {
            const response: UserAuthenticationStateResponse = data.authenticateConfigureTOTP as UserAuthenticationStateResponse;
            if(response.userAuthenticationState.authenticationState === AuthenticationState.Error){
                onUpdateEnd(false, null);
                setErrorMessage(response.authenticationError.errorCode);
            }
            else{
                setNextUserAuthenticationStateResponse(response);
                setConfigurationPage(2);
            }            
        },
        onError(error) {
            onUpdateEnd(false, null);
            setErrorMessage(error.message);
        },
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
            {configurationPage === 1 &&
                <React.Fragment>
                    <Grid2 size={12} container spacing={1}>
                        <Grid2 marginBottom={"8px"} size={12}>
                            <div style={{ marginBottom: "16px" }}>
                                For access you will need to configure a one-time passcode (OTP) using
                                an authenticator app (such as Google Authenticator or Microsoft Authenticator).
                            </div>
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
                                authenticateConfigureTOTP({
                                    variables: {
                                        userId: initialUserAuthenticationState.userId,
                                        authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                        preAuthToken: initialUserAuthenticationState.preAuthToken
                                    }
                                });
                            }}
                        >
                            Configure
                        </Button>
                        <Button
                            onClick={() => onAuthenticationCancelled()}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </React.Fragment>
            }
            {configurationPage === 2 &&
                <React.Fragment>
                    <Grid2 container size={12} spacing={1}>
                        <Grid2 marginBottom={"8px"} size={12}>
                            Use the QR code or the secret value to configure OTP on your device. Once completed click "Next"
                        </Grid2>
                        <Grid2 size={12}>
                            <div>
                                {nextUserAuthenticationStateResponse && nextUserAuthenticationStateResponse.uri &&
                                    <QRCodeSVG
                                        value={nextUserAuthenticationStateResponse.uri}
                                        size={256}
                                    />
                                }
                            </div>
                            <div>
                                {nextUserAuthenticationStateResponse && nextUserAuthenticationStateResponse.totpSecret &&
                                    <div style={{ margin: "25px 0px" }}>
                                        <div>Plain Text value of secret</div>
                                        <div><pre style={{ fontSize: "1.4em", letterSpacing: "4px", wordWrap: "break-word", whiteSpace: "pre-wrap" }}>{nextUserAuthenticationStateResponse.totpSecret}</pre></div>
                                    </div>
                                }
                            </div>
                        </Grid2>
                    </Grid2>
                    <Stack
                        width={"100%"}
                        direction={"row-reverse"}
                        spacing={2}
                    >
                        <Button
                            onClick={() => {
                                if (nextUserAuthenticationStateResponse) {
                                    onUpdateEnd(true, nextUserAuthenticationStateResponse);
                                }
                            }}
                        >
                            Next
                        </Button>
                        <Button
                            onClick={() => onAuthenticationCancelled()}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </React.Fragment>
            }

        </React.Fragment>
    )
}




const RegistrationConfigureTotp: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [nextUserRegistrationResponse, setNextUserRegistrationResponse] = React.useState<UserRegistrationStateResponse>();
    const [configurationPage, setConfigurationPage] = React.useState<number>(1);

    // GRAPHQL FUNCTIONS
    const [registerConfigureTOTP] = useMutation(REGISTER_CONFIGURE_TOTP, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerConfigureTOTP as UserRegistrationStateResponse;
            if (response.userRegistrationState.registrationState === RegistrationState.ValidateTotp) {
                setNextUserRegistrationResponse(data.registerConfigureTOTP);
                setConfigurationPage(2);
            }
            else {
                onUpdateEnd(true, response);
            }
        },
        onError(error) {
            onUpdateEnd(false, null);
            setErrorMessage(error.message);
        },
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
            {configurationPage === 1 &&
                <React.Fragment>
                    <Grid2 size={12} container spacing={1}>
                        <Grid2 marginBottom={"8px"} size={12}>
                            {initialUserRegistrationState.registrationState === RegistrationState.ConfigureTotpOptional &&
                                <div style={{ marginBottom: "16px" }}>
                                    Do you want to configure a one-time passcode (OTP)? It is not required, but is recommended. You
                                    will need an authenticator app (such as Google Authenticator or Microsoft Authenticator).
                                </div>
                            }
                            {initialUserRegistrationState.registrationState === RegistrationState.ConfigureTotpOptional &&
                                <div style={{ marginBottom: "16px" }}>
                                    You will need to configure a one-time passcode (OTP). This is required for access.
                                </div>
                            }
                        </Grid2>
                    </Grid2>
                    <Stack
                        width={"100%"}
                        direction={"row-reverse"}
                        spacing={2}
                    >
                        {initialUserRegistrationState.registrationState === RegistrationState.ConfigureTotpOptional &&
                            <Button
                                onClick={() => {
                                    onUpdateStart();
                                    registerConfigureTOTP({
                                        variables: {
                                            userId: initialUserRegistrationState.userId,
                                            registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                            preAuthToken: initialUserRegistrationState.preAuthToken,
                                            skip: true
                                        }
                                    });
                                }}
                            >
                                Skip
                            </Button>
                        }
                        <Button
                            onClick={() => {
                                onUpdateStart();
                                registerConfigureTOTP({
                                    variables: {
                                        userId: initialUserRegistrationState.userId,
                                        registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                        preAuthToken: initialUserRegistrationState.preAuthToken,
                                        skip: false
                                    }
                                });
                            }}
                        >
                            Configure
                        </Button>
                        <Button
                            onClick={() => onRegistrationCancelled()}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </React.Fragment>
            }
            {configurationPage === 2 &&
                <React.Fragment>
                    <Grid2 container size={12} spacing={1}>
                        <Grid2 marginBottom={"8px"} size={12}>
                            Use the QR code or the secret value to configure OTP on your device. Once completed click "Next"
                        </Grid2>
                        <Grid2 size={12}>
                            <div>
                                {nextUserRegistrationResponse && nextUserRegistrationResponse.uri &&
                                    <QRCodeSVG
                                        value={nextUserRegistrationResponse.uri}
                                        size={256}
                                    />
                                }
                            </div>
                            <div>
                                {nextUserRegistrationResponse && nextUserRegistrationResponse.totpSecret &&
                                    <div style={{ margin: "25px 0px" }}>
                                        <div>Plain Text value of secret</div>
                                        <div><pre style={{ fontSize: "1.4em", letterSpacing: "4px", wordWrap: "break-word", whiteSpace: "pre-wrap" }}>{nextUserRegistrationResponse.totpSecret}</pre></div>
                                    </div>
                                }
                            </div>
                        </Grid2>
                    </Grid2>
                    <Stack
                        width={"100%"}
                        direction={"row-reverse"}
                        spacing={2}
                    >
                        <Button
                            onClick={() => {
                                if (nextUserRegistrationResponse) {
                                    onUpdateEnd(true, nextUserRegistrationResponse);
                                }
                            }}
                        >
                            Next
                        </Button>
                        <Button
                            onClick={() => onRegistrationCancelled()}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </React.Fragment>
            }

        </React.Fragment>
    )
}

export { AuthentiationConfigureTotp, RegistrationConfigureTotp };