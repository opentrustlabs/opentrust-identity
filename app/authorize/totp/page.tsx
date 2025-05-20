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


const TOTP: React.FC = () => {

    const [data, setData] = React.useState<TotpResponse | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [totpValue, setTotpValue] = React.useState<string>("");
    const [isValid, setIsValid] = React.useState<string>("false");
    

    const [validateTotp] = useLazyQuery(VALIDATE_TOTP_TOKEN_QUERY, {
        
        onCompleted(data) {
            setIsValid(data.validateTOTP)
        },
        onError(error) {
            setErrorMessage(error.message)
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"

    });


    const [generateQRCode] = useMutation(GENERATE_TOTP_MUTATION, {
        variables: {
            userId: "83fb0831-8a00-459c-82c5-9fe69c42dbf7"
        },
        onCompleted(data) {
            setData(data.generateTOTP);            
        },
        onError(error) {
            setErrorMessage(error.message);
        },
        notifyOnNetworkStatusChange: true
    });

    
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
                    <Button onClick={() => generateQRCode()}>Generate QR Code</Button>
                </div>
                <div style={{marginBottom: "95px"}}>QR CODE HERE</div>
                <div>
                    {data &&
                        <QRCodeSVG
                            value={data.uri}
                            size={256}
                        />
                    }
                </div>
                <div>
                    {data &&
                        <div style={{margin: "25px 0px"}}>
                        <div>Plain Text value of secret</div>
                        <div><pre style={{fontSize: "1.4em", letterSpacing: "4px", wordWrap: "break-word", whiteSpace: "pre-wrap"}}>{data.userMFARel.totpSecret}</pre></div>
                        </div>
                    }
                </div>
                <div style={{marginTop: "55px"}}>
                    <TextField
                        value={totpValue}
                        onChange={(evt) => setTotpValue(evt.target.value)}
                    />
                </div>
                <div>
                    <Button 
                        onClick={() => validateTotp({
                            variables: {
                                userId: "83fb0831-8a00-459c-82c5-9fe69c42dbf7",
                                totpValue: totpValue
                            }
                        })}
                    >Validate OTP
                    </Button>
                </div>
                <div>Is Valid Results</div>
                <div>{isValid}</div>
                
            </Paper>
        </Suspense>
    )
}


export default TOTP;