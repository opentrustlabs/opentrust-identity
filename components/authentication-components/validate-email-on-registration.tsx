"use client";
import React from "react";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";
import { REGISTER_VERIFY_RECOVERY_EMAIL_ADDRESS, REGISTER_VERIFY_EMAIL_ADDRESS } from "@/graphql/mutations/oidc-mutations";
import { RegistrationComponentsProps } from "./register";
import { UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";

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

    const [verificationCode, setVerificationCode] = React.useState<string>("");

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
                    Confirm
                </Button>
                <Button
                    onClick={() => onRegistrationCancelled()}
                >
                    Cancel
                </Button>
            </Stack>
        </React.Fragment>
    )
}

export default ValidateEmailOnRegistration;