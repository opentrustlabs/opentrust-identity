"use client";
import { MarkForDeleteObjectType, StateProvinceRegion, User, UserMfaRel, UserTenantRelView, UserUpdateInput, PortalUserProfile } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Typography from "@mui/material/Typography";
import { MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_TIME_BASED_OTP, NAME_ORDER_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, TENANT_TYPE_ROOT_TENANT, USER_DELETE_SCOPE, USER_TENANT_REL_TYPE_PRIMARY, USER_UPDATE_SCOPE } from "@/utils/consts";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, MenuItem, Select, Snackbar } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import PolicyIcon from '@mui/icons-material/Policy';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";
import { useMutation, useQuery } from "@apollo/client";
import { FIDO_KEY_DELETION_MUTATION, TOPT_DELETION_MUTATION, USER_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { USER_DETAIL_QUERY, USER_MFA_REL_QUERY } from "@/graphql/queries/oidc-queries";
import UserTenantConfiguration from "./user-tenant-configuration";
import UserAuthorizationGroupConfiguration from "./user-authorization-group-configuration";
import UserAuthenticationGroupConfiguration from "./user-authentication-group-configuration";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";
import ScopeRelConfiguration, { ScopeRelType } from "../scope/scope-rel-configuration";
import UserSessionDetails from "./user-session-details";
import StateProvinceRegionSelector from "./state-province-region-selector";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { MuiTelInput } from "mui-tel-input";

export interface UserDetailProps {
    user: User;
}

const UserDetail: React.FC<UserDetailProps> = ({
    user
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

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
        middleName: user.middleName || "",
        phoneNumber: user.phoneNumber,
        preferredLanguageCode: user.preferredLanguageCode
    }
    // STATE VARIABLES
    const [userInput, setUserInput] = React.useState<UserUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(user.markForDelete);
    const [userTenantRels, setUserTenantRels] = React.useState<Array<UserTenantRelView> | undefined>(undefined);
    const [showMFADeletionConfirmationDialog, setShowMFADeletionConfirmationDialog] = React.useState<boolean>(false);
    const [mfaTypeToDelete, setMfaTypeToDelete] = React.useState<string | null>(null);
    const [disableInputs] = React.useState<boolean>(user.markForDelete || !containsScope(USER_UPDATE_SCOPE, profile?.scope|| []));
    const [canDeleteUser] = React.useState<boolean>(containsScope(USER_DELETE_SCOPE, profile?.scope || []));

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(USER_MFA_REL_QUERY, {
        variables: {
            userId: user.userId
        }
    });

    const [deleteTOTPMutation] = useMutation(TOPT_DELETION_MUTATION, {
        variables: {
            userId: user.userId
        },
        onCompleted() {
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message)
        },
        refetchQueries: [USER_MFA_REL_QUERY]
    });

    const [deleteFIDOKeyMutation] = useMutation(FIDO_KEY_DELETION_MUTATION, {
        variables: {
            userId: user.userId
        },
        onCompleted() {
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message)
        },
        refetchQueries: [USER_MFA_REL_QUERY]
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
        },
        refetchQueries: [USER_DETAIL_QUERY]
    });

    // HANDLER FUNCTIONS
    const hasPrimaryTenant = (rels: Array<UserTenantRelView>): boolean => {
        const rel = rels.find(
            (r: UserTenantRelView) => r.relType === USER_TENANT_REL_TYPE_PRIMARY
        )
        return rel !== undefined;
    }

    const getPrimaryTenantId = (rels: Array<UserTenantRelView>): string | null => {
        const rel = rels.find(
            (r: UserTenantRelView) => r.relType === USER_TENANT_REL_TYPE_PRIMARY
        );
        return rel?.tenantId || null;
    }

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
            {showMFADeletionConfirmationDialog &&
                <Dialog
                    open={showMFADeletionConfirmationDialog}
                    onClose={() => setShowMFADeletionConfirmationDialog(false)}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>
                            Confirm deletion of MFA
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowMFADeletionConfirmationDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            if(mfaTypeToDelete === MFA_AUTH_TYPE_TIME_BASED_OTP){
                                setShowMutationBackdrop(true);
                                deleteTOTPMutation();
                                setShowMFADeletionConfirmationDialog(false);
                            }
                            else if(mfaTypeToDelete === MFA_AUTH_TYPE_FIDO2){
                                setShowMutationBackdrop(true);
                                deleteFIDOKeyMutation();
                                setShowMFADeletionConfirmationDialog(false);
                            }
                        }}>Submit</Button>
                    </DialogActions>
                    
                </Dialog>
            }
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={11}>Overview</Grid2>
                            <Grid2 size={1} display={"flex"} >
                                {isMarkedForDelete !== true && canDeleteUser &&
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
                                                disabled={disableInputs || userInput.federatedOIDCProviderSubjectId !== ""}
                                                value={userInput.firstName}
                                                onChange={(evt) => {userInput.firstName = evt.target.value; setMarkDirty(true); setUserInput({...userInput})}}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Last Name</div>
                                            <TextField name="lastName" id="lastName" 
                                                disabled={disableInputs || userInput.federatedOIDCProviderSubjectId !== ""}
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
                                                        disabled={disableInputs}
                                                        name="enabled"
                                                        checked={userInput.enabled}
                                                        onChange={(_, checked) => {
                                                            userInput.enabled = checked;
                                                            setMarkDirty(true); 
                                                            setUserInput({...userInput});
                                                        }}
                                                    />
                                                </Grid2>
                                                <Grid2 alignContent={"center"} size={10}>Locked</Grid2>
                                                <Grid2 size={2}>
                                                    <Checkbox                                                         
                                                        name="locked"
                                                        checked={userInput.locked}
                                                        disabled={!user.locked || disableInputs === true}
                                                        onChange={(_, checked) => {
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
                                                disabled={disableInputs || userInput.federatedOIDCProviderSubjectId !== ""}
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
                                                disabled={disableInputs || userInput.federatedOIDCProviderSubjectId !== ""}
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
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Email</div>
                                            <TextField name="email" id="email" 
                                                disabled={disableInputs || userInput.federatedOIDCProviderSubjectId !== ""}
                                                value={userInput.email} 
                                                onChange={(evt) => {
                                                    userInput.email = evt.target.value; 
                                                    userInput.emailVerified = false;
                                                    setMarkDirty(true); 
                                                    setUserInput({...userInput}); 
                                                }}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 paddingLeft={"8px"} marginBottom={"16px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={11}>Email verified</Grid2>
                                                <Grid2 size={1}>
                                                    <Checkbox 
                                                        disabled={disableInputs || userInput.federatedOIDCProviderSubjectId !== ""}
                                                        name="emailVerified"
                                                        checked={userInput.emailVerified}
                                                        onChange={(_, checked) => {
                                                            userInput.emailVerified = checked;
                                                            setMarkDirty(true); 
                                                            setUserInput({...userInput});
                                                        }}
                                                    />
                                            </Grid2>
                                        </Grid2>
                                        {user.recoveryEmail &&
                                            <React.Fragment>
                                                <Grid2 marginBottom={"16px"}>
                                                    <div>Recovery Email</div>
                                                    <TextField name="email" id="email" 
                                                        disabled={true}
                                                        value={user.recoveryEmail.email}                                                     
                                                        fullWidth={true} size="small" 
                                                    />
                                                </Grid2>
                                                <Grid2 paddingLeft={"8px"} marginBottom={"16px"} container size={12}>                                                    
                                                    <Grid2 alignContent={"center"} size={11}>Recovery Email verified</Grid2>
                                                    <Grid2 size={1} >                                                            
                                                        <Checkbox name="recoveryEmailVerified" id="recoveryEmailVerified" 
                                                            disabled={true}
                                                            checked={user.recoveryEmail.emailVerified}
                                                        />
                                                    </Grid2>
                                                </Grid2>
                                            </React.Fragment>                                            
                                        }
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Phone Number</div>
                                            <MuiTelInput
                                                name="phoneNumber" 
                                                id="phoneNumber" 
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
                                            <div style={{textDecoration: "underline", marginBottom: "8px"}}>Multi-factor Authentication</div>
                                            {loading && 
                                                <div></div>
                                            }
                                            {error &&
                                                <Alert severity="error">Unable to retrive MFA information</Alert>
                                            }
                                            {data && data.getUserMFARels && data.getUserMFARels.length === 0 &&
                                                <div>No MFA configured for this user</div>
                                            }
                                            {data && data.getUserMFARels && data.getUserMFARels.length > 0 &&
                                                <React.Fragment>
                                                    {data.getUserMFARels.map(
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
                                                                            sx={{cursor: "pointer"}}
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
                                                onChange={(evt) => {userInput.address = evt.target.value; setUserInput({...userInput}); setMarkDirty(true);}}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>(Optional) Apartment, suite, unit, building, floor</div>
                                            <TextField name="addressline1" id="addressline1" 
                                                disabled={disableInputs}
                                                value={userInput.addressLine1} 
                                                onChange={(evt) => {userInput.addressLine1 = evt.target.value; setUserInput({...userInput}); setMarkDirty(true);}}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>City</div>
                                            <TextField name="city" id="city" 
                                                disabled={disableInputs}
                                                value={userInput.city} 
                                                onChange={(evt) => {userInput.city = evt.target.value; setUserInput({...userInput}); setMarkDirty(true);}}
                                                fullWidth={true} size="small" 
                                                
                                            />
                                        </Grid2>
                                        <Grid2 size={12} marginBottom={"16px"}>
                                            <div>Country</div>
                                            <Autocomplete
                                                disabled={disableInputs}
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
                                                    userInput.countryCode = value.id;
                                                    setUserInput({...userInput});                                                    
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
                                                    setUserInput({...userInput});
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
                                        id={"authorization-group-configuration"}
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
                                        id={"authentication-group-configuration"}
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
                                        id={"tenant-membership-configuration"}
                                        sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                    >
                                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                            <SettingsApplicationsIcon /><div style={{marginLeft: "8px"}}>Tenant Memberships</div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <UserTenantConfiguration
                                            onLoadCompleted={(tenants: Array<UserTenantRelView>) => {
                                                setUserTenantRels(tenants);
                                            }}
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
                        
                        {!isMarkedForDelete &&
                            <React.Fragment>
                                {userTenantRels && userTenantRels.length === 0 &&
                                    <Grid2 size={12}>
                                        <Accordion >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                id={`access-control-configuration`}
                                                sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <PolicyIcon /><div style={{ marginLeft: "8px" }}>Access Control</div>
                                                </div>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography>
                                                    <Grid2  display={"flex"} justifyContent={"center"}>
                                                        <div>This user does not belong to any tenants and so no scope can be assigned to this user</div>
                                                    </Grid2>
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid2>
                                }
                                {!userTenantRels &&
                                    <div></div>
                                }
                                {userTenantRels && userTenantRels.length > 0 && 
                                    <React.Fragment>
                                        {userTenantRels.map(
                                            (rel: UserTenantRelView) => (
                                                <Grid2 size={12} key={rel.tenantId} >                            
                                                    <Accordion >
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMoreIcon />}
                                                            id={`access-control-configuration-${rel.tenantId}`}
                                                            sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}
                                                        >
                                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                <PolicyIcon /><div style={{ marginLeft: "8px" }}>Access Control (Tenant: {rel.tenantName})</div>
                                                            </div>
                                                        </AccordionSummary>
                                                        <AccordionDetails>                                                            
                                                            <ScopeRelConfiguration
                                                                tenantId={rel.tenantId}
                                                                id={user.userId}
                                                                scopeRelType={ScopeRelType.USER}
                                                                onUpdateEnd={(success: boolean) => {
                                                                    setShowMutationBackdrop(false);
                                                                    if (success) {
                                                                        setShowMutationSnackbar(true);
                                                                    }
                                                                }}
                                                                onUpdateStart={() => {
                                                                    setShowMutationBackdrop(true);
                                                                }}
                                                            />                                                            
                                                        </AccordionDetails>
                                                    </Accordion>                            
                                                </Grid2>
                                            )
                                        )}
                                    </React.Fragment>
                                }
                            </React.Fragment>                            
                        }
                        <Grid2 size={12}>
                            {!isMarkedForDelete &&
                                <Accordion defaultExpanded={false}  >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        id={"user-session-configuration"}
                                        sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                    >
                                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                            <PeopleOutlinedIcon /><div style={{marginLeft: "8px"}}>User Sessions</div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <UserSessionDetails                                            
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