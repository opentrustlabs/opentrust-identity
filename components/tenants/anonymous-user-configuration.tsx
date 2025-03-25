"use client";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { TenantAnonymousUserConfiguration, Tenant, TenantAnonymousUserConfigInput } from "@/graphql/generated/graphql-types";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY } from "@/graphql/queries/oidc-queries";
import { TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Autocomplete from "@mui/material/Autocomplete";
import { COUNTRY_CODES, CountryCodeDef, LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import { getDefaultCountryCodeDef, getDefaultLanguageCodeDef } from "@/utils/client-utils";


export interface AnonymousUserConfigurationProps {
    tenant: Tenant,
    allowAnonymousUsers: boolean,
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

const AnonymousUserConfiguration: React.FC<AnonymousUserConfigurationProps> = ({
    tenant,
    allowAnonymousUsers,
    onUpdateEnd,
    onUpdateStart
}) => {

    let initInput: TenantAnonymousUserConfigInput = {        
        defaultcountrycode: "",
        defaultlangugecode: "",
        tokenttlseconds: 0,
        tenantId: tenant.tenantId        
    }

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    // const [showReset, setShowReset] = React.useState<boolean>(false);
    const [tenantAnonymousUserConfigInput, setTenantAnonymousUserConfigInput] = React.useState<TenantAnonymousUserConfigInput | null>(null);
    //const [revertToInput, setRevertToInput] = React.useState<TenantLegacyUserMigrationConfigInput | null>(null);


    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error } = useQuery(TENANT_ANONYMOUS_USER_CONFIGURATION_QUERY, {
        variables: {
            tenantId: tenant.tenantId
        },
        onCompleted(data) {
            if (data && data.getLegacyUserMigrationConfiguration) {
                const config: TenantAnonymousUserConfiguration = data.getLegacyUserMigrationConfiguration as TenantAnonymousUserConfiguration;
                initInput.defaultcountrycode = config.defaultcountrycode;
                initInput.defaultlangugecode = config.defaultlangugecode;
                initInput.tokenttlseconds = config.tokenttlseconds ? config.tokenttlseconds : 0;
            }
            setTenantAnonymousUserConfigInput({...initInput});
            // setRevertToInput({...initInput});
        },
    });

    const [mutateAnonymousUserConfiguration] = useMutation(TENANT_ANONYMOUS_USER_CONFIGURATION_MUTATION, {
        variables: {
            tenantAnonymousUserConfigInput: tenantAnonymousUserConfigInput
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message);
            //setShowReset(true);
        }
    });


    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    if (tenantAnonymousUserConfigInput) return (

        <>
            <Grid2 container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <div>{errorMessage}</div>
                    </Grid2>
                }
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Default Country</div>
                    <Autocomplete
                        id="defaultCountry"
                        disabled={allowAnonymousUsers !== true}
                        sx={{paddingTop: "8px"}}
                        size="small"
                        renderInput={(params) => <TextField {...params} label="" />}
                        options={
                            [{countryCode: "", country: ""}, ...COUNTRY_CODES].map(
                                (cc: CountryCodeDef) => {
                                    return {id: cc.countryCode, label: cc.country}
                                }
                            )
                        }                        
                        value={ allowAnonymousUsers ? getDefaultCountryCodeDef(tenantAnonymousUserConfigInput.defaultcountrycode || "" ): {id: "", label: ""}}
                        onChange={ (_, value: any) => {                            
                            tenantAnonymousUserConfigInput.defaultcountrycode = value ? value.id : "";
                            setTenantAnonymousUserConfigInput({ ...tenantAnonymousUserConfigInput });
                            setMarkDirty(true);
                        }}                        
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Default Language</div>
                    <Autocomplete
                        id="defaultLanguage"
                        disabled={allowAnonymousUsers !== true}
                        sx={{paddingTop: "8px"}}
                        size="small"
                        renderInput={(params) => <TextField {...params} label="" />}
                        options={
                            [{languageCode: "", language: ""}, ...LANGUAGE_CODES].map(
                                (lc: LanguageCodeDef) => {
                                    return {id: lc.languageCode, label: lc.language}
                                }
                            )
                        }                        
                        value={allowAnonymousUsers ? getDefaultLanguageCodeDef(tenantAnonymousUserConfigInput.defaultlangugecode || ""): {id: "", label: ""}}
                        onChange={ (_, value: any) => {                                  
                            tenantAnonymousUserConfigInput.defaultlangugecode = value ? value.id : "";
                            setTenantAnonymousUserConfigInput({ ...tenantAnonymousUserConfigInput });
                            setMarkDirty(true);
                        }}                        
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Token Time-To-Live (in seconds)</div>
                    <TextField name="tokenTTLSeconds" id="tokenTTLSeconds"
                        type="number"
                        disabled={allowAnonymousUsers !== true}
                        value={ allowAnonymousUsers !== true ? "" : tenantAnonymousUserConfigInput.tokenttlseconds > 0 ? tenantAnonymousUserConfigInput.tokenttlseconds : ""}
                        onChange={(evt) => { tenantAnonymousUserConfigInput.tokenttlseconds = parseInt(evt.target.value || "0"); setTenantAnonymousUserConfigInput({ ...tenantAnonymousUserConfigInput }); setMarkDirty(true); }}
                        fullWidth={true} size="small"
                    />
                </Grid2>
            </Grid2>
            <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >                
                <Button
                    disabled={!allowAnonymousUsers || !markDirty}
                    onClick={() => { onUpdateStart(); mutateAnonymousUserConfiguration() }}
                    sx={{ border: "solid 1px lightgrey", borderRadius: "4px" }} >Update
                </Button>
                {/* {showReset &&
                    <Button 
                        sx={{marginRight: "8px"}}
                        onClick={() => {
                            setTenantLegacyUserMigrationConfigInput({...revertToInput as TenantLegacyUserMigrationConfigInput});
                            setRevertToInput({...revertToInput as TenantLegacyUserMigrationConfigInput});
                            setShowReset(false);
                        }}
                    >Revert Changes</Button>
                } */}
            </Stack>
        </>

    )

}

export default AnonymousUserConfiguration;