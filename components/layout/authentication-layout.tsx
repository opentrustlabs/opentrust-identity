"use client";
import React, { ReactNode } from "react";
import AuthenticationHeader from "./authentication-header";
import AuthenticationFooter from "./authentication-footer";
import Container from "@mui/material/Container";
import { Grid2 } from "@mui/material";
// import { useSearchParams } from 'next/navigation';
import { DEFAULT_TENANT_META_DATA, QUERY_PARAM_PREAUTH_TENANT_ID } from "@/utils/consts";
import { useQuery } from "@apollo/client";
import { TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";

interface LayoutProps {
    children: ReactNode
}
const AuthenticationLayout: React.FC<LayoutProps> = ({
    children,
  }) => {


    // const params = useSearchParams();
    const params = new Map<string, string>();
    const tenantId = params?.get(QUERY_PARAM_PREAUTH_TENANT_ID);

    const {data, error, loading} = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: tenantId
        },
        skip: tenantId === null || tenantId === undefined
    });

    if(loading) return <div />

    if(!tenantId || error || data)
        return (
            <div
                style={{ }}
            >
                
                <AuthenticationHeader
                    tenantMetaData={
                        !tenantId || error ? DEFAULT_TENANT_META_DATA : data.getTenantMetaData
                    }
                ></AuthenticationHeader>
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
                <AuthenticationFooter
                    tenantMetaData={
                        !tenantId || error ? DEFAULT_TENANT_META_DATA : data.getTenantMetaData
                    }
                ></AuthenticationFooter>
                
            </div>
        )
}

export default AuthenticationLayout;