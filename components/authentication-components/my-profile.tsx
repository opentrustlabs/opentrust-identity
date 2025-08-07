"use client";
import { PortalUserProfile, StateProvinceRegion, UserMfaRel, UserUpdateInput } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { AuthContextProps, AuthContext } from "../contexts/auth-context";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ErrorComponent from "../error/error-component";
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";
import { ME_QUERY, TENANT_META_DATA_QUERY, USER_MFA_REL_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import { Alert, Autocomplete, Checkbox, Grid2, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { getDefaultLanguageCodeDef, getDefaultCountryCodeDef } from "@/utils/client-utils";
import { NAME_ORDER_EASTERN, NAME_ORDER_DISPLAY, NAME_ORDER_WESTERN, MFA_AUTH_TYPE_TIME_BASED_OTP, MFA_AUTH_TYPE_FIDO2 } from "@/utils/consts";
import { LANGUAGE_CODES, LanguageCodeDef, COUNTRY_CODES, CountryCodeDef } from "@/utils/i18n";
import { MuiTelInput } from "mui-tel-input";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import StateProvinceRegionSelector from "../users/state-province-region-selector";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { USER_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";


const MyProfile: React.FC = () => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    //const authSessionProps: AuthSessionProps = useAuthSessionContext();
    //const authContextProps: AuthContextProps = useContext(AuthContext);
    //const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    const maxWidth = breakPoints.isSmall ? "90vw" : breakPoints.isMedium ? "80vw" : "650px";

    const initInput: UserUpdateInput = {
        domain: "",
        email: "",
        emailVerified: false,
        enabled: false,
        firstName: "",
        lastName: "",
        locked: true,
        nameOrder: "",
        userId: "",
        address: "",
        addressLine1: "",
        city: "",
        stateRegionProvince: "",
        postalCode: "",
        countryCode: "",
        federatedOIDCProviderSubjectId: null,
        middleName: "",
        phoneNumber: "",
        preferredLanguageCode: ""
    }
    // STATE VARIABLES
    const [userInput, setUserInput] = React.useState<UserUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [userId, setUserId] = React.useState<boolean | null>(null);
    const [userTenantId, setUserTenantId] = React.useState<string | null>(null);
    const [disableInputs, setDisableInputs] = React.useState<boolean>(false);
    const [mfaTypeToDelete, setMfaTypeToDelete] = React.useState<string | null>(null);
    const [showMFADeletionConfirmationDialog, setShowMFADeletionConfirmationDialog] = React.useState<boolean>(false);

    const { data } = useQuery(ME_QUERY, {
        onCompleted(data) {
            if (data && data.me && data.me.userId) {
                setUserId(data.me.userId);
                setUserTenantId(data.me.tenantId);
                //setUserTenantId("2a303f6d-0ebc-4590-9d12-7ebab6531d7e");
                const userProfile: PortalUserProfile = data.me;
                initInput.domain = userProfile.domain;
                initInput.email = userProfile.email;
                initInput.emailVerified = userProfile.emailVerified;
                initInput.enabled = userProfile.enabled;
                initInput.firstName = userProfile.firstName;
                initInput.lastName = userProfile.lastName;
                initInput.locked = userProfile.locked;
                initInput.nameOrder = userProfile.nameOrder;
                initInput.userId = userProfile.userId;
                initInput.address = userProfile.address;
                initInput.addressLine1 = userProfile.addressLine1;
                initInput.city = userProfile.city;
                initInput.stateRegionProvince = userProfile.stateRegionProvince;
                initInput.postalCode = userProfile.postalCode;
                initInput.countryCode = userProfile.countryCode;
                initInput.federatedOIDCProviderSubjectId = "287389487928374"; //userProfile.federatedOIDCProviderSubjectId;
                initInput.middleName = userProfile.middleName;
                initInput.phoneNumber = userProfile.phoneNumber
                initInput.preferredLanguageCode = userProfile.preferredLanguageCode;
                setUserInput({...initInput});
                if(initInput.federatedOIDCProviderSubjectId && initInput.federatedOIDCProviderSubjectId !== ""){
                    setDisableInputs(true);
                }                
            }
            else{
                setErrorMessage("ERROR_PROFILE_NOT_FOUND");
            }
        },
        onError(error) {
            setErrorMessage(error.message);
        }
    });

    const {data: userMfaData, loading: userMfaDataLoading, error: userMfaDataError} = useQuery(USER_MFA_REL_QUERY, {
            variables: {
                userId: userId
            }
        });

    const { data: tenantData } = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: userTenantId
        },
        skip: userTenantId === null,
        onCompleted(data) {
            console.log(data);
            if (data && data.getTenantMetaData) {
                tenantBean.setTenantMetaData(data.getTenantMetaData);
            }
        },
        onError(error) {
            setErrorMessage(error.message);
        }
    });

    const [updateUserMutation] = useMutation(USER_UPDATE_MUTATION, {
        variables: {
            userInput: userInput
        },
        onCompleted() {
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
            setMarkDirty(false);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        }
    });


    return (
        <Typography component={"div"} >

            <Paper
                elevation={4}
                sx={{ margin: "16px 0px", padding: 2, height: "100%", maxWidth: maxWidth, width: maxWidth }}
            >

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
                    {data && tenantData &&
                        <React.Fragment>                            
                            {userInput.federatedOIDCProviderSubjectId && userInput.federatedOIDCProviderSubjectId.length > 0 &&
                                <Alert severity="info">
                                    Your profile is managed through a 3rd party identity provider. You can only make limited changes
                                    to your profile on this page.
                                </Alert>
                            }
                            <Grid2 container size={12} spacing={2}>
                                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Grid2 marginBottom={"8px"}>
                                        <div>First Name</div>
                                        <TextField name="firstName" id="firstName"
                                            disabled={disableInputs}
                                            value={userInput.firstName}
                                            onChange={(evt) => { userInput.firstName = evt.target.value; setMarkDirty(true); setUserInput({ ...userInput }) }}
                                            fullWidth={true} size="small"
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"8px"}>
                                        <div>Last Name</div>
                                        <TextField name="lastName" id="lastName"
                                            disabled={disableInputs}
                                            value={userInput.lastName}
                                            onChange={(evt) => { userInput.lastName = evt.target.value; setMarkDirty(true); setUserInput({ ...userInput }); }}
                                            fullWidth={true} size="small"
                                        />
                                    </Grid2>
                                </Grid2>
                                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Grid2>
                                        <Grid2 paddingLeft={"8px"} marginBottom={"16px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={10}>Enabled</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox
                                                    disabled={true}
                                                    name="enabled"
                                                    checked={userInput.enabled}
                                                    onChange={(_, checked) => {
                                                        userInput.enabled = checked;
                                                        setMarkDirty(true);
                                                        setUserInput({ ...userInput });
                                                    }}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Email verified</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox
                                                    disabled={true}
                                                    name="emailVerified"
                                                    checked={userInput.emailVerified}
                                                    onChange={(_, checked) => {
                                                        userInput.emailVerified = checked;
                                                        setMarkDirty(true);
                                                        setUserInput({ ...userInput });
                                                    }}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Locked</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox
                                                    name="locked"
                                                    checked={userInput.locked}
                                                    disabled={true}
                                                    onChange={(_, checked) => {
                                                        userInput.locked = checked;
                                                        setMarkDirty(true);
                                                        setUserInput({ ...userInput });
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Middle Name</div>
                                        <TextField name="middleName" id="middleName"
                                            disabled={disableInputs}
                                            value={userInput.middleName}
                                            onChange={(evt) => { userInput.middleName = evt.target.value; setMarkDirty(true); setUserInput({ ...userInput }); }}
                                            fullWidth={true} size="small"
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div style={{ textDecoration: "underline" }}>User ID</div>
                                        <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                            <Grid2 size={11}>
                                                {userInput.userId}
                                            </Grid2>
                                            <Grid2 size={1}>
                                                <ContentCopyIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        copyContentToClipboard(userInput.userId, "User ID copied to clipboard");
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Name Order</div>
                                        <Select                                            
                                            name="nameOrder"
                                            value={userInput.nameOrder}
                                            onChange={(evt) => {
                                                userInput.nameOrder = evt.target.value;
                                                setMarkDirty(true);
                                                setUserInput({ ...userInput });
                                            }}
                                            size="small"
                                            fullWidth={true}
                                        >
                                            <MenuItem value={NAME_ORDER_EASTERN}>{NAME_ORDER_DISPLAY.get(NAME_ORDER_EASTERN)}</MenuItem>
                                            <MenuItem value={NAME_ORDER_WESTERN}>{NAME_ORDER_DISPLAY.get(NAME_ORDER_WESTERN)}</MenuItem>

                                        </Select>
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Email</div>
                                        <TextField name="email" id="email"
                                            disabled={disableInputs}
                                            value={userInput.email}
                                            onChange={(evt) => { userInput.email = evt.target.value; setMarkDirty(true); setUserInput({ ...userInput }); }}
                                            fullWidth={true} size="small"
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Phone Number</div>
                                        <MuiTelInput
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            disabled={disableInputs}
                                            value={userInput.phoneNumber || ""}
                                            onChange={(newValue) => {
                                                userInput.phoneNumber = newValue;
                                                setMarkDirty(true);
                                                setUserInput({ ...userInput });
                                            }}
                                            fullWidth={true}
                                            size="small"
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Preferred Language</div>
                                        <Autocomplete
                                            disabled={disableInputs}
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
                                                setMarkDirty(true);
                                                setUserInput({ ...userInput });
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Federated OIDC Provider Subject ID</div>
                                        <TextField
                                            disabled={true}
                                            name="federatedOIDCProviderSubjectId"
                                            id="federatedOIDCProviderSubjectId"
                                            value={userInput.federatedOIDCProviderSubjectId}
                                            fullWidth={true} size="small"
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div style={{ textDecoration: "underline", marginBottom: "8px" }}>Multi-factor Authentication</div>                                        
                                        {userMfaDataLoading &&
                                            <div></div>
                                        }
                                        {userMfaDataError &&
                                            <Alert severity="error">Unable to retrive MFA information</Alert>
                                        }
                                        {userMfaData && userMfaData.getUserMFARels && userMfaData.getUserMFARels.length === 0 &&
                                            <div>No MFA configured for this user</div>
                                        }
                                        {userMfaData && userMfaData.getUserMFARels && userMfaData.getUserMFARels.length > 0 &&
                                            <React.Fragment>
                                                {userMfaData.getUserMFARels.map(
                                                    (rel: UserMfaRel) => (
                                                        <Grid2 container size={12} spacing={1} key={rel.mfaType}>
                                                            <Grid2 size={11}>
                                                                {rel.mfaType === MFA_AUTH_TYPE_TIME_BASED_OTP &&
                                                                    "Time-based One Time Passcode"
                                                                }
                                                                {rel.mfaType === MFA_AUTH_TYPE_FIDO2 &&
                                                                    "Security Key"
                                                                }
                                                            </Grid2>
                                                            <Grid2 size={1}>
                                                                {!disableInputs &&
                                                                    <DeleteForeverOutlinedIcon
                                                                        sx={{ cursor: "pointer" }}
                                                                        onClick={() => {
                                                                            setMfaTypeToDelete(rel.mfaType)
                                                                            setShowMFADeletionConfirmationDialog(true);
                                                                        }}
                                                                    />
                                                                }
                                                            </Grid2>
                                                        </Grid2>
                                                    )
                                                )}
                                            </React.Fragment>
                                        }
                                    </Grid2>                                    
                                </Grid2>
                                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Address</div>
                                        <TextField name="address" id="address"
                                            disabled={disableInputs}
                                            value={userInput.address} fullWidth={true} size="small"
                                            onChange={(evt) => { userInput.address = evt.target.value; setUserInput({ ...userInput }); setMarkDirty(true); }}
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>(Optional) Apartment, suite, unit, building, floor</div>
                                        <TextField name="addressline1" id="addressline1"
                                            disabled={disableInputs}
                                            value={userInput.addressLine1}
                                            onChange={(evt) => { userInput.addressLine1 = evt.target.value; setUserInput({ ...userInput }); setMarkDirty(true); }}
                                            fullWidth={true} size="small"
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>City</div>
                                        <TextField name="city" id="city"
                                            disabled={disableInputs}
                                            value={userInput.city}
                                            onChange={(evt) => { userInput.city = evt.target.value; setUserInput({ ...userInput }); setMarkDirty(true); }}
                                            fullWidth={true} size="small"

                                        />
                                    </Grid2>
                                    <Grid2 size={12} marginBottom={"16px"}>
                                        <div>Country</div>
                                        <Autocomplete
                                            disabled={disableInputs}
                                            id="countryCode"
                                            sx={{ paddingTop: "8px" }}
                                            size="small"
                                            renderInput={(params) => <TextField {...params} label="" />}
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
                                                setMarkDirty(true);
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>State / Province / Region</div>
                                        <StateProvinceRegionSelector
                                            countryCode={userInput.countryCode || undefined}
                                            initValue={userInput.stateRegionProvince || undefined}
                                            isDisabled={disableInputs}
                                            onChange={(stateProvinceRegion: StateProvinceRegion | null) => {
                                                userInput.stateRegionProvince = stateProvinceRegion ? stateProvinceRegion.isoEntryCode : "";
                                                setUserInput({ ...userInput });
                                                setMarkDirty(true);
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Postal Code</div>
                                        <TextField name="postalCode" id="postalCode"
                                            disabled={disableInputs}
                                            value={userInput.postalCode}
                                            fullWidth={true} size="small"
                                            onChange={(evt) => { userInput.postalCode = evt.target.value; setUserInput({ ...userInput }); setMarkDirty(true); }}
                                        />
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                            <Stack width={"100%"} direction={"row-reverse"}>
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setMarkDirty(false);
                                        setUserInput({...initInput});
                                    }}
                                    onUpdateClickedHandler={() => {
                                        setShowMutationBackdrop(true);
                                        updateUserMutation();
                                    }}
                                    markDirty={markDirty}
                                />
                            </Stack>
                        </React.Fragment>
                    }

                </Grid2>



            </Paper>
        </Typography>
    )
}

export default MyProfile;