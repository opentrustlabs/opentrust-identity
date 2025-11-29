"use client";
import { TenantCreateInput } from "@/graphql/generated/graphql-types";
import { TENANT_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { DEFAULT_RATE_LIMIT_PERIOD_MINUTES, FEDERATED_AUTHN_CONSTRAINT_DISPLAY, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED, FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, TENANT_TYPE_IDENTITY_MANAGEMENT, TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES, TENANT_TYPE_SERVICES, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { Alert, Button, FormControlLabel, Switch, DialogActions, DialogContent, DialogTitle, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';
import { useIntl } from 'react-intl';



export interface NewTenantDialogProps {
    onCancel: () => void,
    onClose: () => void,
    onCreateStart: () => void,
    onCreateEnd: (success: boolean) => void
}

const NewTenantDialog: React.FC<NewTenantDialogProps> = ({
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {


    const initInput: TenantCreateInput = {
        allowAnonymousUsers: false,
        allowForgotPassword: false,
        allowLoginByPhoneNumber: false,
        allowSocialLogin: false,
        allowUnlimitedRate: false,
        allowUserSelfRegistration: false,
        enabled: true,
        federatedAuthenticationConstraint: "",
        migrateLegacyUsers: false,
        tenantId: "",
        tenantName: "",
        tenantType: "",
        verifyEmailOnSelfRegistration: false,
        registrationRequireCaptcha: false,
        registrationRequireTermsAndConditions: false
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const intl = useIntl();


    // STATE VARIABLES    
    const [tenantInput, setTenantInput] = React.useState<TenantCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

    // GRAPHQL FUNCTIONS
    const [createTenantMutation] = useMutation(
        TENANT_CREATE_MUTATION,
        {
            variables: {
                tenantInput: tenantInput
            },
            onCompleted(data) {
                onCreateEnd(true);
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${data.createTenant.tenantId}`);
                onClose();
            },
            onError(error) {
                setErrorMessage(intl.formatMessage({id: error.message}));
                onCreateEnd(false);
            },
        }
    );

    return (
        <>
            <DialogTitle>New Tenant</DialogTitle>
            <DialogContent>
                <Typography component={"div"}>
                    <Grid2 container size={12} spacing={3} marginBottom={"16px"} >
                        <Grid2 size={12}>
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
                            <Grid2 marginBottom={"16px"}>
                                <div>Tenant Name</div>
                                <TextField name="tenantName" id="tenantName" onChange={(evt) => { tenantInput.tenantName = evt?.target.value; setTenantInput({ ...tenantInput }) }} value={tenantInput.tenantName} fullWidth={true} size="small" />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Tenant Descripton</div>
                                <TextField  
                                    name="tenantDescription" id="tenantDescription" 
                                    value={tenantInput.tenantDescription} fullWidth={true} size="small" multiline={true} rows={2} 
                                    onChange={(evt) => { tenantInput.tenantDescription = evt?.target.value; setTenantInput({ ...tenantInput }) }}
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Tenant Type</div>
                                <Select
                                    size="small"
                                    fullWidth={true}
                                    value={tenantInput.tenantType}
                                    onChange={(evt) => { tenantInput.tenantType = evt.target.value; setTenantInput({ ...tenantInput }); }}
                                >
                                    <MenuItem value="">Select...</MenuItem>
                                    <MenuItem value={TENANT_TYPE_IDENTITY_MANAGEMENT}>{TENANT_TYPES_DISPLAY.get(TENANT_TYPE_IDENTITY_MANAGEMENT)}</MenuItem>
                                    <MenuItem value={TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES}>{TENANT_TYPES_DISPLAY.get(TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES)}</MenuItem>
                                    <MenuItem value={TENANT_TYPE_SERVICES}>{TENANT_TYPES_DISPLAY.get(TENANT_TYPE_SERVICES)}</MenuItem>
                                </Select>

                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Federated OIDC Provider Constraint</div>
                                <Select
                                    required={true}
                                    size="small"
                                    fullWidth={true}
                                    value={tenantInput.federatedAuthenticationConstraint}
                                    onChange={(evt) => { tenantInput.federatedAuthenticationConstraint = evt.target.value; setTenantInput({ ...tenantInput }); }}
                                >
                                    <MenuItem value={""}>Select...</MenuItem>
                                    <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED)}</MenuItem>
                                    <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE)}</MenuItem>
                                    <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE)}</MenuItem>
                                </Select>
                            </Grid2>
                            <Grid2 marginBottom={"16px"} container size={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={tenantInput.allowUnlimitedRate === true}
                                            onChange={(_, checked: boolean) => {
                                                tenantInput.allowUnlimitedRate = checked; 
                                                // if checked, clear out the rate limit and the default rate limit period values too
                                                if(checked){
                                                    tenantInput.defaultRateLimit = 0;
                                                    tenantInput.defaultRateLimitPeriodMinutes = 0;
                                                }
                                                else{
                                                    tenantInput.defaultRateLimitPeriodMinutes = DEFAULT_RATE_LIMIT_PERIOD_MINUTES;
                                                }
                                                setTenantInput({...tenantInput});
                                            }}
                                        />
                                    }
                                    label="Allow unlimited rate"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                />  
                                
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Default Rate Limit</div>
                                <TextField name="defaultRateLimit" id="defaultRateLimit" 
                                    type="number"
                                    onChange={(evt) => {const n = parseInt(evt.target.value); if(n){tenantInput.defaultRateLimit = n; setTenantInput({...tenantInput})}}}
                                    value={tenantInput.defaultRateLimit ? tenantInput.defaultRateLimit : ""} fullWidth={true} size="small" 
                                    disabled={tenantInput.allowUnlimitedRate === true}
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Default Rate Limit Period (minutes)</div>
                                <TextField 
                                    disabled={true}
                                    type="number"
                                    name="defaultRateLimitPeriodMinutes" id="defaultRateLimitPeriodMinutes" 
                                    value={tenantInput.defaultRateLimitPeriodMinutes ? tenantInput.defaultRateLimitPeriodMinutes : "" } fullWidth={true} size="small"                                     
                                />
                            </Grid2>

                            <Stack spacing={1}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="allowUserSelfRegistration"
                                            checked={tenantInput.allowUserSelfRegistration === true}
                                            onChange={(_, checked: boolean) => {tenantInput.allowUserSelfRegistration = checked; setTenantInput({...tenantInput})}}
                                        />
                                    }
                                    label="Allow user self-registration"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                />  
                                
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="allowAnonymousUsers"
                                            checked={tenantInput.allowAnonymousUsers === true}
                                            onChange={(_, checked: boolean) => {tenantInput.allowAnonymousUsers = checked; setTenantInput({...tenantInput})}}
                                        />
                                    }
                                    label="Allow anonymous users"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                /> 
                                                                
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="allowSocialLogin"
                                            checked={tenantInput.allowSocialLogin === true}
                                            onChange={(_, checked: boolean) => {tenantInput.allowSocialLogin = checked; setTenantInput({...tenantInput})}}
                                        />
                                    }
                                    label="Allow social login"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="verifyEmailOnSelfRegistration"
                                            checked={tenantInput.verifyEmailOnSelfRegistration === true}
                                            onChange={(_, checked: boolean) => {tenantInput.verifyEmailOnSelfRegistration = checked; setTenantInput({...tenantInput})}}
                                        />
                                    }
                                    label="Verify email on registration"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                />
                                
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="migrateLegacyUsers"
                                            checked={tenantInput.migrateLegacyUsers === true}
                                            onChange={(_, checked: boolean) => {tenantInput.migrateLegacyUsers = checked; setTenantInput({...tenantInput})}}
                                        />
                                    }
                                    label="Migrate legacy users"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="allowLoginByPhoneNumber"
                                            checked={tenantInput.allowLoginByPhoneNumber === true}
                                            onChange={(_, checked: boolean) => {tenantInput.allowLoginByPhoneNumber = checked; setTenantInput({...tenantInput})}}
                                        />
                                    }
                                    label="Allow login by phone number"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="allowForgotPassword"
                                            checked={tenantInput.allowForgotPassword === true}
                                            onChange={(_, checked: boolean) => {tenantInput.allowForgotPassword = checked; setTenantInput({...tenantInput})}}
                                        />
                                    }
                                    label="Allow password recovery"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="registrationRequireCaptcha"
                                            checked={tenantInput.registrationRequireCaptcha === true}
                                            onChange={(_, checked: boolean) => {tenantInput.registrationRequireCaptcha = checked; setTenantInput({...tenantInput})}}
                                        />
                                    }
                                    label="Require CAPTCHA on Registration"
                                    sx={{ margin: "4px", fontSize: "1.1em", justifyContent: 'space-between', width: '100%' }}
                                    labelPlacement="start"
                                />

                            </Stack>
                        </Grid2>
                    </Grid2>

                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {onCancel(); setTenantInput(initInput);}}>Cancel</Button>
                <Button 
                    onClick={() => {onCreateStart(); createTenantMutation();}}
                    disabled={tenantInput.tenantName === null || tenantInput.tenantName === "" || tenantInput.tenantType === null  || tenantInput.tenantType === ""}
                >
                    Finish
                </Button>
            </DialogActions>
        </>
    )
}

export default NewTenantDialog;