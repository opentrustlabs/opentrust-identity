"use client";
import { User, UserUpdateInput } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Typography from "@mui/material/Typography";
import { NAME_ORDER_DISPLAY, NAME_ORDER_EASTERN, NAME_ORDER_WESTERN, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Stack from "@mui/material/Stack";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Button, Divider, MenuItem, Select } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import PolicyIcon from '@mui/icons-material/Policy';
import Link from "next/link";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";

export interface UserDetailProps {
    user: User;
}

const UserDetail: React.FC<UserDetailProps> = ({
    user
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

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
        address: user.address,
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
                        <Grid2
                            className="detail-page-subheader"
                            sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }}
                            fontWeight={"bold"}
                            size={12}
                        >
                            Overview
                        </Grid2>
                        {errorMessage &&
                            <Alert severity={"error"} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                        }
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>                                    
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>First Name</div>
                                            <TextField name="firstName" id="firstName" 
                                                value={userInput.firstName}
                                                onChange={(evt) => {userInput.firstName = evt.target.value; setMarkDirty(true); setUserInput({...userInput})}}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Last Name</div>
                                            <TextField name="lastName" id="lastName" 
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
                                                        checked={userInput.locked}
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
                                                value={""} 
                                                onChange={(evt) => {userInput.middleName = evt.target.value; setMarkDirty(true); setUserInput({...userInput}); }}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Name Order</div>
                                            <Select 
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
                                                value={userInput.email} 
                                                onChange={(evt) => {userInput.email = evt.target.value; setMarkDirty(true); setUserInput({...userInput}); }}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Phone Number</div>
                                            <TextField name="phoneNumber" id="phoneNumber" 
                                                value={userInput.phoneNumber} 
                                                onChange={(evt) => {userInput.phoneNumber = evt.target.value; setMarkDirty(true); setUserInput({...userInput}); }}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Address</div>
                                            <TextField name="tenantType" id="tenantType" value={""} fullWidth={true} size="small" />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 size={12} marginBottom={"16px"}>
                                            <div>Country</div>
                                            <Autocomplete
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
                                            <div>Preferred Language</div>
                                            <Autocomplete
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
                                                    // tenantAnonymousUserConfigInput.defaultlangugecode = value ? value.id : "";
                                                    // setTenantAnonymousUserConfigInput({ ...tenantAnonymousUserConfigInput });
                                                    setMarkDirty(true);
                                                }}                        
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Federated OIDC Provider Subject ID</div>
                                            <TextField disabled={true} 
                                                name="federatedOIDCProviderSubjectId" 
                                                id="federatedOIDCProviderSubjectId" 
                                                value={userInput.federatedOIDCProviderSubjectId} 
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Multi-factor Authorization</div>
                                            <TextField name="tenantType" id="tenantType" value={""} fullWidth={true} size="small" />
                                        </Grid2>

                                    </Grid2>
                                </Grid2>
                                <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    <Button sx={{ border: "solid 1px lightgrey", borderRadius: "4px"}} >Update</Button>
                                </Stack>
                            </Paper>
                        </Grid2>

                        <Grid2 size={12} marginBottom={"16px"}>
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
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add User To Authorization Group</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    <Divider />                                        
                                    {["Project Managers US", "Planning Tool Admin", "Server Room Access", "Gira User", "Confluence User", "Ordering Customer",
                                        "Training Coordinators US", "Evacuation Leader St. Louis", "B2B Tool User", "OpenTrust User", "Ordering Manager"].map(                                            
                                        (name: string) => (
                                            <Typography key={`${name}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={11}>{name}</Grid2>                                                    
                                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>                                                
                                        )
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>
                        <Grid2 size={12}>
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
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add User To Authentication Group</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    <Divider />                                        
                                    {["Project Managers US", "Planning Tool Admin", "Server Room Access", "Gira User", "Confluence User", "Ordering Customer",
                                        "Training Coordinators US", "Evacuation Leader St. Louis", "B2B Tool User", "OpenTrust User", "Ordering Manager"].map(                                            
                                        (name: string) => (
                                            <Typography key={`${name}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={11}>{name}</Grid2>                                                    
                                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>                                                
                                        )
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"redirect-uri-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                >
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <PolicyIcon /><div style={{ marginLeft: "8px" }}>Access Control</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add Scope</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    <Divider></Divider>
                                    {["Read Reports in QA", "Update Reports in QA", "Delete Reports in QA"].map(
                                        (uri: string) => (
                                            <Typography key={`${uri}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={11}><Link href={`/123412341234/authentication-groups/1234372987349`}>{uri}</Link></Grid2>
                                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>
                                        )
                                    )}

                                </AccordionDetails>
                            </Accordion>
                        </Grid2>
                        <Grid2 size={12}>
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
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Grid2 size={8}>Tenant Name</Grid2>
                                            <Grid2 size={3}>Membership Type</Grid2>
                                            <Grid2 size={1}></Grid2>                                                                                        
                                        </Grid2>
                                    </Typography>
                                    <Divider />
                                    {["Ameran Prod Tenant", "WEB UI Tenant"].map(                                            
                                        (name: string, idx: number) => (
                                            <Typography key={`${name}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={8}>{name}</Grid2>
                                                    <Grid2 size={3}>{idx === 3 ? `Primary` : `Guest`}</Grid2>
                                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>                                                
                                        )
                                    )}

                                </AccordionDetails>
                            </Accordion>
                        </Grid2>
                    </Grid2>
                </DetailPageMainContentContainer>
                <DetailPageRightNavContainer><div></div></DetailPageRightNavContainer>
            </DetailPageContainer>

        </Typography>
    )

}

export default UserDetail;