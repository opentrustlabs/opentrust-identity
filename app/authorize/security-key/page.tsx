"use client";
import React, { Suspense } from "react";
import { QRCodeSVG } from 'qrcode.react';
import Paper from "@mui/material/Paper";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GENERATE_TOTP_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Button from "@mui/material/Button";
import { VALIDATE_TOTP_TOKEN_QUERY } from "@/graphql/queries/oidc-queries";
import { TextField } from "@mui/material";
import { TotpResponse } from "@/graphql/generated/graphql-types";


const SecurityKey: React.FC = () => {

    const [data, setData] = React.useState<TotpResponse | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [totpValue, setTotpValue] = React.useState<string>("");
    const [isValid, setIsValid] = React.useState<string>("false");
    

    // const [validateTotp] = useLazyQuery(VALIDATE_TOTP_TOKEN_QUERY, {
        
    //     onCompleted(data) {
    //         setIsValid(data.validateTOTP)
    //     },
    //     onError(error) {
    //         setErrorMessage(error.message)
    //     },
    //     fetchPolicy: "no-cache",
    //     nextFetchPolicy: "no-cache"

    // });

    const d = new TextDecoder().decode(
        new TextEncoder().encode("83fb0831-8a00-459c-82c5-9fe69c42dbf7")
    );
    console.log(d);

    // FOR DETAILS ON THE CREATION AND GETTING OF CREDENTIALS SEE:
    //
    // https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create
    // https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions
    // https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get
    // https://www.npmjs.com/package/@passwordless-id/webauthn


    // TODO
    // Handle cases where the browser does not support webauthn.
    if (!window.PublicKeyCredential) {

    }

    const publicKeyCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: new TextEncoder().encode("83fb0831-8a00-459c-82c5-9fe69c42dbf7"),
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
        rp: {
            name: "Open Trust Development",
            id: "localhost"
        },
        user: {
            displayName: "Aaron Hail",
            id: new TextEncoder().encode("83fb0831-8a00-459c-82c5-9fe69c42dbf7"),
            name: "aaron.hail@pfizer.com"
        },
        timeout: 300000,
        attestation: "direct"
    }


    // const [generateQRCode] = useMutation(GENERATE_TOTP_MUTATION, {
    //     variables: {
    //         userId: "83fb0831-8a00-459c-82c5-9fe69c42dbf7"
    //     },
    //     onCompleted(data) {
    //         setData(data.generateTOTP);            
    //     },
    //     onError(error) {
    //         setErrorMessage(error.message);
    //     },
    //     notifyOnNetworkStatusChange: true
    // });

    const configureSecurityKey = async () => {
        // navigator.credentials
        //     .create({ publicKey: publicKeyCreationOptions })
        //     .then((credential: Credential | null) => {
        //         if(credential){
        //             const publicKeyCredential: PublicKeyCredential = credential as PublicKeyCredential;
        //             const response = publicKeyCredential.response;

        //         }
        //     }
        // );
        try{
            const credential: Credential | null = await navigator.credentials.create({ publicKey: publicKeyCreationOptions });
            if(credential){
                const publicKeyCredential: PublicKeyCredential = credential as PublicKeyCredential;
                publicKeyCredential.authenticatorAttachment;
                publicKeyCredential.toJSON();

                const response = publicKeyCredential.response as AuthenticatorAttestationResponse;
                console.log(response);
                

                // Access attestationObject ArrayBuffer
                const attestationObj = response.attestationObject;

                // Access client JSON
                const clientJSON = response.clientDataJSON;

                // Return authenticator data ArrayBuffer
                const authenticatorData = response.getAuthenticatorData();

                // Return public key ArrayBuffer
                const pk = response.getPublicKey();

                // Return public key algorithm identifier
                const pkAlgo = response.getPublicKeyAlgorithm();

                // Return permissible transports array
                const transports = response.getTransports();
            }
        }
        catch(err){
            console.log(err);
        }
    }

    
    return (
        <Suspense>
            <Paper 
                elevation={3}
                sx={{padding: "55px"}}
            >
                {errorMessage &&
                    <div>{errorMessage}</div>
                }
                <div>
                    
                </div>
                <div style={{marginBottom: "95px"}}>SECURITY KEY EXAMPLE</div>
                <div>
                </div>
                <div>
                </div>
                <div style={{marginTop: "55px"}}>
                    <TextField
                        value={totpValue}
                        onChange={(evt) => setTotpValue(evt.target.value)}
                    />
                </div>
                <div>
                    <Button 
                        onClick={() => configureSecurityKey()}
                    >Add Security Key
                    </Button>
                </div>
                <div>Is Valid Results</div>
                <div>{isValid}</div>
                
            </Paper>
        </Suspense>
    )
}


export default SecurityKey;