"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { TenantCreateInput } from "@/graphql/generated/graphql-types";
import { FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE, TENANT_TYPE_ROOT_TENANT, TENANT_TYPES_DISPLAY } from "@/utils/consts";
import Checkbox from "@mui/material/Checkbox";


const RootTenantConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onNext,
    systemInitInput

}) => {

    // STATE VARIABLES
    const initInput: TenantCreateInput = {
        allowAnonymousUsers: false,
        allowForgotPassword: systemInitInput.rootTenantInput.allowForgotPassword,
        allowLoginByPhoneNumber: false,
        allowSocialLogin: false,
        allowUnlimitedRate: true,
        allowUserSelfRegistration: systemInitInput.rootTenantInput.allowUserSelfRegistration,
        enabled: true,
        federatedAuthenticationConstraint: FEDERATED_AUTHN_CONSTRAINT_PERMISSIVE,
        migrateLegacyUsers: false,
        tenantId: "",
        tenantName: systemInitInput.rootTenantInput.tenantName,
        tenantType: TENANT_TYPE_ROOT_TENANT,
        verifyEmailOnSelfRegistration: systemInitInput.rootTenantInput.verifyEmailOnSelfRegistration,
        registrationRequireCaptcha: false,
        registrationRequireTermsAndConditions: false,
        tenantDescription: systemInitInput.rootTenantInput.tenantDescription
    };
    const [tenantInput, setTenantInput] = React.useState<TenantCreateInput>(initInput);

    // HELPER FUNCTIONS
    const inputIsValid = (): boolean => {
        let bRetVal = true;
        if (tenantInput.tenantName.length < 4) {
            bRetVal = false;
        }
        if (!tenantInput.tenantDescription || tenantInput.tenantDescription?.length < 4) {
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
                        Configure the Root Tenant
                    </Grid2>
                    <Grid2 marginBottom={"16px"}>
                        <div>Tenant Name (Should include your organization name and environment. Example: MyOrg PROD Root Tenant)</div>
                        <TextField name="tenantName" id="tenantName" onChange={(evt) => { tenantInput.tenantName = evt?.target.value; setTenantInput({ ...tenantInput }) }} value={tenantInput.tenantName} fullWidth={true} size="small" />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} size={12}>
                        <div>Tenant Descripton</div>
                        <TextField
                            name="tenantDescription" id="tenantDescription"
                            value={tenantInput.tenantDescription} fullWidth={true} size="small" multiline={true} rows={2}
                            onChange={(evt) => { tenantInput.tenantDescription = evt?.target.value; setTenantInput({ ...tenantInput }) }}
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} size={12}>
                        <div>Tenant Type</div>
                        <TextField fullWidth={true} size="small" disabled={true} value={TENANT_TYPES_DISPLAY.get(TENANT_TYPE_ROOT_TENANT)} />
                    </Grid2>

                    <Grid2 container size={12}>
                        <Grid2 alignContent={"center"} size={11}>Allow user self-registration</Grid2>
                        <Grid2 size={1}>
                            <Checkbox
                                checked={tenantInput.allowUserSelfRegistration === true}
                                onChange={(_, checked: boolean) => { tenantInput.allowUserSelfRegistration = checked; setTenantInput({ ...tenantInput }) }}
                            />
                        </Grid2>
                        <Grid2 alignContent={"center"} size={11}>Verify email on registration</Grid2>
                        <Grid2 size={1}>
                            <Checkbox
                                checked={tenantInput.verifyEmailOnSelfRegistration === true}
                                onChange={(_, checked: boolean) => { tenantInput.verifyEmailOnSelfRegistration = checked; setTenantInput({ ...tenantInput }) }}
                            />
                        </Grid2>
                        <Grid2 alignContent={"center"} size={11}>Allow password recovery</Grid2>
                        <Grid2 size={1}>
                            <Checkbox
                                checked={tenantInput.allowForgotPassword === true}
                                onChange={(_, checked: boolean) => { tenantInput.allowForgotPassword = checked; setTenantInput({ ...tenantInput }) }}
                            />
                        </Grid2>
                    </Grid2>
                </Grid2>
                <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                    <Button
                        onClick={() => {
                            systemInitInput.rootTenantInput = tenantInput;
                            onNext(systemInitInput);
                        }}
                        disabled={!inputIsValid()}
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

export default RootTenantConfiguration;