"use client";
import React, { useContext, useEffect, useState } from "react";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PASSWORD_MINIMUM_LENGTH, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_PREAUTHN_TOKEN, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_TENANT_ID } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { UserAuthenticationStateResponse, TenantSelectorData, AuthenticationState, UserAuthenticationState, TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { AUTHENTICATE_USER, AUTHENTICATE_USERNAME_INPUT_MUTATION, CANCEL_AUTHENTICATION } from "@/graphql/mutations/oidc-mutations";
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import RadioStyledCheckbox from "../input/radio-styled-checkbox";
import { AuthentiationValidateTotp } from "./validate-totp";
import { AuthentiationConfigureTotp } from "./configure-totp";
import { AuthentiationConfigureSecurityKey } from "./configure-security-key";
import { AuthentiationValidateSecurityKey } from "./validate-security-key";
import AuthentiationRotatePassword from "./rotate-password";
import {  useSearchParams } from 'next/navigation';
import { setAccessTokenOnLocalStorage } from "@/utils/client-utils";


const MIN_USERNAME_LENGTH = 6;

export interface AuthenticationComponentsProps {
    initialUserAuthenticationState: UserAuthenticationState,
    onAuthenticationCancelled: () => void,
    onUpdateStart: () => void,
    onUpdateEnd: (userAuthenticationStateResponse: UserAuthenticationStateResponse | null, errorMessage: string | null) => void
}

const Login: React.FC = () => {


    // CONTEXT VARIABLES
    const titleSetter = useContext(PageTitleContext);
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);
    useEffect(() => {
        titleSetter.setPageTitle("Login");
    }, []);

    
    // QUERY PARAMS
    const params = useSearchParams();
    const preAuthToken = params?.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId: string | null = params?.get(QUERY_PARAM_TENANT_ID) || null;
    const redirectUri = params?.get(QUERY_PARAM_REDIRECT_URI);


    // PAGE STATE MANAGEMENT VARIABLES
    const [username, setUsername] = useState<string | null>("");
    const [password, setPassword] = useState<string | null>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showTenantSelector, setShowTenantSelector] = useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [tenantsToSelect, setTenantsToSelect] = useState<Array<TenantSelectorData>>([]);
    const [selectedTenant, setSelectedTenant] = useState<string | null>(tenantId);
    const [userAuthenticationState, setUserAuthenticationState] = React.useState<UserAuthenticationState | null>(null);
    const [passwordConfig, setPasswordConfig] = React.useState<TenantPasswordConfig | null>(null);


    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();
    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));
    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";


    // GRAPHQL FUNCTIONS    
    const [portalLoginEmailHandler] = useMutation(AUTHENTICATE_USERNAME_INPUT_MUTATION, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateHandleUserNameInput;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(error.message);
        }
    });

    const [authenticateUser] = useMutation(AUTHENTICATE_USER, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateUser;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(error.message);
        }
    });

    const [cancelAuthentication] = useMutation(CANCEL_AUTHENTICATION, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.cancelAuthentication;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error){
            setErrorMessage(error.message);
        }
    })

    // HANDLER FUNCTIONS
    const handleUserAuthenticationResponse = (authnStateResponse: UserAuthenticationStateResponse | null, errorMessage: string | null) => {
        if (authnStateResponse === null) {
            if (errorMessage === null) {
                setErrorMessage("ERROR_RETRIEVING_RESPONSE_FROM_SERVER");
            }
            else {
                setErrorMessage(errorMessage);
            }
        }
        else {
            if (authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.Error) {
                setErrorMessage(authnStateResponse.authenticationError.errorCode || "ERROR");
            }
            else if (authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.AuthWithFederatedOidc) {
                if (!authnStateResponse.uri) {
                    setErrorMessage("ERROR_NO_AUTHORIZATION_ENDPOINT_CONFIGURED");
                }
                else {
                    router.push(authnStateResponse.uri);
                }
            }
            else if (authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.Register) {
                if (!authnStateResponse.uri) {
                    setErrorMessage("ERROR_NO_REGISTRATION_REDIRECT_URI_CONFIGURED");
                }
                else {
                    router.push(authnStateResponse.uri);
                }
            }
            else if (
                authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.RedirectBackToApplication ||
                authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal
            ) {
                if (!authnStateResponse.uri) {
                    setErrorMessage("ERROR_NO_REDIRECT_ENDPOINT_CONFIGURED");
                }
                else {
                    if(authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal){
                        if(authnStateResponse.accessToken){
                            setAccessTokenOnLocalStorage(authnStateResponse.accessToken, authnStateResponse.tokenExpiresAtMs || 0);
                        }
                    }
                    router.push(authnStateResponse.uri);
                }
            }
            else {
                setUserAuthenticationState(authnStateResponse.userAuthenticationState);
                if (authnStateResponse.passwordConfig) {
                    setPasswordConfig(authnStateResponse.passwordConfig);
                }
                if (
                    authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.SelectTenant ||
                    authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.SelectTenantThenRegister
                ) {
                    if (authnStateResponse.availableTenants) {
                        setTenantsToSelect(authnStateResponse.availableTenants);
                        setShowTenantSelector(true);
                    }
                    else {
                        setErrorMessage("ERROR_NO_TENANT_TO_SELECT");
                    }
                }
            }
        }
    }


    const handleUserNameInputClick = () => {
        portalLoginEmailHandler({
            variables: {
                username: username,
                tenantId: selectedTenant,
                preAuthToken: preAuthToken
            }
        });
    }
    const handleEnterButtonPress = (evt: React.KeyboardEvent) => {
        if (evt.key.valueOf().toLowerCase() === "enter") {
            if (username && username.length > MIN_USERNAME_LENGTH) {
                portalLoginEmailHandler({
                    variables: {
                        email: username,
                        tenantId: selectedTenant,
                        preAuthToken: preAuthToken
                    }
                });
            }
        }
        // Remove the error message if the user makes any changes to the user name
        else {
            if (errorMessage !== null) {
                setErrorMessage(null);
            }
        }
    }


    const handleCancelAuthentication = (userAuthenticationState: UserAuthenticationState) => {
        console.log("authentication cancelled");        
        cancelAuthentication({
            variables: {
                userId: userAuthenticationState.userId,
                authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                preAuthToken: userAuthenticationState.preAuthToken
            }
        });        
        setUsername("");
        setPassword("");
        setErrorMessage(null);
        setTenantsToSelect([]);
        setSelectedTenant(tenantId);
        setUserAuthenticationState(null);
    }

    const enterKeyLoginHandler = (evt: React.KeyboardEvent) => {

    }

    const closeTenantSelector = () => {
        setShowTenantSelector(false);
        setSelectedTenant(null);
    }

    const getQueryParams = (): string => {
        const params = new URLSearchParams();
        if (tenantId) {
            params.set(QUERY_PARAM_TENANT_ID, tenantId);
        }
        if (preAuthToken) {
            params.set(QUERY_PARAM_PREAUTHN_TOKEN, preAuthToken)
        }
        if (redirectUri) {
            params.set(QUERY_PARAM_REDIRECT_URI, redirectUri);
        }
        return params.toString();
    }

    if (tenantBean.getTenantMetaData()) {
        return (
            <Paper
                elevation={4}
                sx={{ padding: 2, height: "100%", maxWidth: maxWidth, width: maxWidth }}
            >
                {showTenantSelector &&
                    <Dialog
                        open={showTenantSelector}
                        maxWidth="sm"
                        fullWidth={true}
                        onClose={() => closeTenantSelector()}
                    >

                        <DialogTitle><Typography fontSize={"0.95em"}>Select Tenant</Typography></DialogTitle>
                        <Typography component="div" fontSize={"0.90em"}>
                            <DialogContent>
                                <Grid2 alignItems={"center"} container size={12} spacing={0}>
                                    {tenantsToSelect.map(
                                        (t: TenantSelectorData) => (
                                            <React.Fragment key={t.tenantId}>
                                                <Grid2 size={11}>
                                                    {t.tenantName}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <RadioStyledCheckbox
                                                        checked={selectedTenant === t.tenantId}
                                                        onChange={(_, checked: boolean) => {
                                                            if (checked) {
                                                                setSelectedTenant(t.tenantId);
                                                            }
                                                            else {
                                                                setSelectedTenant(null);
                                                            }
                                                        }}

                                                    />
                                                </Grid2>
                                                <Grid2 size={12}><Divider /></Grid2>
                                            </React.Fragment>
                                        )
                                    )}
                                </Grid2>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={() => closeTenantSelector()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowTenantSelector(false);
                                        handleUserNameInputClick();
                                    }}
                                    disabled={selectedTenant === null}
                                >
                                    Next
                                </Button>
                            </DialogActions>
                        </Typography>
                    </Dialog>
                }
                <Grid2 spacing={4} container size={{ xs: 12 }}>
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
                    {userAuthenticationState === null &&
                        <React.Fragment>
                            <Grid2 size={{ xs: 12 }}>
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.2em" }}>Sign In</div>
                                <TextField
                                    id="email"
                                    required={true}
                                    autoFocus={true}
                                    label={tenantBean.getTenantMetaData().tenant.allowLoginByPhoneNumber ? "Email or phone number" : "Email"}
                                    name="email"
                                    fullWidth
                                    onChange={(evt) => setUsername(evt.target.value)}
                                    onKeyDown={handleEnterButtonPress}
                                    value={username}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor:
                                                    (tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "white" ||
                                                        tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "FFF" ||
                                                        tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "fff") ?
                                                        "lightgray" :
                                                        tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor

                                            }
                                        },
                                        "& .MuiFormLabel-root": {
                                            "&.MuiInputLabel-root": {
                                                "&.Mui-focused": {
                                                    color: "black"
                                                }
                                            }
                                        }
                                    }}
                                >
                                </TextField>
                            </Grid2>
                            <Grid2 size={{xs: 12}}>
                                <Stack                                    
                                    direction={"row-reverse"}
                                >
                                    <Button
                                        disabled={username === null || username.length < MIN_USERNAME_LENGTH || (!tenantBean.getTenantMetaData().tenant.allowLoginByPhoneNumber && username.indexOf("@") < 1)}
                                        variant="contained"
                                        sx={{
                                            height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px",
                                            backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                            color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor,
                                            fontWeight: "bold",
                                            fontSize: "0.9em"
                                        }}
                                        onClick={() => handleUserNameInputClick()}
                                    >Next</Button>
                                    <Button
                                        onClick={() =>{
                                            if(redirectUri){
                                                router.push(`${redirectUri}?error=access_denied&error_description=authentication_cancelled_by_user`)
                                            }
                                            else{
                                                setUsername("");
                                                router.push(`/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`);
                                            }
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Stack>
                            </Grid2>
                            {tenantBean.getTenantMetaData().tenant.allowUserSelfRegistration &&
                                <Grid2 size={{ xs: 12 }} textAlign={"center"}>
                                    <Stack
                                        direction={"row-reverse"}
                                        justifyItems={"center"}
                                        alignItems={"center"}
                                    >
                                        <Link prefetch={false} href={`/authorize/register?${getQueryParams()}`}>
                                            <Button
                                                disabled={false}
                                                variant="contained"
                                                sx={{
                                                    height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px",
                                                    backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                                    color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor,
                                                    fontWeight: "bold",
                                                    fontSize: "0.9em"
                                                }}
                                            >Register</Button>
                                        </Link>

                                        <div style={{ verticalAlign: "center", fontWeight: "bold", fontSize: "0.9em" }}>Need to create an account?</div>
                                    </Stack>
                                </Grid2>
                            }
                        </React.Fragment>
                    }
                    {userAuthenticationState && userAuthenticationState.authenticationState === AuthenticationState.EnterPassword &&
                        <React.Fragment>
                            <Grid2 size={{ xs: 12 }}>
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.2em" }}>Sign In</div>
                                <TextField
                                    type="password"
                                    id="password"
                                    required={true}
                                    autoFocus={true}
                                    label={"Password"}
                                    name="password"
                                    fullWidth
                                    onChange={(evt) => setPassword(evt.target.value)}
                                    onKeyDown={enterKeyLoginHandler}
                                    value={password}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor:
                                                    (tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "white" ||
                                                        tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "FFF" ||
                                                        tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "fff") ?
                                                        "lightgray" :
                                                        tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor
                                            }
                                        },
                                        "& .MuiFormLabel-root": {
                                            "&.MuiInputLabel-root": {
                                                "&.Mui-focused": {
                                                    color: "black"
                                                }
                                            }
                                        }
                                    }}
                                >
                                </TextField>
                            </Grid2>
                            {tenantBean.getTenantMetaData().tenant.allowForgotPassword &&
                                <Grid2 size={{ xs: 12 }}>
                                    <Stack
                                        direction={"row-reverse"}
                                    >
                                        <span><Link prefetch={false} href={`/authorize/forgot-password?${getQueryParams()}`} style={{ color: "black", fontWeight: "bold", fontSize: "0.9em" }}>Forgot password?</Link></span>
                                    </Stack>
                                </Grid2>
                            }
                            <Grid2 size={{ xs: 12 }}>
                                <Stack
                                    direction={"row-reverse"}
                                >
                                    <Button
                                        disabled={password === null || password.length < PASSWORD_MINIMUM_LENGTH}
                                        variant="contained"
                                        sx={{
                                            height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px",
                                            backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                            color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor,
                                            fontWeight: "bold",
                                            fontSize: "0.9em"
                                        }}
                                        onClick={() => {
                                            setErrorMessage(null);
                                            authenticateUser({
                                                variables: {                                                
                                                    username: username,
                                                    password: password,
                                                    tenantId: userAuthenticationState.tenantId,
                                                    authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                                                    preAuthToken: userAuthenticationState.preAuthToken
                                                }
                                            });
                                        }}
                                    >Login</Button>
                                    <Button
                                        disabled={false}
                                        variant="contained"
                                        sx={{
                                            height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px",
                                            backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                            color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor,
                                            fontWeight: "bold",
                                            fontSize: "0.9em"
                                        }}
                                        onClick={() => { setErrorMessage(null); setPassword(""); setUserAuthenticationState(null); }}
                                    >Back</Button>
                                    <Button
                                        onClick={() =>{
                                            handleCancelAuthentication(userAuthenticationState);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    
                                </Stack>
                            </Grid2>
                        </React.Fragment>
                    }
                    {userAuthenticationState && userAuthenticationState.authenticationState === AuthenticationState.RotatePassword && passwordConfig !== null &&
                        <AuthentiationRotatePassword
                            initialUserAuthenticationState={userAuthenticationState}
                            passwordConfig={passwordConfig}
                            onAuthenticationCancelled={() => {
                                handleCancelAuthentication(userAuthenticationState);
                            }}
                            onUpdateEnd={(userAuthenticationStateResponse, errorMessage) => {
                                setShowMutationBackdrop(false);
                                handleUserAuthenticationResponse(userAuthenticationStateResponse, errorMessage);                                
                            }}
                            onUpdateStart={() => {
                                setErrorMessage(null);
                                setShowMutationBackdrop(true)
                            }}
                        />
                    }
                    {userAuthenticationState && userAuthenticationState.authenticationState === AuthenticationState.ConfigureTotp &&
                        <AuthentiationConfigureTotp
                            initialUserAuthenticationState={userAuthenticationState}
                            onAuthenticationCancelled={() => {
                                handleCancelAuthentication(userAuthenticationState);
                            }}
                            onUpdateEnd={(userAuthenticationStateResponse, errorMessage) => {
                                setShowMutationBackdrop(false);
                                handleUserAuthenticationResponse(userAuthenticationStateResponse, errorMessage);                                
                            }}
                            onUpdateStart={() => {
                                setErrorMessage(null);
                                setShowMutationBackdrop(true)
                            }}
                        />
                    }
                    {userAuthenticationState && userAuthenticationState.authenticationState === AuthenticationState.ValidateTotp &&
                        <AuthentiationValidateTotp
                            initialUserAuthenticationState={userAuthenticationState}
                            onAuthenticationCancelled={() => {
                                handleCancelAuthentication(userAuthenticationState);
                            }}
                            onUpdateEnd={(userAuthenticationStateResponse, errorMessage) => {
                                setShowMutationBackdrop(false);
                                handleUserAuthenticationResponse(userAuthenticationStateResponse, errorMessage);                                
                            }}
                            onUpdateStart={() => {
                                setErrorMessage(null);
                                setShowMutationBackdrop(true);
                            }}
                        />
                    }
                    {userAuthenticationState && userAuthenticationState.authenticationState === AuthenticationState.ConfigureSecurityKey &&
                        <AuthentiationConfigureSecurityKey
                            initialUserAuthenticationState={userAuthenticationState}
                            onAuthenticationCancelled={() => {
                                handleCancelAuthentication(userAuthenticationState);
                            }}
                            onUpdateEnd={(userAuthenticationStateResponse, errorMessage) => {
                                setShowMutationBackdrop(false);
                                handleUserAuthenticationResponse(userAuthenticationStateResponse, errorMessage);                                
                            }}
                            onUpdateStart={() => {
                                setErrorMessage(null);
                                setShowMutationBackdrop(true);
                            }}
                        />
                    }
                    {userAuthenticationState && userAuthenticationState.authenticationState === AuthenticationState.ValidateSecurityKey &&
                        <AuthentiationValidateSecurityKey
                            initialUserAuthenticationState={userAuthenticationState}
                            onAuthenticationCancelled={() => {
                                handleCancelAuthentication(userAuthenticationState);
                            }}
                            onUpdateEnd={(userAuthenticationStateResponse, errorMessage) => {
                                setShowMutationBackdrop(false);
                                handleUserAuthenticationResponse(userAuthenticationStateResponse, errorMessage);                                
                            }}
                            onUpdateStart={() => {
                                setErrorMessage(null);
                                setShowMutationBackdrop(true);
                            }}
                        />
                    }
                </Grid2>
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
}

export default Login;