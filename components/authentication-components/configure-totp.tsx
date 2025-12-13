"use client";
import React from "react";
import { QRCodeSVG } from 'qrcode.react';
import { AuthenticationComponentsProps } from "./login";
import { RegistrationComponentsProps } from "./register";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_CONFIGURE_TOTP, REGISTER_CONFIGURE_TOTP } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { AuthenticationState, RegistrationState, UserAuthenticationStateResponse, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import Backdrop from "@mui/material/Backdrop";
import { CircularProgress } from "@mui/material";
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { useIntl } from 'react-intl';



const AuthentiationConfigureTotp: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();


    // STATE VARIABLES
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [configurationPage, setConfigurationPage] = React.useState<number>(1);
    const [nextUserAuthenticationStateResponse, setNextUserAuthenticationStateResponse] = React.useState<UserAuthenticationStateResponse>();

    // GRAPHQL FUNCTIONS
    const [authenticateConfigureTOTP] = useMutation(AUTHENTICATE_CONFIGURE_TOTP, {
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const response: UserAuthenticationStateResponse = data.authenticateConfigureTOTP as UserAuthenticationStateResponse;
            if(response.userAuthenticationState.authenticationState === AuthenticationState.Error){
                onUpdateEnd(response, null);
            }
            else{
                setNextUserAuthenticationStateResponse(response);
                setConfigurationPage(2);
            }            
        },
        onError(error) {
            setShowMutationBackdrop(false);
            onUpdateEnd(null, error.message);
        },
    })


    return (
        <React.Fragment>
            {configurationPage === 1 &&
                <React.Fragment>
                    <Grid2 size={12} marginBottom={"8px"}  container spacing={1}>
                        <Grid2 size={1}>
                            <WarningOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="warning" />
                        </Grid2>
                        <Grid2 size={11}>
                            <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "0.95em" }}>
                                {intl.formatMessage({id: "TOTP_REQUIRED_FOR_ACCESS"})}
                            </div>
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
                                setShowMutationBackdrop(true);
                                authenticateConfigureTOTP({
                                    variables: {
                                        userId: initialUserAuthenticationState.userId,
                                        authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                        preAuthToken: initialUserAuthenticationState.preAuthToken
                                    }
                                });
                            }}
                        >
                            {intl.formatMessage({id: "CONFIGURE"})}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => onAuthenticationCancelled()}
                        >
                            {intl.formatMessage({id: "CANCEL"})}
                        </Button>
                    </Stack>
                </React.Fragment>
            }
            {configurationPage === 2 &&
                <React.Fragment>
                    <Grid2 container size={12} spacing={1}>
                        <Grid2 marginBottom={"8px"} fontWeight={"bold"} fontSize={"1.0em"} size={12}>
                            {intl.formatMessage({id: "TOTP_CONFIGURE_APP_FOR_CODE"})}
                        </Grid2>
                        <Grid2 size={12}>
                            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
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
                                        <div>
                                            {intl.formatMessage({id: "PLAIN_TEXT_VALUE_OF_THE_SECRET"})}
                                        </div>
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
                            variant="contained"
                            onClick={() => {
                                if (nextUserAuthenticationStateResponse) {
                                    onUpdateEnd(nextUserAuthenticationStateResponse, null);
                                }
                            }}
                        >
                            {intl.formatMessage({id: "NEXT"})}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => onAuthenticationCancelled()}
                        >
                            {intl.formatMessage({id: "CANCEL"})}
                        </Button>
                    </Stack>
                </React.Fragment>
            }
            <Backdrop
                sx={{ color: '#fff' }}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
        </React.Fragment>
    )
}




const RegistrationConfigureTotp: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [nextUserRegistrationResponse, setNextUserRegistrationResponse] = React.useState<UserRegistrationStateResponse>();
    const [configurationPage, setConfigurationPage] = React.useState<number>(1);

    // GRAPHQL FUNCTIONS
    const [registerConfigureTOTP] = useMutation(REGISTER_CONFIGURE_TOTP, {
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const response: UserRegistrationStateResponse = data.registerConfigureTOTP as UserRegistrationStateResponse;
            // If successful, we will need to validate that the user has actually configured it. In the meantime,
            // this response will contain both the URI and the secret value so we need to show those to
            // the user, who will then be able to configure their authenticator with either of those two values.
            // Once completed, the user will click the "Next" button to go to the validation step.
            if (response.userRegistrationState.registrationState === RegistrationState.ValidateTotp) {
                setNextUserRegistrationResponse(response);
                setConfigurationPage(2);
            }
            else {
                onUpdateEnd(response, null);
            }
        },
        onError(error) {
            setShowMutationBackdrop(false);
            onUpdateEnd(null, error.message);
        },
    })

    return (
        <React.Fragment>
            {configurationPage === 1 &&
                <React.Fragment>
                    <Grid2 size={12} container spacing={1}>
                        <Grid2 size={1}>
                            {initialUserRegistrationState.registrationState === RegistrationState.ConfigureTotpRequired &&
                                <WarningOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="warning" />
                            }
                            {initialUserRegistrationState.registrationState === RegistrationState.ConfigureTotpOptional &&
                                <PriorityHighOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="info" />
                            }
                        </Grid2>
                        <Grid2 marginBottom={"8px"} size={11}>
                            {initialUserRegistrationState.registrationState === RegistrationState.ConfigureTotpOptional &&
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                                    {intl.formatMessage({id: "OPTIONAL_TOTP_CONFIGURATION"})}
                                </div>
                            }
                            {initialUserRegistrationState.registrationState === RegistrationState.ConfigureTotpRequired &&
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                                    {intl.formatMessage({id: "TOTP_REQUIRED_FOR_ACCESS"})}
                                </div>
                            }
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
                                setShowMutationBackdrop(true);
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
                            {intl.formatMessage({id: "CONFIGURE"})}
                        </Button>
                        {initialUserRegistrationState.registrationState === RegistrationState.ConfigureTotpOptional &&
                            <Button
                                variant="contained"
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
                                {intl.formatMessage({id: "SKIP"})}
                            </Button>
                        }                        
                        <Button
                            variant="contained"
                            onClick={() => onRegistrationCancelled()}
                        >
                            {intl.formatMessage({id: "CANCEL"})}
                        </Button>
                    </Stack>
                </React.Fragment>
            }
            {configurationPage === 2 &&
                <React.Fragment>
                    <Grid2 container size={12} spacing={1}>
                        <Grid2 marginBottom={"8px"} fontWeight={"bold"} fontSize={"1.0em"} size={12}>
                            {intl.formatMessage({id: "TOTP_CONFIGURE_APP_FOR_CODE"})}
                        </Grid2>
                        <Grid2 size={12}>
                            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
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
                                        <div>{intl.formatMessage({id: "PLAIN_TEXT_VALUE_OF_THE_SECRET"})}</div>
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
                            variant="contained"
                            onClick={() => {
                                if (nextUserRegistrationResponse) {
                                    onUpdateEnd(nextUserRegistrationResponse, null);
                                }
                            }}
                        >
                            {intl.formatMessage({id: "NEXT"})}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => onRegistrationCancelled()}
                        >
                            {intl.formatMessage({id: "CANCEL"})}
                        </Button>
                    </Stack>
                </React.Fragment>
            }
            <Backdrop
                sx={{ color: '#fff' }}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
        </React.Fragment>
    )
}

export { AuthentiationConfigureTotp, RegistrationConfigureTotp };