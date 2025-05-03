"use client";
import { TENANT_PASSWORD_CONFIG_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { PasswordConfigInput, TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import { DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED, LOGIN_FAILURE_POLICY_BACKOFF, LOGIN_FAILURE_POLICY_BACKOFF_THEN_LOCK, LOGIN_FAILURE_POLICY_LOCK_USER_ACCOUNT, LOGIN_FAILURE_POLICY_PAUSE, LOGIN_FAILURE_POLICY_PAUSE_THEN_LOCK, LOGIN_FAILURE_POLICY_TYPE_DISPLAY, MFA_AUTH_TYPE_DISPLAY, MFA_AUTH_TYPE_EMAIL, MFA_AUTH_TYPE_FIDO2, MFA_AUTH_TYPE_SMS, MFA_AUTH_TYPE_TIME_BASED_OTP, PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS, PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS, PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS, PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS, PASSWORD_HASHING_ALGORITHMS_DISPLAY } from "@/utils/consts";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Alert, Autocomplete, AutocompleteRenderInputParams, Checkbox, Divider, MenuItem, Select } from "@mui/material";
import { PASSWORD_CONFIGURATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";

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
        passwordHistoryPeriod: 0,
        passwordRotationPeriodDays: 0,
        specialCharactersAllowed: DEFAULT_PASSWORD_SPECIAL_CHARACTERS_ALLOWED
    }

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [passwordConfigInput, setPasswordConfigInput] = React.useState<PasswordConfigInput | null>(null);
    const [revertToInput, setRevertToInput] = React.useState<PasswordConfigInput | null>(null);


    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error } = useQuery(TENANT_PASSWORD_CONFIG_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getTenantPasswordConfig) {
                const config: TenantPasswordConfig = data.getTenantPasswordConfig as TenantPasswordConfig;
                initInput.allowMfa = config.allowMfa;
                initInput.maxRepeatingCharacterLength = config.maxRepeatingCharacterLength;
                initInput.mfaTypesAllowed = config.mfaTypesAllowed;
                initInput.mfaTypesRequired = config.mfaTypesRequired;
                initInput.passwordHashingAlgorithm = config.passwordHashingAlgorithm;
                initInput.passwordMaxLength = config.passwordMaxLength;
                initInput.passwordMinLength = config.passwordMinLength;
                initInput.passwordRotationPeriodDays = config.passwordRotationPeriodDays;
                initInput.requireLowerCase = config.requireLowerCase;
                initInput.requireMfa = config.requireMfa;
                initInput.requireNumbers = config.requireNumbers;
                initInput.requireSpecialCharacters = config.requireSpecialCharacters;
                initInput.requireUpperCase = config.requireUpperCase;
                initInput.specialCharactersAllowed = config.specialCharactersAllowed;
                initInput.tenantId = tenantId;
                initInput.passwordHistoryPeriod = config.passwordHistoryPeriod;
            }
            setPasswordConfigInput(initInput);
            setRevertToInput(initInput)
        },
    });

    const [mutatePasswordConfiguration] = useMutation(PASSWORD_CONFIGURATION_MUTATION, {
        variables: {
            passwordConfigInput: passwordConfigInput
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
        },
        onError(error) {
            onUpdateEnd(false);
            setPasswordConfigInput(revertToInput);
            setErrorMessage(error.message)
        },
    }

    )

    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    if (passwordConfigInput) return (

        <>
            <Grid2 container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                    </Grid2>
                }
                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <Grid2 marginBottom={"16px"}>
                        <div>Password Minimum Length</div>
                        <TextField name="passwordMinLength" id="passwordMinLength"
                            value={passwordConfigInput.passwordMinLength > 0 ? passwordConfigInput.passwordMinLength : ""}
                            onChange={(evt) => { passwordConfigInput.passwordMinLength = parseInt(evt.target.value || "0"); setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Password Maximum Length</div>
                        <TextField name="passwordMaxLength" id="passwordMaxLength"
                            value={passwordConfigInput.passwordMaxLength > 0 ? passwordConfigInput.passwordMaxLength : ""}
                            onChange={(evt) => { passwordConfigInput.passwordMaxLength = parseInt(evt.target.value || "0"); setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Maximum Consecutive Length Of Identical Characters</div>
                        <TextField name="maxConsecutiveRepeatingChars" id="maxConsecutiveRepeatingChars"
                            value={passwordConfigInput.maxRepeatingCharacterLength && passwordConfigInput.maxRepeatingCharacterLength > 0 ? passwordConfigInput.maxRepeatingCharacterLength : ""}
                            onChange={(evt) => { passwordConfigInput.maxRepeatingCharacterLength = parseInt(evt.target.value || "0"); setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Password History Period</div>
                        <TextField name="passwordHistoryPeriod" id="passwordHistoryPeriod"
                            value={passwordConfigInput.passwordHistoryPeriod && passwordConfigInput.passwordHistoryPeriod > 0 ? passwordConfigInput.passwordHistoryPeriod : ""}
                            onChange={(evt) => { passwordConfigInput.passwordHistoryPeriod = parseInt(evt.target.value || "0"); setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Change Password Period (days)</div>
                        <TextField name="passwordRotationPeriodDays" id="passwordRotationPeriodDays"
                            value={passwordConfigInput.passwordRotationPeriodDays && passwordConfigInput.passwordRotationPeriodDays > 0 ? passwordConfigInput.passwordRotationPeriodDays : ""}
                            onChange={(evt) => { passwordConfigInput.passwordRotationPeriodDays = parseInt(evt.target.value || "0"); setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Password Hashing Algorithm</div>
                        <Select
                            required={true}
                            size="small"
                            fullWidth={true}
                            value={passwordConfigInput.passwordHashingAlgorithm}
                            onChange={(evt) => { passwordConfigInput.passwordHashingAlgorithm = evt.target.value; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                        >
                            <MenuItem value={PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS}>{PASSWORD_HASHING_ALGORITHMS_DISPLAY.get(PASSWORD_HASHING_ALGORITHM_SHA_256_64K_ITERATIONS)}</MenuItem>
                            <MenuItem value={PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS}>{PASSWORD_HASHING_ALGORITHMS_DISPLAY.get(PASSWORD_HASHING_ALGORITHM_SHA_256_128K_ITERATIONS)}</MenuItem>
                            <MenuItem value={PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS}>{PASSWORD_HASHING_ALGORITHMS_DISPLAY.get(PASSWORD_HASHING_ALGORITHM_BCRYPT_10_ROUNDS)}</MenuItem>
                            <MenuItem value={PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS}>{PASSWORD_HASHING_ALGORITHMS_DISPLAY.get(PASSWORD_HASHING_ALGORITHM_BCRYPT_11_ROUNDS)}</MenuItem>
                            <MenuItem value={PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS}>{PASSWORD_HASHING_ALGORITHMS_DISPLAY.get(PASSWORD_HASHING_ALGORITHM_BCRYPT_12_ROUNDS)}</MenuItem>
                            <MenuItem value={PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS}>{PASSWORD_HASHING_ALGORITHMS_DISPLAY.get(PASSWORD_HASHING_ALGORITHM_PBKDF2_128K_ITERATIONS)}</MenuItem>
                            <MenuItem value={PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS}>{PASSWORD_HASHING_ALGORITHMS_DISPLAY.get(PASSWORD_HASHING_ALGORITHM_PBKDF2_256K_ITERATIONS)}</MenuItem>
                        </Select>
                    </Grid2>
                </Grid2>

                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <Grid2 borderLeft={"dotted 1px lightgrey"} paddingLeft={"8px"} container size={12}>
                        <Grid2 alignContent={"center"} size={10}>
                            Require Uppercase
                        </Grid2>
                        <Grid2 size={2}>
                            <Checkbox
                                checked={passwordConfigInput.requireUpperCase === true}
                                onChange={(_, checked: boolean) => { passwordConfigInput.requireUpperCase = checked; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            />
                        </Grid2>

                        <Grid2 alignContent={"center"} size={10}>
                            Require Lowercase
                        </Grid2>
                        <Grid2 size={2}>
                            <Checkbox
                                checked={passwordConfigInput.requireLowerCase === true}
                                onChange={(_, checked: boolean) => { passwordConfigInput.requireLowerCase = checked; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            />
                        </Grid2>

                        <Grid2 alignContent={"center"} size={10}>
                            Require Numbers
                        </Grid2>
                        <Grid2 size={2}>
                            <Checkbox
                                checked={passwordConfigInput.requireNumbers === true}
                                onChange={(_, checked: boolean) => { passwordConfigInput.requireNumbers = checked; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            />
                        </Grid2>
                        <Grid2 alignContent={"center"} size={10}>
                            Require Special Characters
                        </Grid2>
                        <Grid2 size={2}>
                            <Checkbox
                                checked={passwordConfigInput.requireSpecialCharacters === true}
                                onChange={(_, checked: boolean) => { passwordConfigInput.requireSpecialCharacters = checked; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            />
                        </Grid2>
                        <Grid2 marginTop={"8px"} alignContent={"center"} size={10}>
                            <div>Special Characters Allowed</div>
                            <TextField name="specialCharactersAllowed" id="specialCharactersAllowed"
                                value={passwordConfigInput.specialCharactersAllowed}
                                onChange={(evt) => { passwordConfigInput.specialCharactersAllowed = evt.target.value; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                                fullWidth={true} size="small"
                            />
                        </Grid2>
                    </Grid2>
                </Grid2>
            </Grid2>
            <Divider sx={{ marginTop: "16px" }} />
            <Grid2 marginTop={"24px"} container size={12} spacing={2}>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <Grid2 container size={12}>
                        <Grid2 alignContent={"center"} size={12}>Multi-factor Authentication</Grid2>
                        <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                            <Select
                                name="mfa"
                                id="mfa"
                                required={true}
                                size="small"
                                fullWidth={true}
                                value={
                                    passwordConfigInput.allowMfa ?
                                        "allowed" :
                                        passwordConfigInput.requireMfa ? "required" :
                                            "none"
                                }
                                onChange={(evt) => {
                                    const v: string = evt.target.value;
                                    passwordConfigInput.allowMfa = (v === "none" || v === "required") ? false : true;
                                    passwordConfigInput.requireMfa = (v === "none" || v === "allowed") ? false : true;
                                    if (v === "none") {
                                        passwordConfigInput.mfaTypesRequired = "";
                                        passwordConfigInput.mfaTypesAllowed = "";
                                    }
                                    setPasswordConfigInput({ ...passwordConfigInput });
                                    setMarkDirty(true);
                                }}
                            >
                                <MenuItem value={"none"}>None</MenuItem>
                                <MenuItem value={"allowed"}>Allowed</MenuItem>
                                <MenuItem value={"required"}>Required</MenuItem>
                            </Select>
                        </Grid2>
                        <Grid2 alignContent={"center"} size={12}>
                            MFA Types Allowed/Required
                        </Grid2>
                        <Grid2 alignContent={"center"} size={12}>
                            <Autocomplete
                                id="mfaTypes"
                                multiple={true}
                                size="small"
                                sx={{ paddingTop: "8px" }}
                                renderInput={(params) => <TextField {...params} label="" />}
                                options={[
                                    { id: MFA_AUTH_TYPE_TIME_BASED_OTP, label: "OTP - Requires an authenticator app" },
                                    { id: MFA_AUTH_TYPE_FIDO2, label: "Security Key" },
                                    { id: MFA_AUTH_TYPE_SMS, label: "SMS - Not recommended" }
                                ]}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={
                                    passwordConfigInput.mfaTypesAllowed && passwordConfigInput.mfaTypesAllowed !== "" ?
                                        passwordConfigInput.mfaTypesAllowed.split(",").map(s => { return { id: s, label: MFA_AUTH_TYPE_DISPLAY.get(s) } }) :
                                        passwordConfigInput.mfaTypesRequired && passwordConfigInput.mfaTypesRequired !== "" ?
                                            passwordConfigInput.mfaTypesRequired.split(",").map(s => { return { id: s, label: MFA_AUTH_TYPE_DISPLAY.get(s) } }) :
                                            []
                                }
                                onChange={(_, value: any) => {
                                    const val: any = value.map((s: any) => s.id).join(",");
                                    if (passwordConfigInput.allowMfa) {
                                        passwordConfigInput.mfaTypesAllowed = val;
                                    }
                                    else if (passwordConfigInput.requireMfa) {
                                        passwordConfigInput.mfaTypesRequired = val;
                                    }
                                    setPasswordConfigInput({ ...passwordConfigInput });
                                    setMarkDirty(true);
                                }}
                                disabled={!(passwordConfigInput.allowMfa === true || passwordConfigInput.requireMfa === true)}
                            />
                        </Grid2>

                    </Grid2>
                </Grid2>

            </Grid2>
            <DetailSectionActionHandler
                onDiscardClickedHandler={() => {
                    setPasswordConfigInput(initInput); 
                    setMarkDirty(false);
                }}
                onUpdateClickedHandler={() => {
                    onUpdateStart(); 
                    mutatePasswordConfiguration(); 
                }}
                markDirty={markDirty}
            />
        </>

    )

}

export default PasswordRulesConfiguration