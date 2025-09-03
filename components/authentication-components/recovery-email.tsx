"use client";
import React from "react";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";
import { REGISTER_ADD_RECOVERY_EMAIL_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { RegistrationComponentsProps } from "./register";
import { UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { useIntl } from "react-intl";


const RecoveryEmailConfiguration: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart

}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const [email, setEmail] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const [registerAddRecoveryEmail] = useMutation(REGISTER_ADD_RECOVERY_EMAIL_MUTATION, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerAddRecoveryEmail as UserRegistrationStateResponse;
            onUpdateEnd(response, null)
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        },
    });


    return (
        <React.Fragment>
            <Grid2 size={12} container spacing={1}>
                <Grid2 size={1}>
                    <PriorityHighOutlinedIcon sx={{ height: "1.5em", width: "1.5em" }} color="info" />
                </Grid2>
                <Grid2 marginBottom={"8px"} size={11}>
                    <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>
                        {intl.formatMessage({id: "OPTIONAL_ADD_RECOVERY_EMAIL"})}
                    </div>
                </Grid2>
                <Grid2 size={12} marginTop={"16px"} marginBottom={"16px"}>
                    <TextField name="recoveryEmail" id="recoveryEmail"
                        value={email}
                        onChange={(evt) => setEmail(evt.target.value)}
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
                        registerAddRecoveryEmail({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken,
                                skip: true,
                                recoveryEmail: null
                            }
                        });
                    }}
                >
                    {intl.formatMessage({id: "SKIP"})}
                </Button>

                <Button
                    disabled={email.length < 5 || email.indexOf("@") < 2}
                    onClick={() => {
                        onUpdateStart();
                        registerAddRecoveryEmail({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken,
                                skip: false,
                                recoveryEmail: email
                            }
                        });
                    }}
                >
                    {intl.formatMessage({id: "ADD"})}
                </Button>
                <Button
                    onClick={() => onRegistrationCancelled()}
                >
                    {intl.formatMessage({id: "CANCEL"})}
                </Button>
            </Stack>
        </React.Fragment>

    )
}

export default RecoveryEmailConfiguration;