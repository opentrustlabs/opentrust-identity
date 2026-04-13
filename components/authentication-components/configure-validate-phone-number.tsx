"use client";
import React from "react";
import { AuthenticationComponentsProps } from "./login";
import { RegistrationComponentsProps } from "./register";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_CONFIGURE_VALIDATE_PHONE_NUMBER, REGISTER_CONFIGURE_VALIDATE_PHONE_NUMBER } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { RegistrationState, UserAuthenticationStateResponse, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { useIntl } from 'react-intl';



const AuthenticationConfigureValidatePhoneNumber: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateStart,
    onUpdateEnd
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    // GRAPHQL FUNCTIONS
    const [authenticateConfigureValidatePhoneNumber] = useMutation(AUTHENTICATE_CONFIGURE_VALIDATE_PHONE_NUMBER, {
        onCompleted(data) {            
            const response: UserAuthenticationStateResponse = data.authenticateConfigureVerifyPhoneNumber as UserAuthenticationStateResponse;            
            onUpdateEnd(response, null);            
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        }
    });

    return (
        <React.Fragment>                
            <Grid2 size={12} marginBottom={"8px"}  container spacing={1}>
                <Grid2 size={1}>
                    <WarningOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="warning" />
                </Grid2>
                <Grid2 size={11}>
                    <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "0.95em" }}>
                        {intl.formatMessage({id: "PHONE_NUMBER_VALIDATION_REQUIRED_FOR_ACCESS"})}
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
                        onUpdateStart()
                        authenticateConfigureValidatePhoneNumber({
                            variables: {
                                userId: initialUserAuthenticationState.userId,
                                authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                preAuthToken: initialUserAuthenticationState.preAuthToken
                            }
                        });
                    }}
                >
                    {intl.formatMessage({id: "PHONE_NUMBER_VALIDATION_SEND_CODE"})}
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



const RegistrationConfigureValidatePhoneNumber: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    // GRAPHQL FUNCTIONS
    const [registerConfigureValidatePhoneNumber] = useMutation(REGISTER_CONFIGURE_VALIDATE_PHONE_NUMBER, {
        onCompleted(data) {            
            const response: UserRegistrationStateResponse = data.registerConfigureVerifyPhoneNumber as UserRegistrationStateResponse;
            onUpdateEnd(response, null);            
        },
        onError(error) {            
            onUpdateEnd(null, error.message);
        },
    });

    return (
        <React.Fragment>                
            <Grid2 size={12} container spacing={1}>
                <Grid2 size={1}>
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigurePhoneNumberValidationRequired &&
                        <WarningOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="warning" />
                    }
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigurePhoneNumberValidationOptional &&
                        <PriorityHighOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="info" />
                    }
                </Grid2>
                <Grid2 marginBottom={"8px"} size={11}>
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigurePhoneNumberValidationRequired &&
                        <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                            {intl.formatMessage({id: "PHONE_NUMBER_VALIDATION_REQUIRED_FOR_ACCESS"})}
                        </div>
                    }
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigurePhoneNumberValidationOptional &&
                        <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                            {intl.formatMessage({id: "PHONE_NUMBER_VALIDATION_OPTIONAL"})}
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
                        registerConfigureValidatePhoneNumber({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken,
                                skip: false
                            }
                        });
                    }}
                >
                    {intl.formatMessage({id: "PHONE_NUMBER_VALIDATION_SEND_CODE"})}
                </Button>
                {initialUserRegistrationState.registrationState === RegistrationState.ConfigurePhoneNumberValidationOptional &&
                    <Button
                        variant="contained"
                        onClick={() => {
                            onUpdateStart();
                            registerConfigureValidatePhoneNumber({
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
    )
}

export { AuthenticationConfigureValidatePhoneNumber, RegistrationConfigureValidatePhoneNumber };