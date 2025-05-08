"use client";
import React, { useContext } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Backdrop, Button, Checkbox, CircularProgress, Divider, MenuItem, Paper, Select, Snackbar, Stack, TextField } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { DEFAULT_RATE_LIMIT_PERIOD_MINUTES, FEDERATED_AUTHN_CONSTRAINT_DISPLAY, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED, FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, TENANT_TYPE_IDENTITY_MANAGEMENT, TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES, TENANT_TYPE_ROOT_TENANT, TENANT_TYPE_SERVICES, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { Tenant, TenantUpdateInput } from "@/graphql/generated/graphql-types";
import { useMutation, useQuery } from "@apollo/client";
import { TENANT_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import PasswordIcon from '@mui/icons-material/Password';
import LoginIcon from '@mui/icons-material/Login';
import FaceIcon from '@mui/icons-material/Face';
import InputIcon from '@mui/icons-material/Input';
import PolicyIcon from '@mui/icons-material/Policy';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TENANT_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import LoginFailureConfiguration from "./login-failure-configuration";
import PasswordRulesConfiguration from "./password-rules-config";
import LegacyUserMigrationConfiguration from "./legacy-user-migration-configuration";
import AnonymousUserConfiguration from "./anonymous-user-configuration";
import TenantLookAndFeelConfiguration from "./tenant-look-and-feel-configuration";
import TenantManagementDomainConfiguration from "./tenant-management-domain-configuration";
import TenantAuthenticationDomainConfiguration from "./tenant-authentication-domain-configuration";
import TenantFederatedOIDCProviderConfiguration from "./tenant-federated-oidc-provider-configuration";
import ContactConfiguration from "../contacts/contact-configuration";
import Link from "next/link";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import TenantScopeConfiguration from "./tenant-scope-configuration";

export interface TenantDetailProps {
    tenantId: string
}
const TenantDetail: React.FC<TenantDetailProps> = ({ tenantId }) => {


    // GRAPHQL FUNCTIONS
    const { data, loading, error } = useQuery(
        TENANT_DETAIL_QUERY,
        {
            skip: tenantId === null || tenantId === undefined,
            variables: {
                tenantId: tenantId
            }
        }

    );

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='lg' />

    return <InnerComponent tenant={data.getTenantById} />
}

interface InnerComponentProps {
    tenant: Tenant
}

const InnerComponent: React.FC<InnerComponentProps> = ({
    tenant
}) => {

    const initInput: TenantUpdateInput = {
        allowAnonymousUsers: tenant.allowAnonymousUsers,
        allowForgotPassword: tenant.allowForgotPassword,
        allowLoginByPhoneNumber: tenant.allowLoginByPhoneNumber,
        allowSocialLogin: tenant.allowSocialLogin,
        allowUnlimitedRate: tenant.allowUnlimitedRate,
        allowUserSelfRegistration: tenant.allowUserSelfRegistration,
        enabled: tenant.enabled,
        federatedAuthenticationConstraint: tenant.federatedAuthenticationConstraint,
        markForDelete: tenant.markForDelete,
        migrateLegacyUsers: tenant.migrateLegacyUsers,
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
        tenantType: tenant.tenantType,
        verifyEmailOnSelfRegistration: tenant.verifyEmailOnSelfRegistration,
        tenantDescription: tenant.tenantDescription,
        defaultRateLimit: tenant.defaultRateLimit,
        defaultRateLimitPeriodMinutes: tenant.defaultRateLimitPeriodMinutes
    }

    // STATE VARIABLES
    const [tenantInput, setTenantInput] = React.useState<TenantUpdateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [overviewDirty, setOverviewDirty] = React.useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [tenantUpdateMutation] = useMutation(TENANT_UPDATE_MUTATION, {
            variables: {
                tenantInput: tenantInput
            },
            onCompleted(data) {                
                setOverviewDirty(false);
                setShowMutationBackdrop(false);
                setShowMutationSnackbar(true);
            },
            onError(error) {
                setOverviewDirty(false);
                setShowMutationBackdrop(false);
                setErrorMessage(error.message);
            },
            refetchQueries: [TENANT_DETAIL_QUERY]
        }
    );

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();


    // HANDLER FUNCTIONS
    const performUpdate = () => {
        setShowMutationBackdrop(true);
        tenantUpdateMutation();
    }

    const arrBreadcrumbs = [];
    if (tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT) {
        arrBreadcrumbs.push({
            href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
            linkText: `Tenant List`
        })
    }
    arrBreadcrumbs.push({
        linkText: tenantInput.tenantName,
        href: null
    });

    return (

        <Typography component={"div"}>
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />

            <Grid2 container size={12} spacing={3} marginBottom={"16px"} >
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Grid2 container size={12} spacing={2}>
                        {errorMessage &&
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
                        <Grid2 className="detail-page-subheader" sx={{backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px"}}  fontWeight={"bold"} size={12}>Overview</Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Name</div>
                                            <TextField name="tenantName" id="tenantName" onChange={(evt) => { tenantInput.tenantName = evt?.target.value; setTenantInput({ ...tenantInput }); setOverviewDirty(true); }} value={tenantInput.tenantName} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Descripton</div>
                                            <TextField  
                                                name="tenantDescription" id="tenantDescription" 
                                                value={tenantInput.tenantDescription} fullWidth={true} size="small" multiline={true} rows={2} 
                                                onChange={(evt) => { tenantInput.tenantDescription = evt?.target.value; setTenantInput({ ...tenantInput }); setOverviewDirty(true); }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Type</div>
                                            {tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                                <TextField disabled={true} name="tenantType" id="tenantType" value={TENANT_TYPES_DISPLAY.get(tenant.tenantType)} fullWidth={true} size="small" />
                                            }
                                            {tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                                <Select
                                                    size="small"
                                                    fullWidth={true}
                                                    value={tenantInput.tenantType}
                                                    onChange={(evt) => { tenantInput.tenantType = evt.target.value; setTenantInput({ ...tenantInput }); setOverviewDirty(true);}}
                                                >
                                                    <MenuItem value="">Select...</MenuItem>
                                                    <MenuItem value={TENANT_TYPE_IDENTITY_MANAGEMENT}>{TENANT_TYPES_DISPLAY.get(TENANT_TYPE_IDENTITY_MANAGEMENT)}</MenuItem>
                                                    <MenuItem value={TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES}>{TENANT_TYPES_DISPLAY.get(TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES)}</MenuItem>
                                                    <MenuItem value={TENANT_TYPE_SERVICES}>{TENANT_TYPES_DISPLAY.get(TENANT_TYPE_SERVICES)}</MenuItem>
                                                </Select>
                                            }
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>Object ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2  size={11}>
                                                    {tenant.tenantId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            copyContentToClipboard(tenant.tenantId, "Tenant ID copied to clipboard");
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>                                                                                        
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Federated OIDC Provider Constraint</div>
                                            <Select
                                                required={true}
                                                size="small"
                                                fullWidth={true}
                                                value={tenantInput.federatedAuthenticationConstraint}
                                                onChange={(evt) => { tenantInput.federatedAuthenticationConstraint = evt.target.value; setTenantInput({ ...tenantInput }); setOverviewDirty(true);}}
                                            >
                                                <MenuItem value={""}>Select...</MenuItem>
                                                <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED)}</MenuItem>
                                                <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE)}</MenuItem>
                                                <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE)}</MenuItem>
                                            </Select>
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Default Rate Limit</div>
                                            <TextField name="defaultRateLimit" id="defaultRateLimit" 
                                                disabled={tenantInput.allowUnlimitedRate === true}
                                                onChange={(evt) => {
                                                    const n = parseInt(evt.target.value); 
                                                    if(n){
                                                        tenantInput.defaultRateLimit = n;                                                         
                                                    }
                                                    else{
                                                        tenantInput.defaultRateLimit = undefined; 
                                                    }
                                                    setTenantInput({...tenantInput}); 
                                                    setOverviewDirty(true); 
                                                }}
                                                type="number"
                                                value={tenantInput.defaultRateLimit || ""} fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Default Rate Limit Period (minutes)</div>
                                            <TextField 
                                                disabled={true}                                                
                                                type="number"
                                                name="defaultRateLimitPeriodMinutes" id="defaultRateLimitPeriodMinutes"                                                 
                                                value={tenantInput.allowUnlimitedRate ? "" : DEFAULT_RATE_LIMIT_PERIOD_MINUTES} 
                                                fullWidth={true} 
                                                size="small" 
                                            />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 borderLeft={"dotted 1px lightgrey"} paddingLeft={"8px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={10}>Enabled</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.enabled}
                                                    onChange={(_, checked: boolean) => {tenantInput.enabled = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Mark for delete</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.markForDelete}
                                                    onChange={(_, checked: boolean) => {tenantInput.markForDelete = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow unlimited rate</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.allowUnlimitedRate === true}
                                                    onChange={(_, checked: boolean) => {
                                                        tenantInput.allowUnlimitedRate = checked;                                                         
                                                        if(checked){
                                                            tenantInput.defaultRateLimit = undefined;
                                                            tenantInput.defaultRateLimitPeriodMinutes = undefined;
                                                        }
                                                        else{
                                                            tenantInput.defaultRateLimitPeriodMinutes = DEFAULT_RATE_LIMIT_PERIOD_MINUTES;
                                                        }
                                                        setTenantInput({...tenantInput}); 
                                                        setOverviewDirty(true);
                                                    }}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow user self-registration</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.allowUserSelfRegistration === true}
                                                    onChange={(_, checked: boolean) => {tenantInput.allowUserSelfRegistration = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow anonymous users</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.allowAnonymousUsers === true}
                                                    onChange={(_, checked: boolean) => {tenantInput.allowAnonymousUsers = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow social login</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.allowSocialLogin === true}
                                                    onChange={(_, checked: boolean) => {tenantInput.allowSocialLogin = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Verify email on registration</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.verifyEmailOnSelfRegistration === true}
                                                    onChange={(_, checked: boolean) => {tenantInput.verifyEmailOnSelfRegistration = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Migrate legacy users</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.migrateLegacyUsers === true}
                                                    onChange={(_, checked: boolean) => {tenantInput.migrateLegacyUsers = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow login by phone number</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.allowLoginByPhoneNumber === true}
                                                    onChange={(_, checked: boolean) => {tenantInput.allowLoginByPhoneNumber = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow password recovery</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    checked={tenantInput.allowForgotPassword === true}
                                                    onChange={(_, checked: boolean) => {tenantInput.allowForgotPassword = checked; setTenantInput({...tenantInput}); setOverviewDirty(true);}}
                                                />
                                            </Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Require CAPTCHA on Registration</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                        </Grid2>
                                    </Grid2>                                    
                                </Grid2>
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setTenantInput(initInput); 
                                        setOverviewDirty(false);
                                    }}
                                    onUpdateClickedHandler={() => {
                                        performUpdate();
                                    }}
                                    markDirty={overviewDirty}
                                />
                            </Paper>
                        </Grid2>                        
                        
                        <Grid2 size={12}>
                            <Accordion defaultExpanded={true}  >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"login-failure-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <LoginIcon /><div style={{marginLeft: "8px"}}>Login Failure Configuration</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <LoginFailureConfiguration 
                                        tenantId={tenant.tenantId}
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
                        </Grid2>

                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"password-rules-configuration"}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <PasswordIcon /><div style={{marginLeft: "8px"}}>Password Rules Configuration</div>
                                    </div>                                    
                                </AccordionSummary>
                                <AccordionDetails>
                                    <PasswordRulesConfiguration
                                        tenantId={tenant.tenantId}
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
                        </Grid2>

                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"anonymous-user-configuration"}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <FaceIcon /><div style={{marginLeft: "8px"}}>Anonymous User Configuration</div>
                                    </div>
                                    
                                </AccordionSummary>
                                <AccordionDetails>
                                    <AnonymousUserConfiguration
                                        tenant={tenant}
                                        allowAnonymousUsers={tenantInput.allowAnonymousUsers}
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
                        </Grid2>

                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"legacy-user-migration-configuration"}
                                    sx={{ fontWeight: "bold"}}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <InputIcon /><div style={{marginLeft: "8px"}}>Legacy User Migration Configuration</div>
                                    </div>
                                    
                                </AccordionSummary>
                                <AccordionDetails>
                                    <LegacyUserMigrationConfiguration
                                        tenantId={tenant.tenantId}
                                        allowLegacyUserMigration={tenantInput.migrateLegacyUsers}
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
                        </Grid2>

                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"federated-oidc-providers"}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <AutoAwesomeMosaicIcon /><div style={{marginLeft: "8px"}}>Federated OIDC Providers</div>
                                    </div>
                                    
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TenantFederatedOIDCProviderConfiguration
                                        tenantId={tenant.tenantId}
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
                        </Grid2>
                        
                        <Grid2 size={12} >
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
                                    <TenantScopeConfiguration 
                                        tenantId={tenant.tenantId}
                                        tenantType={tenant.tenantType}
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
                        </Grid2>                        


                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"tenant-look-and-feel-configuration"}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <DisplaySettingsIcon /><div style={{marginLeft: "8px"}}>Tenant Look and Feel</div>
                                    </div>
                                    
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TenantLookAndFeelConfiguration
                                        tenantId={tenant.tenantId}
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
                        </Grid2>

                    </Grid2>
                </Grid2>

                <Grid2 spacing={2} size={{ xs: 12, sm: 12, md: 12, lg: 3, xl: 3 }}>
                    <Grid2 container spacing={2} size={12}>
                        <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >                            
                            <Paper elevation={3} >
                                <div className="detail-page-subheader">Tenant Management Domains</div>
                                <TenantManagementDomainConfiguration
                                    tenantId={tenant.tenantId}
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
                            </Paper>
                        </Grid2>


                        <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >                            
                            <Paper elevation={3} >
                                <div className="detail-page-subheader">Tenant Authentication Domains</div>
                                <TenantAuthenticationDomainConfiguration
                                    tenantId={tenant.tenantId}
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
                            </Paper>
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >
                            <Paper elevation={3} >                                                                
                                <ContactConfiguration
                                    contactForId={tenant.tenantId}
                                    contactForType={"tenant"}
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
                            </Paper>
                        </Grid2>

                    </Grid2>
                </Grid2>

            </Grid2>
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
                    Tenant Updated
                </Alert>
            </Snackbar>	
        </Typography >
    )
}

export default TenantDetail;