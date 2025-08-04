"use client";
import { AUTHENTICATE_HANDLE_USER_CODE_INPUT } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import React from "react";
import { AuthenticationComponentsProps } from "./login";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";



const UserCodeInput: React.FC<AuthenticationComponentsProps> = ({
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {


    // STATE VARIABLES
    const [userCode, setUserCode] = React.useState<string>("");

    // GRAPHQL FUNCTION
    const [handleUserCodeInput] = useMutation(AUTHENTICATE_HANDLE_USER_CODE_INPUT, {
        onCompleted(data) {            
            onUpdateEnd(data.authenticateHandleUserCodeInput, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        },
    })

    return (
        <React.Fragment>
            <Typography component="div" width={"100%"}>
                    <Grid2 width={"100%"} marginBottom={"8px"} size={12} fontWeight={"bold"}>
                        Enter the code for your device:
                    </Grid2>
                    <Grid2 width={"100%"} marginBottom={"16px"} size={12}>
                        <TextField name="userCode" id="userCode"
                            value={userCode}
                            onChange={(evt) => {
                                setUserCode(evt.target.value);
                            }}
                            fullWidth={true} size="small"                                                                            
                        />
                    </Grid2>
                <Stack
                    width={"100%"}
                    direction={"row-reverse"}
                    spacing={2}
                >
                    <Button
                        onClick={() => {
                            onUpdateStart();                        
                            handleUserCodeInput({
                                variables: {
                                    userCode: userCode,
                                    
                                }
                            });
                        }}
                        disabled={userCode.length < 8}
                    >
                        Next
                    </Button>
                    <Button
                        onClick={() => onAuthenticationCancelled()}
                    >
                        Cancel
                    </Button>
                </Stack>
            </Typography>
        </React.Fragment>

    )
}

export default UserCodeInput;