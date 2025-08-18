"use client";
import { LOGIN_FAILURE_CONFIGURATION_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { TenantLoginFailurePolicy, TenantLoginFailurePolicyInput } from "@/graphql/generated/graphql-types";
import { DEFAULT_LOGIN_FAILURE_LOCK_THRESHOLD, DEFAULT_LOGIN_PAUSE_TIME_MINUTES, DEFAULT_MAXIMUM_LOGIN_FAILURES, LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT, LOGIN_FAILURE_POLICY_PAUSE, LOGIN_FAILURE_POLICY_TYPE_DISPLAY } from "@/utils/consts";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import { MenuItem, Select } from "@mui/material";
import { LOGIN_FAILURE_POLICY_CONFIGURATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";

export interface LoginFailureConfigurationProps {
    tenantId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const LoginFailureConfiguration: React.FC<LoginFailureConfigurationProps> = ({
    tenantId,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {

    const initInput: TenantLoginFailurePolicyInput = {
        failureThreshold: DEFAULT_LOGIN_FAILURE_LOCK_THRESHOLD,
        loginFailurePolicyType: LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT,
        tenantId: tenantId,
        pauseDurationMinutes: 0,
        maximumLoginFailures: 0
    }

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [failurePolicyInput, setFailurePolicyInput] = React.useState<TenantLoginFailurePolicyInput | null>(null);
    const [revertToPolicyInput, setRevertToPolicyInput] = React.useState<TenantLoginFailurePolicyInput | null>(null);


    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error } = useQuery(LOGIN_FAILURE_CONFIGURATION_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getTenantLoginFailurePolicy) {
                const policy: TenantLoginFailurePolicy = data.getTenantLoginFailurePolicy as TenantLoginFailurePolicy;
                initInput.failureThreshold = policy.failureThreshold;
                initInput.loginFailurePolicyType = policy.loginFailurePolicyType;                
                initInput.pauseDurationMinutes = policy.pauseDurationMinutes;
                initInput.maximumLoginFailures = policy.maximumLoginFailures;
            }
            setFailurePolicyInput(initInput);
            setRevertToPolicyInput(initInput);
        },
    });

    const [mutateLoginFailureConfiguration] = useMutation(LOGIN_FAILURE_POLICY_CONFIGURATION_MUTATION, {
        variables: {
            tenantLoginFailurePolicyInput: failurePolicyInput
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
        },
        onError(error) {
            onUpdateEnd(false);
            setFailurePolicyInput(revertToPolicyInput);
            setErrorMessage(error.message)
        },
    }

    )

    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    if (failurePolicyInput) return (
        <>
            <Grid2 container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <div>{errorMessage}</div>
                    </Grid2>
                }
                
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Login Failure Policy Type</div>
                    <Select
                        disabled={readOnly}
                        required={true}
                        size="small"
                        fullWidth={true}
                        value={failurePolicyInput.loginFailurePolicyType}
                        onChange={ (evt) => {
                            failurePolicyInput.loginFailurePolicyType = evt.target.value;
                            if(evt.target.value === LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT){
                                failurePolicyInput.maximumLoginFailures = null;
                                failurePolicyInput.pauseDurationMinutes = null;
                            }
                            else{
                                failurePolicyInput.maximumLoginFailures = DEFAULT_MAXIMUM_LOGIN_FAILURES;
                                failurePolicyInput.pauseDurationMinutes = DEFAULT_LOGIN_PAUSE_TIME_MINUTES;
                            }
                            setFailurePolicyInput({...failurePolicyInput}); 
                            setMarkDirty(true);}}
                    >
                        <MenuItem value={LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT}>{LOGIN_FAILURE_POLICY_TYPE_DISPLAY.get(LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT)}</MenuItem>
                        <MenuItem value={LOGIN_FAILURE_POLICY_PAUSE}>{LOGIN_FAILURE_POLICY_TYPE_DISPLAY.get(LOGIN_FAILURE_POLICY_PAUSE)}</MenuItem>
                    </Select>

                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Failure Threshold</div>
                    <TextField name="failureThreshold" id="failureThreshold" 
                        disabled={readOnly}
                        value={failurePolicyInput.failureThreshold || ""} 
                        onChange={(evt) => {failurePolicyInput.failureThreshold = parseInt(evt.target.value || "0"); setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                        fullWidth={true} size="small" 
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Pause Duration (in minutes)</div>
                    <TextField name="pauseDuration" id="pauseDuration" 
                        disabled={readOnly || ! (failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE) }
                        value={
                            ! (failurePolicyInput.loginFailurePolicyType === LOGIN_FAILURE_POLICY_PAUSE) ?
                            "" :
                            failurePolicyInput.pauseDurationMinutes || ""} 
                        onChange={(evt) => {failurePolicyInput.pauseDurationMinutes = parseInt(evt.target.value || "0"); setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                        fullWidth={true} size="small" 
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Maximum Login Failures</div>
                    <TextField name="maximumLoginFailures" id="maximumLoginFailures" 
                        disabled={readOnly || failurePolicyInput.loginFailurePolicyType !== LOGIN_FAILURE_POLICY_PAUSE}
                        value={
                            failurePolicyInput.loginFailurePolicyType !== LOGIN_FAILURE_POLICY_PAUSE ?
                            "" :
                            failurePolicyInput.maximumLoginFailures || DEFAULT_MAXIMUM_LOGIN_FAILURES} 
                        onChange={(evt) => {failurePolicyInput.maximumLoginFailures = parseInt(evt.target.value || "0"); setFailurePolicyInput({...failurePolicyInput}); setMarkDirty(true);}}
                        fullWidth={true} size="small" />
                </Grid2>                
            </Grid2>
            <DetailSectionActionHandler
                onDiscardClickedHandler={() => {   
                    setFailurePolicyInput(initInput);
                    setRevertToPolicyInput(initInput);                                     
                    setMarkDirty(false);
                }}
                onUpdateClickedHandler={() => {
                    onUpdateStart(); 
                    mutateLoginFailureConfiguration();
                }}
                markDirty={markDirty}
            />
        </>
    )

}

export default LoginFailureConfiguration