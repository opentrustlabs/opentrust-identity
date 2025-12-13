"use client";
import { SYSTEM_INITIALIZATION_READY_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { Alert, Button, Grid2, Stack, Typography } from "@mui/material";
import React, { useContext } from "react";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { ErrorDetail, SystemInitializationInput } from "@/graphql/generated/graphql-types";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import RootTenantConfiguration from "./root-tenant-configuration";
import InitAuthentication from "./init-authentication";
import RootClientConfiguration from "./root-client-configuration";
import InitAuthzConfiguration from "./init-authz-group-configuration";
import RootUserConfiguration from "./root-user-configuration";
import InitFederatedOIDCProviderConfiguration from "./init-federated-oidc-provider-configuration";
import InitSystemSettingsConfiguration from "./init-system-settings-configuration";
import InitCaptchaConfiguration from "./init-captcha-configuration";
import InitSubmit from "./init-submit";

export interface SystemInitializationConfigProps {
    onNext: (updatedInput: SystemInitializationInput) => void,
    onBack: () => void,
    onError: (message: string) => void,
    systemInitInput: SystemInitializationInput
}

const INIT_SYSTEM_READY_CHECK = "INIT_SYSTEM_READY_CHECK";
const INIT_AUTHENTICATION = "INIT_AUTHENTICATION";
const INIT_TENANT = "INIT_TENANT";
const INIT_CLIENT = "INIT_CLIENT";
const INIT_ROOT_AUTHZ_GROUP = "INIT_ROOT_AUTHZ_GROUP";
const INIT_ROOT_USER = "INIT_ROOT_USER";
const INIT_ROOT_READ_ONLY_AUTHZ_GROUP = "INIT_ROOT_READ_ONLY_AUTHZ_GROUP";
const INIT_OIDC_PROVIDER = "INIT_OIDC_PROVIDER";
const INIT_SYSTEM_SETTINGS = "INIT_SYSTEM_SETTINGS";
const INIT_CAPTCHA_CONFIG = "INIT_CAPTCHA_CONFIG";
const INIT_SUBMIT="INIT_SUBMIT";

const INITIALIZATION_STATES = [
    INIT_SYSTEM_READY_CHECK,
    INIT_AUTHENTICATION,
    INIT_TENANT,
    INIT_CLIENT,
    INIT_ROOT_AUTHZ_GROUP,
    INIT_ROOT_USER,
    INIT_ROOT_READ_ONLY_AUTHZ_GROUP,
    INIT_OIDC_PROVIDER,
    INIT_SYSTEM_SETTINGS,
    INIT_CAPTCHA_CONFIG,
    INIT_SUBMIT
];

const SystemInit: React.FC = () => {

    // CONTEXT VARIABLES
    const responsiveBreakpoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    const input: SystemInitializationInput = {
        rootAuthenticationDomain: "",
        rootAuthorizationGroupInput: {
            allowForAnonymousUsers: false,
            default: false,
            groupDescription: undefined,
            groupName: "",
            tenantId: ""
        },
        rootClientInput: {
            audience: undefined,
            clientDescription: undefined,
            clientName: "",
            clientTokenTTLSeconds: undefined,
            clientType: "",
            clienttypeid: undefined,
            enabled: false,
            maxRefreshTokenCount: undefined,
            oidcEnabled: false,
            pkceEnabled: false,
            tenantId: "",
            userTokenTTLSeconds: undefined
        },
        rootTenantInput: {
            allowAnonymousUsers: false,
            allowForgotPassword: false,
            allowLoginByPhoneNumber: false,
            allowSocialLogin: false,
            allowUnlimitedRate: false,
            allowUserSelfRegistration: false,
            defaultRateLimit: undefined,
            defaultRateLimitPeriodMinutes: undefined,
            enabled: false,
            federatedAuthenticationConstraint: "",
            migrateLegacyUsers: false,
            registrationRequireCaptcha: false,
            registrationRequireTermsAndConditions: false,
            tenantDescription: undefined,
            tenantId: "",
            tenantName: "",
            tenantType: "",
            termsAndConditionsUri: undefined,
            verifyEmailOnSelfRegistration: false
        },
        rootUserCreateInput: {
            address: undefined,
            addressLine1: undefined,
            city: undefined,
            countryCode: undefined,
            domain: "",
            email: "",
            emailVerified: false,
            enabled: false,
            federatedOIDCProviderSubjectId: undefined,
            firstName: "",
            lastName: "",
            locked: false,
            middleName: undefined,
            nameOrder: "",
            password: "",
            phoneNumber: undefined,
            postalCode: undefined,
            preferredLanguageCode: undefined,
            stateRegionProvince: undefined,
            termsAndConditionsAccepted: false
        },
        systemSettingsInput: {
            allowDuressPassword: false,
            allowRecoveryEmail: false,
            auditRecordRetentionPeriodDays: undefined,
            contactEmail: undefined,
            enablePortalAsLegacyIdp: false,
            noReplyEmail: undefined,
            rootClientId: ""
        },
        captchaConfigInput: null,
        rootFederatedOIDCProviderInput: null,
        rootReadOnlyAuthorizationGroupInput: null
    }
    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [hasReadinessError, setHasReadinessError] = React.useState<boolean>(false);
    const [hasReadinessWarning, setHasReadinessWarning] = React.useState<boolean>(false);        
    const [initializationStateIndex, setInitializationStateIndex] = React.useState<number>(0);
    const [systemInitializationInput, setSystemInitializationInput] = React.useState<SystemInitializationInput>(input);

    const width = !responsiveBreakpoints.isMedium ? "750px" : undefined;
    const maxWidth = "650px";

    // GRAPHQL FUNCTIONS
    const { data, loading, error } = useQuery(SYSTEM_INITIALIZATION_READY_QUERY, {

        onCompleted(data) {
            if (data.systemInitializationReady.systemInitializationReadyErrors && data.systemInitializationReady.systemInitializationReadyErrors.length > 0) {
                setHasReadinessError(true);
            }
            if (data.systemInitializationReady.systemInitializationWarnings && data.systemInitializationReady.systemInitializationWarnings.length > 0) {
                setHasReadinessWarning(true);
            }
        },
        onError(error) {
            setErrorMessage(error.message);
            setHasReadinessError(true);
        },
    });


    if (error) return <ErrorComponent componentSize={"xs"} message={"Error"} />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />

    return (
        <React.Fragment>
            <Grid2 marginBottom={"16px"} maxWidth={"750px"} container size={12} spacing={1}>
                {errorMessage &&
                    <Alert onClose={() => setErrorMessage(null)} sx={{ width: width, maxWidth: maxWidth }} severity="error">
                        {errorMessage}
                    </Alert>
                }
            </Grid2>
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_SYSTEM_READY_CHECK &&
                <Typography component="div">
                    {data && data.systemInitializationReady && data.systemInitializationReady.systemInitializationReadyErrors && data.systemInitializationReady.systemInitializationReadyErrors.length > 0 &&
                        <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                            <Alert sx={{width: width, maxWidth: maxWidth, fontSize: "0.95em" }} severity="error">
                                <Grid2 marginBottom={"8px"} fontWeight={"bold"} sx={{ textDecoration: "underline" }} size={12}>
                                    The following errors were encountered during the check for initialization readiness:
                                </Grid2>
                                {data.systemInitializationReady.systemInitializationReadyErrors.map(
                                    (errorDetail: ErrorDetail, idx: number) => (
                                        <Grid2 size={12} container marginBottom={"8px"} key={errorDetail.errorCode}>
                                            <Grid2 fontWeight={"bold"} size={0.7}>{idx + 1}.</Grid2>
                                            <Grid2 size={11.3}> {errorDetail.errorMessage}</Grid2>
                                        </Grid2>
                                    )
                                )}
                                <Grid2 fontWeight={"bold"} size={12}>
                                    Be advised that system initialization cannot proceed until the errors are corrected.
                                </Grid2>
                            </Alert>
                        </Grid2>
                    }

                    {data && data.systemInitializationReady && data.systemInitializationReady.systemInitializationWarnings && data.systemInitializationReady.systemInitializationWarnings.length > 0 &&
                        <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                            <Alert sx={{ width: width, maxWidth: maxWidth, fontSize: "0.95em" }} severity="warning">
                                <Grid2 marginBottom={"8px"} fontWeight={"bold"} sx={{ textDecoration: "underline" }} size={12}>
                                    The following warnings were encountered during the check for initialization readiness:
                                </Grid2>
                                {data.systemInitializationReady.systemInitializationWarnings.map(
                                    (errorDetail: ErrorDetail, idx: number) => (
                                        <Grid2 size={12} container marginBottom={"8px"} key={errorDetail.errorCode}>
                                            <Grid2 fontWeight={"bold"} size={0.7}>{idx + 1}.</Grid2>
                                            <Grid2 size={11.3}> {errorDetail.errorMessage}</Grid2>
                                        </Grid2>
                                    )
                                )}
                                <Grid2 fontWeight={"bold"} size={12}>
                                    Be advised that certain parts of the application may have limited functionality.
                                </Grid2>
                            </Alert>
                        </Grid2>
                    }

                    {!hasReadinessError && !hasReadinessWarning &&
                        <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                            <Alert sx={{ width: width, maxWidth: maxWidth, fontSize: "0.95em" }} severity="success">
                                <Grid2 marginBottom={"8px"} fontWeight={"bold"} sx={{ textDecoration: "underline" }} size={12}>
                                    All system initialization checks passed.
                                </Grid2>

                            </Alert>
                        </Grid2>
                    }
                    {!hasReadinessError &&
                        <Stack
                            direction={"row-reverse"}
                            sx={{ width: "100%" }}
                        >
                            <Button
                                onClick={() => {
                                    setInitializationStateIndex(initializationStateIndex + 1);
                                }}
                            >
                                Next
                            </Button>
                        </Stack>
                    }
                </Typography>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_AUTHENTICATION &&
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <InitAuthentication
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={() => {
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_TENANT &&
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <RootTenantConfiguration
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_CLIENT &&
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <RootClientConfiguration
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_ROOT_AUTHZ_GROUP &&
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <InitAuthzConfiguration
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                        isReadOnlyAuthzGroup={false}
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_ROOT_USER && 
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <RootUserConfiguration
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_ROOT_READ_ONLY_AUTHZ_GROUP && 
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <InitAuthzConfiguration
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                        isReadOnlyAuthzGroup={true}
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_OIDC_PROVIDER && 
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <InitFederatedOIDCProviderConfiguration
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_SYSTEM_SETTINGS && 
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <InitSystemSettingsConfiguration
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_CAPTCHA_CONFIG && 
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} container size={12} spacing={1}>
                    <InitCaptchaConfiguration
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                    />
                </Grid2>
            }
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_SUBMIT && 
                <Grid2 marginBottom={"16px"} maxWidth={maxWidth} width={width} container size={12} spacing={1}>
                    <InitSubmit
                        onBack={() => {
                            setInitializationStateIndex(initializationStateIndex - 1);
                        }}
                        onError={(message) => {
                            setErrorMessage(message)
                        }}
                        onNext={(updatedInput: SystemInitializationInput) => {                            
                            setSystemInitializationInput({...updatedInput});
                            setInitializationStateIndex(initializationStateIndex + 1);
                        }}
                        systemInitInput={systemInitializationInput} 
                    />
                </Grid2>            
            }
        </React.Fragment>
    )
}

export default SystemInit;