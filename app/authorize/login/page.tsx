"use client";
import React, { useContext, useState } from "react";
import { Button, CircularProgress, Divider, Grid2, Paper, Stack, TextField } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { DEFAULT_TENANT_META_DATA, QUERY_PARAM_PREAUTH_REDIRECT_URI, QUERY_PARAM_PREAUTH_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN } from "@/utils/consts";
import { LOGIN_USERNAME_HANDLER_QUERY, TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { LoginAuthenticationHandlerAction, LoginAuthenticationHandlerResponse, LoginUserNameHandlerAction, LoginUserNameHandlerResponse } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { LOGIN_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { PageTitleContext } from "@/components/contexts/page-title-context";


const MIN_USERNAME_LENGTH = 6;
const USERNAME_COMPONENT = "USERNAME_COMPONENT";
const PASSWORD_COMPONENT = "PASSWORD_COMPONENT";

const Login: React.FC = () => {

    // Context objects
    const titleSetter = useContext(PageTitleContext);
    titleSetter.setPageTitle("Login");

    // QUERY PARAMS
    const params = useSearchParams();
    const preauthToken = params.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId = params.get(QUERY_PARAM_PREAUTH_TENANT_ID);
    const redirectUri = params.get(QUERY_PARAM_PREAUTH_REDIRECT_URI);

    // PAGE STATE MANAGEMENT VARIABLES
    const [username, setUsername] = useState<string | null>("");
    const [password, setPassword] = useState<string | null>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [tenantMetaData, setTenantMetaData] = useState(tenantId ? null : DEFAULT_TENANT_META_DATA);
    // To toggle between USERNAME_COMPONENT and PASSWORD_COMPONENT for display
    const [displayComponent, setDisplayComponent] = useState<string>(USERNAME_COMPONENT);

    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();
    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));
    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";


    // GRAPHQL FUNCTIONS    
    // TODO -> Need to add the token to this query and get the redirect uri if it exists
    // Need to get password min length from password config, or use default min length
    const { loading } = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: tenantId
        },
        skip: tenantId === null || tenantId === undefined,
        onCompleted(data) {
            setTenantMetaData(data.getTenantMetaData);
        },
        onError() {
            setTenantMetaData(DEFAULT_TENANT_META_DATA);
        }
    });

    const [getLoginUsernameHandler, {  }] = useLazyQuery(
        LOGIN_USERNAME_HANDLER_QUERY, {
            fetchPolicy: "network-only",
            onCompleted(data) {
                const response: LoginUserNameHandlerResponse = data.getLoginUserNameHandler as LoginUserNameHandlerResponse;
                if (response.action === LoginUserNameHandlerAction.EnterPassword) {
                    setDisplayComponent(PASSWORD_COMPONENT);
                }
                else if (response.action === LoginUserNameHandlerAction.OidcRedirect) {
                    let redirectUri = `${response.oidcRedirectActionHandlerConfig?.redirectUri}?`;
                    const params = new URLSearchParams({
                        client_id: response.oidcRedirectActionHandlerConfig?.clientId || "",
                        state: response.oidcRedirectActionHandlerConfig?.state || "",
                        redirect_uri: response.oidcRedirectActionHandlerConfig?.redirectUri || "",
                        response_type: response.oidcRedirectActionHandlerConfig?.responseType || ""
                    })
                    if(response.oidcRedirectActionHandlerConfig?.responseMode){
                        params.set("response_mode", response.oidcRedirectActionHandlerConfig?.responseMode);
                    }                
                    if(response.oidcRedirectActionHandlerConfig?.codeChallenge){
                        params.set("code_challenge", response.oidcRedirectActionHandlerConfig.codeChallenge);
                        params.set("code_challenge_method", response.oidcRedirectActionHandlerConfig.codeChallengeMethod || "");
                    }
                    if(response.oidcRedirectActionHandlerConfig?.scope){
                        params.set("scope", response.oidcRedirectActionHandlerConfig.scope);
                    }
                    router.push(redirectUri + params.toString());
                }
                else {
                    setErrorMessage(response.errorActionHandler?.errorMessage || "Error with the user account. It is either disabled or not permitted for this tenant or client.");
                }
            }
        }            
    );

    const [getPasswordAuthenticationResponse, {}] = useMutation(
        LOGIN_MUTATION,
        {
            onCompleted(data) {
                const response: LoginAuthenticationHandlerResponse = data.login as LoginAuthenticationHandlerResponse;
                if(response.status === LoginAuthenticationHandlerAction.SecondFactorInput){
                    router.push(`/authorize/mfa?mfa_type=${response.secondFactorType}`);
                }
                else if(response.status === LoginAuthenticationHandlerAction.Authenticated){
                    let redirectUri = `${response.successConfig?.redirectUri}`
                    if(response.successConfig?.responseMode && response.successConfig.responseMode === "fragment"){
                        redirectUri = redirectUri + "#";
                    }
                    else{
                        redirectUri = redirectUri + "?";
                    }
                    const params = new URLSearchParams({
                        code: response.successConfig?.code || "",
                    });
                    if(response.successConfig?.state){
                        params.set("state", response.successConfig.state);
                    }
                    router.push(redirectUri + params.toString());
                }
                else {
                    setErrorMessage(response.errorActionHandler?.errorMessage || "Error with authentication. Either the user name or password is incorrect.")
                }
                
            },
            onError() {
                setErrorMessage("Error with authentication. Either the user name or password is incorrect, or the system is unable to perform authentication.")
            }
        }
    );


    // EVENT HANDLERS
    const handleNextClick = (evt: any) => {
        getLoginUsernameHandler({
            variables: {
                username: username,
                tenantId: tenantId,
                preauthToken: preauthToken
            }
        });
    }
    const handleEnterButtonPress = (evt: React.KeyboardEvent) => {        
        if (evt.key.valueOf().toLowerCase() === "enter") {
            if (username && username.length > MIN_USERNAME_LENGTH) {
                getLoginUsernameHandler({
                    variables: {
                        username: username,
                        tenantId: tenantId,
                        preauthToken: preauthToken
                    }
                });
            }
        }
        // Remove the error message if the user makes any changes to the user name
        else{
            if(errorMessage !== null){
                setErrorMessage(null);
            }
        }
    }

    const enterKeyLoginHandler = (evt: React.KeyboardEvent) => {
        if (evt.key.valueOf().toLowerCase() === "enter") {
            if (username && username.length > MIN_USERNAME_LENGTH && password && password.length >= 8) {
                getPasswordAuthenticationResponse({
                    variables: {
                        username: username,
                        password: password
                    }
                });
            }
        }
        // Remove the error message if the user makes any changes to the password
        else{
            if(errorMessage !== null){
                setErrorMessage(null);
            }
        }
        
    }

    const buttonLoginHandler = () => {
        getPasswordAuthenticationResponse({
            variables: {
                username: username,
                password: password
            }
        });
    }

    const getQueryParams = (): string => {
        const params = new URLSearchParams();
        if(tenantId){
            params.set("_tid", tenantId);
        }
        if(preauthToken){
            params.set("_tk", preauthToken)
        }
        return params.toString();
    }

    if (loading) return <CircularProgress />

    if (tenantMetaData) {
        return (

            <Paper
                elevation={4}
                sx={{ padding: 2, height: "100%", maxWidth: maxWidth, width: maxWidth }}
            >
                <Grid2 spacing={4} container size={{ xs: 12 }}>
                    {errorMessage !== null &&
                        <>
                            <Grid2 size={{ xs: 12 }} textAlign={"center"}>
                                <Stack
                                    direction={"row"}
                                    justifyItems={"center"}
                                    alignItems={"center"}
                                    sx={{width: "100%"}}
                                >
                                    <Alert onClose={() => setErrorMessage(null)} sx={{width: "100%"}}severity="error">{errorMessage}</Alert>
                                    
                                </Stack>
                            </Grid2>
                        </>
                    }
                    <Grid2 size={{ xs: 12 }}>
                        <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.2em" }}>Sign In</div>
                        {displayComponent === USERNAME_COMPONENT &&
                            <TextField
                                id="email"
                                required={true}
                                autoFocus={true}
                                label={tenantMetaData.tenant.allowLoginByPhoneNumber ? "Email or phone number" : "Email"}
                                name="email"
                                fullWidth
                                onChange={(evt) => setUsername(evt.target.value)}
                                onKeyDown={handleEnterButtonPress}
                                value={username}
                                sx={{                                    
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: 
                                                (tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor === "white" ||
                                                tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor === "FFF" ||
                                                tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor === "fff") ?
                                                "lightgray" :
                                                tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor
                                                
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
                        }
                        {displayComponent === PASSWORD_COMPONENT &&
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
                                                (tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor === "white" ||
                                                tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor === "FFF" ||
                                                tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor === "fff") ?
                                                "lightgray" :
                                                tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor
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
                        }
                    </Grid2>
                    {tenantMetaData.tenant.allowForgotPassword &&
                        <Grid2 size={{ xs: 12 }}>
                            <Stack
                                direction={"row-reverse"}
                            >
                                <span><Link prefetch={false} href={`/authorize/forgot-password?${getQueryParams()}`} style={{ color: "black", fontWeight: "bold", fontSize: "0.9em"}}>Forgot password?</Link></span>
                            </Stack>
                        </Grid2>
                    }
                    <Grid2 size={{ xs: 12 }}>
                        {displayComponent === USERNAME_COMPONENT &&
                            <Stack
                                direction={"row-reverse"}
                            >
                                <Button
                                    disabled={username === null || username.length < MIN_USERNAME_LENGTH || (!tenantMetaData.tenant.allowLoginByPhoneNumber && username.indexOf("@") < 1)}
                                    variant="contained"
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px", 
                                        backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                        color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor,
                                        fontWeight: "bold",
                                        fontSize: "0.9em"
                                    }}
                                    onClick={handleNextClick}
                                >Next</Button>
                                {preauthToken &&
                                    <a href={`${redirectUri}?error=access_denied`}>
                                        <Button
                                            disabled={false}
                                            variant="contained"
                                            sx={{ height: "100%", padding: "8px 32px 8px 32px", 
                                                backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                                color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor,
                                                fontWeight: "bold",
                                                fontSize: "0.9em"
                                            }}
                                        >Cancel</Button>
                                    </a>
                                }

                            </Stack>
                        }
                        {displayComponent === PASSWORD_COMPONENT &&
                            <Stack
                                direction={"row-reverse"}
                            >
                                <Button
                                    disabled={password === null || password.length < MIN_USERNAME_LENGTH}
                                    variant="contained"
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px",
                                        backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                        color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor,
                                        fontWeight: "bold",
                                        fontSize: "0.9em"
                                    }}
                                    onClick={buttonLoginHandler}
                                >Login</Button>
                                <Button
                                    disabled={false}
                                    variant="contained"
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px",
                                        backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                        color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor,
                                        fontWeight: "bold",
                                        fontSize: "0.9em"
                                    }}
                                    onClick={() => {setErrorMessage(null); setPassword(""); setDisplayComponent(USERNAME_COMPONENT);}}
                                >Back</Button>
                                {preauthToken &&
                                    <a href={`${redirectUri}?error=access_denied`}>
                                        <Button
                                            disabled={false}
                                            variant="contained"
                                            sx={{ height: "100%", padding: "8px 32px 8px 32px",
                                                backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                                color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor,
                                                fontWeight: "bold",
                                                fontSize: "0.9em"
                                            }}
                                        >Cancel</Button>
                                    </a>
                                }
                            </Stack>
                        }
                    </Grid2>
                    {tenantMetaData.tenant.allowUserSelfRegistration &&
                        <>
                            <Grid2 size={{ xs: 12 }}>
                                <Divider></Divider>
                            </Grid2>

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
                                            sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px",
                                                backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                                color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor,
                                                fontWeight: "bold",
                                                fontSize: "0.9em"
                                            }}
                                        >Register</Button>
                                    </Link>

                                    <div style={{ verticalAlign: "center", fontWeight: "bold", fontSize: "0.9em" }}>Need to create an account?</div>
                                </Stack>
                            </Grid2>
                        </>
                    }
                </Grid2>

            </Paper>

        )
    }
}

export default Login;