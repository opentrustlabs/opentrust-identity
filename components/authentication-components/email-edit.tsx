"use client";
import { ProfileProperty, ProfileState, UserProfileChangeResponse, UserProfileChangeState } from "@/graphql/generated/graphql-types";
import { PROFILE_ADD_RECOVERY_EMAIL_MUTATION, PROFILE_CANCEL_EMAIL_CHANGE_MUTATION, PROFILE_HANDLE_EMAIL_CHANGE_MUTATION, PROFILE_VALIDATE_EMAIL_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { ERROR_CODES } from "@/lib/models/error";
import { useMutation } from "@apollo/client";
import { Alert, Button, Grid2, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { useIntl } from 'react-intl';


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

    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const initState: UserProfileChangeState = {
        changeProfileSessionToken: "",
        profileState: ProfileState.EnterEmail,
        profileProperty: isPrimaryEmail ? ProfileProperty.Email : ProfileProperty.RecoveryEmail,
        profilePropertyValue: "",
        userId: userId,
        changeOrder: 0,
        changeStateStatus: "",
        expiresAtMs: 0
    }
        
    const [profileChangeState, setProfileChangeState] = React.useState<UserProfileChangeState>(initState);
    const [newEmail, setNewEmail] = React.useState<string>("");
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [verificationCode, setVerificationCode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [profileHandleEmailChangeMutation] = useMutation(PROFILE_HANDLE_EMAIL_CHANGE_MUTATION, {
        onCompleted(data) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            const userProfileChangeResponse: UserProfileChangeResponse = data.profileHandleEmailChange;
            if(userProfileChangeResponse.profileChangeState.profileState === ProfileState.Error){
                setErrorMessage(userProfileChangeResponse.profileChangeError?.errorMessage || ERROR_CODES.DEFAULT.errorMessage);
            }
            else{
                setProfileChangeState(userProfileChangeResponse.profileChangeState);
            }
        },
        onError(error) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [profileAddRecoveryEmailMutation] = useMutation(PROFILE_ADD_RECOVERY_EMAIL_MUTATION, {
        onCompleted(data) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            const userProfileChangeResponse: UserProfileChangeResponse = data.profileAddRecoveryEmail;
            if(userProfileChangeResponse.profileChangeState.profileState === ProfileState.Error){
                setErrorMessage(userProfileChangeResponse.profileChangeError?.errorMessage || ERROR_CODES.DEFAULT.errorMessage);
            }
            else{
                setProfileChangeState(userProfileChangeResponse.profileChangeState);
            }
        },
        onError(error) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [profileValidateEmail] = useMutation(PROFILE_VALIDATE_EMAIL_MUTATION, {
        onCompleted(data) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            const userProfileChangeResponse: UserProfileChangeResponse = data.profileValidateEmail;
            if(userProfileChangeResponse.profileChangeState.profileState === ProfileState.Error){
                setErrorMessage(userProfileChangeResponse.profileChangeError?.errorMessage || ERROR_CODES.DEFAULT.errorMessage);
            }
            else{
                setProfileChangeState(userProfileChangeResponse.profileChangeState);
                if(userProfileChangeResponse.profileChangeState.profileState === ProfileState.Completed){
                    onSuccess();
                }
            }            
        },
        onError(error) {
            stateTransitionListener(StateTransition.STATE_CHANGE_RECEIVED);
            setErrorMessage(intl.formatMessage({id: error.message}));
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
            {profileChangeState.profileState === ProfileState.EnterEmail &&
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
                                if(profileChangeState.changeProfileSessionToken !== ""){
                                    profileCancelEmailChangeMutation({
                                        variables: {
                                            changeEmailSessionToken: profileChangeState.changeProfileSessionToken
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
            {profileChangeState.profileState === ProfileState.ValidateEmail &&
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
                                        changeEmailSessionToken: profileChangeState.changeProfileSessionToken
                                    }
                                });
                            }}
                        >
                            Confirm
                        </Button>
                        <Button 
                            onClick={() => {
                                if(profileChangeState.changeProfileSessionToken !== ""){
                                    profileCancelEmailChangeMutation({
                                        variables: {
                                            changeEmailSessionToken: profileChangeState.changeProfileSessionToken
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