"use client";
import React from "react";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";
import { AUTHENTICATE_VALIDATE_PASSWORD_RESET_TOKEN } from "@/graphql/mutations/oidc-mutations";
import { AuthenticationComponentsProps } from "./login";
import { UserAuthenticationStateResponse } from "@/graphql/generated/graphql-types";


const ValidatePasswordResetToken: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    const [verificationCode, setVerificationCode] = React.useState<string>("");

    const [verifyPasswordResetToken] = useMutation(AUTHENTICATE_VALIDATE_PASSWORD_RESET_TOKEN, {
        onCompleted(data) {
            const response: UserAuthenticationStateResponse = data.authenticateValidatePasswordResetToken as UserAuthenticationStateResponse;
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
                    <div style={{marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em"}}>A verification code has been sent to your email address. Please enter it below. The code is valid for 60 minutes</div>
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
                        verifyPasswordResetToken({
                            variables: {                                
                                token: verificationCode,
                                authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                preAuthToken: initialUserAuthenticationState.preAuthToken
                            }
                        });
                    }}
                    disabled={verificationCode === null || verificationCode === ""}
                >
                    Confirm
                </Button>
                <Button
                    onClick={() => onAuthenticationCancelled()}
                >
                    Cancel
                </Button>
            </Stack>
        </React.Fragment>
    )
}

export default ValidatePasswordResetToken;