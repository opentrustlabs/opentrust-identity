"use client";
import React, { Suspense, useEffect } from "react";
import Paper from "@mui/material/Paper";
import { useMutation } from "@apollo/client";
import { CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, CREATE_FIDO2_AUTHENTICATION_CHALLENGE_MUTATION, REGISTER_FIDO2_KEY_MUTATION, AUTHENTICATE_FIDO2_KEY_MUATATION } from "@/graphql/mutations/oidc-mutations";
import Button from "@mui/material/Button";
import { Fido2RegistrationChallengeResponse, Fido2KeyRegistrationInput, TotpResponse, Fido2AuthenticationChallengeResponse, Fido2KeyAuthenticationInput } from "@/graphql/generated/graphql-types";
import { RegistrationResponseJSON, startRegistration, startAuthentication, PublicKeyCredentialRequestOptionsJSON, AuthenticatorTransport, AuthenticationResponseJSON } from "@simplewebauthn/browser";
import Alert from "@mui/material/Alert";




const SecurityKey: React.FC = () => {

    const [data, setData] = React.useState<TotpResponse | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [isValid, setIsValid] = React.useState<string>("false");

    const [createFido2Challenge] = useMutation(CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, {
        variables: {
            userId: "83fb0831-8a00-459c-82c5-9fe69c42dbf7"
        },
        onCompleted(data) {
            // TODO
            // Need to stop the feedback indicating that the response is complete.
            const challengeResponse: Fido2RegistrationChallengeResponse = data.createFido2RegistrationChallenge;
            createKeyRegistration(challengeResponse);
        },
        onError(error) {
            // TODO
            // Need to stop the feedback indicating that the response is complete.
            setErrorMessage(error.message)
        },
    });

    const [createFido2AuthenticationChallenge] = useMutation(CREATE_FIDO2_AUTHENTICATION_CHALLENGE_MUTATION, {
        variables: {
            userId: "83fb0831-8a00-459c-82c5-9fe69c42dbf7"
        },
        onCompleted(data) {
            // TODO
            // Need to stop the feedback indicating that the response is complete.
            const challengeResponse: Fido2AuthenticationChallengeResponse = data.createFido2AuthenticationChallenge;
            createKeyAuthentication(challengeResponse);
        },
        onError(error) {
            // TODO
            // Need to stop the feedback indicating that the response is complete.
            setErrorMessage(error.message)
        },
    });


    const [registerFido2KeyMutation] = useMutation(REGISTER_FIDO2_KEY_MUTATION, {
        onCompleted(data) {
            console.log("success");
            console.log(data);            
        },
        onError(error) {
            console.log("error");
            setErrorMessage(error.message);
        }
    });


    const [authenticateFido2KeyMutation] = useMutation(AUTHENTICATE_FIDO2_KEY_MUATATION, {
        onCompleted(data) {
            console.log("success");
            console.log(data);            
        },
        onError(error) {
            console.log("error");
            setErrorMessage(error.message);
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

            console.log(resp);

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

            authenticateFido2KeyMutation({
                variables: {
                    userId: challengeResponse.fido2Challenge.userId,
                    fido2KeyAuthenticationInput: fido2KeyAuthenticationInput
                }
            })
        }
        catch(error){

        }
    }

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

                registerFido2KeyMutation({
                    variables: {
                        userId: challengeResponse.fido2Challenge.userId, 
                        fido2KeyRegistrationInput: fido2KeyRegistrationInput    
                    }
                });
            }
            catch(err){
                console.log(err);
            }
        }
        else{
            console.log("challengeResponse is still null");
        }
    }

    
    return (
        <Suspense>
            <Paper 
                elevation={3}
                sx={{padding: "55px"}}
            >
                {errorMessage &&
                    <div>
                        <Alert onClose={() => setErrorMessage(null)}>{errorMessage}</Alert></div>
                }
                <div>
                    
                </div>
                <div style={{marginBottom: "95px"}}>SECURITY KEY EXAMPLE</div>
                
                <div>
                    <Button 
                        onClick={async () => {
                            // TODO Need to show some feedback to the user
                            // indicating that something is happening
                            createFido2Challenge();
                        }}
                    >Add Security Key
                    </Button>
                </div>
                <div style={{marginTop: "16px"}}>
                    <Button 
                        onClick={async () => {
                            // TODO Need to show some feedback to the user
                            // indicating that something is happening
                            createFido2AuthenticationChallenge();
                            
                        }}
                    >Authenticate With Security Key
                    </Button>
                </div>   
            </Paper>
        </Suspense>
    )
}


export default SecurityKey;