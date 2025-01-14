"use client";
import React, { ReactNode } from "react";
import Container from "@mui/material/Container";
import { Grid2 } from "@mui/material";
import { useSearchParams, useParams } from 'next/navigation';

import { DEFAULT_TENANT_META_DATA, QUERY_PARAM_PREAUTH_TENANT_ID } from "@/utils/consts";
import { useQuery } from "@apollo/client";
import { TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import ManagementHeader from "./management-header";
import ManagementFooter from "./management-footer";

interface LayoutProps {
    children: ReactNode
}
const ManagementLayout: React.FC<LayoutProps> = ({
    children,
  }) => {


    //const params = useSearchParams();
    //const tenantId = params.get(QUERY_PARAM_PREAUTH_TENANT_ID);

    // State management variables
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);


    const params = useParams();
    const tenantIdFromPath = params.tenant_id;
    console.log("tenant id from path is: " + tenantIdFromPath);

    // If tenantIdFromPath is null or undefined, then we may redirect to the login screen. 
    // Bur first we will check some things:
    //
    // 1.   Have we saved a tenant id in local stored to which the user has management access?
    // 2.   What is the user profile from the "me" call. Is there a valid user?
    // 3.   Is there a tenant id which the user can manage and which is set in their profile?
    // 
    // Note that the query param _pa=true will be present in these authentication redirects.
    // _pa=true is a flag that indicates that the user is NOT coming from a client (which is
    // doing an OAuth2 flow) but rather from a user who wants to authenticate and access a
    // management screen.
    // 
    // ACTIONS
    // =======
    // 1.   If no user profile and no tenant id in local storage, then
    //      redirect to the /authorization/login?_pa=true screen.
    // 2.   If the profile is valid and the user has access to a management screen, then
    //      redirect to the landing page of the tenant, which is just /{tenant_id}/
    // 3.   If the profile is valid but the user does NOT have access to a management screen then
    //      show an error message
    // 4.   If there is no a valid user profile but there IS a tenant id in local storeage, then
    //      redirect to /authorization/login?_tid={tenant id found in local storage}&_pa=true
    //
    // Any redirects to the authorization screen will ALSO include any saved language and country
    // values that were saved in local storage, or defaulted to en-US

    const {data, error, loading} = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: tenantIdFromPath
        },
        skip: tenantIdFromPath === null || tenantIdFromPath === undefined,
        onCompleted(data) {
            if(data.getTenantMetaData === null){
                setErrorMessage("No tenant to display")
            }
        },
        onError(error) {
            setErrorMessage(JSON.stringify(error));
        },
    });

    // if(loading) return <CircularProgress />
    if(loading) return <div />
    if(error) return (
        <div
            style={{ }}
        >
            <ManagementHeader
                tenantMetaData={
                    DEFAULT_TENANT_META_DATA
                }
            />
            
            <Container
                maxWidth="xl"
            >
                <Grid2 
                    container
                    spacing={0}
                    alignItems={"center"}
                    justifyContent={"center"}
                    sx={{minHeight: "84vh"}}
                >
                    <Grid2>
                        <div>{errorMessage}</div>
                    </Grid2>
                </Grid2>                
            </Container>
            <ManagementFooter
                tenantMetaData={
                    DEFAULT_TENANT_META_DATA
                }
            ></ManagementFooter>
            
        </div>
    )
        
    if(data)
        return (
            <div
                style={{ }}
            >
                <ManagementHeader
                    tenantMetaData={
                        data.getTenantMetaData
                    }
                />
                
                <Container
                    maxWidth="xl"
                >
                    <Grid2 
                        container
                        spacing={0}
                        alignItems={"center"}
                        justifyContent={"center"}
                        sx={{minHeight: "84vh"}}
                    >
                        <Grid2>
                            <div>{children}</div>
                        </Grid2>
                    </Grid2>                
                </Container>
                <ManagementFooter
                    tenantMetaData={
                        data.getTenantMetaData
                    }
                ></ManagementFooter>
                
            </div>
        )
}

export default ManagementLayout;