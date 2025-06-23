"use client";
import React from "react";
import { AuthenticationComponentsProps } from "./portal-login";
import { RegistrationComponentsProps } from "./register";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_REGISTER_SECURITY_KEY, AUTHENTICATE_VALIDATE_SECURITY_KEY, CREATE_FIDO2_AUTHENTICATION_CHALLENGE_MUTATION, CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, REGISTER_CONFIGURE_SECURITY_KEY, REGISTER_VALIDATE_SECURITY_KEY } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Fido2AuthenticationChallengeResponse, Fido2KeyAuthenticationInput, Fido2KeyRegistrationInput, Fido2RegistrationChallengeResponse, RegistrationState, UserAuthenticationStateResponse, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import { RegistrationResponseJSON, startRegistration, startAuthentication, PublicKeyCredentialRequestOptionsJSON, AuthenticatorTransport, AuthenticationResponseJSON } from "@simplewebauthn/browser";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";


const AuthentiationConfigureSecurityKey: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {
    
    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [createFido2Challenge] = useMutation(CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, {
        variables: {
            userId: initialUserAuthenticationState.userId
        },
        onCompleted(data) {
            onUpdateEnd(false, null);
            const challengeResponse: Fido2RegistrationChallengeResponse = data.createFido2RegistrationChallenge;
            createKeyRegistration(challengeResponse);
        },
        onError(error) {
            onUpdateEnd(false, null);
            setErrorMessage(error.message)
        },
    });

    const [authenticateRegisterSecurityKey] = useMutation(AUTHENTICATE_REGISTER_SECURITY_KEY, {
        onCompleted(data) {
            const response: UserAuthenticationStateResponse = data.authenticateRegisterSecurityKey as UserAuthenticationStateResponse;
            onUpdateEnd(true, response);

        },
        onError(error){
            onUpdateEnd(false, null);
            setErrorMessage(error.message);
        }
    })

    
    const createKeyRegistration = async (challengeResponse: Fido2RegistrationChallengeResponse) => {
        if(challengeResponse){
            try{
                const attResp: RegistrationResponseJSON = await startRegistration({
                    optionsJSON: {
                        rp: {
                            name: challengeResponse.rpName,
                            id: challengeResponse.rpId
                        },
                        user: {
                            displayName: challengeResponse.userName,
                            id: challengeResponse.fido2Challenge.userId,
                            name: challengeResponse.email
                        },
                        challenge: challengeResponse.fido2Challenge.challenge,
                        pubKeyCredParams: [
                            {
                                type: "public-key",
                                alg: -257
                            },
                            {
                                type: "public-key",
                                alg: -7
                            },
                            {
                                type: "public-key",
                                alg: -8
                            }
                        ],
                        timeout: 300000,                    
                        attestation: "direct",
                        authenticatorSelection: {
                            authenticatorAttachment: "cross-platform"
                        }
                    }
                });
                console.log(attResp);

                const fido2KeyRegistrationInput: Fido2KeyRegistrationInput = {
                    authenticationAttachment: attResp.authenticatorAttachment || "",
                    id: attResp.id,
                    rawId: attResp.rawId,
                    response: {
                        attestationObject: attResp.response.attestationObject,
                        authenticatorData: attResp.response.authenticatorData || "",
                        clientDataJSON: attResp.response.clientDataJSON,
                        publicKey: attResp.response.publicKey || "",
                        publicKeyAlgorithm: attResp.response.publicKeyAlgorithm || 0,
                        transports: attResp.response.transports || []
                    },
                    type: attResp.type
                }
                onUpdateStart();
                authenticateRegisterSecurityKey({
                    variables: {
                        userId: initialUserAuthenticationState.userId,
                        authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                        preAuthToken: initialUserAuthenticationState.preAuthToken,
                        fido2KeyRegistrationInput: fido2KeyRegistrationInput    
                    }
                });
            }
            catch(err){
                console.log(err);
            }
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
                    <div style={{marginBottom: "16px"}}>Access to this tenant requires multi-factor authentication using a security key</div>                    
                </Grid2>
            </Grid2>
            <Stack 
                width={"100%"}
                direction={"row-reverse"}
                spacing={2}
            >
                <Button
                    onClick={() => {
                        setShowMutationBackdrop(true);
                        createFido2Challenge();
                    }}
                >
                    Configure Key
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

const RegistrationConfigureSecurityKey: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [createFido2RegistrationChallenge] = useMutation(CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, {
        variables: {
            userId: initialUserRegistrationState.userId
        },
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const challengeResponse: Fido2RegistrationChallengeResponse = data.createFido2RegistrationChallenge;
            createKeyRegistration(challengeResponse);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message)
        },
    });
   

    const [registerConfigureSecurityKey] = useMutation(REGISTER_CONFIGURE_SECURITY_KEY, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerConfigureSecurityKey as UserRegistrationStateResponse;
            onUpdateEnd(true, response);
        },
        onError(error) {
            onUpdateEnd(false, null);
            setErrorMessage(error.message);            
        }
    })


    const createKeyRegistration = async (challengeResponse: Fido2RegistrationChallengeResponse) => {
        if(challengeResponse){
            try{
                const attResp: RegistrationResponseJSON = await startRegistration({
                    optionsJSON: {
                        rp: {
                            name: challengeResponse.rpName,
                            id: challengeResponse.rpId
                        },
                        user: {
                            displayName: challengeResponse.userName,
                            id: challengeResponse.fido2Challenge.userId,
                            name: challengeResponse.email
                        },
                        challenge: challengeResponse.fido2Challenge.challenge,
                        pubKeyCredParams: [
                            {
                                type: "public-key",
                                alg: -257
                            },
                            {
                                type: "public-key",
                                alg: -7
                            },
                            {
                                type: "public-key",
                                alg: -8
                            }
                        ],
                        timeout: 300000,                    
                        attestation: "direct",
                        authenticatorSelection: {
                            authenticatorAttachment: "cross-platform"
                        }
                    }
                });
                console.log(attResp);

                const fido2KeyRegistrationInput: Fido2KeyRegistrationInput = {
                    authenticationAttachment: attResp.authenticatorAttachment || "",
                    id: attResp.id,
                    rawId: attResp.rawId,
                    response: {
                        attestationObject: attResp.response.attestationObject,
                        authenticatorData: attResp.response.authenticatorData || "",
                        clientDataJSON: attResp.response.clientDataJSON,
                        publicKey: attResp.response.publicKey || "",
                        publicKeyAlgorithm: attResp.response.publicKeyAlgorithm || 0,
                        transports: attResp.response.transports || []
                    },
                    type: attResp.type
                }
                onUpdateStart();                
                registerConfigureSecurityKey({
                    variables: {
                        userId: initialUserRegistrationState.userId,
                        registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                        preAuthToken: initialUserRegistrationState.preAuthToken,
                        fido2KeyRegistrationInput: fido2KeyRegistrationInput,
                        skip: false  
                    }
                });
            }
            catch(err){
                console.log(err);
            }
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
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyOptional &&
                        <div style={{ marginBottom: "16px" }}>
                            Do you want to configure a security key? This is an optional step and requires a hardware device
                            such as a YubiKey or Google's Titan Security Key
                        </div>
                    }
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyRequired &&
                        <div style={{ marginBottom: "16px" }}>
                            You will need to configure a security key to continue. This requires a hardware device
                            such as a YubiKey or Google's Titan Security Key
                        </div>
                    }
                </Grid2>
            </Grid2>

            <Stack 
                width={"100%"}
                direction={"row-reverse"}
                spacing={2}
            >
                {initialUserRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyOptional &&
                    <Button
                        onClick={() => {
                            registerConfigureSecurityKey({
                                variables: {
                                    userId: initialUserRegistrationState.userId,
                                    registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                    preAuthToken: initialUserRegistrationState.preAuthToken,
                                    fido2KeyRegistrationInput: null,
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
                        setShowMutationBackdrop(true);
                        createFido2RegistrationChallenge();
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

export { AuthentiationConfigureSecurityKey, RegistrationConfigureSecurityKey }