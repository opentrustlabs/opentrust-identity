"use client";
import { MarkForDeleteObjectType, User, UserUpdateInput } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Typography from "@mui/material/Typography";
import { MFA_AUTH_TYPE_DISPLAY, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_NONE, MFA_AUTH_TYPE_SMS, MFA_AUTH_TYPE_TIME_BASED_OTP, MFA_AUTH_TYPES, NAME_ORDER_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Backdrop, Button, CircularProgress, MenuItem, Select, Snackbar } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";
import { useMutation } from "@apollo/client";
import { USER_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { USER_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import UserTenantConfiguration from "./user-tenant-configuration";
import UserAuthorizationGroupConfiguration from "./user-authorization-group-configuration";
import UserAuthenticationGroupConfiguration from "./user-authentication-group-configuration";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";

export interface UserDetailProps {
    user: User;
}

const UserDetail: React.FC<UserDetailProps> = ({
    user
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

    const initInput: UserUpdateInput = {
        domain: user.domain,
        email: user.email,
        emailVerified: user.emailVerified,
        enabled: user.enabled,
        firstName: user.firstName,
        lastName: user.lastName,
        locked: user.locked,
        nameOrder: user.nameOrder,
        userId: user.userId,
        address: user.address || "",
        addressLine1: user.addressLine1 || "",
        city: user.city || "",
        stateRegionProvince: user.stateRegionProvince || "",
        postalCode: user.postalCode || "",
        countryCode: user.countryCode,
        federatedOIDCProviderSubjectId: user.federatedOIDCProviderSubjectId,
        middleName: user.middleName,
        phoneNumber: user.phoneNumber,
        preferredLanguageCode: user.preferredLanguageCode,
        twoFactorAuthType: user.twoFactorAuthType
    }
    // STATE VARIABLES
    const [userInput, setUserInput] = React.useState<UserUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(user.markForDelete);

    // GRAPHQL FUNCTIONS
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
        },
        refetchQueries: [USER_DETAIL_QUERY]

    });


    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={[
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
                    linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
                },
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=users`,
                    linkText: "Users"
                },
                {
                    href: null,
                    linkText: user.nameOrder === NAME_ORDER_WESTERN ? `${user.firstName} ${user.lastName}` : `${user.lastName} ${user.firstName}`
                }
            ]} />
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={11}>Overview</Grid2>
                            <Grid2 size={1} display={"flex"} >
                                {isMarkedForDelete !== true && 
                                    <SubmitMarkForDelete 
                                        objectId={user.userId}
                                        objectType={MarkForDeleteObjectType.User}
                                        confirmationMessage={`Confirm deletion of user: ${user.firstName} ${user.lastName}. Once submitted the operation cannot be undone.`}
                                        onDeleteEnd={(successful: boolean, errorMessage?: string) => {
                                            setShowMutationBackdrop(false);
                                            if(successful){
                                                setShowMutationSnackbar(true);
                                                setIsMarkedForDelete(true);
                                            }
                                            else{
                                                setErrorMessage(errorMessage || "ERROR");
                                            }
                                        }}
                                        onDeleteStart={() => setShowMutationBackdrop(true)}
                                    />
                                }
                            </Grid2>
                        </Grid2>                        
                        <Grid2 size={12} marginBottom={"16px"}>                            
                            {errorMessage &&
                                <Grid2 size={12}>                            
                                    <Alert severity={"error"} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                                </Grid2>
                            }
                            {isMarkedForDelete === true &&
                                <MarkForDeleteAlert 
                                    message={"This user has been marked for deletion. No changes to the user are permitted."}
                                />
                            }	
                            <Paper sx={{ padding: "8px" }} elevation={1}>                            
                                <Grid2 container size={12} spacing={2}>  
                                    
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>First Name</div>
                                            <TextField name="firstName" id="firstName" 
                                                disabled={isMarkedForDelete}
                                                value={userInput.firstName}
                                                onChange={(evt) => {userInput.firstName = evt.target.value; setMarkDirty(true); setUserInput({...userInput})}}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Last Name</div>
                                            <TextField name="lastName" id="lastName" 
                                                disabled={isMarkedForDelete}
                                                value={userInput.lastName} 
                                                onChange={(evt) => {userInput.lastName = evt.target.value; setMarkDirty(true); setUserInput({...userInput}); }}
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
                                                        disabled={isMarkedForDelete}
                                                        name="enabled"
                                                        checked={userInput.enabled}
                                                        onChange={(_, checked) => {
                                                            userInput.enabled = checked;
                                                            setMarkDirty(true); 
                                                            setUserInput({...userInput});
                                                        }}
                                                    />
                                                </Grid2>
                                                <Grid2 alignContent={"center"} size={10}>Email verified</Grid2>
                                                <Grid2 size={2}>
                                                    <Checkbox 
                                                        disabled={isMarkedForDelete}
                                                        name="emailVerified"
                                                        checked={userInput.emailVerified}
                                                        onChange={(_, checked) => {
                                                            userInput.emailVerified = checked;
                                                            setMarkDirty(true); 
                                                            setUserInput({...userInput});
                                                        }}
                                                    />
                                                </Grid2>
                                                <Grid2 alignContent={"center"} size={10}>Locked</Grid2>
                                                <Grid2 size={2}>
                                                    <Checkbox                                                         
                                                        name="locked"
                                                        checked={user.locked}
                                                        disabled={!user.locked || isMarkedForDelete === true}
                                                        onChange={(_, checked) => {
                                                            // TODO
                                                            // Rather than update the entire user,
                                                            // we just want to unlock the account in case it is locked.
                                                            // There is a special function for this, just need to invoke it here.
                                                            userInput.locked = checked;
                                                            setMarkDirty(true); 
                                                            setUserInput({...userInput});
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
                                                disabled={isMarkedForDelete}
                                                value={userInput.middleName} 
                                                onChange={(evt) => {userInput.middleName = evt.target.value; setMarkDirty(true); setUserInput({...userInput}); }}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>User ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2  size={11}>
                                                    {user.userId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            copyContentToClipboard(user.userId, "User ID copied to clipboard");
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Name Order</div>
                                            <Select 
                                                disabled={isMarkedForDelete}
                                                name="nameOrder"
                                                value={userInput.nameOrder}
                                                onChange={(evt) => {
                                                    userInput.nameOrder = evt.target.value;
                                                    setMarkDirty(true); 
                                                    setUserInput({...userInput});
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
                                                disabled={isMarkedForDelete}
                                                value={userInput.email} 
                                                onChange={(evt) => {userInput.email = evt.target.value; setMarkDirty(true); setUserInput({...userInput}); }}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Phone Number</div>
                                            <TextField name="phoneNumber" id="phoneNumber" 
                                                disabled={isMarkedForDelete}
                                                value={userInput.phoneNumber} 
                                                onChange={(evt) => {userInput.phoneNumber = evt.target.value; setMarkDirty(true); setUserInput({...userInput}); }}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Preferred Language</div>
                                            <Autocomplete
                                                disabled={isMarkedForDelete}
                                                id="defaultLanguage"                                                
                                                sx={{paddingTop: "8px"}}
                                                size="small"
                                                renderInput={(params) => <TextField {...params} label="" />}
                                                options={
                                                    [{languageCode: "", language: ""}, ...LANGUAGE_CODES].map(
                                                        (lc: LanguageCodeDef) => {
                                                            return {id: lc.languageCode, label: lc.language}
                                                        }
                                                    )
                                                }                        
                                                value={getDefaultLanguageCodeDef(userInput.preferredLanguageCode || "")}
                                                onChange={ (_, value: any) => {
                                                    userInput.preferredLanguageCode = value.id;
                                                    setMarkDirty(true);
                                                    setUserInput({...userInput});
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
                                            <div>Multi-factor Authorization</div>
                                            <Autocomplete
                                                disabled={isMarkedForDelete}
                                                id="mfa"
                                                multiple={false}
                                                size="small"
                                                sx={{ paddingTop: "8px" }}
                                                renderInput={(params) => <TextField {...params} label="" />}
                                                options={
                                                    MFA_AUTH_TYPES.map(
                                                        (type: string) => {
                                                            return {id: type, label: MFA_AUTH_TYPE_DISPLAY.get(type)}
                                                        }
                                                    )
                                                }
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                value={
                                                    userInput.twoFactorAuthType ?
                                                        {id: userInput.twoFactorAuthType, label: MFA_AUTH_TYPE_DISPLAY.get(userInput.twoFactorAuthType)}
                                                        :
                                                        {id: "", label: ""}
                                                }
                                                onChange={(_, value: any) => {
                                                    if(!value){
                                                        userInput.twoFactorAuthType = MFA_AUTH_TYPE_NONE;
                                                    }
                                                    else{
                                                        userInput.twoFactorAuthType = value.id;
                                                    }
                                                    setUserInput({...userInput});
                                                    setMarkDirty(true);
                                                }}
                                            />
                                        </Grid2>
                                        
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Address</div>
                                            <TextField name="address" id="address" 
                                                disabled={isMarkedForDelete}
                                                value={userInput.address} fullWidth={true} size="small" 
                                                onChange={(evt) => {userInput.address = evt.target.value; setUserInput({...userInput}); setMarkDirty(true);}}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>(Optional) Apartment, suite, unit, building, floor</div>
                                            <TextField name="addressline1" id="addressline1" 
                                                disabled={isMarkedForDelete}
                                                value={userInput.addressLine1} 
                                                onChange={(evt) => {userInput.addressLine1 = evt.target.value; setUserInput({...userInput}); setMarkDirty(true);}}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>City</div>
                                            <TextField name="city" id="city" 
                                                disabled={isMarkedForDelete}
                                                value={userInput.city} 
                                                onChange={(evt) => {userInput.city = evt.target.value; setUserInput({...userInput}); setMarkDirty(true);}}
                                                fullWidth={true} size="small" 
                                                
                                            />
                                        </Grid2>
                                        <Grid2 size={12} marginBottom={"16px"}>
                                            <div>Country</div>
                                            <Autocomplete
                                                disabled={isMarkedForDelete}
                                                id="countryCode"                                                
                                                sx={{paddingTop: "8px"}}
                                                size="small"
                                                renderInput={(params) => <TextField {...params} label="" />}
                                                options={
                                                    [{countryCode: "", country: ""}, ...COUNTRY_CODES].map(
                                                        (cc: CountryCodeDef) => {
                                                            return {id: cc.countryCode, label: cc.country}
                                                        }
                                                    )
                                                }                        
                                                value={getDefaultCountryCodeDef(userInput.countryCode || "")}
                                                onChange={ (_, value: any) => {                            
                                                    // tenantAnonymousUserConfigInput.defaultcountrycode = value ? value.id : "";
                                                    // setTenantAnonymousUserConfigInput({ ...tenantAnonymousUserConfigInput });
                                                    setMarkDirty(true);
                                                }}                        
                                            />                                            
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>State / Province / Region</div>
                                            <TextField name="stateprovinceregion" id="stateprovinceregion" 
                                                disabled={isMarkedForDelete}
                                                value={userInput.stateRegionProvince} 
                                                onChange={(evt) => {userInput.stateRegionProvince = evt.target.value; setUserInput({...userInput}); setMarkDirty(true);}}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Postal Code</div>
                                            <TextField name="postalCode" id="postalCode" 
                                                disabled={isMarkedForDelete}
                                                value={userInput.postalCode} 
                                                fullWidth={true} size="small" 
                                                onChange={(evt) => {userInput.postalCode = evt.target.value; setUserInput({...userInput}); setMarkDirty(true);}}
                                            />
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setMarkDirty(false);
                                        setUserInput(initInput);
                                    }}
                                    onUpdateClickedHandler={() => {
                                        setShowMutationBackdrop(true);
                                        updateUserMutation();
                                    }}
                                    markDirty={markDirty}
                                />
                            </Paper>
                        </Grid2>

                        <Grid2 size={12} marginBottom={"16px"}>
                            {!isMarkedForDelete &&
                                <Accordion defaultExpanded={true}  >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        id={"login-failure-configuration"}
                                        sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                    >
                                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                            <GroupIcon /><div style={{marginLeft: "8px"}}>Authorization Groups</div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <UserAuthorizationGroupConfiguration
                                            userId={user.userId}
                                            onUpdateEnd={(success: boolean) => {
                                                setShowMutationBackdrop(false);
                                                if(success){
                                                    setShowMutationSnackbar(true);
                                                }
                                            }}
                                            onUpdateStart={() => {
                                                setShowMutationBackdrop(true);
                                            }}    
                                        />
                                    </AccordionDetails>                                
                                </Accordion>
                            }
                        </Grid2>
                        <Grid2 size={12}>
                            {!isMarkedForDelete &&
                                <Accordion defaultExpanded={false}  >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        id={"login-failure-configuration"}
                                        sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                    >
                                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                            <PeopleIcon /><div style={{marginLeft: "8px"}}>Authentication Groups</div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <UserAuthenticationGroupConfiguration
                                            userId={user.userId}
                                            onUpdateEnd={(success: boolean) => {
                                                setShowMutationBackdrop(false);
                                                if(success){
                                                    setShowMutationSnackbar(true);
                                                }
                                            }}
                                            onUpdateStart={() => {
                                                setShowMutationBackdrop(true);
                                            }} 
                                        />                                    
                                    </AccordionDetails>
                                </Accordion>
                            }
                        </Grid2>
                        
                        <Grid2 size={12}>
                            {!isMarkedForDelete &&
                                <Accordion defaultExpanded={false}  >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        id={"login-failure-configuration"}
                                        sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                    >
                                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                            <SettingsApplicationsIcon /><div style={{marginLeft: "8px"}}>Tenant Memberships</div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <UserTenantConfiguration
                                            userId={user.userId}
                                            onUpdateEnd={(success: boolean) => {
                                                setShowMutationBackdrop(false);
                                                if(success){
                                                    setShowMutationSnackbar(true);
                                                }
                                            }}
                                            onUpdateStart={() => {
                                                setShowMutationBackdrop(true);
                                            }}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            }
                        </Grid2>
                    </Grid2>
                </DetailPageMainContentContainer>
                <DetailPageRightNavContainer><div></div></DetailPageRightNavContainer>
            </DetailPageContainer>
            <Backdrop
                sx={{ color: '#fff'}}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
            <Snackbar
                open={showMutationSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowMutationSnackbar(false)}                
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            >
                <Alert sx={{fontSize: "1em"}}
                    onClose={() => setShowMutationSnackbar(false)}
                >
                    User Updated
                </Alert>
            </Snackbar>	            
        </Typography>
    )

}

export default UserDetail;