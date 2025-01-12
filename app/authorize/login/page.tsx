"use client";
import React, { useState } from "react";
import { Button, CircularProgress, Divider, Grid2, Paper, Stack, TextField } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { DEFAULT_TENANT_META_DATA, QUERY_PARAM_PREAUTH_REDIRECT_URI, QUERY_PARAM_PREAUTH_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN } from "@/utils/consts";
import { LOGIN_USERNAME_HANDLER_QUERY, TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { useLazyQuery, useQuery } from "@apollo/client";
import { LoginUserNameHandlerAction, LoginUserNameHandlerResponse } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';

// TODO
// 1.   retrieve the tenant information if present, in order to show
//      background colors and logos

const MIN_USERNAME_LENGTH = 6;
const USERNAME_COMPONENT = "USERNAME_COMPONENT";
const PASSWORD_COMPONENT = "PASSWORD_COMPONENT";

const Login: React.FC = () => {

    // PAGE STATE MANAGEMENT VARIABLES
    const [username, setUsername] = useState<string | null>("");
    const [password, setPassword] = useState<string | null>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // To toggle between USERNAME_COMPONENT and PASSWORD_COMPONENT for display
    const [displayComponent, setDisplayComponent] = useState<string>(USERNAME_COMPONENT);

    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();
    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));
    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";

    const params = useSearchParams();
    const preauthToken = params.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId = params.get(QUERY_PARAM_PREAUTH_TENANT_ID);
    const redirectUri = params.get(QUERY_PARAM_PREAUTH_REDIRECT_URI);

    // GRAPHQL FUNCTIONS
    const [tenantMetaData, setTenantMetaData] = useState(tenantId ? null : DEFAULT_TENANT_META_DATA);
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
            console.log(response);
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
        },
    });


    // EVENT HANDLERS
    const handleNextClick = (evt: any) => {
        console.log(evt);
        getLoginUsernameHandler({
            variables: {
                username: username,
                tenantId: tenantId,
                preauthToken: preauthToken
            }
        });
    }
    const handleEnterButtonPress = (evt: React.KeyboardEvent) => {
        console.log(evt.key.valueOf());
        if (evt.key.valueOf().toLowerCase() === "enter") {
            console.log("hit enter key?")
            if (username && username.length > MIN_USERNAME_LENGTH) {
                console.log("will call handler")
                getLoginUsernameHandler({
                    variables: {
                        username: username,
                        tenantId: tenantId,
                        preauthToken: preauthToken
                    }
                });
            }
        }
    }

    const handleEnterButtonLogin = (evt: React.KeyboardEvent) => {
        console.log("will login")
    }

    const handleLoginButton = () => {
        console.log("will login")
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
                                onKeyDown={handleEnterButtonLogin}
                            >
                            </TextField>
                        }
                    </Grid2>
                    {tenantMetaData.tenant.allowForgotPassword &&
                        <Grid2 size={{ xs: 12 }}>
                            <Stack
                                direction={"row-reverse"}
                            >
                                <span><Link href="/authorize/forgot-password" style={{ color: "#1976d2" }}>Forgot password?</Link></span>
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
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px" }}
                                    onClick={handleNextClick}
                                >Next</Button>
                                {preauthToken &&
                                    <a href={`${redirectUri}?error=access_denied`}>
                                        <Button
                                            disabled={false}
                                            variant="contained"
                                            sx={{ height: "100%", padding: "8px 32px 8px 32px" }}
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
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px" }}
                                    onClick={handleLoginButton}
                                >Login</Button>
                                <Button
                                    disabled={false}
                                    variant="contained"
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px" }}
                                    onClick={() => setDisplayComponent(USERNAME_COMPONENT)}
                                >Back</Button>
                                {preauthToken &&
                                    <a href={`${redirectUri}?error=access_denied`}>
                                        <Button
                                            disabled={false}
                                            variant="contained"
                                            sx={{ height: "100%", padding: "8px 32px 8px 32px" }}
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
                                    <a href="/authorize/register">
                                        <Button
                                            disabled={false}
                                            variant="contained"
                                            sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px" }}
                                        >Register</Button>
                                    </a>

                                    <div style={{ verticalAlign: "center" }}>Need to create an account?</div>
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