"use client";
import React from "react";
import { AuthenticationComponentsProps } from "./login";
import { Tenant } from "@/graphql/generated/graphql-types";
import { useMutation, useQuery } from "@apollo/client";
import { AUTHENTICATE_ACCEPT_TERMS_AND_CONDITIONS } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "next/link";
import Checkbox from "@mui/material/Checkbox";
import { TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { Typography } from "@mui/material";


const AuthentiationAcceptTermsAndConditions: React.FC<AuthenticationComponentsProps> = ({
    initialUserAuthenticationState,
    onAuthenticationCancelled,
    onUpdateEnd,
    onUpdateStart
}) => {
       

    // STATE VARIABLES
    const [linkClicked, setLinkClicked] = React.useState<boolean>(false);
    const [termsAccepted, setTermsAccepted] = React.useState<boolean>(false);
    const [tenant, setTenant] = React.useState<Tenant | null>(null);

    // GRAPHQL FUNCTIONS
    const {} = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: initialUserAuthenticationState.tenantId
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        },
        onCompleted(data){
            setTenant(data.getTenantMetaData.tenant)
        }
    });
    
    const [acceptTermsAndConditions] = useMutation(AUTHENTICATE_ACCEPT_TERMS_AND_CONDITIONS, {
        onCompleted(data) {
            onUpdateEnd(data.authenticateAcceptTermsAndConditions, null);
        },
        onError(error) {
            onUpdateEnd(null, error.message);
        }
    })

    
    return (
        <React.Fragment>
            <Typography component="div">
                <Grid2 marginBottom={"8px"} container size={12} spacing={1}>
                    <Grid2 fontWeight={"bold"} size={12} marginBottom={"8px"}>This application has terms and conditions which must be accepted before continuing.</Grid2>
                    <Grid2  size={11}>
                        {tenant &&
                            <React.Fragment>
                                <span>I agree to accept the </span>
                                <Link onClick={() => setLinkClicked(true)} href={tenant.termsAndConditionsUri || ""} target="_blank">Terms and Conditions</Link>
                            </React.Fragment>
                        }
                    </Grid2>
                    <Grid2 size={1}>
                        <Checkbox
                            disabled={linkClicked === false}
                            checked={termsAccepted}
                            onChange={(_, checked: boolean) => {
                                setTermsAccepted(checked);
                            }}
                        />
                    </Grid2>
                </Grid2>
                <Stack 
                    width={"100%"}
                    direction={"row-reverse"}
                    spacing={2}
                >
                    <Button
                        onClick={() => {
                            onUpdateStart();
                            acceptTermsAndConditions({
                                variables: {
                                    accepted: termsAccepted,                                
                                    authenticationSessionToken: initialUserAuthenticationState.authenticationSessionToken,
                                    preAuthToken: initialUserAuthenticationState.preAuthToken
                                }
                            });
                        }}
                        disabled={linkClicked === false || termsAccepted === false}
                    >
                        Continue
                    </Button>
                    <Button
                        onClick={() => onAuthenticationCancelled()}
                    >
                        Cancel
                    </Button>
                </Stack>
            </Typography>
        </React.Fragment>
    )

}


export default AuthentiationAcceptTermsAndConditions;