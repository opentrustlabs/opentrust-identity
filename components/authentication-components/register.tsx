"use client";
import React, { Suspense, useContext, useState } from "react";
import { Autocomplete, Button, CircularProgress, Divider, Grid2, InputAdornment, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_TENANT_META_DATA, DEFAULT_TENANT_PASSWORD_CONFIGURATION, NAME_ORDER_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, NAME_ORDERS, QUERY_PARAM_PREAUTH_REDIRECT_URI, QUERY_PARAM_PREAUTH_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN } from "@/utils/consts";
import { LOGIN_USERNAME_HANDLER_QUERY, TENANT_META_DATA_QUERY, TENANT_PASSWORD_CONFIG_QUERY } from "@/graphql/queries/oidc-queries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { LoginAuthenticationHandlerAction, LoginAuthenticationHandlerResponse, LoginUserNameHandlerAction, LoginUserNameHandlerResponse, StateProvinceRegion, TenantPasswordConfig, UserCreateInput } from "@/graphql/generated/graphql-types";
import Alert from '@mui/material/Alert';
import { LOGIN_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";
import StateProvinceRegionSelector from "../users/state-province-region-selector";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';


const MIN_USERNAME_LENGTH = 6;
const USERNAME_COMPONENT = "USERNAME_COMPONENT";
const PASSWORD_COMPONENT = "PASSWORD_COMPONENT";

const Register: React.FC = () => {

    // Context objects
    // const titleSetter = useContext(PageTitleContext);
    // titleSetter.setPageTitle("Register");

    // QUERY PARAMS
    // const params = useSearchParams();
    const params = new Map<string, string>();
    const preauthToken = params?.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId = params?.get(QUERY_PARAM_PREAUTH_TENANT_ID);
    const redirectUri = params?.get(QUERY_PARAM_PREAUTH_REDIRECT_URI);

    const countryInput = React.useRef(null);


    // PAGE STATE MANAGEMENT VARIABLES    
    const initInput: UserCreateInput = {
        domain: "",
        email: "",
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
    const [tenantMetaData, setTenantMetaData] = useState(tenantId ? null : DEFAULT_TENANT_META_DATA);
    const [registrationPage, setRegistrationPage] = React.useState<number>(1);
    const [repeatPassword, setRepeatPassword] = React.useState<string>("");
    const [viewPassword, setViewPassword] = React.useState<boolean>(false);
    const [viewRepeatPassword, setViewRepeatPassword] = React.useState<boolean>(false);
    const [passwordConfig, setPasswordConfig] = React.useState<TenantPasswordConfig>(DEFAULT_TENANT_PASSWORD_CONFIGURATION);
    const [showPasswordRules, setShowPasswordRules] = React.useState<boolean>(false);

    // HOOKS FROM NEXTJS OR MUI
    const router = useRouter();
    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));
    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "550px";


    // GRAPHQL FUNCTIONS    
    // TODO -> Need to add the token to this query and get the redirect uri if it exists
    // Need to get password min length from password config, or use default min length
    const { } = useQuery(TENANT_META_DATA_QUERY, {
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

    // data for password config may be null, so present some sensible defaults
    const { loading, error } = useQuery(TENANT_PASSWORD_CONFIG_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getTenantPasswordConfig) {
                const config: TenantPasswordConfig = data.getTenantPasswordConfig as TenantPasswordConfig;
                setPasswordConfig(config);
            }
        }
    });

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

    const validatePassword = (password: string): boolean => {
        let bRetVal = true;

        return bRetVal;
    }


    return (
        <Suspense>
            {tenantMetaData &&
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
                            {registrationPage === 1 &&
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
                                                    <div style={{paddingLeft: "16px", textDecoration: "underline"}}>The following are required</div>                                          
                                                    <ul  style={{paddingLeft: "32px", marginBottom: "8px"}}>
                                                        {passwordConfig.requireLowerCase &&
                                                            <li>Lowercase</li>
                                                        }
                                                        {passwordConfig.requireUpperCase &&
                                                            <li>Uppercase</li>
                                                        }
                                                        {passwordConfig.requireNumbers &&
                                                            <li>Numbers</li>
                                                        }
                                                        {passwordConfig.requireSpecialCharacters &&
                                                            <li>Special Characters: {passwordConfig.specialCharactersAllowed}</li>                                                    
                                                        }
                                                        <li>Minimum Length: {passwordConfig.passwordMinLength}</li>
                                                        <li>Maximum Length: {passwordConfig.passwordMaxLength}</li>
                                                        {passwordConfig.maxRepeatingCharacterLength &&
                                                            <li>Maximum repeating character length: {passwordConfig.maxRepeatingCharacterLength}</li>
                                                        }
                                                        <li>Leading and trailing spaces will be removed</li>
                                                    </ul>  
                                                </>                                          
                                            }
                                        </Stack>
                                        <TextField name="password" id="password"
                                            type={ viewPassword === true ? "text" : "password"}
                                            value={userInput.password}
                                            onChange={(evt) => { userInput.password = evt.target.value; setUserInput({ ...userInput }); }}
                                            fullWidth={true} size="small"
                                            error={true}
                                            slotProps={{
                                                input: {
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {viewPassword === true &&
                                                                <CloseOutlinedIcon
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
                                                                <CloseOutlinedIcon
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
                            {registrationPage === 2 &&
                                <Grid2 size={12} container spacing={1}>
                                    <Grid2 marginBottom={"8px"} size={12}>
                                        <div>Preferred Language</div>
                                        <Autocomplete
                                            id="defaultLanguage"
                                            sx={{ paddingTop: "8px" }}
                                            size="small"
                                            renderInput={(params) => <TextField {...params} label="" />}
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
                                            value={userInput.postalCode}
                                            fullWidth={true} size="small"
                                            onChange={(evt) => { userInput.postalCode = evt.target.value; setUserInput({ ...userInput }); }}
                                        />
                                    </Grid2>
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
                                            setRegistrationPage(registrationPage - 1);
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

                            </Stack>
                        </Grid2>
                    </Typography>
                </Paper>
            }
        </Suspense >
    )

}

export default Register;