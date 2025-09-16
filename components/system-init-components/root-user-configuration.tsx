"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { UserCreateInput } from "@/graphql/generated/graphql-types";
import Select from "@mui/material/Select";
import { DEFAULT_TENANT_PASSWORD_CONFIGURATION, NAME_ORDER_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, NAME_ORDERS } from "@/utils/consts";
import MenuItem from "@mui/material/MenuItem";
import { MuiTelInput } from "mui-tel-input";
import PasswordRulesDisplay from "../authentication-components/password-rules-display";
import { validatePasswordFormat } from "@/utils/password-utils";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import Autocomplete from "@mui/material/Autocomplete";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";


const RootUserConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onNext,
    systemInitInput

}) => {
    
    const initInput: UserCreateInput = {
        domain: systemInitInput.rootUserCreateInput.domain,
        email: systemInitInput.rootUserCreateInput.email,
        emailVerified: systemInitInput.rootUserCreateInput.emailVerified,
        enabled: true,
        firstName: systemInitInput.rootUserCreateInput.firstName,
        lastName: systemInitInput.rootUserCreateInput.lastName,
        locked: false,
        nameOrder: systemInitInput.rootUserCreateInput.nameOrder,
        address: systemInitInput.rootUserCreateInput.address || "",
        addressLine1: systemInitInput.rootUserCreateInput.addressLine1 || "",
        city: systemInitInput.rootUserCreateInput.city || "",
        stateRegionProvince: systemInitInput.rootUserCreateInput.stateRegionProvince || "",
        postalCode: systemInitInput.rootUserCreateInput.postalCode || "",
        countryCode: systemInitInput.rootUserCreateInput.countryCode,
        federatedOIDCProviderSubjectId: "",
        middleName: systemInitInput.rootUserCreateInput.middleName || "",
        phoneNumber: systemInitInput.rootUserCreateInput.phoneNumber,
        preferredLanguageCode: systemInitInput.rootUserCreateInput.preferredLanguageCode,
        password: systemInitInput.rootUserCreateInput.password,
        termsAndConditionsAccepted: false
    }
    // STATE VARIABLES
    const [userInput, setUserInput] = React.useState<UserCreateInput>(initInput);
    const [viewPassword, setViewPassword] = React.useState<boolean>(false);
    const [showPasswordRules, setShowPasswordRules] = React.useState<boolean>(false);

    // HANDLER FUNCTIONS
    const userInfoIsValid = (): boolean => {
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
        if(!userInput.countryCode || userInput.countryCode.length < 2){
            bRetVal = false;
        }
        if(!userInput.preferredLanguageCode || userInput.preferredLanguageCode.length < 2){
            bRetVal = false;
        }
        return bRetVal;
    }

    return (
        <Typography component="div">
            <Paper
                elevation={1}
                sx={{ padding: "8px", border: "solid 1px lightgrey" }}
            >
                <Grid2 container size={12} spacing={1}>
                    <Grid2 fontWeight={"bold"} size={12} marginBottom={"8px"}>
                        Configure the first user for the Root Tenant. This will be your account within the IAM tool
                        and will be assigned to the admin authorization group. You can change permissions once the
                        IAM tool is initialized.                        
                    </Grid2>
                    <Grid2 size={12} marginBottom={"8px"}>
                        <div>First Name</div>
                        <TextField name="firstName" id="firstName"                             
                            value={userInput.firstName}
                            onChange={(evt) => {userInput.firstName = evt.target.value; setUserInput({...userInput})}}
                            fullWidth={true} size="small" 
                        />
                    </Grid2>
                    <Grid2 size={12} marginBottom={"8px"}>
                        <div>Last Name</div>
                        <TextField name="lastName" id="lastName" 
                            value={userInput.lastName} 
                            onChange={(evt) => {userInput.lastName = evt.target.value; setUserInput({...userInput}); }}
                            fullWidth={true} size="small" 
                        />
                    </Grid2>
                    <Grid2 size={12} marginBottom={"8px"}>
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
                            onChange={(evt) => { 
                                userInput.email = evt.target.value; 
                                const s: Array<string> = evt.target.value.split("@");
                                if(s.length === 2){
                                    userInput.domain = s[1];
                                }
                                setUserInput({ ...userInput }); 
                            }}
                            fullWidth={true} size="small"
                            error={!userInput.email || userInput.email.length < 7}
                        />
                    </Grid2>
                    <Grid2 marginBottom={"8px"} size={12}>
                        <div>Admin and Authentication Domain for the Root Tenant</div>
                        <TextField name="domain" id="domain"
                            value={userInput.domain}                            
                            fullWidth={true} size="small" 
                            disabled={true}
                        />
                    </Grid2>
                    <Grid2 marginBottom={"8px"} size={12}>
                        <Stack spacing={1} direction={"row"}>
                            <div>Password</div>
                            <div>
                                Password Rules
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
                                    passwordConfig={DEFAULT_TENANT_PASSWORD_CONFIGURATION}
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
                            error={!validatePasswordFormat(userInput.password, DEFAULT_TENANT_PASSWORD_CONFIGURATION).result}
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
                        <div>Phone Number</div>
                        <MuiTelInput
                            value={userInput.phoneNumber || ""}
                            onChange={(newValue) => { userInput.phoneNumber = newValue; setUserInput({ ...userInput }); }}
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
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(_, value: any) => {
                                userInput.countryCode = value.id;
                                setUserInput({ ...userInput });
                            }}
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} size={12}>
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
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(_, value: any) => {
                                userInput.preferredLanguageCode = value.id;
                                setUserInput({ ...userInput });
                            }}
                        />
                    </Grid2>
                    
                </Grid2>
                <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                    <Button
                        onClick={() => {
                            systemInitInput.rootUserCreateInput = userInput;
                            systemInitInput.rootAuthenticationDomain = userInput.domain;
                            onNext(systemInitInput);
                            
                        }}
                        disabled={!userInfoIsValid()}
                    >
                        Next
                    </Button>                    
                    <Button
                        onClick={() => {
                            onBack();
                        }}
                    >
                        Back
                    </Button>
                </Stack>
            </Paper>
        </Typography>
    )
}

export default RootUserConfiguration;