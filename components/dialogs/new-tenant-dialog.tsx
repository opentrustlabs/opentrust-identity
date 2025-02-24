"use client";
import { TenantCreateInput } from "@/graphql/generated/graphql-types";
import { FEDERATED_AUTHN_CONSTRAINT_DISPLAY, FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE, FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED, FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, TENANT_TYPE_IDENTITY_MANAGEMENT, TENANT_TYPE_IDENTITY_MANAGEMENT_AND_SERVICES, TENANT_TYPE_SERVICES, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import { Checkbox, Grid2, MenuItem, Select, TextField, Typography } from "@mui/material";
import React from "react";



export interface NewTenantDialogProps {
    enableFinish: () => boolean,
    onSuccess: (tenantId: string) => void
}

const NewTenantDialog: React.FC<NewTenantDialogProps> = ({
    enableFinish,
    onSuccess
}) => {

/* 
input TenantCreateInput {
    tenantId: String!
    tenantName: String!
    tenantDescription: String
    enabled: Boolean!
    claimsSupported: [String!]!
    allowUnlimitedRate: Boolean!
    allowUserSelfRegistration: Boolean!
    allowAnonymousUsers: Boolean!
    verifyEmailOnSelfRegistration: Boolean!
    allowSocialLogin: Boolean!
    federatedAuthenticationConstraint: String!    
    tenantType: String!
    contactInput: [ContactInput!]!
    passwordConfigInput: PasswordConfigInput
    anonymousUserConfigInput: AnonymousUserConfigInput
    migrateLegacyUsers: Boolean!
    allowLoginByPhoneNumber: Boolean!
    allowForgotPassword: Boolean!
    defaultRateLimit: Int
    defaultRateLimitPeriodMinutes: Int
}
*/
    const initInput: TenantCreateInput = {
        allowAnonymousUsers: false,
        allowForgotPassword: false,
        allowLoginByPhoneNumber: false,
        allowSocialLogin: false,
        allowUnlimitedRate: false,
        allowUserSelfRegistration: false,
        claimsSupported: [],
        contactInput: [],
        enabled: true,
        federatedAuthenticationConstraint: "",
        migrateLegacyUsers: false,
        tenantId: "",
        tenantName: "",
        tenantType: "",
        verifyEmailOnSelfRegistration: false
    }

    // STATE VARIABLES
    const [name, setName] = React.useState<string | null>(null);
    const [description, setDescription] = React.useState<string | null>(null);
    const [type, setType] = React.useState<string | null>(null);
    const [tenantInput, setTenantInput] = React.useState<TenantCreateInput>(initInput);

    return (
        <Typography component={"div"}>
            <Grid2 container size={12} spacing={3} marginBottom={"16px"} >

                                    <Grid2 size={12}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Name</div>
                                            <TextField name="tenantName" id="tenantName" onChange={(evt) => {tenantInput.tenantName = evt?.target.value; setTenantInput({...tenantInput}) }} value={tenantInput.tenantName} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Descripton</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={tenantInput.tenantDescription} fullWidth={true} size="small" multiline={true} rows={2} />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Type</div>
                                            <Select 
                                                size="small"
                                                fullWidth={true}
                                                value={tenantInput.tenantType} 
                                                onChange={(evt) => {tenantInput.tenantType = evt.target.value; setTenantInput({...tenantInput});}}
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
                                                onChange={(evt) => {tenantInput.federatedAuthenticationConstraint = evt.target.value; setTenantInput({...tenantInput});}}
                                            >
                                                <MenuItem value="">Select...</MenuItem>
                                                <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_NOT_ALLOWED)}</MenuItem>
                                                <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_EXCLUSIVE)}</MenuItem>
                                                <MenuItem value={FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE}>{FEDERATED_AUTHN_CONSTRAINT_DISPLAY.get(FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE)}</MenuItem>
                                            </Select>                                            
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={10}>Allow unlimited rate</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Default Rate Limit</div>
                                            <TextField name="defaultRateLimit" id="defaultRateLimit" value={tenantInput.defaultRateLimit} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Default Rate Limit Period (minutes)</div>
                                            <TextField name="defaultRateLimitPeriodMinutes" id="defaultRateLimitPeriodMinutes" value={tenantInput.defaultRateLimitPeriodMinutes} fullWidth={true} size="small" />
                                        </Grid2>
                                        
                                        <Grid2  container size={12}>
                                            <Grid2 alignContent={"center"} size={10}>Allow user self-registration</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow anonymous users</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow social login</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Verify email on registration</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Migrate legacy users</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow login by phone number</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow password recovery</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Require CAPTCHA on Registration</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                        </Grid2>
                                    </Grid2>                                    
                                </Grid2>                            
                        
        </Typography>
    )
}

export default NewTenantDialog;