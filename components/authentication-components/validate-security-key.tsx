"use client";
import React from "react";
import { AuthenticationComponentsProps } from "./login";
import { RegistrationComponentsProps } from "./register";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_VALIDATE_SECURITY_KEY, CREATE_FIDO2_AUTHENTICATION_CHALLENGE_MUTATION, REGISTER_VALIDATE_SECURITY_KEY } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Fido2AuthenticationChallengeResponse, Fido2KeyAuthenticationInput } from "@/graphql/generated/graphql-types";
import { startAuthentication, PublicKeyCredentialRequestOptionsJSON, AuthenticatorTransport, AuthenticationResponseJSON } from "@simplewebauthn/browser";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import { SESSION_TOKEN_TYPE_AUTHENTICATION, SESSION_TOKEN_TYPE_REGISTRATION } from "@/utils/consts";


const AuthentiationValidateSecurityKey: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {
    
    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [createFido2AuthenticationChallenge] = useMutation(CREATE_FIDO2_AUTHENTICATION_CHALLENGE_MUTATION, {
        variables: {
            userId: initialUserAuthenticationState.userId,
            sessionToken: initialUserAuthenticationState.authenticationSessionToken, 
            sessionTokenType: SESSION_TOKEN_TYPE_AUTHENTICATION
        },
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const challengeResponse: Fido2AuthenticationChallengeResponse = data.createFido2AuthenticationChallenge;
            createKeyAuthentication(challengeResponse);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message)
        },
    });
    

    const [authenticateValidateSecurityKey] = useMutation(AUTHENTICATE_VALIDATE_SECURITY_KEY, {
        onCompleted(data) {
            onUpdateEnd(data.authenticateValidateSecurityKey, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        }
    });

    const createKeyAuthentication = async (challengeResponse: Fido2AuthenticationChallengeResponse) => {
        try {
            const optionsJSON: PublicKeyCredentialRequestOptionsJSON = {
                challenge: challengeResponse.fido2Challenge.challenge,
                rpId: challengeResponse.rpId,                
                timeout: 300000,
                allowCredentials: [
                    {
                        id: challengeResponse.fido2AuthenticationChallengePasskeys[0].id,
                        transports: challengeResponse.fido2AuthenticationChallengePasskeys[0].transports as Array<AuthenticatorTransport>,
                        type: "public-key"
                    }
                ]
            };
            const useBrowserAutofill: boolean = false;
            const verifyBrowserAutofillInput: boolean = false;

            const resp: AuthenticationResponseJSON = await startAuthentication({
                optionsJSON,
                useBrowserAutofill,
                verifyBrowserAutofillInput
            });

            const fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput = {
                authenticationAttachment: resp.authenticatorAttachment || "",
                id: resp.id,
                rawId: resp.rawId,
                response: {
                    authenticatorData: resp.response.authenticatorData,
                    clientDataJSON: resp.response.clientDataJSON,
                    signature: resp.response.signature
                },
                type: "public-key"
            }

            onUpdateStart();
            authenticateValidateSecurityKey({
                variables: {
                    userId: challengeResponse.fido2Challenge.userId,
                    fido2KeyAuthenticationInput: fido2KeyAuthenticationInput,
                    authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                    preAuthToken: initialUserAuthenticationState.preAuthToken
                }
            });
        }
        catch(error: unknown){
            const e = error as Error;
            setErrorMessage(e.message);
        }
    }
    
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
                    <div style={{marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em"}}>Validate your security key</div>                    
                </Grid2>
            </Grid2>
            <Stack 
                width={"100%"}
                direction={"row-reverse"}
                spacing={2}
            >
                <Button
                    onClick={() => {
                        setErrorMessage(null);
                        setShowMutationBackdrop(true);
                        createFido2AuthenticationChallenge();
                    }}
                >
                    Validate Key
                </Button>
                <Button
                    onClick={() => onAuthenticationCancelled()}
                >
                    Cancel
                </Button>
            </Stack>
            <Backdrop
                    sx={{ color: '#fff' }}
                    open={showMutationBackdrop}
                    onClick={() => setShowMutationBackdrop(false)}
                >
                    <Typography variant="h6" color="white">
                        Generating Challenge...
                    </Typography>
                </Backdrop>
        </React.Fragment>
    )
}

const RegistrationValidateSecurityKey: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [createFido2AuthenticationChallenge] = useMutation(CREATE_FIDO2_AUTHENTICATION_CHALLENGE_MUTATION, {
        variables: {
            userId: initialUserRegistrationState.userId,
            sessionToken: initialUserRegistrationState.registrationSessionToken, 
            sessionTokenType: SESSION_TOKEN_TYPE_REGISTRATION
        },
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const challengeResponse: Fido2AuthenticationChallengeResponse = data.createFido2AuthenticationChallenge;
            createKeyAuthentication(challengeResponse);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message)
        },
    });
    

    const [registerValidateSecurityKey] = useMutation(REGISTER_VALIDATE_SECURITY_KEY, {
        onCompleted(data) {
            onUpdateEnd(data.registerValidateSecurityKey, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);            
        }
    });

    const createKeyAuthentication = async (challengeResponse: Fido2AuthenticationChallengeResponse) => {
        try {
            const optionsJSON: PublicKeyCredentialRequestOptionsJSON = {
                challenge: challengeResponse.fido2Challenge.challenge,
                rpId: challengeResponse.rpId,                
                timeout: 300000,
                allowCredentials: [
                    {
                        id: challengeResponse.fido2AuthenticationChallengePasskeys[0].id,
                        transports: challengeResponse.fido2AuthenticationChallengePasskeys[0].transports as Array<AuthenticatorTransport>,
                        type: "public-key"
                    }
                ]
            };
            const useBrowserAutofill: boolean = false;
            const verifyBrowserAutofillInput: boolean = false;

            const resp: AuthenticationResponseJSON = await startAuthentication({
                optionsJSON,
                useBrowserAutofill,
                verifyBrowserAutofillInput
            });

            const fido2KeyAuthenticationInput: Fido2KeyAuthenticationInput = {
                authenticationAttachment: resp.authenticatorAttachment || "",
                id: resp.id,
                rawId: resp.rawId,
                response: {
                    authenticatorData: resp.response.authenticatorData,
                    clientDataJSON: resp.response.clientDataJSON,
                    signature: resp.response.signature
                },
                type: "public-key"
            }

            onUpdateStart();            
            registerValidateSecurityKey({
                variables: {
                    userId: challengeResponse.fido2Challenge.userId,
                    fido2KeyAuthenticationInput: fido2KeyAuthenticationInput,
                    registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                    preAuthToken: initialUserRegistrationState.preAuthToken
                }
            });
        }
        catch(error: unknown){
            const e = error as Error;
            setErrorMessage(e.message);
        }
    }
    
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
                    <div style={{marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em"}}>Validate your security key</div>                    
                </Grid2>
            </Grid2>
            <Stack 
                width={"100%"}
                direction={"row-reverse"}
                spacing={2}
            >
                <Button
                    onClick={() => {
                        setErrorMessage(null);
                        setShowMutationBackdrop(true);
                        createFido2AuthenticationChallenge();
                    }}
                >
                    Validate Key
                </Button>
                <Button
                    onClick={() => onRegistrationCancelled()}
                >
                    Cancel
                </Button>
            </Stack>
            <Backdrop
                    sx={{ color: '#fff' }}
                    open={showMutationBackdrop}
                    onClick={() => setShowMutationBackdrop(false)}
                >
                    <Typography variant="h6" color="white">
                        Generating Challenge...
                    </Typography>
                </Backdrop>
        </React.Fragment>
    )
}

export { AuthentiationValidateSecurityKey, RegistrationValidateSecurityKey }