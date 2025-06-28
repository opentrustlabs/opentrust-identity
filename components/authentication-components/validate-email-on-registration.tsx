"use client";
import React from "react";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";
import { REGISTER_VERIFY_EMAIL_ADDRESS } from "@/graphql/mutations/oidc-mutations";
import { RegistrationComponentsProps } from "./register";
import { UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import Alert from "@mui/material/Alert";



const ValidateEmailOnRegistration: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    const [verificationCode, setVerificationCode] = React.useState<string>("");
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const [verifyEmailRegistrationToken] = useMutation(REGISTER_VERIFY_EMAIL_ADDRESS, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerVerifyEmailAddress as UserRegistrationStateResponse;
            onUpdateEnd(response, null)
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        },
    });
    
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
                        verifyEmailRegistrationToken({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                token: verificationCode,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken
                            }
                        });
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