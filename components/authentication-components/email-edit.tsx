"use client";
import { EmailChangeState, ProfileEmailChangeResponse, ProfileEmailChangeState } from "@/graphql/generated/graphql-types";
import { PROFILE_ADD_RECOVERY_EMAIL_MUTATION, PROFILE_CANCEL_EMAIL_CHANGE_MUTATION, PROFILE_HANDLE_EMAIL_CHANGE_MUTATION, PROFILE_VALIDATE_EMAIL_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import { Alert, Button, Grid2, Stack, TextField, Typography } from "@mui/material";
import React from "react";

export enum StateTransition {
    STATE_CHANGE_SUBMITTED,
    STATE_CHANGE_RECEIVED
}

export interface EmailEditProps {
    userId: string,
    isPrimaryEmail: boolean,
    onCancel: () => void,
    onSuccess: () => void,
    stateTransitionListener: (stateTransition: StateTransition) => void,
};

const EmailEdit: React.FC<EmailEditProps> = ({
    userId,
    isPrimaryEmail,
    onCancel,
    onSuccess,
    stateTransitionListener
}) => {

    // STATE VARIABLES
    const initState: ProfileEmailChangeState = {
        changeEmailSessionToken: "",
        changeOrder: 0,
        changeStateStatus: "",
        email: "",
        emailChangeState: EmailChangeState.EnterEmail,
        expiresAtMs: 0,
        isPrimaryEmail: true,
        userId: userId
    }
    const [profileEmailChangeState, setProfileEmailChangeState] = React.useState<ProfileEmailChangeState>(initState);
    const [newEmail, setNewEmail] = React.useState<string>("");
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [verificationCode, setVerificationCode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [profileHandleEmailChangeMutation] = useMutation(PROFILE_HANDLE_EMAIL_CHANGE_MUTATION, {
        onCompleted(data) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            const profileEmailChangeResponse: ProfileEmailChangeResponse = data.profileHandleEmailChange;
            if(profileEmailChangeResponse.profileEmailChangeState.emailChangeState === EmailChangeState.Error){                
                setErrorMessage(profileEmailChangeResponse.profileEmailChangeError?.errorMessage || "ERROR");
            }
            else{
                setProfileEmailChangeState(profileEmailChangeResponse.profileEmailChangeState);
            }
        },
        onError(error) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            setErrorMessage(error.message);
        }
    });

    const [profileAddRecoveryEmailMutation] = useMutation(PROFILE_ADD_RECOVERY_EMAIL_MUTATION, {
        onCompleted(data) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            const profileEmailChangeResponse: ProfileEmailChangeResponse = data.profileAddRecoveryEmail;
            if(profileEmailChangeResponse.profileEmailChangeState.emailChangeState === EmailChangeState.Error){
                setErrorMessage(profileEmailChangeResponse.profileEmailChangeError?.errorCode || "ERROR");
            }
            else{
                setProfileEmailChangeState(profileEmailChangeResponse.profileEmailChangeState);
            }
        },
        onError(error) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            setErrorMessage(error.message);
        }
    });

    const [profileValidateEmail] = useMutation(PROFILE_VALIDATE_EMAIL_MUTATION, {
        onCompleted(data) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            const profileEmailChangeResponse: ProfileEmailChangeResponse = data.profileValidateEmail;
            if(profileEmailChangeResponse.profileEmailChangeState.emailChangeState === EmailChangeState.Error){
                setErrorMessage(profileEmailChangeResponse.profileEmailChangeError?.errorCode || "ERROR");
            }
            else{
                setProfileEmailChangeState(profileEmailChangeResponse.profileEmailChangeState);
                if(profileEmailChangeResponse.profileEmailChangeState.emailChangeState === EmailChangeState.Completed){
                    onSuccess();
                }
            }            
        },
        onError(error) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            setErrorMessage(error.message);
        }
    })

    const [profileCancelEmailChangeMutation] = useMutation(PROFILE_CANCEL_EMAIL_CHANGE_MUTATION, {
        
    });

    return (
        <Typography component={"div"}>
            {errorMessage &&
                <Grid2 marginBottom={"8px"} container size={12} spacing={1}>
                    <Alert severity="error" sx={{width: "100%"}} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                </Grid2>
            }
            {profileEmailChangeState.emailChangeState === EmailChangeState.EnterEmail &&
                <Grid2 container size={12} spacing={1}>
                    <Grid2 fontWeight={"bold"} fontSize={"1.0em"} size={12}>
                        {isPrimaryEmail ? "Enter your new email" : "Enter your recovery email"}
                    </Grid2>
                    <TextField
                        name="newEmail"
                        fullWidth={true}
                        size="small"
                        value={newEmail}
                        onChange={(evt) => {
                            setNewEmail(evt.target.value);
                        }}
                    />
                    <Stack  marginTop={"8px"} width={"100%"} direction={"row-reverse"}>
                        <Button
                            disabled={newEmail.length < 7 || newEmail.indexOf("@") < 1}
                            onClick={() => {
                                stateTransitionListener(StateTransition.STATE_CHANGE_SUBMITTED);
                                if(isPrimaryEmail){
                                    profileHandleEmailChangeMutation({
                                        variables: {
                                            newEmail: newEmail
                                        }
                                    });
                                }
                                else{
                                    profileAddRecoveryEmailMutation({
                                        variables: {
                                            recoveryEmail: newEmail
                                        }
                                    });
                                }
                            }}
                        >
                            Next
                        </Button>
                        <Button 
                            onClick={() => {
                                if(profileEmailChangeState.changeEmailSessionToken !== ""){
                                    profileCancelEmailChangeMutation({
                                        variables: {
                                            changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
                                        }
                                    })
                                }
                                onCancel();
                            }}
                        >
                            Cancel
                        </Button>                        
                    </Stack>
                </Grid2>
                
            }
            {profileEmailChangeState.emailChangeState === EmailChangeState.ValidateEmail &&
                <Grid2 container size={12} spacing={1}>
                    <Grid2 marginBottom={"8px"} size={12}>
                        <Grid2 fontWeight={"bold"} fontSize={"1.0em"} size={12}>A verification code has been sent to your email address. Please enter it below. The code is valid for 60 minutes</Grid2>
                        <TextField name="verificationCode" id="verificationCode"
                            value={verificationCode}
                            onChange={(evt) => setVerificationCode(evt.target.value)}
                            fullWidth={true}
                            size="small"
                        />
                    </Grid2>
                    <Stack  marginTop={"8px"} width={"100%"} direction={"row-reverse"}>
                        <Button
                            disabled={verificationCode.length < 6}
                            onClick={() => {
                                stateTransitionListener(StateTransition.STATE_CHANGE_SUBMITTED);
                                profileValidateEmail({
                                    variables: {
                                        token: verificationCode, 
                                        changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
                                    }
                                });
                            }}
                        >
                            Confirm
                        </Button>
                        <Button 
                            onClick={() => {
                                if(profileEmailChangeState.changeEmailSessionToken !== ""){
                                    profileCancelEmailChangeMutation({
                                        variables: {
                                            changeEmailSessionToken: profileEmailChangeState.changeEmailSessionToken
                                        }
                                    })
                                }
                                onCancel();
                            }}
                        >
                            Cancel
                        </Button>                        
                    </Stack>
                
                </Grid2>
            }
            
        </Typography>
    )


}

export default EmailEdit;