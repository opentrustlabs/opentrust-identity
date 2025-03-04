"use client";
import { TenantCreateInput } from "@/graphql/generated/graphql-types";
import { TENANT_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { FEDERATED_AUTHN_CONSTRAINT_DISPLAY, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED, FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, TENANT_TYPE_IDENTITY_MANAGEMENT, TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES, TENANT_TYPE_SERVICES, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { Alert, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';


export interface NewTenantDialogProps {
    onCancel: () => void
    onClose: () => void
}

const NewTenantDialog: React.FC<NewTenantDialogProps> = ({
    onCancel,
    onClose
}) => {



    const initInput: TenantCreateInput = {
        allowAnonymousUsers: false,
        allowForgotPassword: false,
        allowLoginByPhoneNumber: false,
        allowSocialLogin: false,
        allowUnlimitedRate: false,
        allowUserSelfRegistration: false,
        claimsSupported: [],
        enabled: true,
        federatedAuthenticationConstraint: "",
        migrateLegacyUsers: false,
        tenantId: "",
        tenantName: "",
        tenantType: "",
        verifyEmailOnSelfRegistration: false
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

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
                router.push(`${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${data.createTenant.tenantId}`);
                onClose();
            },
            onError(error) {
                setErrorMessage(error.message)
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
                                <Grid2 alignContent={"center"} size={10}>Allow unlimited rate</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={tenantInput.allowUnlimitedRate === true}
                                        onChange={(_, checked: boolean) => {tenantInput.allowUnlimitedRate = checked; setTenantInput({...tenantInput})}}
                                    />
                                </Grid2>
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Default Rate Limit</div>
                                <TextField name="defaultRateLimit" id="defaultRateLimit" 
                                    onChange={(evt) => {const n = parseInt(evt.target.value); if(n){tenantInput.defaultRateLimit = n; setTenantInput({...tenantInput})}}}
                                    value={tenantInput.defaultRateLimit} fullWidth={true} size="small" 
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Default Rate Limit Period (minutes)</div>
                                <TextField 
                                    onChange={(evt) => {const n = parseInt(evt.target.value); if(n){tenantInput.defaultRateLimitPeriodMinutes = n; setTenantInput({...tenantInput})}}}
                                    name="defaultRateLimitPeriodMinutes" id="defaultRateLimitPeriodMinutes" 
                                    value={tenantInput.defaultRateLimitPeriodMinutes} fullWidth={true} size="small" 
                                />
                            </Grid2>

                            <Grid2 container size={12}>
                                <Grid2 alignContent={"center"} size={10}>Allow user self-registration</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={tenantInput.allowUserSelfRegistration === true}
                                        onChange={(_, checked: boolean) => {tenantInput.allowUserSelfRegistration = checked; setTenantInput({...tenantInput})}}
                                    />
                                </Grid2>
                                <Grid2 alignContent={"center"} size={10}>Allow anonymous users</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={tenantInput.allowAnonymousUsers === true}
                                        onChange={(_, checked: boolean) => {tenantInput.allowAnonymousUsers = checked; setTenantInput({...tenantInput})}}
                                    />
                                </Grid2>
                                <Grid2 alignContent={"center"} size={10}>Allow social login</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={tenantInput.allowSocialLogin === true}
                                        onChange={(_, checked: boolean) => {tenantInput.allowSocialLogin = checked; setTenantInput({...tenantInput})}}
                                    />
                                </Grid2>
                                <Grid2 alignContent={"center"} size={10}>Verify email on registration</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={tenantInput.verifyEmailOnSelfRegistration === true}
                                        onChange={(_, checked: boolean) => {tenantInput.verifyEmailOnSelfRegistration = checked; setTenantInput({...tenantInput})}}
                                    />
                                </Grid2>
                                <Grid2 alignContent={"center"} size={10}>Migrate legacy users</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={tenantInput.migrateLegacyUsers === true}
                                        onChange={(_, checked: boolean) => {tenantInput.migrateLegacyUsers = checked; setTenantInput({...tenantInput})}}
                                    />
                                </Grid2>
                                <Grid2 alignContent={"center"} size={10}>Allow login by phone number</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={tenantInput.allowLoginByPhoneNumber === true}
                                        onChange={(_, checked: boolean) => {tenantInput.allowLoginByPhoneNumber = checked; setTenantInput({...tenantInput})}}
                                    />
                                </Grid2>
                                <Grid2 alignContent={"center"} size={10}>Allow password recovery</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={tenantInput.allowForgotPassword === true}
                                        onChange={(_, checked: boolean) => {tenantInput.allowForgotPassword = checked; setTenantInput({...tenantInput})}}
                                    />
                                </Grid2>
                                <Grid2 alignContent={"center"} size={10}>Require CAPTCHA on Registration</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    </Grid2>

                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {onCancel(); setTenantInput(initInput);}}>Cancel</Button>
                <Button 
                    onClick={() => createTenantMutation()}
                    disabled={tenantInput.tenantName === null || tenantInput.tenantName === "" || tenantInput.tenantType === null  || tenantInput.tenantType === ""}
                >
                    Finish
                </Button>
            </DialogActions>
        </>
    )
}

export default NewTenantDialog;