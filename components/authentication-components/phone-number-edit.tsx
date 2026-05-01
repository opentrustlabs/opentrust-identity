"use client";
import { ProfileProperty, ProfileState, UserProfileChangeResponse, UserProfileChangeState } from "@/graphql/generated/graphql-types";
import { PROFILE_CANCEL_PHONE_NUMBER_CHANGE_MUTATION, PROFILE_HANDLE_PHONE_NUMBER_CHANGE_MUTATION, PROFILE_VALIDATE_PHONE_NUMBMER_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { ERROR_CODES } from "@/lib/models/error";
import { useMutation } from "@apollo/client";
import { Alert, Button, Grid2, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { useIntl } from 'react-intl';
import { ProfileStateChangeTransition } from "./my-profile";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";


export interface PhoneNumberEditProps {
    userId: string,
    onCancel: () => void,
    onSuccess: () => void,
    stateTransitionListener: (stateTransition: ProfileStateChangeTransition) => void,
};

const PhoneNumberEdit: React.FC<PhoneNumberEditProps> = ({
    userId,
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
        profileProperty: ProfileProperty.PhoneNumber,
        profilePropertyValue: "",
        userId: userId,
        changeOrder: 0,
        changeStateStatus: "",
        expiresAtMs: 0
    }
        
    const [profileChangeState, setProfileChangeState] = React.useState<UserProfileChangeState>(initState);
    const [phoneNumber, setPhoneNumber] = React.useState<string>("");
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [verificationCode, setVerificationCode] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [profileHandlePhoneNumberChangeMutation] = useMutation(PROFILE_HANDLE_PHONE_NUMBER_CHANGE_MUTATION, {
        onCompleted(data) {
            stateTransitionListener(ProfileStateChangeTransition.STATE_CHANGE_RECEIVED);
            const userProfileChangeResponse: UserProfileChangeResponse = data.profileHandlePhoneNumberChange;
            if(userProfileChangeResponse.profileChangeState.profileState === ProfileState.Error){
                setErrorMessage(userProfileChangeResponse.profileChangeError?.errorMessage || ERROR_CODES.DEFAULT.errorMessage);
            }
            else{
                setProfileChangeState(userProfileChangeResponse.profileChangeState);
            }
        },
        onError(error) {
            stateTransitionListener(ProfileStateChangeTransition.STATE_CHANGE_RECEIVED);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [profileValidateValidatePhoneNumberMutation] = useMutation(PROFILE_VALIDATE_PHONE_NUMBMER_MUTATION, {
        onCompleted(data) {
            stateTransitionListener(ProfileStateChangeTransition.STATE_CHANGE_RECEIVED);
            const userProfileChangeResponse: UserProfileChangeResponse = data.profileValidatePhoneNumberChange;
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
            stateTransitionListener(ProfileStateChangeTransition.STATE_CHANGE_RECEIVED);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    })

    const [profileCancelPhoneNumberChangeMutation] = useMutation(PROFILE_CANCEL_PHONE_NUMBER_CHANGE_MUTATION, {
        
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
                        Enter your phone number
                    </Grid2>
                    <MuiTelInput
                        name="newPhoneNumber"
                        id="newPhoneNumber"
                        value={phoneNumber}
                        onChange={(newValue) => {
                            setPhoneNumber(newValue); 
                        }}
                        fullWidth={true}
                        size="small"
                    />
                    <Stack  marginTop={"8px"} width={"100%"} direction={"row-reverse"}>
                        <Button
                            disabled={phoneNumber.length < 7 || !matchIsValidTel(phoneNumber)}
                            onClick={() => {
                                stateTransitionListener(ProfileStateChangeTransition.STATE_CHANGE_SUBMITTED);
                                profileHandlePhoneNumberChangeMutation({
                                    variables: {
                                        newPhoneNumber: phoneNumber
                                    }
                                });                                
                            }}
                        >
                            Next
                        </Button>
                        <Button 
                            onClick={() => {
                                if(profileChangeState.changeProfileSessionToken !== ""){
                                    profileCancelPhoneNumberChangeMutation({
                                        variables: {
                                            changePhoneNumberSessionToken: profileChangeState.changeProfileSessionToken
                                        }
                                    });
                                }
                                onCancel();
                            }}
                        >
                            Cancel
                        </Button>                        
                    </Stack>
                </Grid2>
                
            }
            {profileChangeState.profileState === ProfileState.ValidatePhone &&
                <Grid2 container size={12} spacing={1}>
                    <Grid2 marginBottom={"8px"} size={12}>
                        <Grid2 fontWeight={"bold"} fontSize={"1.0em"} size={12}>A verification code has been sent to your phone number. Please enter it below. The code is valid for 60 minutes</Grid2>
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
                                stateTransitionListener(ProfileStateChangeTransition.STATE_CHANGE_SUBMITTED);
                                profileValidateValidatePhoneNumberMutation({
                                    variables: {
                                        token: verificationCode, 
                                        changePhoneNumberSessionToken: profileChangeState.changeProfileSessionToken
                                    }
                                });
                            }}
                        >
                            Confirm
                        </Button>
                        <Button 
                            onClick={() => {
                                if(profileChangeState.changeProfileSessionToken !== ""){
                                    profileCancelPhoneNumberChangeMutation({
                                        variables: {
                                            changePhoneNumberSessionToken: profileChangeState.changeProfileSessionToken
                                        }
                                    });
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

export default PhoneNumberEdit;