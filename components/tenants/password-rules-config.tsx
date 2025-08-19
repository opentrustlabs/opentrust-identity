"use client";
import { TENANT_PASSWORD_CONFIG_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { PasswordConfigInput, TenantPasswordConfig } from "@/graphql/generated/graphql-types";
import { DEFAULT_TENANT_PASSWORD_CONFIGURATION, MFA_AUTH_TYPE_DISPLAY, MFA_AUTH_TYPE_NONE, MFA_AUTH_TYPES, PASSWORD_HASHING_ALGORITHMS, PASSWORD_HASHING_ALGORITHMS_DISPLAY } from "@/utils/consts";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import { Alert, Autocomplete, Checkbox, Divider, MenuItem, Select } from "@mui/material";
import { PASSWORD_CONFIGURATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";

export interface PasswordRulesConfigurationProps {
    tenantId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const PasswordRulesConfiguration: React.FC<PasswordRulesConfigurationProps> = ({
    tenantId,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {

    const initInput: PasswordConfigInput = DEFAULT_TENANT_PASSWORD_CONFIGURATION;
    initInput.tenantId = tenantId;

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
                initInput.maxRepeatingCharacterLength = config.maxRepeatingCharacterLength;
                initInput.mfaTypesRequired = config.mfaTypesRequired;
                initInput.passwordHashingAlgorithm = config.passwordHashingAlgorithm;
                initInput.passwordMaxLength = config.passwordMaxLength;
                initInput.passwordMinLength = config.passwordMinLength;
                initInput.requireLowerCase = config.requireLowerCase;
                initInput.requireMfa = config.requireMfa;
                initInput.requireNumbers = config.requireNumbers;
                initInput.requireSpecialCharacters = config.requireSpecialCharacters;
                initInput.requireUpperCase = config.requireUpperCase;
                initInput.specialCharactersAllowed = config.specialCharactersAllowed;
                initInput.passwordHistoryPeriod = config.passwordHistoryPeriod;
                initInput.passwordRotationPeriodDays = config.passwordRotationPeriodDays;
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
        refetchQueries: [TENANT_PASSWORD_CONFIG_QUERY]
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
                            disabled={readOnly}
                            type="number"
                            value={passwordConfigInput.passwordMinLength > 0 ? passwordConfigInput.passwordMinLength : ""}
                            onChange={(evt) => { passwordConfigInput.passwordMinLength = parseInt(evt.target.value || "0"); setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Password Maximum Length</div>
                        <TextField name="passwordMaxLength" id="passwordMaxLength"
                            disabled={readOnly}
                            type="number"
                            value={passwordConfigInput.passwordMaxLength > 0 ? passwordConfigInput.passwordMaxLength : ""}
                            onChange={(evt) => { passwordConfigInput.passwordMaxLength = parseInt(evt.target.value || "0"); setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Maximum Consecutive Length Of Identical Characters</div>
                        <TextField name="maxConsecutiveRepeatingChars" id="maxConsecutiveRepeatingChars"
                            disabled={readOnly}
                            type="number"
                            value={passwordConfigInput.maxRepeatingCharacterLength && passwordConfigInput.maxRepeatingCharacterLength > 0 ? passwordConfigInput.maxRepeatingCharacterLength : ""}
                            onChange={(evt) => { passwordConfigInput.maxRepeatingCharacterLength = parseInt(evt.target.value || "0"); setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Password History Period</div>
                        <TextField name="passwordHistoryPeriod" id="passwordHistoryPeriod"
                            disabled={readOnly}
                            type="number"
                            value={passwordConfigInput.passwordHistoryPeriod && passwordConfigInput.passwordHistoryPeriod > 0 ? passwordConfigInput.passwordHistoryPeriod : ""}
                            onChange={(evt) => { 
                                const period = parseInt(evt.target.value || "0");
                                passwordConfigInput.passwordHistoryPeriod = period <= 0 ? null : period;
                                setPasswordConfigInput({ ...passwordConfigInput }); 
                                setMarkDirty(true); 
                            }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Change Password Period (days)</div>
                        <TextField name="passwordRotationPeriodDays" id="passwordRotationPeriodDays"
                            disabled={readOnly}
                            type="number"
                            value={passwordConfigInput.passwordRotationPeriodDays && passwordConfigInput.passwordRotationPeriodDays > 0 ? passwordConfigInput.passwordRotationPeriodDays : ""}
                            onChange={(evt) => { 
                                const rotationPeriod = parseInt(evt.target.value || "0"); 
                                passwordConfigInput.passwordRotationPeriodDays = rotationPeriod <= 0 ? null : rotationPeriod;
                                setPasswordConfigInput({ ...passwordConfigInput }); 
                                setMarkDirty(true); 
                            }}
                            fullWidth={true} size="small"
                        />
                    </Grid2>
                    <Grid2 marginBottom={"16px"} >
                        <div>Password Hashing Algorithm</div>
                        <Select
                            disabled={readOnly}
                            required={true}
                            size="small"
                            fullWidth={true}
                            value={passwordConfigInput.passwordHashingAlgorithm}
                            onChange={(evt) => { passwordConfigInput.passwordHashingAlgorithm = evt.target.value; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                        >
                            {PASSWORD_HASHING_ALGORITHMS.map(
                                (algorithm: string) => (
                                    <React.Fragment key={algorithm}>
                                        <MenuItem value={algorithm}>{PASSWORD_HASHING_ALGORITHMS_DISPLAY.get(algorithm)}</MenuItem>
                                    </React.Fragment>
                                )
                            )}
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
                                disabled={readOnly}
                                checked={passwordConfigInput.requireUpperCase === true}
                                onChange={(_, checked: boolean) => { passwordConfigInput.requireUpperCase = checked; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            />
                        </Grid2>

                        <Grid2 alignContent={"center"} size={10}>
                            Require Lowercase
                        </Grid2>
                        <Grid2 size={2}>
                            <Checkbox
                                disabled={readOnly}
                                checked={passwordConfigInput.requireLowerCase === true}
                                onChange={(_, checked: boolean) => { passwordConfigInput.requireLowerCase = checked; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            />
                        </Grid2>

                        <Grid2 alignContent={"center"} size={10}>
                            Require Numbers
                        </Grid2>
                        <Grid2 size={2}>
                            <Checkbox
                                disabled={readOnly}
                                checked={passwordConfigInput.requireNumbers === true}
                                onChange={(_, checked: boolean) => { passwordConfigInput.requireNumbers = checked; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            />
                        </Grid2>
                        <Grid2 alignContent={"center"} size={10}>
                            Require Special Characters
                        </Grid2>
                        <Grid2 size={2}>
                            <Checkbox
                                disabled={readOnly}
                                checked={passwordConfigInput.requireSpecialCharacters === true}
                                onChange={(_, checked: boolean) => { passwordConfigInput.requireSpecialCharacters = checked; setPasswordConfigInput({ ...passwordConfigInput }); setMarkDirty(true); }}
                            />
                        </Grid2>
                        <Grid2 marginTop={"8px"} alignContent={"center"} size={10}>
                            <div>Special Characters Allowed</div>
                            <TextField name="specialCharactersAllowed" id="specialCharactersAllowed"
                                disabled={readOnly}
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
                    <Grid2 size={12}>
                        <Grid2 container size={12} marginBottom={"16px"}>
                            <Grid2 alignContent={"center"} size={11}>Require Multi-factor Authentication</Grid2>
                            <Grid2 size={1}>
                                <Checkbox
                                    disabled={readOnly}
                                    checked={passwordConfigInput.requireMfa === true}                                
                                    onChange={(_, checked: boolean) => {
                                        if(checked === false){
                                            passwordConfigInput.mfaTypesRequired = "";
                                        }
                                        passwordConfigInput.requireMfa = checked;
                                        setPasswordConfigInput({ ...passwordConfigInput });
                                        setMarkDirty(true);
                                    }}
                                />
                            </Grid2>                        
                        </Grid2>
                        <Grid2 alignContent={"center"} size={12}>
                            MFA Types Required
                        </Grid2>
                        <Grid2 alignContent={"center"} size={12}>
                            <Autocomplete
                                
                                id="mfaTypes"
                                multiple={true}
                                size="small"
                                sx={{ paddingTop: "8px" }}
                                renderInput={(params) => <TextField {...params} label="" />}
                                options={
                                    MFA_AUTH_TYPES
                                    .filter(
                                        (type: string) => type !== MFA_AUTH_TYPE_NONE
                                    )
                                    .map(
                                        (type: string) => {
                                            return {id: type, label: MFA_AUTH_TYPE_DISPLAY.get(type)}
                                        }
                                    )
                                }
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={
                                        passwordConfigInput.mfaTypesRequired && passwordConfigInput.mfaTypesRequired !== "" ?
                                            passwordConfigInput.mfaTypesRequired.split(",").map(s => { return { id: s, label: MFA_AUTH_TYPE_DISPLAY.get(s) } }) :
                                            []
                                }                                
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(_, value: any) => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const val: any = value.map((s: any) => s.id).join(",");                                    
                                    if (passwordConfigInput.requireMfa) {
                                        passwordConfigInput.mfaTypesRequired = val;
                                    }
                                    setPasswordConfigInput({ ...passwordConfigInput });
                                    setMarkDirty(true);
                                }}
                                disabled={readOnly || !passwordConfigInput.requireMfa === true}
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