"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QUERY_PARAM_PREAUTH_TENANT_ID } from "@/utils/consts";
import { LOGIN_USERNAME_HANDLER_QUERY } from "@/graphql/queries/oidc-queries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {  UserAuthenticationStateResponse, TenantSelectorData, AuthenticationState } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { AUTHENTICATE_USERNAME_INPUT_MUTATION, LOGIN_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import RadioStyledCheckbox from "../input/radio-styled-checkbox";
import { channel } from "diagnostics_channel";


const MIN_USERNAME_LENGTH = 6;
const USERNAME_COMPONENT = "USERNAME_COMPONENT";
const PASSWORD_COMPONENT = "PASSWORD_COMPONENT";

export interface PortalLoginProps {
    tenantId?: string,
    redirectUri: string,
    preauthToken: string,
    tenantBean: TenantMetaDataBean
}

const PortalLogin: React.FC<PortalLoginProps> = ({
    tenantId,
    redirectUri,
    preauthToken,
    tenantBean
}) => {


    // CONTEXT VARIABLES
    const titleSetter = useContext(PageTitleContext);
    useEffect(() => {
        titleSetter.setPageTitle("Login");
    }, []);
    

    // PAGE STATE MANAGEMENT VARIABLES
    const [username, setUsername] = useState<string | null>("");
    const [password, setPassword] = useState<string | null>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // To toggle between USERNAME_COMPONENT and PASSWORD_COMPONENT for display
    const [displayComponent, setDisplayComponent] = useState<string>(USERNAME_COMPONENT);
    const [showTenantSelector, setShowTenantSelector] = useState<boolean>(false);
    const [tenantsToSelect, setTenantsToSelect] = useState<Array<TenantSelectorData>>([]);
    const [selectedTenant, setSelectedTenant] = useState<string | undefined>(tenantId);

    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();
    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));
    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";


    // GRAPHQL FUNCTIONS    
    const [portalLoginEmailHandler] = useMutation(AUTHENTICATE_USERNAME_INPUT_MUTATION, {
        onCompleted(data) {            
            const authnStateResponse: UserAuthenticationStateResponse = data.authenticateUserNameInput;
            if(authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.Error){
                setErrorMessage(authnStateResponse.authenticationError?.errorMessage || "ERROR");
            }
            else{
                if(authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.AuthWithFederatedOidc){
                    if(!authnStateResponse.uri){
                        setErrorMessage("ERROR_NO_AUTHORIZATION_ENDPOINT_CONFIGURED");
                    }

                    else{
                        router.push(authnStateResponse.uri);
                    }
                }
                if(authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.SelectTenant){ 
                    if(authnStateResponse.availableTenants){
                        setTenantsToSelect(authnStateResponse.availableTenants);
                        setShowTenantSelector(true);
                    }
                    else{
                        setErrorMessage("ERROR_NO_TENANT_TO_SELECT");
                    }
                }
                if(authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.EnterPassword){
                    setDisplayComponent(PASSWORD_COMPONENT);                    
                }
                if(authnStateResponse.userAuthenticationState.authenticationState === AuthenticationState.Register){
                    if(authnStateResponse.availableTenants && authnStateResponse.availableTenants.length === 1){
                        router.push(`/authorize/register?${QUERY_PARAM_PREAUTH_TENANT_ID}=${authnStateResponse.availableTenants[0].tenantId}&username=${username}`);
                    }
                    else{
                        setErrorMessage("ERROR_INVALID_TENANTS_TO_SELECT_FOR_REGISTRATION");
                    }
                }
            }

        },
        onError(error) {
            setErrorMessage(error.message);
        },
    })

    // const [getPasswordAuthenticationResponse, {}] = useMutation(
    //     LOGIN_MUTATION,
    //     {
    //         onCompleted(data) {
    //             const response: LoginAuthenticationHandlerResponse = data.login as LoginAuthenticationHandlerResponse;
    //             if(response.status === LoginAuthenticationHandlerAction.SecondFactorInput){
    //                 router.push(`/authorize/mfa?mfa_type=${response.secondFactorType}`);
    //             }
    //             else if(response.status === LoginAuthenticationHandlerAction.Authenticated){
    //                 let redirectUri = `${response.successConfig?.redirectUri}`
    //                 if(response.successConfig?.responseMode && response.successConfig.responseMode === "fragment"){
    //                     redirectUri = redirectUri + "#";
    //                 }
    //                 else{
    //                     redirectUri = redirectUri + "?";
    //                 }
    //                 const params = new URLSearchParams({
    //                     code: response.successConfig?.code || "",
    //                 });
    //                 if(response.successConfig?.state){
    //                     params.set("state", response.successConfig.state);
    //                 }
    //                 router.push(redirectUri + params.toString());
    //             }
    //             else {
    //                 setErrorMessage(response.errorActionHandler?.errorMessage || "Error with authentication. Either the user name or password is incorrect.")
    //             }
                
    //         },
    //         onError() {
    //             setErrorMessage("Error with authentication. Either the user name or password is incorrect, or the system is unable to perform authentication.")
    //         }
    //     }
    // );


    // EVENT HANDLERS
    const handleNextClick = () => {
        portalLoginEmailHandler({
            variables: {
                email: username,
                tenantId: selectedTenant
            }
        });
    }
    const handleEnterButtonPress = (evt: React.KeyboardEvent) => {        
        if (evt.key.valueOf().toLowerCase() === "enter") {
            if (username && username.length > MIN_USERNAME_LENGTH) {
                portalLoginEmailHandler({
                    variables: {
                        email: username,
                        tenantId: selectedTenant
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

    }

    // const setLoginErrorMessage = (errorType: PortalLoginEmailHandlerErrorTypes) => {
    //     // enum PortalLoginEmailHandlerErrorTypes {    
    //     //     CONDITIONS_FOR_AUTHENTICATION_NOT_MET
    //     //     NO_MANAGEMENT_DOMAIN
    //     //     NO_MATCHING_FEDERATED_PROVIDER_FOR_TENANT
    //     //     EXCLUSIVE_TENANT_AND_NO_FEDERATED_OIDC_PROVIDER
    //     //     NO_MATCHING_USER_AND_NO_TENANT_SELF_REGISTRATION
    //     // }
    //     if(errorType === PortalLoginEmailHandlerErrorTypes.ConditionsForAuthenticationNotMet){

    //     }
    // }

    const closeTenantSelector = () => {
        setShowTenantSelector(false);
        setSelectedTenant(undefined);
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
                                                        if(checked){
                                                            setSelectedTenant(t.tenantId);
                                                        }
                                                        else{
                                                            setSelectedTenant(undefined);
                                                        }
                                                    }}

                                                />
                                            </Grid2>
                                            <Grid2 size={12}><Divider /></Grid2>
                                        </React.Fragment>
                                    )                                
                                )
                            }
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
                                    handleNextClick();
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
                        }
                    </Grid2>
                    {tenantBean.getTenantMetaData().tenant.allowForgotPassword &&
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
                                    disabled={username === null || username.length < MIN_USERNAME_LENGTH || (!tenantBean.getTenantMetaData().tenant.allowLoginByPhoneNumber && username.indexOf("@") < 1)}
                                    variant="contained"
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px", 
                                        backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                        color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor,
                                        fontWeight: "bold",
                                        fontSize: "0.9em"
                                    }}
                                    onClick={handleNextClick}
                                >Next</Button>
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
                                        backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                        color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor,
                                        fontWeight: "bold",
                                        fontSize: "0.9em"
                                    }}
                                    // onClick={buttonLoginHandler}
                                >Login</Button>
                                <Button
                                    disabled={false}
                                    variant="contained"
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px",
                                        backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                        color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor,
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
                                                backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor,
                                                color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor,
                                                fontWeight: "bold",
                                                fontSize: "0.9em"
                                            }}
                                        >Cancel</Button>
                                    </a>
                                }
                            </Stack>
                        }
                    </Grid2>                    
                </Grid2>
            </Paper>
        )
    }
}

export default PortalLogin;