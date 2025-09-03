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
import { useIntl } from 'react-intl';


const ValidatePasswordResetToken: React.FC<AuthenticationComponentsProps> = ({
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
                    variant="contained"    
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
                    {intl.formatMessage({id: "CONFIRM"})}
                </Button>
                <Button
                    variant="contained"    
                    onClick={() => onAuthenticationCancelled()}
                >
                    {intl.formatMessage({id: "CANCEL"})}
                </Button>
            </Stack>
        </React.Fragment>
    )
}

export default ValidatePasswordResetToken;