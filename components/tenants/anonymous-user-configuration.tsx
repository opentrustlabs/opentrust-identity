"use client";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { TenantAnonymousUserConfiguration, Tenant, TenantAnonymousUserConfigInput } from "@/graphql/generated/graphql-types";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import { TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY } from "@/graphql/queries/oidc-queries";
import { REMOVE_TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION, TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Autocomplete from "@mui/material/Autocomplete";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import { useIntl } from 'react-intl';
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";


export interface AnonymousUserConfigurationProps {
    tenant: Tenant,
    allowAnonymousUsers: boolean,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const AnonymousUserConfiguration: React.FC<AnonymousUserConfigurationProps> = ({
    tenant,
    allowAnonymousUsers,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();
    

    const initInput: TenantAnonymousUserConfigInput = {
        defaultcountrycode: "",
        defaultlanguagecode: "",
        tokenttlseconds: 0,
        tenantId: tenant.tenantId
    }

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [tenantAnonymousUserConfigInput, setTenantAnonymousUserConfigInput] = React.useState<TenantAnonymousUserConfigInput>(initInput);
    const [revertToInput, setRevertToInput] = React.useState<TenantAnonymousUserConfigInput>(initInput);
    const [showConfirmRemoveAnonymousUserConfiguration, setShowConfirmRemoveAnonymousUserConfiguration] = React.useState<boolean>(false);
    const [hasAnonymousUserConfiguration, setHasAnonymousUserConfiguration] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error } = useQuery(TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY, {
        variables: {
            tenantId: tenant.tenantId
        },
        onCompleted(data) {
            if (data && data.getAnonymousUserConfiguration) {
                const config: TenantAnonymousUserConfiguration = data.getAnonymousUserConfiguration as TenantAnonymousUserConfiguration;
                initInput.defaultcountrycode = config.defaultcountrycode;
                initInput.defaultlanguagecode = config.defaultlanguagecode;
                initInput.tokenttlseconds = config.tokenttlseconds ? config.tokenttlseconds : 0;
                setTenantAnonymousUserConfigInput({ ...initInput });
                setRevertToInput({...initInput});
                setHasAnonymousUserConfiguration(true);
            }            
        },
    });

    const [mutateAnonymousUserConfiguration] = useMutation(TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION, {
        variables: {
            tenantAnonymousUserConfigInput: tenantAnonymousUserConfigInput
        },
        onCompleted(data) {
            onUpdateEnd(true);
            setMarkDirty(false);
            if(data && data.setTenantAnonymousUserConfig){
                const input: TenantAnonymousUserConfigInput = {
                    tenantId: tenant.tenantId,
                    tokenttlseconds: data.setTenantAnonymousUserConfig.tokenttlseconds,
                    defaultcountrycode: data.setTenantAnonymousUserConfig.defaultcountrycode,
                    defaultlanguagecode: data.setTenantAnonymousUserConfig.defaultlanguagecode
                };
                setTenantAnonymousUserConfigInput(input);
                setRevertToInput(input);
            }
            if(hasAnonymousUserConfiguration === false){
                setHasAnonymousUserConfiguration(true);
            }
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [removeTenantAnonymousUserConfiguration] = useMutation(REMOVE_TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION, {
        variables: {
            tenantId: tenant.tenantId
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
            const input: TenantAnonymousUserConfigInput = {
                tenantId: tenant.tenantId,
                tokenttlseconds: 0,
                defaultcountrycode: null,
                defaultlanguagecode: null
            };
            setTenantAnonymousUserConfigInput(input);
            setRevertToInput(input);
            setHasAnonymousUserConfiguration(false);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    })


    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    if (tenantAnonymousUserConfigInput) return (

        <>
            {showConfirmRemoveAnonymousUserConfiguration &&
                <Dialog
                    open={showConfirmRemoveAnonymousUserConfiguration}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>
                            Confirm that you want to restore the system default settings for password rules:
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowConfirmRemoveAnonymousUserConfiguration(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowConfirmRemoveAnonymousUserConfiguration(false);
                                onUpdateStart();
                                removeTenantAnonymousUserConfiguration();
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            }

            <Grid2 marginTop={"8px"} container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                    </Grid2>
                }
                {!allowAnonymousUsers &&
                    <Grid2 container size={12} margin={"8px 0px"} justifyContent={"center"} fontWeight={"bold"} fontSize={"0.9em"}>
                        To make configuration changes to anonymous users, update the tenant to allow anonymous users.
                    </Grid2>
                }
                {allowAnonymousUsers &&
                    <React.Fragment>
                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                            
                            <Autocomplete
                                id="defaultCountry"
                                disabled={readOnly || allowAnonymousUsers !== true}
                                sx={{ paddingTop: "8px" }}                                
                                renderInput={(params) => <TextField {...params} label="Default Country" />}
                                options={
                                    [{ countryCode: "", country: "" }, ...COUNTRY_CODES].map(
                                        (cc: CountryCodeDef) => {
                                            return { id: cc.countryCode, label: cc.country }
                                        }
                                    )
                                }
                                value={allowAnonymousUsers ? getDefaultCountryCodeDef(tenantAnonymousUserConfigInput.defaultcountrycode || "") : { id: "", label: "" }}                                
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(_, value: any) => {
                                    tenantAnonymousUserConfigInput.defaultcountrycode = value ? value.id : "";
                                    setTenantAnonymousUserConfigInput({ ...tenantAnonymousUserConfigInput });
                                    setMarkDirty(true);
                                }}
                            />
                        </Grid2>
                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                            
                            <Autocomplete
                                id="defaultLanguage"
                                disabled={readOnly || allowAnonymousUsers !== true}
                                sx={{ paddingTop: "8px" }}                            
                                renderInput={(params) => <TextField {...params} label="Default Language" />}
                                options={
                                    [{ languageCode: "", language: "" }, ...LANGUAGE_CODES].map(
                                        (lc: LanguageCodeDef) => {
                                            return { id: lc.languageCode, label: lc.language }
                                        }
                                    )
                                }
                                value={allowAnonymousUsers ? getDefaultLanguageCodeDef(tenantAnonymousUserConfigInput.defaultlanguagecode || "") : { id: "", label: "" }}                                
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(_, value: any) => {
                                    tenantAnonymousUserConfigInput.defaultlanguagecode = value ? value.id : "";
                                    setTenantAnonymousUserConfigInput({ ...tenantAnonymousUserConfigInput });
                                    setMarkDirty(true);
                                }}
                            />
                        </Grid2>
                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                            
                            <TextField name="tokenTTLSeconds" id="tokenTTLSeconds"
                                type="number"
                                disabled={readOnly || allowAnonymousUsers !== true}
                                value={allowAnonymousUsers !== true ? "" : tenantAnonymousUserConfigInput.tokenttlseconds > 0 ? tenantAnonymousUserConfigInput.tokenttlseconds : ""}
                                onChange={(evt) => { tenantAnonymousUserConfigInput.tokenttlseconds = parseInt(evt.target.value || "0"); setTenantAnonymousUserConfigInput({ ...tenantAnonymousUserConfigInput }); setMarkDirty(true); }}
                                fullWidth={true} 
                                label="Token Time-To-Live (in seconds)"
                            />
                        </Grid2>
                    </React.Fragment>
                }
            </Grid2 >
            {allowAnonymousUsers &&
                <DetailSectionActionHandler
                    onDiscardClickedHandler={() => {
                        setTenantAnonymousUserConfigInput({ ...revertToInput });
                        setMarkDirty(false);
                    }}
                    onUpdateClickedHandler={() => {
                        onUpdateStart();
                        mutateAnonymousUserConfiguration();
                    }}
                    markDirty={markDirty}
                    enableRestoreDefault={hasAnonymousUserConfiguration === true}
                    restoreDefaultHandler={() => {
                        setShowConfirmRemoveAnonymousUserConfiguration(true);
                    }}
                    tooltipTitle="Remove Anonymous User Configuration Values"

                />
            }

        </>
    )
}

export default AnonymousUserConfiguration;