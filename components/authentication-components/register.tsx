"use client";
import React, { Suspense, useContext, useEffect, useState } from "react";
import { Autocomplete, Backdrop, Button, CircularProgress, Grid2, InputAdornment, MenuItem, Paper, Select, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_TENANT_PASSWORD_CONFIGURATION, NAME_ORDER_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, NAME_ORDERS, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN, QUERY_PARAM_USERNAME } from "@/utils/consts";
import {  TENANT_PASSWORD_CONFIG_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import { RegistrationState, StateProvinceRegion, TenantPasswordConfig, UserCreateInput, UserRegistrationState, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef, setAccessTokenOnLocalStorage } from "@/utils/client-utils";
import StateProvinceRegionSelector from "../users/state-province-region-selector";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import { validatePasswordFormat } from "@/utils/password-utils";
import { CANCEL_REGISTRATION, REGISTER_USER_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ValidateEmailOnRegistration from "./validate-email-on-registration";
import { RegistrationConfigureTotp } from "./configure-totp";
import { RegistrationValidateTotp } from "./validate-totp";
import { RegistrationValidateSecurityKey } from "./validate-security-key";
import { RegistrationConfigureSecurityKey } from "./configure-security-key";
import PasswordRulesDisplay from "./password-rules-display";
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";


export interface RegistrationComponentsProps {
    initialUserRegistrationState: UserRegistrationState,    
    onRegistrationCancelled: () => void,
    onUpdateStart: () => void,
    onUpdateEnd: (userRegistrationStateResponse: UserRegistrationStateResponse | null, errorMessage: string | null) => void
}


const Register: React.FC = () => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);    
    const titleSetter = useContext(PageTitleContext);
    titleSetter.setPageTitle("Register");
    const authSessionProps: AuthSessionProps = useAuthSessionContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);

    // QUERY PARAMS
    const params = useSearchParams();    
    const preAuthToken: string | null | undefined = params?.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId = params?.get(QUERY_PARAM_TENANT_ID);
    const username = params?.get(QUERY_PARAM_USERNAME);
    const redirectUri = params?.get(QUERY_PARAM_REDIRECT_URI);
    
    
    // PAGE STATE MANAGEMENT VARIABLES    
    const initInput: UserCreateInput = {
        domain: "",
        email: username ? username : "",
        emailVerified: false,
        enabled: false,
        firstName: "",
        lastName: "",
        locked: false,
        nameOrder: "",
        address: "",
        addressLine1: "",
        city: "",
        countryCode: "",
        federatedOIDCProviderSubjectId: "",
        middleName: "",
        phoneNumber: "",
        postalCode: "",
        preferredLanguageCode: "",
        stateRegionProvince: "",
        password: ""
    };

    const [userInput, setUserInput] = React.useState<UserCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);    
    const [registrationPage, setRegistrationPage] = React.useState<number>(1);
    const [repeatPassword, setRepeatPassword] = React.useState<string>("");
    const [viewPassword, setViewPassword] = React.useState<boolean>(false);
    const [viewRepeatPassword, setViewRepeatPassword] = React.useState<boolean>(false);
    const [passwordConfig, setPasswordConfig] = React.useState<TenantPasswordConfig>(DEFAULT_TENANT_PASSWORD_CONFIGURATION);
    const [showPasswordRules, setShowPasswordRules] = React.useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [userRegistrationState, setUserRegistrationState] = React.useState<UserRegistrationState | null>(null);

    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();
    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));
    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";


    // GRAPHQL FUNCTIONS    
    // The data for password config may be null, so present some sensible defaults
    const {} = useQuery(TENANT_PASSWORD_CONFIG_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getTenantPasswordConfig) {
                const config: TenantPasswordConfig = data.getTenantPasswordConfig as TenantPasswordConfig;
                setPasswordConfig(config);
            }
        },
        onError(error) {
            setErrorMessage(error.message);            
        }
    });

    const [registerUser] = useMutation(REGISTER_USER_MUTATION, {
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const userRegistrationStateResponse: UserRegistrationStateResponse = data.registerUser;
            handleUserRegistrationStateResponse(userRegistrationStateResponse, null);            
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        },
    });


    const [cancelRegistration] = useMutation(CANCEL_REGISTRATION, {        
        onCompleted(data) {
            const userRegistrationStateResponse: UserRegistrationStateResponse = data.cancelRegistration;
            handleUserRegistrationStateResponse(userRegistrationStateResponse, null);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
    })

    // HANDLER FUNCTIONS
    const handleUserRegistrationStateResponse = (response: UserRegistrationStateResponse | null, errorMessage: string | null) => {
        if(response === null){
            if(errorMessage === null){
                setErrorMessage("ERROR_RETRIEVING_RESPONSE_FROM_SERVER");
            }
            else{
                setErrorMessage(errorMessage);
            }
        }
        else{
            if (response.userRegistrationState.registrationState === RegistrationState.Error) {
                setErrorMessage(response.registrationError.errorCode || "ERROR");
            }
            else if (
                response.userRegistrationState.registrationState === RegistrationState.RedirectBackToApplication ||
                response.userRegistrationState.registrationState === RegistrationState.RedirectToIamPortal
            ) {
                if (!response.uri) {
                    setErrorMessage("ERROR_NO_REDIRECT_ENDPOINT_CONFIGURED");
                }
                else {
                    if(response.userRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
                        if(response.accessToken){
                            authSessionProps.setAuthSessionData({accessToken: response.accessToken, expiresAtMs: response.tokenExpiresAtMs || 0});                            
                        }
                    }
                    router.push(response.uri);
                    if(response.userRegistrationState.registrationState === RegistrationState.RedirectToIamPortal){
                        authContextProps.forceProfileRefetch();
                    }
                }
            }
            else {
                setUserRegistrationState(response.userRegistrationState);            
            }
        }
    }

    const handleCancelRegistration = (userRegistrationState: UserRegistrationState) => {
        console.log("registration cancelled");        
        cancelRegistration({
            variables: {
                userId: userRegistrationState.userId,
                registrationSessionToken: userRegistrationState.registrationSessionToken,
                preAuthToken: userRegistrationState.preAuthToken
            }
        });
        setUserInput(initInput);
        setErrorMessage(null);
        setRegistrationPage(1);
        setPasswordConfig(DEFAULT_TENANT_PASSWORD_CONFIGURATION);
        setUserRegistrationState(null);
    }


    const isPage1InputValid = (): boolean => {
        let bRetVal = true;
        if(!userInput.firstName || userInput.firstName.length < 3){
            bRetVal = false;
        }
        if(!userInput.lastName || userInput.lastName.length < 3){
            bRetVal = false;
        }
        if(!userInput.nameOrder || !NAME_ORDERS.includes(userInput.nameOrder)){
            bRetVal = false;
        }
        if(!userInput.email || userInput.email.length < 5){
            bRetVal = false;
        }
        if(!userInput.password || userInput.password.length < 8){
            bRetVal = false;
        }
        if(!repeatPassword || repeatPassword.length < 8 || repeatPassword !== userInput.password){
            bRetVal = false;
        }
        return bRetVal;
    }

    const isPage2InputValid = (): boolean => {
        let bRetVal = true;
        if(!userInput.preferredLanguageCode || userInput.preferredLanguageCode.length < 2){
            bRetVal = false;
        }
        if(!userInput.address || userInput.address.length < 3){
            bRetVal = false;
        }
        if(!userInput.city || userInput.city.length < 2){
            bRetVal = false;
        }
        if(!userInput.countryCode || userInput.countryCode.length < 2){
            bRetVal = false;
        }
        if(!userInput.postalCode || userInput.postalCode.length < 3){
            bRetVal = false;
        }
        return bRetVal;
    }

    
    // Cannot register without a valid tenant id to register against    
    if(tenantBean.getTenantMetaData().tenant.tenantId === "" &&  (tenantId === null || tenantId === undefined)){
        router.push(`/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`);
        return <></>
    }
    

    return (
        <Suspense>
            {tenantBean.getTenantMetaData().tenant.tenantId !== "" &&
                <Paper
                    elevation={4}
                    sx={{ padding: 2, height: "100%", maxWidth: maxWidth, width: maxWidth, margin: "16px 0px" }}
                >
                    <Typography component="div" fontSize={"0.95em"}>                        
                        <Grid2 spacing={1} container size={{ xs: 12 }}>
                            {errorMessage !== null &&
                                <>
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
                                </>
                            }
                            <Grid2 size={{ xs: 12 }}>
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>Register</div>
                            </Grid2>
                            {userRegistrationState === null && registrationPage === 1 &&
                                <React.Fragment>
                                    <Grid2 size={12} container spacing={1}>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>First Name</div>
                                            <TextField name="firstName" id="firstName" 
                                                error={!userInput.firstName || userInput.firstName.length < 3}
                                                value={userInput.firstName}
                                                onChange={(evt) => { userInput.firstName = evt.target.value; setUserInput({ ...userInput }) }}
                                                fullWidth={true} size="small" required={true}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Last Name</div>
                                            <TextField name="lastName" id="lastName"
                                                error={!userInput.lastName || userInput.lastName.length < 3}
                                                value={userInput.lastName}
                                                onChange={(evt) => { userInput.lastName = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Middle Name</div>
                                            <TextField name="middleName" id="middleName"
                                                value={userInput.middleName}
                                                onChange={(evt) => { userInput.middleName = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Name Order</div>
                                            <Select
                                                name="nameOrder"
                                                value={userInput.nameOrder}
                                                onChange={(evt) => {
                                                    userInput.nameOrder = evt.target.value;
                                                    setUserInput({ ...userInput });
                                                }}
                                                size="small"
                                                fullWidth={true}
                                                error={!userInput.nameOrder || !NAME_ORDERS.includes(userInput.nameOrder)}
                                            >
                                                <MenuItem value={NAME_ORDER_EASTERN}>{NAME_ORDER_DISPLAY.get(NAME_ORDER_EASTERN)}</MenuItem>
                                                <MenuItem value={NAME_ORDER_WESTERN}>{NAME_ORDER_DISPLAY.get(NAME_ORDER_WESTERN)}</MenuItem>

                                            </Select>
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Email</div>
                                            <TextField name="email" id="email"
                                                value={userInput.email}
                                                onChange={(evt) => { userInput.email = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"
                                                error={!userInput.email || userInput.email.length < 7}
                                                disabled={! (username === null || username === undefined)}
                                            />
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
                                                        passwordConfig={passwordConfig}
                                                    />
                                                }
                                            </Stack>
                                            <TextField name="password" id="password"
                                                type={ viewPassword === true ? "text" : "password"}
                                                value={userInput.password}
                                                onChange={(evt) => { 
                                                    userInput.password = evt.target.value;
                                                    setUserInput({ ...userInput }); 
                                                }}
                                                fullWidth={true} size="small"
                                                error={!validatePasswordFormat(userInput.password, passwordConfig).result}
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
                                                onChange={(evt) => { setRepeatPassword(evt.target.value);}}
                                                fullWidth={true} size="small"
                                                error={!repeatPassword || repeatPassword !== userInput.password}
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
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Phone Number</div>
                                            <TextField name="phoneNumber" id="phoneNumber"
                                                value={userInput.phoneNumber}
                                                onChange={(evt) => { userInput.phoneNumber = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"
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
                                                setRegistrationPage(registrationPage + 1);
                                            }}
                                            disabled={
                                                !isPage1InputValid()
                                            }
                                        >
                                            Next
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                if(!redirectUri){
                                                    router.push(`/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`);
                                                }
                                                else{
                                                    router.push(`${redirectUri}?error=access_denied&error_description=authentication_cancelled_by_user`)
                                                }
                                            }}
                                        >Cancel</Button>
                                    </Stack>
                                </React.Fragment>
                            }
                            {userRegistrationState === null && registrationPage === 2 &&
                                <React.Fragment>
                                    <Grid2 size={12} container spacing={1}>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Preferred Language</div>
                                            <Autocomplete
                                                
                                                id="defaultLanguage"
                                                sx={{ paddingTop: "8px" }}
                                                size="small"
                                                renderInput={(params) => 
                                                    <TextField 
                                                        {...params} 
                                                        label="" 
                                                        error={!userInput.preferredLanguageCode || userInput.preferredLanguageCode === ""} 
                                                    />}
                                                options={
                                                    [{ languageCode: "", language: "" }, ...LANGUAGE_CODES].map(
                                                        (lc: LanguageCodeDef) => {
                                                            return { id: lc.languageCode, label: lc.language }
                                                        }
                                                    )
                                                }
                                                value={getDefaultLanguageCodeDef(userInput.preferredLanguageCode || "")}
                                                onChange={(_, value: any) => {
                                                    userInput.preferredLanguageCode = value.id;

                                                    setUserInput({ ...userInput });
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Address</div>
                                            <TextField name="address" id="address"
                                                error={!userInput.address || userInput.address.length < 3}
                                                value={userInput.address} fullWidth={true} size="small"
                                                onChange={(evt) => { userInput.address = evt.target.value; setUserInput({ ...userInput }); }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>(Optional) Apartment, suite, unit, building, floor</div>
                                            <TextField name="addressline1" id="addressline1"
                                                value={userInput.addressLine1}
                                                onChange={(evt) => { userInput.addressLine1 = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>City</div>
                                            <TextField name="city" id="city"
                                                error={!userInput.city || userInput.city.length < 3}
                                                value={userInput.city}
                                                onChange={(evt) => { userInput.city = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"

                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Country</div>
                                            <Autocomplete
                                                sx={{ paddingTop: "8px" }}
                                                size="small"
                                                renderInput={(params) =>
                                                    <TextField
                                                        {...params}
                                                        label=""
                                                        autoComplete="one-time-code"
                                                        error={!userInput.countryCode || userInput.countryCode.length < 2}
                                                    />
                                                }
                                                options={
                                                    [{ countryCode: "", country: "" }, ...COUNTRY_CODES].map(
                                                        (cc: CountryCodeDef) => {
                                                            return { id: cc.countryCode, label: cc.country }
                                                        }
                                                    )
                                                }
                                                value={getDefaultCountryCodeDef(userInput.countryCode || "")}
                                                onChange={(_, value: any) => {
                                                    userInput.countryCode = value.id;
                                                    setUserInput({ ...userInput });
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>State / Province / Region</div>
                                            <StateProvinceRegionSelector
                                                countryCode={userInput.countryCode || undefined}
                                                initValue={userInput.stateRegionProvince || ""}
                                                onChange={(stateProvinceRegion: StateProvinceRegion | null) => {
                                                    userInput.stateRegionProvince = stateProvinceRegion ? stateProvinceRegion.isoEntryCode : "";
                                                    setUserInput({ ...userInput });
                                                }}
                                                isDisabled={false}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Postal Code</div>
                                            <TextField name="postalCode" id="postalCode"
                                                error={!userInput.postalCode || userInput.postalCode.length < 3}
                                                value={userInput.postalCode}
                                                fullWidth={true} size="small"
                                                onChange={(evt) => { userInput.postalCode = evt.target.value; setUserInput({ ...userInput }); }}
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
                                                setErrorMessage(null);
                                                setShowMutationBackdrop(true);                                            
                                                registerUser({
                                                    variables: {
                                                        tenantId: tenantId,
                                                        userInput: userInput,
                                                        preAuthToken: preAuthToken
                                                    }
                                                });
                                            }}
                                            disabled={
                                                !isPage2InputValid()
                                            }
                                        >
                                            Next
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setRegistrationPage(registrationPage - 1);
                                            }}
                                        >
                                            Back
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                console.log("registration cancelled");
                                                if(!redirectUri){
                                                    router.push(`/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`);
                                                }
                                                else{
                                                    router.push(`${redirectUri}?error=access_denied&error_description=authentication_cancelled_by_user`)
                                                }
                                            }}
                                        >Cancel</Button>
                                    </Stack>
                                </React.Fragment>
                                
                            }
                            {userRegistrationState && userRegistrationState.registrationState === RegistrationState.ValidateEmail &&
                                <ValidateEmailOnRegistration 
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration(userRegistrationState);
                                    }} 
                                    onUpdateStart={() => {
                                        setErrorMessage(null);
                                        setShowMutationBackdrop(true)
                                    }}
                                    onUpdateEnd={(userRegistrationStateResponse: UserRegistrationStateResponse | null, errorMessage: string | null) => {
                                        setShowMutationBackdrop(false);
                                        handleUserRegistrationStateResponse(userRegistrationStateResponse, errorMessage);
                                    }}                               
                                />
                                
                            }
                            {userRegistrationState && 
                                (
                                    userRegistrationState.registrationState === RegistrationState.ConfigureTotpOptional ||
                                    userRegistrationState.registrationState === RegistrationState.ConfigureTotpRequired
                                ) &&
                                <RegistrationConfigureTotp
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration(userRegistrationState);
                                    }} 
                                    onUpdateStart={() => {
                                        setErrorMessage(null);
                                        setShowMutationBackdrop(true)
                                    }}
                                    onUpdateEnd={(userRegistrationStateResponse: UserRegistrationStateResponse | null, errorMessage: string | null) => {
                                        setShowMutationBackdrop(false);
                                        handleUserRegistrationStateResponse(userRegistrationStateResponse, errorMessage);
                                    }} 
                                />
                            }
                            {userRegistrationState && userRegistrationState.registrationState === RegistrationState.ValidateTotp &&
                                <RegistrationValidateTotp
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration(userRegistrationState);
                                    }} 
                                    onUpdateStart={() => {
                                        setErrorMessage(null);
                                        setShowMutationBackdrop(true)
                                    }}
                                    onUpdateEnd={(userRegistrationStateResponse: UserRegistrationStateResponse | null, errorMessage: string | null) => {
                                        setShowMutationBackdrop(false);
                                        handleUserRegistrationStateResponse(userRegistrationStateResponse, errorMessage);
                                    }} 
                                />                            
                            }
                            {userRegistrationState && 
                                (
                                    userRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyOptional ||
                                    userRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyRequired
                                ) &&
                                <RegistrationConfigureSecurityKey
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration(userRegistrationState);
                                    }}
                                    onUpdateStart={() => {
                                        setErrorMessage(null);
                                        setShowMutationBackdrop(true)
                                    }}
                                    onUpdateEnd={(userRegistrationStateResponse: UserRegistrationStateResponse | null, errorMessage: string | null) => {
                                        setShowMutationBackdrop(false);
                                        handleUserRegistrationStateResponse(userRegistrationStateResponse, errorMessage);
                                    }} 
                                />
                            }
                            {userRegistrationState && userRegistrationState.registrationState === RegistrationState.ValidateSecurityKey &&
                                <RegistrationValidateSecurityKey
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration(userRegistrationState);
                                    }} 
                                    onUpdateStart={() => {
                                        setErrorMessage(null);
                                        setShowMutationBackdrop(true)
                                    }}
                                    onUpdateEnd={(userRegistrationStateResponse: UserRegistrationStateResponse | null, errorMessage: string | null) => {
                                        setShowMutationBackdrop(false);
                                        handleUserRegistrationStateResponse(userRegistrationStateResponse, errorMessage);
                                    }} 
                                />
                            }
                            
                        </Grid2>
                    </Typography>
                </Paper>
                
            }
            <Backdrop
                sx={{ color: '#fff' }}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
        </Suspense >
    )

}

export default Register;