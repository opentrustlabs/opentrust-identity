"use client";
import React, { Suspense, useContext, useEffect, useState } from "react";
import { Autocomplete, Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, Grid2, InputAdornment, MenuItem, Paper, Select, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AUTH_TOKEN_LOCAL_STORAGE_KEY, DEFAULT_TENANT_PASSWORD_CONFIGURATION, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, NAME_ORDER_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, NAME_ORDERS, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN, QUERY_PARAM_USERNAME } from "@/utils/consts";
import {  TENANT_PASSWORD_CONFIG_QUERY, VALIDATE_TOTP_TOKEN_QUERY } from "@/graphql/queries/oidc-queries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Fido2KeyRegistrationInput, Fido2RegistrationChallengeResponse, RegistrationState, StateProvinceRegion, TenantPasswordConfig, TotpResponse, UserCreateInput, UserRegistrationState, UserRegistrationStateResponse } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";
import StateProvinceRegionSelector from "../users/state-province-region-selector";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import { validatePassword } from "@/utils/password-utils";
import { CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, GENERATE_AUTHORIZATION_RETURN_URI_MUTATION, GENERATE_TOTP_MUTATION, REGISTER_FIDO2_KEY_MUTATION, REGISTER_USER_MUTATION, VERIFY_REGISTRATION_TOKEN_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { RegistrationResponseJSON, startRegistration } from "@simplewebauthn/browser";
import ValidateEmailOnRegistration from "./validate-email-on-registration";


export interface RegistrationComponentsProps {
    initialUserRegistrationState: UserRegistrationState,    
    onRegistrationCancelled: () => void,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean, userRegistrationStateResponse: UserRegistrationStateResponse | null) => void
}


const Register: React.FC = () => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);    
    const titleSetter = useContext(PageTitleContext);
    titleSetter.setPageTitle("Register");

    // QUERY PARAMS
    const params = useSearchParams();    
    const preAuthToken: string | null | undefined = params?.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId = params?.get(QUERY_PARAM_TENANT_ID);
    const username = params?.get(QUERY_PARAM_USERNAME);
    const redirectUri = params?.get(QUERY_PARAM_REDIRECT_URI);
    
    console.log("tenantId from query params is: " + tenantId);
    
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
    const [requriedMFAs, setRequiredMFAs] = React.useState<Array<string>>([]);
    const [showPasswordRules, setShowPasswordRules] = React.useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [verificationCode, setVerificationCode] = React.useState<string>("");
    const [createdUserId, setCreatedUserId] = React.useState<string | null>(null);
    const [showTotpQRCodeDialog, setShowTotpQRCodeDialog] = React.useState(false);
    const [totpResponse, setTotpResponse] = React.useState<TotpResponse | null>(null);
    const [totpValidationMessage, setTotpValidationMessage] = React.useState<string | null>(null);
    const [totpTestValue, setTotpTestValue] = React.useState<string>("");
    const [totpValidationErrorMessage, setTotpValidationErrorMessage] = React.useState<string | null>(null);
    const [totpSuccessfullyConfigured, setTotpSuccessfullyConfigured] = React.useState<boolean>(false);
    const [securityKeySuccessfullyConfigured, setSecurityKeySuccessfullyConfigured] = React.useState<boolean>(false);
    const [userRegistrationState, setUserRegistrationState] = React.useState<UserRegistrationState | null>(null);

    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();
    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));
    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";


    // GRAPHQL FUNCTIONS    
    // data for password config may be null, so present some sensible defaults
    const {} = useQuery(TENANT_PASSWORD_CONFIG_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getTenantPasswordConfig) {
                const config: TenantPasswordConfig = data.getTenantPasswordConfig as TenantPasswordConfig;
                setPasswordConfig(config);
                if(config.requireMfa && config.mfaTypesRequired){
                    setRequiredMFAs(config.mfaTypesRequired.split(","));
                }
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
            if(userRegistrationStateResponse.userRegistrationState.registrationState === RegistrationState.Error){
                setErrorMessage(userRegistrationStateResponse.registrationError.errorCode);
            }
            else{
                setUserRegistrationState(userRegistrationStateResponse.userRegistrationState);
            }
            setCreatedUserId(userRegistrationStateResponse.userRegistrationState.userId);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        },
    });

     const [createFido2Challenge] = useMutation(CREATE_FIDO2_REGISTRATION_CHALLENGE_MUTATION, {
        variables: {
            userId: createdUserId
        },
        onCompleted(data) {
            setShowMutationBackdrop(false);
            const challengeResponse: Fido2RegistrationChallengeResponse = data.createFido2RegistrationChallenge;
            createKeyRegistration(challengeResponse);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message)
        },
    });

    const [registerFido2KeyMutation] = useMutation(REGISTER_FIDO2_KEY_MUTATION, {
        onCompleted(data) {
            console.log("success");
            setShowMutationBackdrop(false);
            console.log(data);
            setSecurityKeySuccessfullyConfigured(true);
        },
        onError(error) {
            console.log("error");
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        }
    });

    const [generateQRCode] = useMutation(GENERATE_TOTP_MUTATION, {
        variables: {
            userId: createdUserId
        },
        onCompleted(data) {
            setTotpSuccessfullyConfigured(true);
            setShowMutationBackdrop(false);
            setTotpResponse(data.generateTOTP);
            setShowTotpQRCodeDialog(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        },
        notifyOnNetworkStatusChange: true
    });

    const [validateTotp] = useLazyQuery(VALIDATE_TOTP_TOKEN_QUERY, {        
        onCompleted(data) {
            if(data.validateTOTP === true){
                setTotpValidationMessage("Test Passed")
            }
            else{
                setTotpValidationMessage("Test failed");
            }            
        },
        onError(error) {
            setTotpValidationErrorMessage(error.message)
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"

    });

    const [generateAuthorizationReturnUri] = useMutation(GENERATE_AUTHORIZATION_RETURN_URI_MUTATION, {
        variables: {
            preAuthToken: preAuthToken
        },
        onCompleted(data) {
            setShowMutationBackdrop(false);
            router.push(data.generateAuthorizationReturnUri.uri);            
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        },
    })

    const mfaConfigIsComplete = (): boolean => {
        let bRetVal = true;
        if(requriedMFAs.length > 0){
            for(let i = 0; i < requriedMFAs.length; i++){
                if(requriedMFAs[i] === MFA_AUTH_TYPE_TIME_BASED_OTP && !totpSuccessfullyConfigured){
                    bRetVal = false;
                    break;
                }
                if(requriedMFAs[i] === MFA_AUTH_TYPE_FIDO2 && !securityKeySuccessfullyConfigured){
                    bRetVal = false;
                    break;
                }
            }
        }
        return bRetVal;
    }

    // HANDLER FUNCTIONS
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

    const createKeyRegistration = async (challengeResponse: Fido2RegistrationChallengeResponse) => {        
        if(challengeResponse){
            try{
                const attResp: RegistrationResponseJSON = await startRegistration({
                    optionsJSON: {
                        rp: {
                            name: challengeResponse.rpName,
                            id: challengeResponse.rpId
                        },
                        user: {
                            displayName: challengeResponse.userName,
                            id: challengeResponse.fido2Challenge.userId,
                            name: challengeResponse.email
                        },
                        challenge: challengeResponse.fido2Challenge.challenge,
                        pubKeyCredParams: [
                            {
                                type: "public-key",
                                alg: -257
                            },
                            {
                                type: "public-key",
                                alg: -7
                            },
                            {
                                type: "public-key",
                                alg: -8
                            }
                        ],
                        timeout: 300000,                    
                        attestation: "direct",
                        authenticatorSelection: {
                            authenticatorAttachment: "cross-platform"
                        }
                    }
                });
                console.log(attResp);

                const fido2KeyRegistrationInput: Fido2KeyRegistrationInput = {
                    authenticationAttachment: attResp.authenticatorAttachment || "",
                    id: attResp.id,
                    rawId: attResp.rawId,
                    response: {
                        attestationObject: attResp.response.attestationObject,
                        authenticatorData: attResp.response.authenticatorData || "",
                        clientDataJSON: attResp.response.clientDataJSON,
                        publicKey: attResp.response.publicKey || "",
                        publicKeyAlgorithm: attResp.response.publicKeyAlgorithm || 0,
                        transports: attResp.response.transports || []
                    },
                    type: attResp.type
                }
                setShowMutationBackdrop(true);
                registerFido2KeyMutation({
                    variables: {
                        userId: challengeResponse.fido2Challenge.userId, 
                        fido2KeyRegistrationInput: fido2KeyRegistrationInput    
                    }
                });
            }
            catch(err){
                console.log(err);
            }
        }
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
                        {showTotpQRCodeDialog &&
                            <Dialog
                                open={showTotpQRCodeDialog}
                                maxWidth="sm"
                                fullWidth={true}
                            >
                                <DialogContent>
                                    {totpValidationErrorMessage &&
                                        <Alert onClose={() => setTotpValidationErrorMessage(null)} severity="error">{totpValidationErrorMessage}</Alert>
                                    }
                                    {totpResponse &&
                                        <>                                            
                                            <div style={{display: "flex", justifyContent: "center"}}>
                                                <QRCodeSVG
                                                    value={totpResponse.uri}
                                                    size={256}
                                                />                                            
                                            </div>
                                            <div style={{margin: "35px 0px"}}>
                                                <div style={{marginBottom: "8px"}}>If you do not have a QR code scanner you can enter the secret value below:</div>
                                                <div><pre style={{fontSize: "1.4em", letterSpacing: "3px", wordWrap: "break-word", whiteSpace: "pre-wrap"}}>{totpResponse.userMFARel.totpSecret}</pre></div>
                                            </div>
                                        </>
                                    }
                                    {!totpResponse &&
                                        <div>Unable to generate a valid QR code.</div>
                                    }
                                    <Grid2 container size={12} spacing={1} margin={"55px 0px"}>
                                        <Grid2 size={12}>Confirm your passcode.</Grid2>
                                        <Grid2 size={8}>
                                            <TextField
                                                value={totpTestValue}
                                                onChange={(evt) => setTotpTestValue(evt.target.value)}
                                                size="small"
                                                fullWidth={true}
                                            />
                                        </Grid2>
                                        <Grid2 size={4}>
                                            <Button
                                                sx={{cursor: "pointer"}}
                                                onClick={() => {
                                                    setTotpValidationMessage(null);
                                                    validateTotp({
                                                        variables: {
                                                            userId: createdUserId,
                                                            totpValue: totpTestValue
                                                        }
                                                    })
                                                }}
                                            >
                                                Test
                                            </Button>
                                        </Grid2>
                                        {totpValidationMessage &&
                                            <Grid2 size={12}>{totpValidationMessage}</Grid2>
                                        }
                                    </Grid2>
                                </DialogContent>
                                <DialogActions>
                                    <Button
                                        onClick={() => setShowTotpQRCodeDialog(false)}
                                    >
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        }
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
                                                <>
                                                    <div style={{paddingLeft: "16px", textDecoration: "underline"}}>The following are required for all passwords</div>
                                                    <ul  style={{paddingLeft: "32px", marginBottom: "8px"}}>
                                                        {passwordConfig.requireNumbers &&
                                                            <li>Numbers</li>
                                                        }
                                                        {passwordConfig.requireSpecialCharacters &&
                                                            <li>Special Characters: <pre style={{letterSpacing: "5px"}}>{passwordConfig.specialCharactersAllowed}</pre></li>
                                                        }
                                                        <li>Minimum Length: {passwordConfig.passwordMinLength}</li>
                                                        <li>Maximum Length: {passwordConfig.passwordMaxLength}</li>
                                                        {passwordConfig.maxRepeatingCharacterLength &&
                                                            <li>Maximum repeating character length: {passwordConfig.maxRepeatingCharacterLength}</li>
                                                        }
                                                        <li>Leading and trailing spaces are not allowed</li>
                                                    </ul>
                                                    { (passwordConfig.requireLowerCase || passwordConfig.requireUpperCase) &&
                                                        <>
                                                            <div style={{paddingLeft: "16px", textDecoration: "underline"}}>The following are required for passwords with ASCII characters</div>  
                                                                <ul  style={{paddingLeft: "32px", marginBottom: "8px"}}>
                                                                    {passwordConfig.requireLowerCase &&
                                                                        <li>Lowercase</li>
                                                                    }
                                                                    {passwordConfig.requireUpperCase &&
                                                                        <li>Uppercase</li>
                                                                    }
                                                            </ul>
                                                        </>
                                                    }
                                                    {!passwordConfig.requireSpecialCharacters &&
                                                        <>
                                                            {passwordConfig.specialCharactersAllowed &&
                                                                <>
                                                                    <div style={{paddingLeft: "16px", textDecoration: "underline"}}>The following special characters are allowed:</div>
                                                                    <div style={{paddingLeft: "16px", marginBottom: "16px"}}>
                                                                        <pre style={{letterSpacing: "5px"}}>{passwordConfig.specialCharactersAllowed}</pre>
                                                                    </div>
                                                                </>
                                                            }

                                                        </>
                                                    }
                                                </>                                          
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
                                            error={!validatePassword(userInput.password, passwordConfig).result}
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
                            }
                            {userRegistrationState === null && registrationPage === 2 &&
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
                            }
                            {userRegistrationState && userRegistrationState.registrationState === RegistrationState.ValidateEmail &&
                                <ValidateEmailOnRegistration 
                                    initialUserRegistrationState={userRegistrationState}
                                    onRegistrationCancelled={() => console.log("registration cancelled")} 
                                    onUpdateStart={() => setShowMutationBackdrop(true)} 
                                    onUpdateEnd={(success: boolean, userRegistrationStateResponse: UserRegistrationStateResponse | null) => {
                                        setShowMutationBackdrop(false);
                                        if(success){
                                            setShowMutationSnackbar(true);
                                        }
                                        if(userRegistrationStateResponse){
                                            setUserRegistrationState(userRegistrationStateResponse.userRegistrationState);
                                        }
                                    }}                               
                                />
                                
                            }
                            {registrationPage === 4 &&
                                <Grid2 size={12} container spacing={1}>
                                    <Typography component="div" fontSize={"0.95em"}>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            {passwordConfig.requireMfa &&
                                                <div style={{marginBottom: "24px", fontWeight: "bold"}}>This tenant requires multi-factor authentication. This will need to be completed before access to tenant is allowed</div>
                                            }
                                            {!passwordConfig.requireMfa &&
                                                <div style={{marginBottom: "24px", fontWeight: "bold"}}>Do you want to configure multi-factor authentication?</div>
                                            }
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} spacing={2} container size={12}>                                            
                                            <Grid2 size={3}>
                                                <Stack>
                                                    <Button sx={{padding: "8px"}}
                                                        onClick={() => generateQRCode()}
                                                        disabled={totpSuccessfullyConfigured}
                                                    >
                                                        TOTP
                                                    </Button>
                                                </Stack> 
                                            </Grid2>
                                            <Grid2 size={9}>
                                                <div style={{fontWeight: "bold", textDecoration: "underline", marginBottom: "8px"}}>
                                                    {passwordConfig.requireMfa && passwordConfig.mfaTypesRequired?.includes(MFA_AUTH_TYPE_TIME_BASED_OTP) ? "REQUIRED" : "OPTIONAL"}
                                                </div>
                                                <div style={{marginBottom: "8px"}}>
                                                    Time-based One-Time Passcode. This requires an authenticator app (such as <span style={{fontWeight: "bold"}}>Microsoft Authenticator</span> or <span style={{fontWeight: "bold"}}>Google Authenticator</span>) on a device such as your phone
                                                </div>
                                            </Grid2>
                                            <Grid2 size={3}>
                                                <Stack>
                                                    <Button 
                                                        sx={{padding: "8px"}}
                                                        disabled={securityKeySuccessfullyConfigured}
                                                        onClick={() => {
                                                            setShowMutationBackdrop(true);
                                                            createFido2Challenge();
                                                        }}
                                                    >
                                                        Security Key
                                                    </Button>
                                                </Stack> 
                                            </Grid2>
                                            <Grid2 size={9}>
                                                <div style={{fontWeight: "bold", textDecoration: "underline", marginBottom: "8px"}}>
                                                    {passwordConfig.requireMfa && passwordConfig.mfaTypesRequired?.includes(MFA_AUTH_TYPE_FIDO2) ? "REQUIRED" : "OPTIONAL"}
                                                </div>
                                                <div style={{marginBottom: "8px"}}>
                                                    This requires a hardware device such as <span style={{fontWeight: "bold"}}>Yubi Key</span> or <span style={{fontWeight: "bold"}}>Titan Key</span>
                                                </div>
                                            </Grid2>
                                        </Grid2>
                                    </Typography>
                                </Grid2>
                            }
                            <Stack 
                                width={"100%"}
                                direction={"row-reverse"}
                                spacing={2}
                            >
                                {registrationPage === 2 &&
                                    <Button
                                        onClick={() => {
                                            setShowMutationBackdrop(true);                                            
                                            registerUser({
                                                variables: {
                                                    tenantId: tenantId,
                                                    userInput: userInput
                                                }
                                            });
                                        }}
                                        disabled={
                                            !isPage2InputValid()
                                        }
                                    >
                                        Finish
                                    </Button>
                                }
                                {registrationPage === 1 &&
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
                                }
                                {registrationPage === 2 &&
                                    <Button
                                        onClick={() => {
                                            setRegistrationPage(registrationPage - 1);
                                        }}
                                    >
                                        Back
                                    </Button>
                                }                                
                                {registrationPage === 4 && !passwordConfig.requireMfa &&
                                    <Button
                                        onClick={() => {
                                            /*
                                                If this is a user who is accessing an application and NOT the
                                                IdP tool itself, then the pre-auth token (_tk) will be non-null and non-empty.
                                                In this case, use the preauth token to generate an authorization code and
                                                get a redirect URL back and then redirect the user.

                                                If this is a user who is accessing the IdP tool itself, then the pre-auth token
                                                will be null or undefined. In this case, take the user to the landing page for
                                                the tenant they have just registered against - that is: /{tenant_id}
                                            */
                                            // generateValidAuthToken()
                                            if(preAuthToken === null || preAuthToken === undefined){
                                                router.push(`/${tenantId}`);
                                            }
                                            else{
                                                setShowMutationBackdrop(true);
                                                generateAuthorizationReturnUri();
                                            }                                            
                                            
                                        }}  

                                    >                                        
                                        Skip
                                    </Button>
                                }
                                {registrationPage === 4 && passwordConfig.requireMfa &&
                                    <Button
                                        disabled={
                                            !mfaConfigIsComplete()
                                        }
                                        onClick={() => {
                                            // See the comments in the onClick() function above. The same logic applies here too.    
                                            if(preAuthToken === null || preAuthToken === undefined){
                                                router.push(`/${tenantId}`);
                                            }
                                            else{
                                                setShowMutationBackdrop(true);
                                                generateAuthorizationReturnUri();
                                            }  
                                        }}
                                    >                                        
                                        Finish
                                    </Button>
                                }

                            </Stack>
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
            <Snackbar
                open={showMutationSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowMutationSnackbar(false)}
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
            >
                <Alert sx={{ fontSize: "1em" }}
                    onClose={() => setShowMutationSnackbar(false)}
                >
                    User Created
                </Alert>
            </Snackbar>
        </Suspense >
    )

}

export default Register;