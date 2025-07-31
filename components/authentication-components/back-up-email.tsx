"use client";
import React from "react";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";
import { REGISTER_ADD_BACKUP_EMAIL_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { RegistrationComponentsProps } from "./register";
import { UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';


const BackupEmailConfiguration: React.FC<RegistrationComponentsProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart

}) => {

    const [email, setEmail] = React.useState<string>("");

    const [registerAddBackupEmail] = useMutation(REGISTER_ADD_BACKUP_EMAIL_MUTATION, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerAddBackupEmail as UserRegistrationStateResponse;
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
                        Do you want to add a recovery email? It is not required, but is recommended. You
                        can always add one later if you choose.
                    </div>
                </Grid2>
                <Grid2 size={12} marginTop={"16px"} marginBottom={"16px"}>
                    <TextField name="backupEmail" id="backupEmail"
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
                        registerAddBackupEmail({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken,
                                skip: true,
                                backupEmail: null
                            }
                        });
                    }}
                >
                    Skip
                </Button>

                <Button
                    disabled={email.length < 5 || email.indexOf("@") < 2}
                    onClick={() => {
                        onUpdateStart();
                        registerAddBackupEmail({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken,
                                skip: false,
                                backupEmail: email
                            }
                        });
                    }}
                >
                    Add
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

export default BackupEmailConfiguration;