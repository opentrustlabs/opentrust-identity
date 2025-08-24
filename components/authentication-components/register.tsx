"use client";
import React, { Suspense, useContext, useState } from "react";
import { Autocomplete, Backdrop, Button, Checkbox, CircularProgress, Dialog, DialogContent, Grid2, InputAdornment, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_TENANT_PASSWORD_CONFIGURATION, NAME_ORDER_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, NAME_ORDERS, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN, QUERY_PARAM_USERNAME, DEFAULT_TENANT_META_DATA, QUERY_PARAM_DEVICE_CODE_ID } from "@/utils/consts";
import {  TENANT_PASSWORD_CONFIG_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import { RegistrationState, StateProvinceRegion, TenantPasswordConfig, UserCreateInput, UserRegistrationState, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";
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
import Link from "next/link";
import { MuiTelInput } from "mui-tel-input";
import RecoveryEmailConfiguration from "./recovery-email";
import DuressPasswordConfiguration from "./duress-password";
import { ERROR_CODES } from "@/lib/models/error";
import { useInternationalizationContext } from "../contexts/internationalization-context";
import SelectLanguage from "./select-language";
import { useIntl } from 'react-intl';


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
    const i18nContext = useInternationalizationContext();
    const intl = useIntl();

    // QUERY PARAMS
    const params = useSearchParams();
    const preAuthToken: string | null | undefined = params?.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const deviceCodeId: string | null | undefined = params?.get(QUERY_PARAM_DEVICE_CODE_ID);
    const tenantId = params?.get(QUERY_PARAM_TENANT_ID);
    const username = params?.get(QUERY_PARAM_USERNAME);
    
    
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
        password: "",
        termsAndConditionsAccepted: false
    };

    const initUserRegistrationState: UserRegistrationState = {
        email: "",
        expiresAtMs: 0,
        registrationSessionToken: "",
        registrationState: RegistrationState.Unregistered,
        registrationStateOrder: 0,
        registrationStateStatus: "",
        tenantId: tenantId || "",
        userId: "",
        deviceCodeId: deviceCodeId,
        preAuthToken: preAuthToken
    }

    const [userInput, setUserInput] = React.useState<UserCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);    
    const [registrationPage, setRegistrationPage] = React.useState<number>(1);
    const [repeatPassword, setRepeatPassword] = React.useState<string>("");
    const [viewPassword, setViewPassword] = React.useState<boolean>(false);
    const [viewRepeatPassword, setViewRepeatPassword] = React.useState<boolean>(false);
    const [passwordConfig, setPasswordConfig] = React.useState<TenantPasswordConfig>(DEFAULT_TENANT_PASSWORD_CONFIGURATION);
    const [showPasswordRules, setShowPasswordRules] = React.useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [userRegistrationState, setUserRegistrationState] = React.useState<UserRegistrationState>(initUserRegistrationState);
    const [userClickedTermsAndConditionsLink, setUserClickedTermsAndConditionsLink] = React.useState<boolean>(false);

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
            setErrorMessage(intl.formatMessage({id: error.message}));            
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
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });


    const [cancelRegistration] = useMutation(CANCEL_REGISTRATION, {        
        onCompleted(data) {
            const userRegistrationStateResponse: UserRegistrationStateResponse = data.cancelRegistration;
            handleUserRegistrationStateResponse(userRegistrationStateResponse, null);
        },
        onError(error) {
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    })

    // HANDLER FUNCTIONS
    const handleUserRegistrationStateResponse = (response: UserRegistrationStateResponse | null, errorMessage: string | null) => {
        if(response === null){
            if(errorMessage === null){
                setErrorMessage(intl.formatMessage({id: "ERROR_DEFAULT_ERROR_MESSAGE"}));
            }
            else{
                setErrorMessage(intl.formatMessage({id: errorMessage}));
            }
        }
        else{
            if (response.userRegistrationState.registrationState === RegistrationState.Error) {
                const id: string = response.registrationError ? response.registrationError.errorKey : ERROR_CODES.DEFAULT.errorKey;
                setErrorMessage(
                    intl.formatMessage(
                        {id: id}
                    )
                ); 
            }
            else if (
                response.userRegistrationState.registrationState === RegistrationState.RedirectBackToApplication ||
                response.userRegistrationState.registrationState === RegistrationState.RedirectToIamPortal
            ) {
                if (!response.uri) {
                    setErrorMessage(intl.formatMessage({id: "ERROR_NO_REDIRECT_ENDPOINT_CONFIGURED"}));
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

    const handleCancelRegistration = async () => {
        tenantBean.setTenantMetaData(DEFAULT_TENANT_META_DATA);
        
        await cancelRegistration({
            variables: {
                userId: userRegistrationState.userId,
                registrationSessionToken: userRegistrationState.registrationSessionToken,
                preAuthToken: userRegistrationState.preAuthToken,
                deviceCodeId: deviceCodeId
            }
        });
        setUserInput(initInput);
        setErrorMessage(null);
        setRegistrationPage(1);
        setPasswordConfig(DEFAULT_TENANT_PASSWORD_CONFIGURATION);
        
        // else{
        //     if(!redirectUri){
        //         router.push(`/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true`);
        //     }
        //     else{
        //         router.push(`${redirectUri}?error=access_denied&error_description=authentication_cancelled_by_user`)
        //     }
        // }       
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
        if(tenantBean.getTenantMetaData().tenant.registrationRequireTermsAndConditions && !userInput.termsAndConditionsAccepted){
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
                    {i18nContext.hasSelectedLanguage() !== true &&
                        <Dialog 
                            open={i18nContext.hasSelectedLanguage() !== true}
                            maxWidth="sm"
                            fullWidth={true}
                        >
                            <DialogContent>
                                <SelectLanguage />
                            </DialogContent>
                        </Dialog>
                    }
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
                                <div style={{ marginBottom: "16px", fontWeight: "bold", fontSize: "1.0em" }}>{intl.formatMessage({id: "REGISTER"})}</div>
                            </Grid2>
                            {userRegistrationState.registrationState === RegistrationState.Unregistered && registrationPage === 1 &&
                                <React.Fragment>
                                    <Grid2 size={12} container spacing={1}>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "FIRST_NAME"})}</div>
                                            <TextField name="firstName" id="firstName" 
                                                error={!userInput.firstName || userInput.firstName.length < 3}
                                                value={userInput.firstName}
                                                onChange={(evt) => { userInput.firstName = evt.target.value; setUserInput({ ...userInput }) }}
                                                fullWidth={true} size="small" required={true}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "LAST_NAME"})}</div>
                                            <TextField name="lastName" id="lastName"
                                                error={!userInput.lastName || userInput.lastName.length < 3}
                                                value={userInput.lastName}
                                                onChange={(evt) => { userInput.lastName = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "MIDDLE_NAME"})}</div>
                                            <TextField name="middleName" id="middleName"
                                                value={userInput.middleName}
                                                onChange={(evt) => { userInput.middleName = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "NAME_ORDER"})}</div>
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
                                            <div>{intl.formatMessage({id: "EMAIL"})}</div>
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
                                                <div>{intl.formatMessage({id: "PASSWORD"})}</div>
                                                <div>
                                                    ({intl.formatMessage({id: "PASSWORD_RULES"})}) 
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
                                            <div>{intl.formatMessage({id: "REPEAT_PASSWORD"})}</div>
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
                                            <div>{intl.formatMessage({id: "PHONE_NUMBER"})}</div>
                                            <MuiTelInput
                                                value={userInput.phoneNumber || ""}
                                                onChange={(newValue) => { userInput.phoneNumber = newValue; setUserInput({ ...userInput }); }}
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
                                            {intl.formatMessage({id: "NEXT"})}
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                handleCancelRegistration();
                                            }}
                                        >
                                            {intl.formatMessage({id: "CANCEL"})}
                                        </Button>
                                    </Stack>
                                </React.Fragment>
                            }
                            {userRegistrationState.registrationState === RegistrationState.Unregistered && registrationPage === 2 &&
                                <React.Fragment>
                                    <Grid2 size={12} container spacing={1}>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "PREFERRED_LANGUAGE"})}</div>
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
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                onChange={(_, value: any) => {
                                                    userInput.preferredLanguageCode = value.id;

                                                    setUserInput({ ...userInput });
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "ADDRESS"})}</div>
                                            <TextField name="address" id="address"
                                                error={!userInput.address || userInput.address.length < 3}
                                                value={userInput.address} fullWidth={true} size="small"
                                                onChange={(evt) => { userInput.address = evt.target.value; setUserInput({ ...userInput }); }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "ADDRESS_LINE_1"})}</div>
                                            <TextField name="addressline1" id="addressline1"
                                                value={userInput.addressLine1}
                                                onChange={(evt) => { userInput.addressLine1 = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "CITY"})}</div>
                                            <TextField name="city" id="city"
                                                error={!userInput.city || userInput.city.length < 3}
                                                value={userInput.city}
                                                onChange={(evt) => { userInput.city = evt.target.value; setUserInput({ ...userInput }); }}
                                                fullWidth={true} size="small"

                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "COUNTRY"})}</div>
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
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                onChange={(_, value: any) => {
                                                    userInput.countryCode = value.id;
                                                    setUserInput({ ...userInput });
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>{intl.formatMessage({id: "STATE_PROVINCE_REGION"})}</div>
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
                                            <div>{intl.formatMessage({id: "POSTAL_CODE"})}</div>
                                            <TextField name="postalCode" id="postalCode"
                                                error={!userInput.postalCode || userInput.postalCode.length < 3}
                                                value={userInput.postalCode}
                                                fullWidth={true} size="small"
                                                onChange={(evt) => { userInput.postalCode = evt.target.value; setUserInput({ ...userInput }); }}
                                            />
                                        </Grid2>
                                        {tenantBean.getTenantMetaData().tenant.registrationRequireTermsAndConditions &&
                                            <Grid2 container marginBottom={"8px"} size={12}>
                                                <Grid2 size={11}>
                                                    <span>{intl.formatMessage({id: "I_AGREE_TO_ACCEPT"})} </span>
                                                    <Link onClick={() => setUserClickedTermsAndConditionsLink(true)} 
                                                        href={tenantBean.getTenantMetaData().tenant.termsAndConditionsUri || ""} 
                                                        target="_blank">
                                                            {intl.formatMessage({id: "TERMS_AND_CONDITIONS"})}
                                                        </Link>
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <Checkbox
                                                        disabled={userClickedTermsAndConditionsLink === false}
                                                        checked={userInput.termsAndConditionsAccepted === true}
                                                        onChange={(_, checked: boolean) => {
                                                            userInput.termsAndConditionsAccepted = checked;
                                                            setUserInput({ ...userInput });
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        }
                                        {tenantBean.getTenantMetaData().tenant.registrationRequireTermsAndConditions === false && tenantBean.getTenantMetaData().tenant.termsAndConditionsUri &&
                                            <Grid2 container marginBottom={"8px"} size={12}>
                                                <Grid2 size={12}>
                                                    <span>{intl.formatMessage({id: "THIS_SITE_USES_THE_FOLLOWING"})} </span>
                                                    <Link onClick={() => setUserClickedTermsAndConditionsLink(true)} 
                                                        href={tenantBean.getTenantMetaData().tenant.termsAndConditionsUri || ""} 
                                                        target="_blank">
                                                            {intl.formatMessage({id: "TERMS_AND_CONDITIONS"})}
                                                        </Link>
                                                </Grid2>                                                
                                            </Grid2>
                                        }
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
                                                        preAuthToken: preAuthToken,
                                                        deviceCodeId: deviceCodeId
                                                    }
                                                });
                                            }}
                                            disabled={
                                                !isPage2InputValid()
                                            }
                                        >
                                            {intl.formatMessage({id: "NEXT"})}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setRegistrationPage(registrationPage - 1);
                                            }}
                                        >
                                            {intl.formatMessage({id: "BACK"})}
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                handleCancelRegistration();
                                            }}
                                        >
                                            {intl.formatMessage({id: "CANCEL"})}
                                        </Button>
                                    </Stack>
                                </React.Fragment>                                
                            }
                            {
                                (
                                    userRegistrationState.registrationState === RegistrationState.ValidateEmail || 
                                    userRegistrationState.registrationState === RegistrationState.ValidateRecoveryEmail
                                ) &&
                                <ValidateEmailOnRegistration 
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration();
                                    }} 
                                    onUpdateStart={() => {
                                        setErrorMessage(null);
                                        setShowMutationBackdrop(true)
                                    }}
                                    onUpdateEnd={(userRegistrationStateResponse: UserRegistrationStateResponse | null, errorMessage: string | null) => {
                                        setShowMutationBackdrop(false);
                                        handleUserRegistrationStateResponse(userRegistrationStateResponse, errorMessage);
                                    }}
                                    isRecoveryEmail={userRegistrationState.registrationState === RegistrationState.ValidateRecoveryEmail}
                                />                                
                            }
                            {userRegistrationState.registrationState === RegistrationState.AddRecoveryEmailOptional &&
                                <RecoveryEmailConfiguration
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration();
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
                            {userRegistrationState.registrationState === RegistrationState.AddDuressPasswordOptional &&
                                <DuressPasswordConfiguration
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration();
                                    }} 
                                    onUpdateStart={() => {
                                        setErrorMessage(null);
                                        setShowMutationBackdrop(true)
                                    }}
                                    onUpdateEnd={(userRegistrationStateResponse: UserRegistrationStateResponse | null, errorMessage: string | null) => {
                                        setShowMutationBackdrop(false);
                                        handleUserRegistrationStateResponse(userRegistrationStateResponse, errorMessage);
                                    }}
                                    tenantPasswordConfig={passwordConfig}
                                />
                            }
                            {
                                (
                                    userRegistrationState.registrationState === RegistrationState.ConfigureTotpOptional ||
                                    userRegistrationState.registrationState === RegistrationState.ConfigureTotpRequired
                                ) &&
                                <RegistrationConfigureTotp
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration();
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
                            {userRegistrationState.registrationState === RegistrationState.ValidateTotp &&
                                <RegistrationValidateTotp
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration();
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
                            {
                                (
                                    userRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyOptional ||
                                    userRegistrationState.registrationState === RegistrationState.ConfigureSecurityKeyRequired
                                ) &&
                                <RegistrationConfigureSecurityKey
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration();
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
                            {userRegistrationState.registrationState === RegistrationState.ValidateSecurityKey &&
                                <RegistrationValidateSecurityKey
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => {
                                        handleCancelRegistration();
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