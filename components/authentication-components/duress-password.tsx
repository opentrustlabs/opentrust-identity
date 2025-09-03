"use client";
import React from "react";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";
import { REGISTER_ADD_DURESS_PASSWORD } from "@/graphql/mutations/oidc-mutations";
import { RegistrationComponentsProps } from "./register";
import { TenantPasswordConfig, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import PasswordRulesDisplay from "./password-rules-display";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import InputAdornment from "@mui/material/InputAdornment";
import { validatePasswordFormat } from "@/utils/password-utils";
import { useIntl } from "react-intl";

export interface DuressPasswordConfigurationProps extends RegistrationComponentsProps {
    tenantPasswordConfig: TenantPasswordConfig
}

const DuressPasswordConfiguration: React.FC<DuressPasswordConfigurationProps> = ({
    initialUserRegistrationState,
    onRegistrationCancelled,
    onUpdateEnd,
    onUpdateStart,
    tenantPasswordConfig
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();
    
    // STATE VARIABLES
    const [duressPassword, setDuressPassword] = React.useState<string>("");
    const [repeatDuressPassword, setRepeatDuressPassword] = React.useState<string>("");
    const [viewPassword, setViewPassword] = React.useState<boolean>(false);
    const [viewRepeatPassword, setViewRepeatPassword] = React.useState<boolean>(false);
    const [showPasswordRules, setShowPasswordRules] = React.useState<boolean>(false);
    

    // REGISTER_ADD_DURESS_PASSWORD = gql`
    //     mutation registerAddDuressPassword($userId: String!, $password: String, $skip: Boolean!, $registrationSessionToken: String!, $preAuthToken: String)
    const [registerAddDuressPassword] = useMutation(REGISTER_ADD_DURESS_PASSWORD, {
        onCompleted(data) {
            const response: UserRegistrationStateResponse = data.registerAddDuressPassword as UserRegistrationStateResponse;
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
                        {intl.formatMessage({id: "OPTIONAL_ADD_DURESS_PASSWORD"})}
                    </div>
                </Grid2>
                <Grid2 marginBottom={"8px"} size={12}>
                    <Stack spacing={1} direction={"row"}>
                        <div>Password</div>
                        <div>
                            (Rules) 
                        </div>
                            <div>
                                {showPasswordRules === false &&
                                    <ArrowDropDownOutlinedIcon 
                                        sx={{cursor: "pointer"}}
                                        onClick={() => setShowPasswordRules(true)}
                                    />
                                }
                                {showPasswordRules === true &&
                                    <ArrowDropUpOutlinedIcon
                                        sx={{cursor: "pointer"}}
                                        onClick={() => setShowPasswordRules(false)}
                                    />
                                }
                        </div>
                    </Stack>
                    <Stack spacing={1} direction={"column"}>
                        {showPasswordRules === true &&
                            <PasswordRulesDisplay 
                                passwordConfig={tenantPasswordConfig}
                            />
                        }
                    </Stack>
                    <TextField name="password" id="password"
                        type={ viewPassword === true ? "text" : "password"}
                        value={duressPassword}
                        onChange={(evt) => { 
                            setDuressPassword(evt.target.value)
                        }}
                        fullWidth={true} size="small"
                        error={!validatePasswordFormat(duressPassword, tenantPasswordConfig).result}
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
                    <TextField name="repeatDuressPassword" id="repeatDuressPassword"
                        type={viewRepeatPassword === true ? "text" : "password"}
                        value={repeatDuressPassword}
                        onChange={(evt) => { setRepeatDuressPassword(evt.target.value);}}
                        fullWidth={true} size="small"
                        error={!repeatDuressPassword || repeatDuressPassword !== duressPassword}
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
                        registerAddDuressPassword({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken,
                                skip: true,
                                password: null
                            }
                        });
                    }}
                >
                    {intl.formatMessage({id: "SKIP"})}
                </Button>

                <Button                    
                    onClick={() => {
                        onUpdateStart();
                        registerAddDuressPassword({
                            variables: {
                                userId: initialUserRegistrationState.userId,
                                registrationSessionToken: initialUserRegistrationState.registrationSessionToken,
                                preAuthToken: initialUserRegistrationState.preAuthToken,
                                skip: false,
                                password: duressPassword
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

export default DuressPasswordConfiguration;