"use client";
import { TENANT_PASSWORD_CONFIG_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { PasswordConfigInput, TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import { LOGIN_FAILURE_POLICY_BACKOFF, LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK, LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT, LOGIN_FAILURE_POLICY_PAUSE, LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK, LOGIN_FAILURE_POLICY_TYPE_DISPLAY, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS } from "@/utils/consts";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { MenuItem, Select } from "@mui/material";
import { PASSWORD_CONFIGURATION_MUTATION } from "@/graphql/mutations/oidc-mutations";

export interface PasswordRulesConfigurationProps {
    tenantId: string,
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

const PasswordRulesConfiguration: React.FC<PasswordRulesConfigurationProps> = ({
    tenantId,
    onUpdateEnd,
    onUpdateStart
}) => {

    let initInput: PasswordConfigInput = {
        allowMfa: false,
        passwordHashingAlgorithm: PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS,
        passwordMaxLength: 64,
        passwordMinLength: 8,
        requireLowerCase: true,
        requireMfa: false,
        requireNumbers: true,
        requireSpecialCharacters: true,
        requireUpperCase: true,
        tenantId: tenantId,
        maxRepeatingCharacterLength: 2,
        mfaTypesAllowed: "",
        mfaTypesRequired: "",
        passwordRotationPeriodDays: 720,
        specialCharactersAllowed: ""
    }

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [passwordConfigInput, setPasswordConfigInput] = React.useState<PasswordConfigInput | null>(null);


    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error } = useQuery(TENANT_PASSWORD_CONFIG_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getLoginFailurePolicy) {
                const config: TenantPasswordConfig = data.getTenantPasswordConfig as TenantPasswordConfig;
                
            }
            setPasswordConfigInput(initInput);
        },
    });

    const [mutatePasswordConfiguration] = useMutation(PASSWORD_CONFIGURATION_MUTATION, {
        variables: {
            passwordConfigInput: setPasswordConfigInput
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message)            
        },
    }

    )

    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    if (passwordConfigInput) return (

        <>
            {/* <Grid2 container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <div>{errorMessage}</div>
                    </Grid2>
                }
                
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Login Failure Policy Type</div>
                    <Select
                        required={true}
                        size="small"
                        fullWidth={true}
                        value={failurePolicyInput.loginFailurePolicyType}
                        onChange={ (evt) => {failurePolicyInput.loginFailurePolicyType = evt.target.value; setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                    >
                        <MenuItem value={LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT}>{LOGIN_FAILURE_POLICY_TYPE_DISPLAY.get(LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT)}</MenuItem>
                        <MenuItem value={LOGIN_FAILURE_POLICY_PAUSE}>{LOGIN_FAILURE_POLICY_TYPE_DISPLAY.get(LOGIN_FAILURE_POLICY_PAUSE)}</MenuItem>
                        <MenuItem value={LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK}>{LOGIN_FAILURE_POLICY_TYPE_DISPLAY.get(LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK)}</MenuItem>
                        <MenuItem value={LOGIN_FAILURE_POLICY_BACKOFF}>{LOGIN_FAILURE_POLICY_TYPE_DISPLAY.get(LOGIN_FAILURE_POLICY_BACKOFF)}</MenuItem>
                        <MenuItem value={LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK}>{LOGIN_FAILURE_POLICY_TYPE_DISPLAY.get(LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK)}</MenuItem>
                    </Select>

                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Failure Threshold</div>
                    <TextField name="failureThreshold" id="failureThreshold" 
                        value={failurePolicyInput.failureThreshold || ""} 
                        onChange={(evt) => {failurePolicyInput.failureThreshold = parseInt(evt.target.value || "0"); setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                        fullWidth={true} size="small" 
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Pause Duration (in minutes)</div>
                    <TextField name="pauseDuration" id="pauseDuration" 
                        disabled={ ! (failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE || failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK) }
                        value={
                            ! (failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE || failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK) ?
                            "0" :
                            failurePolicyInput.pauseDurationMinutes || ""} 
                        onChange={(evt) => {failurePolicyInput.pauseDurationMinutes = parseInt(evt.target.value || "0"); setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                        fullWidth={true} size="small" 
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Number of pause cycles before locking</div>
                    <TextField name="numberOfPauseCycles" id="numberOfPauseCycles" 
                        disabled={failurePolicyInput.loginFailurePolicyType !== LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK}
                        value={
                            failurePolicyInput.loginFailurePolicyType !== LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK ?
                            "0" :
                            failurePolicyInput.numberOfPauseCyclesBeforeLocking || ""} 
                        onChange={(evt) => {failurePolicyInput.numberOfPauseCyclesBeforeLocking = parseInt(evt.target.value || "0"); setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                        fullWidth={true} size="small" />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Initial backoff duration (in minutes)</div>
                    <TextField name="tenantType" id="tenantType" 
                        disabled={ ! (failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_BACKOFF || failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK) }
                        value={
                            ! (failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_BACKOFF || failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK) ?
                            "0" :
                            failurePolicyInput.initBackoffDurationMinutes || ""} 
                        onChange={(evt) => {failurePolicyInput.initBackoffDurationMinutes = parseInt(evt.target.value || "0"); setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                        fullWidth={true} size="small" 
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Number of backoff cycles before locking</div>
                    <TextField name="tenantType" id="tenantType"
                        disabled={failurePolicyInput.loginFailurePolicyType !== LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK}                
                        value={
                            failurePolicyInput.loginFailurePolicyType !== LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK ?
                            "0" :
                            failurePolicyInput.numberOfBackoffCyclesBeforeLocking || ""} 
                        onChange={(evt) => {failurePolicyInput.numberOfBackoffCyclesBeforeLocking = parseInt(evt.target.value || "0"); setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                        fullWidth={true} size="small" 
                    />
                </Grid2>
            </Grid2>
            <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                <Button 
                    disabled={!markDirty}
                    onClick={() => {onUpdateStart(); mutatePasswordConfiguration()}}
                    sx={{ border: "solid 1px lightgrey", borderRadius: "4px" }} >Update</Button>
            </Stack> */}
        </>
        
    )

}

export default PasswordRulesConfiguration