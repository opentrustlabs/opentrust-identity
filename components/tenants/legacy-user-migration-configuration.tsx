"use client";
import { LEGACY_USER_MIGRATION_CONFIGURATION_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { TenantLegacyUserMigrationConfig, TenantLegacyUserMigrationConfigInput } from "@/graphql/generated/graphql-types";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import { LEGACY_USER_MIGRATION_CONFIGURATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import { useIntl } from 'react-intl';


export interface LegacyUserMigrationConfigurationProps {
    tenantId: string,
    allowLegacyUserMigration: boolean,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const LegacyUserMigrationConfiguration: React.FC<LegacyUserMigrationConfigurationProps> = ({
    tenantId,
    allowLegacyUserMigration,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    const initInput: TenantLegacyUserMigrationConfigInput = {
        authenticationUri: "",
        tenantId: tenantId,
        userProfileUri: "",
        usernameCheckUri: ""
    }

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [tenantLegacyUserMigrationConfigInput, setTenantLegacyUserMigrationConfigInput] = React.useState<TenantLegacyUserMigrationConfigInput | null>(null);
    //const [revertToInput, setRevertToInput] = React.useState<TenantLegacyUserMigrationConfigInput | null>(null);


    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error } = useQuery(LEGACY_USER_MIGRATION_CONFIGURATION_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getLegacyUserMigrationConfiguration) {
                const config: TenantLegacyUserMigrationConfig = data.getLegacyUserMigrationConfiguration as TenantLegacyUserMigrationConfig;
                initInput.authenticationUri = config.authenticationUri;
                initInput.userProfileUri = config.userProfileUri;
                initInput.usernameCheckUri = config.usernameCheckUri;
            }
            setTenantLegacyUserMigrationConfigInput({ ...initInput });
            // setRevertToInput({...initInput});
        },
    });

    const [mutateUserMigrationConfiguration] = useMutation(LEGACY_USER_MIGRATION_CONFIGURATION_MUTATION, {
        variables: {
            tenantLegacyUserMigrationConfigInput: tenantLegacyUserMigrationConfigInput
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
            //setShowReset(true);
        }
    });

    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    if (tenantLegacyUserMigrationConfigInput) return (

        <>
            <Grid2 marginTop={"8px"} container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <div>{errorMessage}</div>
                    </Grid2>
                }
                {!allowLegacyUserMigration &&
                    <Grid2 container size={12} margin={"8px 0px"} justifyContent={"center"} fontWeight={"bold"} fontSize={"0.9em"}>
                        To make configuration changes, update the tenant to allow legacy user migration.
                    </Grid2>
                }
                {allowLegacyUserMigration &&
                    <React.Fragment>
                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                            
                            <TextField name="authenticationUri" id="authenticationUri"
                                disabled={readOnly || allowLegacyUserMigration !== true}
                                value={allowLegacyUserMigration ? tenantLegacyUserMigrationConfigInput.authenticationUri : ""}
                                onChange={(evt) => { tenantLegacyUserMigrationConfigInput.authenticationUri = evt.target.value; setTenantLegacyUserMigrationConfigInput({ ...tenantLegacyUserMigrationConfigInput }); setMarkDirty(true); }}
                                fullWidth={true} 
                                label="Authentication URI"
                            />
                        </Grid2>
                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                            
                            <TextField name="userProfileUri" id="userProfileUri"
                                disabled={readOnly || allowLegacyUserMigration !== true}
                                value={allowLegacyUserMigration ? tenantLegacyUserMigrationConfigInput.userProfileUri : ""}
                                onChange={(evt) => { tenantLegacyUserMigrationConfigInput.userProfileUri = evt.target.value; setTenantLegacyUserMigrationConfigInput({ ...tenantLegacyUserMigrationConfigInput }); setMarkDirty(true); }}
                                fullWidth={true} 
                                label="User Profile URI"
                            />
                        </Grid2>
                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                            
                            <TextField name="namecheckUri" id="namecheckUri"
                                disabled={readOnly || allowLegacyUserMigration !== true}
                                value={allowLegacyUserMigration ? tenantLegacyUserMigrationConfigInput.usernameCheckUri : ""}
                                onChange={(evt) => { tenantLegacyUserMigrationConfigInput.usernameCheckUri = evt.target.value; setTenantLegacyUserMigrationConfigInput({ ...tenantLegacyUserMigrationConfigInput }); setMarkDirty(true); }}
                                fullWidth={true} 
                                label="User Name-Check URI"
                            />
                        </Grid2>

                        
                    </React.Fragment>
                }
            </Grid2>
            {allowLegacyUserMigration &&
                <DetailSectionActionHandler
                    onDiscardClickedHandler={() => {
                        setTenantLegacyUserMigrationConfigInput({ ...initInput });
                        setMarkDirty(false);
                    }}
                    onUpdateClickedHandler={() => {
                        onUpdateStart();
                        mutateUserMigrationConfiguration();
                    }}
                    disableSubmit={!allowLegacyUserMigration || !markDirty}
                    markDirty={markDirty}
                />
            }
        </>
    )
}

export default LegacyUserMigrationConfiguration