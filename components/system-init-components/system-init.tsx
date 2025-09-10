"use client";
import { SYSTEM_INITIALIZATION_READY_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { Alert, Button, Grid2, Stack, Typography } from "@mui/material";
import React, { useContext } from "react";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { ErrorDetail } from "@/graphql/generated/graphql-types";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";

const INIT_SYSTEM_READY_CHECK = "INIT_SYSTEM_READY_CHECK";
const INIT_AUTHENTICATION = "INIT_AUTHENTICATION";
const INIT_TENANT = "INIT_TENANT";
const INIT_CLIENT = "INIT_CLIENT";
const INIT_ROOT_AUTHZ_GROUP = "INIT_ROOT_AUTHZ_GROUP";
const INIT_ROOT_USER = "INIT_ROOT_USER";
const INIT_ROOT_READ_ONLY_AUTHZ_GROUP = "INIT_ROOT_READ_ONLY_AUTHZ_GROUP";
const INIT_OIDC_PROVIDER = "INIT_OIDC_PROVIDER";
const INIT_ROOT_CONTACT = "INIT_ROOT_CONTACT";
const INIT_SYSTEM_SETTINGS = "INIT_SYSTEM_SETTINGS";
const INIT_CAPTCHA_CONFIG = "INIT_CAPTCHA_CONFIG";

const INITIALIZATION_STATES = [
    INIT_SYSTEM_READY_CHECK,
    INIT_AUTHENTICATION,
    INIT_TENANT,
    INIT_CLIENT,
    INIT_ROOT_AUTHZ_GROUP,
    INIT_ROOT_USER,
    INIT_ROOT_READ_ONLY_AUTHZ_GROUP,
    INIT_OIDC_PROVIDER,
    INIT_ROOT_CONTACT,
    INIT_SYSTEM_SETTINGS,
    INIT_CAPTCHA_CONFIG
];

const SystemInit: React.FC = () => {

    // CONTEXT VARIABLES
    const responsiveBreakpoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [hasReadinessError, setHasReadinessError] = React.useState<boolean>(false);
    const [hasReadinessWarning, setHasReadinessWarning] = React.useState<boolean>(false);
    const [initializationStateIndex, setInitializationStateIndex] = React.useState<number>(0);

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
            {INITIALIZATION_STATES[initializationStateIndex] === INIT_SYSTEM_READY_CHECK &&
                <Typography component="div">
                    <Grid2 marginBottom={"16px"} maxWidth={"750px"} container size={12} spacing={1}>
                        {errorMessage &&
                            <Alert sx={{ width: !responsiveBreakpoints.isMedium ? "750px" : undefined, maxWidth: "750px" }} severity="error">
                                {errorMessage};
                            </Alert>
                        }
                    </Grid2>

                    {data && data.systemInitializationReady && data.systemInitializationReady.systemInitializationReadyErrors && data.systemInitializationReady.systemInitializationReadyErrors.length > 0 &&
                        <Grid2 marginBottom={"16px"} maxWidth={"750px"} container size={12} spacing={1}>
                            <Alert sx={{ width: !responsiveBreakpoints.isMedium ? "750px" : undefined, maxWidth: "750px", fontSize: "0.95em" }} severity="error">
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
                        <Grid2 marginBottom={"16px"} maxWidth={"750px"} container size={12} spacing={1}>
                            <Alert sx={{ width: !responsiveBreakpoints.isMedium ? "750px" : undefined, maxWidth: "750px", fontSize: "0.95em" }} severity="warning">
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
                        <Grid2 marginBottom={"16px"} maxWidth={"750px"} container size={12} spacing={1}>
                            <Alert sx={{ width: !responsiveBreakpoints.isMedium ? "750px" : undefined, maxWidth: "750px", fontSize: "0.95em" }} severity="success">
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
                            <Button>Next</Button>
                        </Stack>
                    }
                </Typography>
            }
        </React.Fragment>

    )
}

export default SystemInit;