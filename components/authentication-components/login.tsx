"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useContext, useEffect, useState } from "react";
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2, Paper, Stack, TextField, Typography } from "@mui/material";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_TENANT_META_DATA, PASSWORD_MINIMUM_LENGTH, QUERY_PARAM_ERROR, QUERY_PARAM_ERROR_DESCRIPTION, QUERY_PARAM_PREAUTHN_TOKEN, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_RETURN_URI, QUERY_PARAM_TENANT_ID, SOCIAL_OIDC_PROVIDER_GOOGLE, SOCIAL_OIDC_PROVIDER_LINKEDIN, SOCIAL_OIDC_PROVIDER_SALESFORCE } from "@/utils/consts";
import { useMutation, useQuery } from "@apollo/client";
import { UserAuthenticationStateResponse, TenantSelectorData, AuthenticationState, UserAuthenticationState, TenantPasswordConfig, FederatedOidcProvider, AuthorizationScopeApprovalData, Scope } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { AUTHENTICATE_HANDLE_FORGOT_PASSWORD, AUTHENTICATE_USER, AUTHENTICATE_USER_AND_MIGRATE, AUTHENTICATE_USERNAME_INPUT_MUTATION, AUTHENTICATE_WITH_SOCIAL_OIDC_PROVIDER, CANCEL_AUTHENTICATION } from "@/graphql/mutations/oidc-mutations";
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import RadioStyledCheckbox from "../input/radio-styled-checkbox";
import { AuthentiationValidateTotp } from "./validate-totp";
import { AuthentiationConfigureTotp } from "./configure-totp";
import { AuthentiationConfigureSecurityKey } from "./configure-security-key";
import { AuthentiationValidateSecurityKey } from "./validate-security-key";
import AuthentiationRotatePassword from "./rotate-password";
import { useSearchParams } from 'next/navigation';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import Skeleton from '@mui/material/Skeleton';
import ValidatePasswordResetToken from "./validate-password-reset-token";
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import AuthentiationAcceptTermsAndConditions from "./accept-terms-and-conditions";
import UserCodeInput from "./user-code";
import { ERROR_CODES } from "@/lib/models/error";
import { useInternationalizationContext } from "../contexts/internationalization-context";
import SelectLanguage from "./select-language";
import { GET_AUTHORIZATION_SCOPE_APPROVAL_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import LanguageIcon from '@mui/icons-material/Language';
import { useIntl } from 'react-intl';
import { ValidateEmailOnAuthentication } from "./validate-email";


const MIN_USERNAME_LENGTH = 6;

export interface AuthenticationComponentsProps {
    initialUserAuthenticationState: UserAuthenticationState,
    onAuthenticationCancelled: () => void,
    onUpdateStart: () => void,
    onUpdateEnd: (userAuthenticationStateResponse: UserAuthenticationStateResponse | null, errorMessage: string | null) => void
}


export interface LoginProps {
    initialUserAuthenticationState?: UserAuthenticationState
}

const Login: React.FC<LoginProps>= ({
    initialUserAuthenticationState
}) => {


    // CONTEXT VARIABLES
    const titleSetter = useContext(PageTitleContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const i18nContext = useInternationalizationContext();
    const intl = useIntl();


    useEffect(() => {
        titleSetter.setPageTitle("Login");
    }, [titleSetter]);

    // QUERY PARAMS
    const params = useSearchParams();
    const preAuthToken = params?.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId: string | null = params?.get(QUERY_PARAM_TENANT_ID) || null;
    const redirectUri = params?.get(QUERY_PARAM_REDIRECT_URI);
    const returnToUri = params?.get(QUERY_PARAM_RETURN_URI);
    const authorizationError = params?.get(QUERY_PARAM_ERROR);
    const authorizationErrorDescription = params?.get(QUERY_PARAM_ERROR_DESCRIPTION);
  
    // PAGE STATE MANAGEMENT VARIABLES
    const authnState: UserAuthenticationState = initialUserAuthenticationState ? initialUserAuthenticationState : {
        authenticationSessionToken: "",
        authenticationState: AuthenticationState.EnterEmail,
        authenticationStateOrder: 0,
        authenticationStateStatus: "",
        expiresAtMs: 0,
        tenantId: "",
        userId: "",
        preAuthToken: preAuthToken,
        returnToUri: returnToUri
    };

    
    const [username, setUsername] = useState<string | null>("");
    const [password, setPassword] = useState<string | null>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showTenantSelector, setShowTenantSelector] = useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [tenantsToSelect, setTenantsToSelect] = useState<Array<TenantSelectorData>>([]);
    const [selectedTenant, setSelectedTenant] = useState<string | null>(tenantId);
    const [userAuthenticationState, setUserAuthenticationState] = React.useState<UserAuthenticationState>(authnState);
    const [passwordConfig, setPasswordConfig] = React.useState<TenantPasswordConfig | null>(null);
    const [isPasswordResetFlow, setIsPasswordResetFlow] = React.useState<boolean>(false);
    const [showRecoveryEmailDialog, setShowRecoveryEmailDialog] = React.useState<boolean>(false);
    const [useRecoveryEmail, setUseRecoveryEmail] = React.useState<boolean>(false);
    const [isLoginDisabled] = React.useState<boolean>( !(authorizationError === null || authorizationError === "") );
    const [authorizationScopeApprovalData, setAuthorizationScopeApprovalData] = React.useState<AuthorizationScopeApprovalData | null>(null);
    const [openLanguageSelector, setOpenLanguageSelector] = React.useState<boolean>(false);
    
    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();

    const maxWidth = breakPoints.isSmall ? "90vw" : breakPoints.isMedium ? "80vw" : "650px";

    // GRAPHQL FUNCTIONS
    const {} = useQuery(GET_AUTHORIZATION_SCOPE_APPROVAL_DATA_QUERY, {
        variables: {
            preAuthToken: preAuthToken
        },
        skip: preAuthToken === null || preAuthToken === undefined,
        onCompleted(data) {
            const approvalData: AuthorizationScopeApprovalData | null = data.getAuthorizationScopeApprovalData;
            if(approvalData && approvalData.requiresUserApproval && approvalData.requestedScope.length > 0){
                setAuthorizationScopeApprovalData(approvalData);
            }
        }
    })


    const [portalLoginEmailHandler] = useMutation(AUTHENTICATE_USERNAME_INPUT_MUTATION, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateHandleUserNameInput;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [authenticateUser] = useMutation(AUTHENTICATE_USER, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateUser;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [authenticateUserAndMigrate] = useMutation(AUTHENTICATE_USER_AND_MIGRATE, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateUserAndMigrate;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    })

    const [cancelAuthentication] = useMutation(CANCEL_AUTHENTICATION, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.cancelAuthentication;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [authenticateWithSocialOIDCProvider] = useMutation(AUTHENTICATE_WITH_SOCIAL_OIDC_PROVIDER, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateWithSocialOIDCProvider;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [authenticateHandleForgotPassword] = useMutation(AUTHENTICATE_HANDLE_FORGOT_PASSWORD, {
        onCompleted(data) {
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateHandleForgotPassword;
            handleUserAuthenticationResponse(authnStateResponse, null);
        },
        onError(error) {
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    // HANDLER FUNCTIONS
    const handleUserAuthenticationResponse = (authnStateResponse: UserAuthenticationStateResponse | null, errorMessage: string | null) => {
        if (authnStateResponse === null) {
            if (errorMessage === null) {
                setErrorMessage(intl.formatMessage({id: "ERROR_DEFAULT_ERROR_MESSAGE"}));
            }
            else {
                setErrorMessage(intl.formatMessage({id: errorMessage}));
            }
        }
        else {
            if (authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.Error) {
                const id: string = authnStateResponse.authenticationError ? authnStateResponse.authenticationError.errorKey : ERROR_CODES.DEFAULT.errorKey;
                setErrorMessage(
                    intl.formatMessage(
                        {id: id}
                    )
                );                
            }
            else if (authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.AuthWithFederatedOidc) {
                if (!authnStateResponse.uri) {
                    setErrorMessage(intl.formatMessage({id: "ERROR_NO_AUTHORIZATION_ENDPOINT_CONFIGURED"}));
                }
                else {
                    router.push(authnStateResponse.uri);
                }
            }
            else if (authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.Register) {
                if (!authnStateResponse.uri) {
                    setErrorMessage(intl.formatMessage({id: "ERROR_NO_REGISTRATION_REDIRECT_URI_CONFIGURED"}));
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
                    setErrorMessage(intl.formatMessage({id: "ERROR_NO_REDIRECT_ENDPOINT_CONFIGURED"}));
                }
                else {
                    if (authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.RedirectToIamPortal) {
                        if (authnStateResponse.accessToken) {
                            authSessionProps.setAuthSessionData({ accessToken: authnStateResponse.accessToken, expiresAtMs: authnStateResponse.tokenExpiresAtMs || 0 });
                            authContextProps.forceProfileRefetch();
                        }
                    }
                    window.location.href = authnStateResponse.uri;                    
                }
            }
            else {
                setUserAuthenticationState(authnStateResponse.userAuthenticationState);                
                if (authnStateResponse.passwordConfig) {
                    setPasswordConfig(authnStateResponse.passwordConfig);
                }
                if(authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.EnterEmail){                    
                    if(authnStateResponse.userAuthenticationState.tenantId.length > 0 && authnStateResponse && selectedTenant === null){
                        setSelectedTenant(authnStateResponse.userAuthenticationState.tenantId);                        
                    }
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
                        setErrorMessage(intl.formatMessage({id: "ERROR_NO_TENANT_TO_SELECT"}));
                    }
                }
                else{
                    if(selectedTenant === null && authnStateResponse.userAuthenticationState.tenantId){
                        setSelectedTenant(authnStateResponse.userAuthenticationState.tenantId);                        
                    }
                }
            }
        }
    }


    const handleUserNameInput = () => {
        portalLoginEmailHandler({
            variables: {
                username: username,
                tenantId: selectedTenant,
                preAuthToken: preAuthToken,
                returnToUri: returnToUri,
                deviceCodeId: userAuthenticationState.deviceCodeId
            }
        });
    }
    const handleEnterButtonPress = (evt: React.KeyboardEvent) => {
        if (evt.key.valueOf().toLowerCase() === "enter") {
            if (username && username.length > MIN_USERNAME_LENGTH) {
                handleUserNameInput();
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
        if(!preAuthToken && authorizationError && redirectUri){            
            window.location.href = `${redirectUri}?${QUERY_PARAM_ERROR}=${authorizationError}&${QUERY_PARAM_ERROR_DESCRIPTION}=${authorizationErrorDescription}`
        }
        else{
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
            setUserAuthenticationState({...authnState});
            authSessionProps.deleteAuthSessionData();
            tenantBean.setTenantMetaData(DEFAULT_TENANT_META_DATA);
        }
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
            return <img alt="google logo" src="/google.png" width={"25px"} />
        }
        else if (provider.socialLoginProvider === SOCIAL_OIDC_PROVIDER_LINKEDIN) {
            return <img alt="linkedin logo" src="/linkedin.png" width={"25px"} />
        }        
        else if (provider.socialLoginProvider === SOCIAL_OIDC_PROVIDER_SALESFORCE) {
            return <img alt="salesforce logo" src="/salesforce.png" width={"25px"} />
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
                {(i18nContext.hasSelectedLanguage() !== true || openLanguageSelector) &&
                    <Dialog 
                        open={i18nContext.hasSelectedLanguage() !== true || openLanguageSelector}
                        maxWidth="sm"
                        fullWidth={true}
                    >
                        <DialogContent>
                            <SelectLanguage 
                                allowCancel={i18nContext.hasSelectedLanguage() === true}
                                cancelCallback={() => setOpenLanguageSelector(false)}
                                onLanguageChanged={() => setOpenLanguageSelector(false)}
                            />
                        </DialogContent>
                    </Dialog>
                }
                {showTenantSelector &&
                    <Dialog
                        open={showTenantSelector}
                        maxWidth="sm"
                        fullWidth={true}
                        onClose={() => closeTenantSelector()}
                    >

                        <DialogTitle><Typography fontSize={"0.95em"}>{intl.formatMessage({id: "SELECT_TENANT"})}</Typography></DialogTitle>
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
                                    {intl.formatMessage({id: "CANCEL"})}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowTenantSelector(false);
                                        handleUserNameInput();
                                    }}
                                    disabled={selectedTenant === null}
                                >
                                    {intl.formatMessage({id: "NEXT"})}
                                </Button>
                            </DialogActions>
                        </Typography>
                    </Dialog>
                }
                {showRecoveryEmailDialog &&
                    <Dialog
                        open={showRecoveryEmailDialog}
                        onClose={() => {
                            setShowRecoveryEmailDialog(false);
                            setIsPasswordResetFlow(false);
                        }}
                        maxWidth="sm"
                        fullWidth={true}
                    >
                        <DialogTitle fontWeight={"bold"}>{intl.formatMessage({id: "SELECT_PASSWORD_RECOVERY_OPTION"})}</DialogTitle>
                        <DialogContent>
                            <Typography component="div">
                                <Grid2 container size={12} spacing={1}>
                                    <Grid2 size={11}>{intl.formatMessage({id: "USE_PRIMARY_EMAIL"})}</Grid2>
                                    <Grid2 size={1}>
                                        <RadioStyledCheckbox 
                                            onChange={() => {
                                                setUseRecoveryEmail(false);
                                            }}
                                            checked={useRecoveryEmail === false}                                    
                                        />
                                    </Grid2>
                                    <Grid2 size={11}>{intl.formatMessage({id: "USE_RECOVERY_EMAI"})}</Grid2>
                                    <Grid2 size={1}>
                                        <RadioStyledCheckbox 
                                            onChange={() => {
                                                setUseRecoveryEmail(true);
                                            }}
                                            checked={useRecoveryEmail === true}
                                        />

                                    </Grid2>
                                </Grid2>
                            </Typography>

                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setShowRecoveryEmailDialog(false);
                                    setIsPasswordResetFlow(false);
                                }}
                            >
                                {intl.formatMessage({id: "CANCEL"})}
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowRecoveryEmailDialog(false);
                                    authenticateHandleForgotPassword({
                                        variables: {
                                            authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                                            preAuthToken: preAuthToken,
                                            useRecoveryEmail: useRecoveryEmail
                                        }
                                    });
                                }}
                            >
                                {intl.formatMessage({id: "SUBMIT"})}
                            </Button>
                        </DialogActions>

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
                    {authorizationError &&
                        <Grid2 size={{ xs: 12 }} textAlign={"center"}>
                            <Stack
                                direction={"row"}
                                justifyItems={"center"}
                                alignItems={"center"}
                                sx={{ width: "100%" }}
                            >
                                <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%", fontSize: "0.85em", lineHeight: "1.6em" }} severity="error">
                                    <span>There was an error with the configuration of the client or referring application:</span>
                                    <span style={{fontWeight: "bold"}}> {authorizationErrorDescription}. </span>
                                    <span>Login will not be permitted until the issues are resolved. Please try again later or contact support if the problem persists.</span>
                                </Alert>

                            </Stack>
                        </Grid2>
                    }
                    {userAuthenticationState.authenticationState === AuthenticationState.EnterUserCode &&
                        <UserCodeInput
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
                    {userAuthenticationState.authenticationState === AuthenticationState.EnterEmail &&
                        <React.Fragment>
                            {authorizationScopeApprovalData &&
                                <Grid2 container size={12} spacing={1}>
                                    <Typography component="div" sx={{width: "100%"}}>
                                        <Alert severity="info" sx={{width: "100%", fontSize: "0.95em"}}>
                                            <Grid2 marginBottom={"8px"} size={{xs: 12}}>
                                                <span style={{fontWeight: "bold"}}>{authorizationScopeApprovalData.clientName} </span>
                                                <span>{intl.formatMessage({id: "SCOPE_PERMISSION_REQUEST"})}:</span>
                                            </Grid2>
                                            <Grid2 size={{xs: 12}}>
                                                <ul style={{ paddingLeft: "32px", marginBottom: "8px" }}>
                                                    {authorizationScopeApprovalData.requestedScope.map(
                                                        (scope: Scope) => (
                                                            <li key={scope.scopeId}>{scope.scopeDescription}</li>
                                                        )
                                                    )}
                                                </ul>
                                            </Grid2>
                                        </Alert>
                                    </Typography>
                                </Grid2>
                            }
                            <Grid2 container size={12} spacing={1}>
                                <Grid2 size={11}>
                                    <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.2em" }}>{intl.formatMessage({id: "SIGN_IN"})}</div>                                    
                                </Grid2>
                                <Grid2 size={1}>
                                    <LanguageIcon 
                                        sx={{cursor: "pointer"}}
                                        onClick={() => {
                                            setOpenLanguageSelector(true);
                                        }}
                                    />
                                </Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        id="email"
                                        required={true}
                                        autoFocus={true}
                                        label={tenantBean.getTenantMetaData().tenant.allowLoginByPhoneNumber ? intl.formatMessage({id: "ENTER_EMAIL_OR_PHONE_NUMBER"}) : intl.formatMessage({id: "EMAIL"})}
                                        name="email"
                                        fullWidth
                                        onChange={(evt) => setUsername(evt.target.value)}
                                        onKeyDown={handleEnterButtonPress}
                                        value={username}
                                        disabled={isLoginDisabled}
                                    >
                                    </TextField>
                                </Grid2>

                            </Grid2>
                            
                            <Grid2 size={{ xs: 12 }}>
                                <Stack
                                    direction={"row-reverse"}
                                >
                                    <Button
                                        disabled={username === null || username.length < MIN_USERNAME_LENGTH || (!tenantBean.getTenantMetaData().tenant.allowLoginByPhoneNumber && username.indexOf("@") < 1)}
                                        variant="contained"                                        
                                        onClick={() => handleUserNameInput()}
                                    >
                                        {intl.formatMessage({id: "NEXT"})}
                                    </Button>
                                    <Button
                                        variant="contained"  
                                        onClick={() => {
                                            handleCancelAuthentication(userAuthenticationState);                                            
                                        }}
                                    >
                                        {intl.formatMessage({id: "CANCEL"})}
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
                                            >
                                                {intl.formatMessage({id: "REGISTER"})}
                                            </Button>
                                        </Link>

                                        <div style={{ verticalAlign: "center", fontWeight: "bold", fontSize: "0.9em" }}>Need to create an account?</div>
                                    </Stack>
                                </Grid2>
                            }
                            {tenantBean.getTenantMetaData().tenant.allowSocialLogin && tenantBean.getTenantMetaData().socialOIDCProviders.length > 0 &&
                                <React.Fragment>
                                    <Grid2 size={{ xs: 12 }}>
                                        <Divider>OR</Divider>
                                    </Grid2>
                                    <Typography width={"100%"} component="div">
                                        {tenantBean.getTenantMetaData().socialOIDCProviders.map(
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
                                                    <Grid2 size={breakPoints.isMedium ? 2 : 1.5}>
                                                        {getIconForSocialProvider(provider)}
                                                    </Grid2>
                                                    <Grid2 size={breakPoints.isMedium ? 10 : 10.5}>{intl.formatMessage({id: "SIGN_IN_WITH"})} {provider.federatedOIDCProviderName}</Grid2>
                                                </Grid2>
                                            )
                                        )}
                                    </Typography>
                                </React.Fragment>
                            }
                        </React.Fragment>
                    }                    
                    {userAuthenticationState.authenticationState === AuthenticationState.EnterPassword &&
                        <React.Fragment>
                            <Grid2 size={{ xs: 12 }}>
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.2em" }}>{intl.formatMessage({id: "SIGN_IN"})}</div>
                                <TextField
                                    type="password"
                                    id="password"
                                    required={true}
                                    autoFocus={true}
                                    label={intl.formatMessage({id: "PASSWORD"})}
                                    name="password"
                                    fullWidth
                                    onChange={(evt) => setPassword(evt.target.value)}
                                    
                                    value={password}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "&.Mui-focused fieldset": {
                                                borderColor:
                                                    (tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "white" ||                                                        
                                                        tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "#FFFFFF" ||
                                                        tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor === "#ffffff") ?
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
                                                setShowRecoveryEmailDialog(true);                                                
                                            }}
                                        >
                                            {intl.formatMessage({id: "FORGOT_PASSWORD"})}?
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
                                    >
                                        {intl.formatMessage({id: "LOGIN"})}
                                    </Button>
                                    <Button
                                        disabled={false}
                                        variant="contained"
                                        onClick={() => { 
                                            setErrorMessage(null); 
                                            setPassword(""); 
                                            setUserAuthenticationState({...authnState});
                                        }}
                                    >
                                        {intl.formatMessage({id: "BACK"})}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleCancelAuthentication(userAuthenticationState);
                                        }}
                                        variant="contained"
                                    >
                                        {intl.formatMessage({id: "CANCEL"})}
                                    </Button>
                                </Stack>
                            </Grid2>
                        </React.Fragment>
                    }
                    {userAuthenticationState.authenticationState === AuthenticationState.EnterPasswordAndMigrateUser &&
                        <React.Fragment>
                            <Grid2 size={{ xs: 12 }}>
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.2em" }}>{intl.formatMessage({id: "SIGN_IN"})}</div>
                                <TextField
                                    type="password"
                                    id="password"
                                    required={true}
                                    autoFocus={true}
                                    label={intl.formatMessage({id: "PASSWORD"})}
                                    name="password"
                                    fullWidth
                                    onChange={(evt) => setPassword(evt.target.value)}                                    
                                    value={password}                                    
                                >
                                </TextField>
                            </Grid2>
                            <Grid2 size={12}>
                                <Stack
                                    direction={"row-reverse"}
                                >
                                    <Button
                                        disabled={password === null || password.length < PASSWORD_MINIMUM_LENGTH}
                                        variant="contained"
                                        onClick={() => {
                                            setErrorMessage(null);
                                            authenticateUserAndMigrate({
                                                variables: {
                                                    username: username,
                                                    password: password,
                                                    tenantId: userAuthenticationState.tenantId,
                                                    authenticationSessionToken: userAuthenticationState.authenticationSessionToken,
                                                    preAuthToken: userAuthenticationState.preAuthToken
                                                }
                                            });
                                        }}
                                    >
                                        {intl.formatMessage({id: "LOGIN"})}
                                    </Button>
                                    <Button
                                        disabled={false}
                                        variant="contained"
                                        onClick={() => { 
                                            setErrorMessage(null); 
                                            setPassword(""); 
                                            setUserAuthenticationState({...authnState});
                                        }}
                                    >
                                        {intl.formatMessage({id: "BACK"})}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleCancelAuthentication(userAuthenticationState);
                                        }}
                                        variant="contained"
                                    >
                                        {intl.formatMessage({id: "CANCEL"})}
                                    </Button>
                                </Stack>
                            </Grid2>
                        </React.Fragment>
                    }
                    {userAuthenticationState.authenticationState === AuthenticationState.RotatePassword && passwordConfig !== null &&
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
                    {userAuthenticationState.authenticationState === AuthenticationState.ValidatePasswordResetToken &&
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
                    {userAuthenticationState.authenticationState === AuthenticationState.ValidateEmail &&
                        <ValidateEmailOnAuthentication
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
                    {userAuthenticationState.authenticationState === AuthenticationState.ConfigureTotp &&
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
                    {userAuthenticationState.authenticationState === AuthenticationState.ValidateTotp &&
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
                    {userAuthenticationState.authenticationState === AuthenticationState.ConfigureSecurityKey &&
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
                    {userAuthenticationState.authenticationState === AuthenticationState.ValidateSecurityKey &&
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
                    {userAuthenticationState.authenticationState === AuthenticationState.AcceptTermsAndConditions &&
                        <AuthentiationAcceptTermsAndConditions
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