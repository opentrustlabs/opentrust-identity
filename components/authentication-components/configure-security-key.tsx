"use client";
import React from "react";
import { AuthenticationComponentsProps } from "./login";
import { RegistrationComponentsProps } from "./register";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_REGISTER_SECURITY_KEY, CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, REGISTER_CONFIGURE_SECURITY_KEY } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Fido2KeyRegistrationInput, Fido2RegistrationChallengeResponse, RegistrationState, UserAuthenticationStateResponse, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import { RegistrationResponseJSON, startRegistration } from "@simplewebauthn/browser";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { SESSION_TOKEN_TYPE_AUTHENTICATION, SESSION_TOKEN_TYPE_REGISTRATION } from "@/utils/consts";
import { useIntl } from 'react-intl';


const AuthentiationConfigureSecurityKey: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();


    // STATE VARIABLES
    // Need duplicate of the parent state variables for the generation of the 
    // key challenge.
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [createFido2Challenge] = useMutation(CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, {
        variables: {
            userId: initialUserAuthenticationState.userId,
            sessionToken: initialUserAuthenticationState.authenticationSessionToken, 
            sessionTokenType: SESSION_TOKEN_TYPE_AUTHENTICATION
        },
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const challengeResponse: Fido2RegistrationChallengeResponse = data.createFido2RegistrationChallenge;
            createKeyRegistration(challengeResponse);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
    });

    const [authenticateRegisterSecurityKey] = useMutation(AUTHENTICATE_REGISTER_SECURITY_KEY, {
        onCompleted(data) {
            const response: UserAuthenticationStateResponse = data.authenticateRegisterSecurityKey as UserAuthenticationStateResponse;
            onUpdateEnd(response, null);
        },
        onError(error){
            onUpdateEnd(null, error.message);
        }
    });

    
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
            catch(err: unknown){
                const e = err as Error;
                setErrorMessage(e.message);
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
                <Grid2 size={1}>
                    <WarningOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="warning" />
                </Grid2>
                <Grid2 marginBottom={"8px"} size={11}>
                    <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                        {intl.formatMessage({id: "SECURITY_KEY_REQUIRED"})}
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
                        createFido2Challenge();
                    }}
                >
                    {intl.formatMessage({id: "CONFIGURE_SECURITY_KEY"})}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => onAuthenticationCancelled()}
                >
                    {intl.formatMessage({id: "CANCEL"})}
                </Button>
            </Stack>
            <Backdrop
                    sx={{ color: '#fff' }}
                    open={showMutationBackdrop}
                    onClick={() => setShowMutationBackdrop(false)}
                >
                    <Typography variant="h6" color="white">
                        {intl.formatMessage({id: "GENERATING_CHALLENGE"})}
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

    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    // We need a local version of the following two variables because we need to
    // show the backdrop during the challenge generation step and we may have
    // errors from that step as well.
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [createFido2RegistrationChallenge] = useMutation(CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, {
        variables: {
            userId: initialUserRegistrationState.userId,
            sessionToken: initialUserRegistrationState.registrationSessionToken, 
            sessionTokenType: SESSION_TOKEN_TYPE_REGISTRATION
        },
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const challengeResponse: Fido2RegistrationChallengeResponse = data.createFido2RegistrationChallenge;
            createKeyRegistration(challengeResponse);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
    });
   

    const [registerConfigureSecurityKey] = useMutation(REGISTER_CONFIGURE_SECURITY_KEY, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerConfigureSecurityKey as UserRegistrationStateResponse;
            onUpdateEnd(response, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);            
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
            catch(err: unknown){
                const e = err as Error;
                setErrorMessage(e.message);
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
                <Grid2 size={1}>
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyOptional &&
                        <PriorityHighOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="info" />
                    }
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyRequired &&
                        <WarningOutlinedIcon sx={{height: "1.5em", width: "1.5em"}} color="warning" />
                    }                    
                </Grid2>
                <Grid2 marginBottom={"8px"} size={11}>
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyOptional &&
                        <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                            {intl.formatMessage({id: "SECURITY_KEY_OPTIONAL"})}
                        </div>
                    }
                    {initialUserRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyRequired &&
                        <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                            {intl.formatMessage({id: "SECURITY_KEY_REQUIRED"})}
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
                        createFido2RegistrationChallenge();
                    }}
                >
                    {intl.formatMessage({id: "CONFIGURE_KEY"})}
                </Button>
                {initialUserRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyOptional &&
                    <Button
                        variant="contained"
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
            <Backdrop
                    sx={{ color: '#fff' }}
                    open={showMutationBackdrop}
                    onClick={() => setShowMutationBackdrop(false)}
                >
                    <Typography variant="h6" color="white">
                        {intl.formatMessage({id: "GENERATING_CHALLENGE"})}
                    </Typography>
                </Backdrop>
        </React.Fragment>
    )
}

export { AuthentiationConfigureSecurityKey, RegistrationConfigureSecurityKey }