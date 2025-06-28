"use client";
import React, { ReactNode, useContext } from "react";
import AuthenticationHeader from "./authentication-header";
import AuthenticationFooter from "./authentication-footer";
import Container from "@mui/material/Container";
import { Grid2 } from "@mui/material";
// import { useSearchParams } from 'next/navigation';
import { DEFAULT_TENANT_META_DATA, QUERY_PARAM_TENANT_ID } from "@/utils/consts";
import { useQuery } from "@apollo/client";
import { TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { useSearchParams } from "next/navigation";
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import ErrorComponent from "../error/error-component";
import DataLoading from "./data-loading";

interface LayoutProps {
    children: ReactNode
}
const AuthenticationLayout: React.FC<LayoutProps> = ({
    children,
  }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);

    // REACT HOOKS
    const params = useSearchParams();
    const tenantId = params?.get(QUERY_PARAM_TENANT_ID);

    // STATE VARIABLES
    // const [isComplete, setIsComplete] = React.useState<boolean>(tenantId === undefined || tenantId === null ? true : false);

    // GRAPHQL FUNCTIONS
    const {error, loading} = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: tenantId
        },
        skip: tenantId === null || tenantId === undefined,
        onCompleted(data) {            
            if(data.getTenantMetaData !== null){             
                tenantBean.setTenantMetaData(data.getTenantMetaData);             
            }    
        }
    });

    if(loading) return <DataLoading dataLoadingSize={"lg"} color={null} />
    if(error) return <ErrorComponent componentSize={"xl"} message={error.message}  />

    if(tenantBean && tenantBean.getTenantMetaData()){
        const theme = createTheme({    
            components: {
                MuiButton: {
                    defaultProps: {
                        
                    },                    
                    styleOverrides: {
                        root: {
                            "&:disabled": {
                                color: "white",
                                backgroundColor: "lightgrey"
                            },
                            variants: [
                                {
        
                                }
                            ],
                            color: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheadertextcolor || "white",
                            backgroundColor: tenantBean.getTenantMetaData().tenantLookAndFeel?.authenticationheaderbackgroundcolor || "#1976d2",
                            fontWeight: "bold",
                            fontSize: "0.9em",
                            height: "100%", 
                            padding: "8px 32px 8px 32px", 
                            marginLeft: "8px" 
                        }                        
                    }        
                },
                MuiTextField: {
                    styleOverrides: {
                        root: {
                            
                        },
                        
                    }
                },
                MuiTypography: {
                    styleOverrides: {
                        root: {
                            fontSize: "0.9em"
                        }
                    },
                    defaultProps: {                
                        fontSize: "0.9em"
                    }
                }
            },
            typography: {        
              fontSize: 12
            }
        });

        return (
            <div
                style={{ }}
            >
                <ThemeProvider theme={theme}>                
                    <AuthenticationHeader
                        tenantMetaData={
                            !tenantId || error ? DEFAULT_TENANT_META_DATA : tenantBean.getTenantMetaData()
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
                            sx={{minHeight: "90vh"}}
                        >
                            <Grid2>
                                <div>{children}</div>
                            </Grid2>
                        </Grid2>                
                    </Container>
                    <AuthenticationFooter
                        tenantMetaData={
                            !tenantId || error ? DEFAULT_TENANT_META_DATA : tenantBean.getTenantMetaData()
                        }
                    ></AuthenticationFooter>
                </ThemeProvider>                
            </div>
        )
    }
}

export default AuthenticationLayout;