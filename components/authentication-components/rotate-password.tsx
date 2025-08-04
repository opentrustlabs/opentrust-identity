"use client";
import { AUTHENTICATE_ROTATE_PASSWORD } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import { Grid2, Stack, TextField, Button, InputAdornment, Typography } from "@mui/material";
import React from "react";
import { AuthenticationComponentsProps } from "./login";
import { TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import { validatePasswordFormat } from "@/utils/password-utils";
import PasswordRulesDisplay from "./password-rules-display";


export interface AuthenticationRotatePasswordProps extends AuthenticationComponentsProps {
    isPasswordResetFlow: boolean,
    passwordConfig: TenantPasswordConfig
}

const AuthentiationRotatePassword: React.FC<AuthenticationRotatePasswordProps> = ({
    initialUserAuthenticationState,
    passwordConfig,
    isPasswordResetFlow,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {

    // STATE VARIABLES
    const [password, setPassword] = React.useState<string>("");
    const [repeatPassword, setRepeatPassword] = React.useState<string>("");
    const [viewPassword, setViewPassword] = React.useState<boolean>(false);
    const [viewRepeatPassword, setViewRepeatPassword] = React.useState<boolean>(false);
    const [showPasswordRules, setShowPasswordRules] = React.useState<boolean>(false);


    // GRAPHQL FUNCTIONS
    const [authenticateRotatePassword] = useMutation(AUTHENTICATE_ROTATE_PASSWORD, {
        onCompleted(data) {
            onUpdateEnd(data.authenticateRotatePassword, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        },
    })

    return (
        <React.Fragment>
            <Typography component="div">
                <Grid2 size={12} container spacing={1}>
                    {isPasswordResetFlow &&
                        <Grid2 marginBottom={"8px"} size={12} fontWeight={"bold"}>
                            Enter your new password:
                        </Grid2>
                    }
                    {!isPasswordResetFlow &&
                        <Grid2 marginBottom={"8px"} size={12} fontWeight={"bold"}>
                            Continued access requires your password to be updated. Enter your new password below:
                        </Grid2>
                    }
                    <Grid2 marginBottom={"8px"} size={12}>
                        <Stack spacing={1} direction={"row"}>
                            <div>Password</div>
                            <div>
                                (Rules)
                            </div>
                            <div>
                                {showPasswordRules === false &&
                                    <ArrowDropDownOutlinedIcon
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => setShowPasswordRules(true)}
                                    />
                                }
                                {showPasswordRules === true &&
                                    <ArrowDropUpOutlinedIcon
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => setShowPasswordRules(false)}
                                    />
                                }
                            </div>
                        </Stack>
                        <Stack spacing={1} direction={"column"}>
                            {showPasswordRules === true &&
                                <PasswordRulesDisplay
                                    passwordConfig={passwordConfig}
                                />
                            }
                        </Stack>
                        <TextField name="password" id="password"
                            type={viewPassword === true ? "text" : "password"}
                            value={password}
                            onChange={(evt) => {
                                setPassword(evt.target.value);
                            }}
                            fullWidth={true} size="small"
                            error={!validatePasswordFormat(password, passwordConfig).result}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {viewPassword === true &&
                                                <VisibilityOffOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setViewPassword(false);
                                                    }}
                                                />
                                            }
                                            {viewPassword === false &&
                                                <VisibilityOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setViewPassword(true);
                                                    }}
                                                />
                                            }
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Grid2>
                    <Grid2 marginBottom={"8px"} size={12}>
                        <div>Repeat Password</div>
                        <TextField name="repeatPassword" id="repeatPassword"
                            type={viewRepeatPassword === true ? "text" : "password"}
                            value={repeatPassword}
                            onChange={(evt) => { setRepeatPassword(evt.target.value); }}
                            fullWidth={true} size="small"
                            error={!repeatPassword || repeatPassword !== password}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {viewRepeatPassword === true &&
                                                <VisibilityOffOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setViewRepeatPassword(false);
                                                    }}
                                                />
                                            }
                                            {viewRepeatPassword === false &&
                                                <VisibilityOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setViewRepeatPassword(true);
                                                    }}
                                                />
                                            }
                                        </InputAdornment>
                                    )
                                }
                            }}
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
                            authenticateRotatePassword({
                                variables: {
                                    userId: initialUserAuthenticationState.userId,
                                    newPassword: password,
                                    authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                    preAuthToken: initialUserAuthenticationState.preAuthToken
                                }
                            });
                        }}
                        disabled={password !== repeatPassword && !validatePasswordFormat(password, passwordConfig)}
                    >
                        Update
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

export default AuthentiationRotatePassword;