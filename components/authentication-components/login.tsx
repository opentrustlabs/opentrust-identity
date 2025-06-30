"use client";
import React, { useContext, useEffect, useState } from "react";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2, Paper, Stack, TextField, Typography } from "@mui/material";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, PASSWORD_MINIMUM_LENGTH, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_PREAUTHN_TOKEN, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_RETURN_URI, QUERY_PARAM_TENANT_ID, SOCIAL_OIDC_PROVIDER_APPLE, SOCIAL_OIDC_PROVIDER_FACEBOOK, SOCIAL_OIDC_PROVIDER_GOOGLE, SOCIAL_OIDC_PROVIDER_LINKEDIN, SOCIAL_OIDC_PROVIDER_SALESFORCE } from "@/utils/consts";
import { useMutation, useQuery } from "@apollo/client";
import { UserAuthenticationStateResponse, TenantSelectorData, AuthenticationState, UserAuthenticationState, TenantPasswordConfig, FederatedOidcProvider } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { AUTHENTICATE_HANDLE_FORGOT_PASSWORD, AUTHENTICATE_USER, AUTHENTICATE_USERNAME_INPUT_MUTATION, AUTHENTICATE_WITH_SOCIAL_OIDC_PROVIDER, CANCEL_AUTHENTICATION } from "@/graphql/mutations/oidc-mutations";
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import RadioStyledCheckbox from "../input/radio-styled-checkbox";
import { AuthentiationValidateTotp } from "./validate-totp";
import { AuthentiationConfigureTotp } from "./configure-totp";
import { AuthentiationConfigureSecurityKey } from "./configure-security-key";
import { AuthentiationValidateSecurityKey } from "./validate-security-key";
import AuthentiationRotatePassword from "./rotate-password";
import { useSearchParams } from 'next/navigation';
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";
import { FEDERATED_OIDC_PROVIDERS_QUERY } from "@/graphql/queries/oidc-queries";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import Skeleton from '@mui/material/Skeleton';
import ValidatePasswordResetToken from "./validate-password-reset-token";


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
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    useEffect(() => {
        titleSetter.setPageTitle("Login");
    }, []);
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // QUERY PARAMS
    const params = useSearchParams();
    const preAuthToken = params?.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId: string | null = params?.get(QUERY_PARAM_TENANT_ID) || null;
    const redirectUri = params?.get(QUERY_PARAM_REDIRECT_URI);
    const returnToUri = params?.get(QUERY_PARAM_RETURN_URI);


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
    const [socialOIDCProviders, setSocialOIDCProviders] = React.useState<Array<FederatedOidcProvider>>([]);
    const [isPasswordResetFlow, setIsPasswordResetFlow] = React.useState<boolean>(false);

    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();

    const maxWidth = breakPoints.isSmall ? "90vw" : breakPoints.isMedium ? "80vw" : "650px";

    // GRAPHQL FUNCTIONS
    const { } = useQuery(FEDERATED_OIDC_PROVIDERS_QUERY, {
        variables: {
            tenantId: tenantId
        },
        ssr: false,
        skip: tenantId === null || tenantBean.getTenantMetaData().tenant.allowSocialLogin !== true,
        onCompleted(data) {
            if (data && data.getFederatedOIDCProviders) {
                let arr: Array<FederatedOidcProvider> = data.getFederatedOIDCProviders;
                arr = arr.filter(
                    (provider: FederatedOidcProvider) => provider.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL
                );
                if (arr.length > 0) {
                    setSocialOIDCProviders(arr);
                }
            }
        }
    });

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
        onError(error) {
            setErrorMessage(error.message);
        }
    });

    const [authenticateWithSocialOIDCProvider] = useMutation(AUTHENTICATE_WITH_SOCIAL_OIDC_PROVIDER, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateWithSocialOIDCProvider;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(error.message);
        }
    });

    const [authenticateHandleForgotPassword] = useMutation(AUTHENTICATE_HANDLE_FORGOT_PASSWORD, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateHandleForgotPassword;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(error.message);
        }
    });

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
                    if (authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal) {
                        if (authnStateResponse.accessToken) {
                            authSessionProps.setAuthSessionData({ accessToken: authnStateResponse.accessToken, expiresAtMs: authnStateResponse.tokenExpiresAtMs || 0 });
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
                preAuthToken: preAuthToken,
                returnToUri: returnToUri
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
                        preAuthToken: preAuthToken,
                        returnToUri: returnToUri
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

    const getIconForSocialProvider = (provider: FederatedOidcProvider) => {
        if (provider.socialLoginProvider === SOCIAL_OIDC_PROVIDER_GOOGLE) {
            return <img src="/google.png" width={"25px"} />
        }
        else if (provider.socialLoginProvider === SOCIAL_OIDC_PROVIDER_FACEBOOK) {
            return <img src="/facebook.png" width={"25px"} />
        }
        else if (provider.socialLoginProvider === SOCIAL_OIDC_PROVIDER_LINKEDIN) {
            return <img src="/linkedin.png" width={"25px"} />
        }
        else if (provider.socialLoginProvider === SOCIAL_OIDC_PROVIDER_APPLE) {
            return <img src="/apple.png" width={"25px"} />
        }
        else if (provider.socialLoginProvider === SOCIAL_OIDC_PROVIDER_SALESFORCE) {
            return <img src="/salesforce.png" width={"25px"} />
        }
        else {
            return <Skeleton height={"25px"} width={"25px"} />
        }
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
                <Grid2 spacing={3} container size={{ xs: 12 }}>
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
                            <Grid2 size={{ xs: 12 }}>
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
                                        onClick={() => {
                                            if (redirectUri) {
                                                router.push(`${redirectUri}?error=access_denied&error_description=authentication_cancelled_by_user`)
                                            }
                                            else {
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
                            {tenantBean.getTenantMetaData().tenant.allowSocialLogin && socialOIDCProviders.length > 0 &&
                                <React.Fragment>
                                    <Grid2 size={{ xs: 12 }}>
                                        <Divider>OR</Divider>
                                    </Grid2>
                                    <Typography width={"100%"} component="div">
                                        {socialOIDCProviders.map(
                                            (provider: FederatedOidcProvider) => (
                                                <Grid2
                                                    className="social-media-login-container"
                                                    key={provider.federatedOIDCProviderId}
                                                    onClick={() => {
                                                        authenticateWithSocialOIDCProvider({
                                                            variables: {
                                                                tenantId: tenantId,
                                                                preAuthToken: preAuthToken,
                                                                federatedOIDCProviderId: provider.federatedOIDCProviderId
                                                            }
                                                        })
                                                    }}
                                                    container spacing={0}
                                                    size={{ xs: 12 }}
                                                >
                                                    <Grid2 size={breakPoints.isMedium ? 2 : 1.5}>{getIconForSocialProvider(provider)}

                                                    </Grid2>
                                                    <Grid2 size={breakPoints.isMedium ? 10 : 10.5}>Sign in with {provider.federatedOIDCProviderName}</Grid2>
                                                </Grid2>
                                            )
                                        )}
                                    </Typography>
                                </React.Fragment>
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
                                        <span 
                                            style={{fontWeight: "bold", fontSize: "0.9em", textDecoration: "underline", cursor: "pointer"}}
                                            onClick={() => {
                                                setIsPasswordResetFlow(true);                                                
                                                authenticateHandleForgotPassword({
                                                    variables: {
                                                        authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                                                        preAuthToken: preAuthToken
                                                    }
                                                });
                                            }}
                                        >Forgot Password?
                                        </span>                                            
                                    </Stack>
                                </Grid2>
                            }
                            <Grid2 size={12}>
                                <Stack
                                    direction={"row-reverse"}
                                >
                                    <Button
                                        disabled={password === null || password.length < PASSWORD_MINIMUM_LENGTH}
                                        variant="contained"
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
                                        onClick={() => { setErrorMessage(null); setPassword(""); setUserAuthenticationState(null); }}
                                    >Back</Button>
                                    <Button
                                        onClick={() => {
                                            handleCancelAuthentication(userAuthenticationState);
                                        }}
                                        variant="contained"
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
                            isPasswordResetFlow={isPasswordResetFlow}
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
                    {userAuthenticationState && userAuthenticationState.authenticationState === AuthenticationState.ValidatePasswordResetToken &&
                        <ValidatePasswordResetToken
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