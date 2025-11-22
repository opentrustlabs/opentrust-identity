"use client";
import { QUERY_PARAM_SECRET_ENTRY_OTP } from "@/utils/consts";
import Paper from "@mui/material/Paper";
import { useSearchParams } from "next/navigation";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import Button from "@mui/material/Button";
import { useMutation } from "@apollo/client";
import { ENTER_SECRET_VALUE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useIntl } from 'react-intl';


const SecretEntry: React.FC = () => {


    // CONTEXT VARIABLES
    const c: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const intl = useIntl();

    // STATE VARIABLES
    const [secretValue, setSecretValue] = React.useState<string>("");
    const [viewPassword, setViewPassword] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [success, setSuccess] = React.useState<boolean>(false);

    // QUERY PARAMS
    const params = useSearchParams();
    const otp: string | null | undefined = params?.get(QUERY_PARAM_SECRET_ENTRY_OTP);

    // GRAPHQL FUNCTIONS
    const [enterSecretValue] = useMutation(ENTER_SECRET_VALUE_MUTATION, {
        onCompleted(data) {
            setShowMutationBackdrop(false);
            if(data && data.enterSecretValue === true){
                setSuccess(true);
            }            
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    })

    const maxWidth = c.isSmall ? "90vw" : c.isMedium ? "80vw" : "650px";

    return (
        <Paper
            elevation={4}
            sx={{ padding: 2, height: "100%", maxWidth: maxWidth, width: maxWidth, margin: "16px 0px" }}
        >
            <Typography component="div" fontSize={"0.95em"}>                        
                <Grid2 spacing={1} container size={{ xs: 12 }}>
                    {errorMessage !== null &&                        
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
                    }
                    {success === true &&
                        <Grid2 size={{ xs: 12 }} textAlign={"center"}>
                            <Stack
                                direction={"row"}
                                justifyItems={"center"}
                                alignItems={"center"}
                                sx={{ width: "100%" }}
                            >
                                <Alert severity="success" sx={{ width: "100%" }} >The secret value has been successfully updated</Alert>
                            </Stack>
                        </Grid2>

                    }
                    {success === false &&
                        <React.Fragment>
                            <Grid2 marginBottom={"8px"} size={{ xs: 12 }}>
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>Enter the secret value:</div>
                            </Grid2>
                            <Grid2 marginBottom={"8px"} size={{ xs: 12 }}>
                                <TextField name="secretValue" id="secretValue"
                                    type={ viewPassword === true ? "text" : "password"}
                                    value={secretValue}
                                    onChange={(evt) => { 
                                        setSecretValue(evt.target.value);
                                    }}
                                    fullWidth={true} 
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
                            <Stack 
                                width={"100%"}
                                direction={"row-reverse"}
                                spacing={2}
                            >
                                <Button 
                                    disabled={!secretValue || secretValue.length < 8}
                                    onClick={() => {
                                        enterSecretValue({
                                            variables: {
                                                otp: otp,
                                                secretValue: secretValue
                                            }
                                        })
                                    }}
                                >
                                    Submit
                                </Button>                        
                            </Stack>
                        </React.Fragment>
                    }
                </Grid2>
                
            </Typography>
            <Backdrop
                sx={{ color: '#fff' }}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
        </Paper>
        
    )
}

export default SecretEntry;