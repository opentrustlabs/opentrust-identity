"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { SYSTEM_INITIALIZATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import { SystemInitializationResponse, Tenant } from "@/graphql/generated/graphql-types";
import { useRouter } from "next/navigation";
import { QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_TENANT_ID } from "@/utils/consts";
import { AuthSessionProps, useAuthSessionContext } from "../contexts/auth-session-context";

const InitSubmit: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onError,
    systemInitInput
}) => {


    // CONTEXT VARIABLES
    const router = useRouter();
    const authSessionProps: AuthSessionProps = useAuthSessionContext();

    // STATE VARIABLES
    const [initializationSuccessful, setInitializationSuccessful] = React.useState<boolean>(false);
    const [rootTenant, setRootTenant] = React.useState<Tenant | null>(null);

    // GRAPHQL FUNCTIONS
    const [systemInitializationMutation] = useMutation(SYSTEM_INITIALIZATION_MUTATION, {
        variables: {
            systemInitializationInput: systemInitInput
        },
        onCompleted(data) {
            const response: SystemInitializationResponse = data.initializeSystem as SystemInitializationResponse;
            if(response.systemInitializationErrors && response.systemInitializationErrors.length > 0){
                onError(response.systemInitializationErrors[0].errorKey);
            }
            else{
                if(response.tenant){
                    setRootTenant(response.tenant);
                    setInitializationSuccessful(true);
                    authSessionProps.deleteAuthSessionData();
                }
                else{
                    onError("No root tenant was created. See the logs for details.");
                }
            }
        },
        onError(error) {
            onError(error.message);
        }    
    });

    return (
        <Typography component="div" sx={{width: "100%"}}>
            <Paper
                elevation={1}
                sx={{ padding: "8px", border: "solid 1px lightgrey" }}
                
            >
                {initializationSuccessful &&
                    <React.Fragment>
                        <Grid2 container size={12} spacing={1}>
                            <Grid2 fontWeight={"bold"} size={12} marginBottom={"32px"}>
                                System Initialization Successfully Completed. Click below to login
                            </Grid2>
                        </Grid2>
                        <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                            <Button
                                onClick={() => {
                                    const tenantId = rootTenant?.tenantId || "";
                                    router.push(`/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true&${QUERY_PARAM_TENANT_ID}=${tenantId}`);
                                }}
                                disabled={rootTenant === null || rootTenant?.tenantId === undefined}
                            >
                                Login
                            </Button>                 
                            
                        </Stack>
                    </React.Fragment>
                }
                {!initializationSuccessful &&
                    <React.Fragment>
                        <Grid2 container size={12} spacing={1}>
                            <Grid2 fontWeight={"bold"} size={12} marginBottom={"32px"}>
                                Complete System Initialization                     
                            </Grid2>
                        </Grid2>
                        <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                            <Button
                                onClick={() => {
                                    systemInitializationMutation();
                                }}
                            >
                                Finish
                            </Button>                 
                            <Button
                                onClick={() => {
                                    onBack();
                                }}
                            >
                                Back
                            </Button>
                        </Stack>
                    </React.Fragment>
                }
            </Paper>
        </Typography>
    )
}

export default InitSubmit;