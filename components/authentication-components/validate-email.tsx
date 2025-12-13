"use client";
import React from "react";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";
import { REGISTER_VERIFY_RECOVERY_EMAIL_ADDRESS, REGISTER_VERIFY_EMAIL_ADDRESS, AUTHENTICATE_VALIDATE_EMAIL_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { RegistrationComponentsProps } from "./register";
import { UserAuthenticationStateResponse, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import { useIntl } from 'react-intl';
import { AuthenticationComponentsProps } from "./login";


export interface ValidateEmailOnRegistrationProps extends RegistrationComponentsProps {
    isRecoveryEmail: boolean
}

const ValidateEmailOnRegistration: React.FC<ValidateEmailOnRegistrationProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart,
    isRecoveryEmail
    
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const [verificationCode, setVerificationCode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [verifyEmailRegistrationToken] = useMutation(REGISTER_VERIFY_EMAIL_ADDRESS, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerVerifyEmailAddress as UserRegistrationStateResponse;
            onUpdateEnd(response, null)
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        },
    });
    
    const [verifyRecoveryEmailRegistrationToken] = useMutation(REGISTER_VERIFY_RECOVERY_EMAIL_ADDRESS, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerVerifyRecoveryEmail as UserRegistrationStateResponse;
            onUpdateEnd(response, null)
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        },
    });

    return (
        <React.Fragment>            
            <Grid2 size={12} container spacing={1}>
                <Grid2 marginBottom={"8px"} size={12}>
                    <div style={{marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em"}}>
                        {intl.formatMessage({id: "VALIDATE_EMAIL_WITH_TOKEN"})}
                    </div>
                    <TextField name="verificationCode" id="verificationCode"
                        value={verificationCode}
                        onChange={(evt) => setVerificationCode(evt.target.value)}
                        fullWidth={true}
                        size="small"
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
                        if(!isRecoveryEmail){
                            verifyEmailRegistrationToken({
                                variables: {
                                    userId: initialUserRegistrationState.userId,
                                    token: verificationCode,
                                    registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                    preAuthToken: initialUserRegistrationState.preAuthToken
                                }
                            });
                        }
                        else{
                            verifyRecoveryEmailRegistrationToken({
                                variables: {
                                    userId: initialUserRegistrationState.userId,
                                    token: verificationCode,
                                    registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                    preAuthToken: initialUserRegistrationState.preAuthToken
                                }
                            });
                        }
                    }}
                    disabled={verificationCode === null || verificationCode === ""}
                >
                    {intl.formatMessage({id: "CONFIRM"})}
                </Button>
                <Button
                    onClick={() => onRegistrationCancelled()}
                >
                    {intl.formatMessage({id: "CANCEL"})}
                </Button>
            </Stack>
        </React.Fragment>
    )
}

const ValidateEmailOnAuthentication: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {


    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const [verificationCode, setVerificationCode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [authenticateValidateEmailMutation] = useMutation(AUTHENTICATE_VALIDATE_EMAIL_MUTATION, {
        onCompleted(data) {
            const response: UserAuthenticationStateResponse = data.authenticateVerifyEmailAddress as UserAuthenticationStateResponse;
            onUpdateEnd(response, null)
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        },
    });


    return (
        <React.Fragment>            
            <Grid2 size={12} container spacing={1}>
                <Grid2 marginBottom={"8px"} size={12}>
                    <div style={{marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em"}}>
                        {intl.formatMessage({id: "VALIDATE_EMAIL_WITH_TOKEN"})}
                    </div>
                    <TextField name="verificationCode" id="verificationCode"
                        value={verificationCode}
                        onChange={(evt) => setVerificationCode(evt.target.value)}
                        fullWidth={true}
                        size="small"
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
                        // ($userId: String!, $token: String!, $authenticationSessionToken: String!, $preAuthToken: String
                        authenticateValidateEmailMutation({
                            variables: {
                                userId: initialUserAuthenticationState.userId,
                                token: verificationCode,
                                authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                preAuthToken: initialUserAuthenticationState.preAuthToken
                            }
                        });
                        
                    }}
                    disabled={verificationCode === null || verificationCode === ""}
                >
                    {intl.formatMessage({id: "CONFIRM"})}
                </Button>
                <Button
                    onClick={() => onAuthenticationCancelled()}
                >
                    {intl.formatMessage({id: "CANCEL"})}
                </Button>
            </Stack>
        </React.Fragment>
    )
}

export { ValidateEmailOnAuthentication, ValidateEmailOnRegistration }