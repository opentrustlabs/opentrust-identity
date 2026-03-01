"use client";
import React, { ReactNode, useContext } from "react";
import AuthenticationHeader from "./authentication-header";
import AuthenticationFooter from "./authentication-footer";
import Container from "@mui/material/Container";
import { CssBaseline, Grid2 } from "@mui/material";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TENANT_META_DATA, DEFAULT_TEXT_COLOR, QUERY_PARAM_TENANT_ID, QUERY_PARAM_AUTHENTICATE_TO_PORTAL, DEFAULT_TENANT_LOOK_AND_FEEL } from "@/utils/consts";
import { useQuery } from "@apollo/client";
import { TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { useSearchParams } from "next/navigation";
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import ErrorComponent from "../error/error-component";
import DataLoading from "./data-loading";
import { TenantLookAndFeel } from "@/graphql/generated/graphql-types";

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
    const authenticateToPortal = params?.get(QUERY_PARAM_AUTHENTICATE_TO_PORTAL);
    let textColor = DEFAULT_TEXT_COLOR;
    let backgroundColor = DEFAULT_BACKGROUND_COLOR;
    if(authenticateToPortal !== "true"){
        textColor = tenantBean.getTenantMetaData().tenantLookAndFeel?.headertextcolor || DEFAULT_TEXT_COLOR;
        backgroundColor = tenantBean.getTenantMetaData().tenantLookAndFeel?.headerbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
    }
   
    // STATE VARIABLES
    const [lookAndFeel, setLookAndFeel] = React.useState<TenantLookAndFeel>();
 
    // GRAPHQL FUNCTIONS
    const {error, loading} = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: tenantId
        },
        skip: tenantId === null || tenantId === undefined,
        onCompleted(data) {            
            if(data.getTenantMetaData !== null){             
                tenantBean.setTenantMetaData(data.getTenantMetaData);
                setLookAndFeel(data.getTenantMetaData.tenantLookAndFeel || DEFAULT_TENANT_LOOK_AND_FEEL);
            }    
        }
    });

    if(loading) return <DataLoading dataLoadingSize={"lg"} color={null} />
    if(error) return <ErrorComponent componentSize={"xl"} message={error.message}  />

    if(lookAndFeel){
        const palette = lookAndFeel.pagebackgroundcolor ? {background: {default: lookAndFeel.pagebackgroundcolor }} : {};
        const theme = createTheme({
            palette: palette,
            components: {                
                MuiButton: {
                    defaultProps: {
                        variant: "contained"
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
                            color: lookAndFeel.buttontextcolor || textColor,
                            backgroundColor: lookAndFeel.buttonbackgroundcolor || backgroundColor,
                            fontWeight: "bold",
                            fontSize: "0.9em",
                            height: "100%", 
                            padding: "8px 32px 8px 32px", 
                            marginLeft: "8px",
                            borderRadius: tenantBean.getTenantMetaData().tenantLookAndFeel?.buttonborderradius ?? "4px"
                        }                        
                    }        
                },
                MuiTextField: {
                    styleOverrides: {
                        root: {
                            '& .MuiOutlinedInput-root': {
                                '& fieldset, &:hover fieldset, &.Mui-focused fieldset': {
                                    borderColor: lookAndFeel.inputbordercolor || "default",
                                }                                
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: lookAndFeel.inputbordercolor || "default"
                            }
                        }                        
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
                    <CssBaseline />
                    <AuthenticationHeader
                        tenantMetaData={
                            tenantBean.getTenantMetaData().tenant.tenantId === "" || error ? DEFAULT_TENANT_META_DATA : tenantBean.getTenantMetaData()
                        }
                        isAuthenticateToPortal={authenticateToPortal === "true"}
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
                            tenantBean.getTenantMetaData().tenant.tenantId === "" || error ? DEFAULT_TENANT_META_DATA : tenantBean.getTenantMetaData()
                        }
                        isAuthenticateToPortal={authenticateToPortal === "true"}
                    ></AuthenticationFooter>
                </ThemeProvider>                
            </div>
        )
    }
}

export default AuthenticationLayout;