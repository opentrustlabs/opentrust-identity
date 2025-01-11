"use client";
import React, { useState } from "react";
import { Button, CircularProgress, Divider, Grid2, Paper, Stack, TextField } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DEFAULT_TENANT_META_DATA, QUERY_PARAM_PREAUTH_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN } from "@/utils/consts";
import { TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";


// TODO
// 1.   add handlers for buttons
// 2.   retrieve the tenant information if present, in order to show
//      background colors and logos
// 3.   if there is tenant information, then are the following enabled?
//      a.  forgot password allowed
//      b.  registration allowed
//      c.  phone number as username allowed
// 4.   Show the cancel button only when there is a _tk parameter, (which
//      means that the user is coming from a known client and is doing
//      the oauth2 protocol and so may want to cancel and go back to
//      where they came from.
const Login: React.FC = () => {

    

    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));

    const params = useSearchParams();
    const preauthToken = params.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId = params.get(QUERY_PARAM_PREAUTH_TENANT_ID);

    const [tenantMetaData, setTenantMetaData] = useState(tenantId ? null : DEFAULT_TENANT_META_DATA);
    const {loading} = useQuery(TENANT_META_DATA_QUERY, {
        variables: {
            tenantId: tenantId
        },
        skip: tenantId === null || tenantId === undefined,
        onCompleted(data) {
            setTenantMetaData(data.getTenantMetaData);
        },
        onError(){
            setTenantMetaData(DEFAULT_TENANT_META_DATA);
        }
    });

    if(loading) return <CircularProgress />

    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";
    
    if(tenantMetaData){
        return (

            <Paper
                elevation={4}
                sx={{ padding: 2, height: "100%", maxWidth: maxWidth }}
            >
                <Grid2 spacing={4} container size={{ xs: 12 }}>
                    <Grid2 size={{ xs: 12 }}>
                        <div style={{marginBottom: "16px", fontWeight: "bold", fontSize: "1.2em"}}>Sign In</div>
                        <TextField
                            id="email"
                            required={true}
                            autoFocus={true}
                            label={tenantMetaData.tenant.allowLoginByPhoneNumber ? "Email or phone number" : "Email"}
                            name="email"
                            fullWidth
                        >
                        </TextField>
                    </Grid2>
                    {tenantMetaData.tenant.allowForgotPassword &&
                        <Grid2 size={{ xs: 12 }}>
                            <Stack
                                direction={"row-reverse"}
                            >
                                <span><Link href="/authorize/forgot-password" style={{color: "#1976d2"}}>Forgot password?</Link></span>
                            </Stack>
                        </Grid2>
                    }
                    <Grid2 size={{ xs: 12 }}>
                        <Stack
                            direction={"row-reverse"}
                        >
                            <Button
                                disabled={false}
                                variant="contained"
                                sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px" }}
                            >Next</Button>
                            {preauthToken &&
                                <Button
                                    disabled={false}
                                    variant="contained"
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px" }}
                                >Cancel</Button>
                            }

                        </Stack>
                    </Grid2>
                    {tenantMetaData.tenant.allowUserSelfRegistration &&
                        <>
                            <Grid2 size={{ xs: 12 }}>
                                <Divider></Divider>
                            </Grid2>
                            
                            <Grid2 size={{ xs: 12 }} textAlign={"center"}>
                                <Stack
                                    direction={"row-reverse"}
                                    justifyItems={"center"}
                                    alignItems={"center"}
                                >                        
                                    <Button
                                        disabled={false}
                                        variant="contained"
                                        sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px" }}
                                    >Register</Button>

                                    <div style={{verticalAlign: "center"}}>Need to create an account?</div>
                                </Stack>
                            </Grid2>
                        </>
                    }
                    

                </Grid2>
            </Paper>

        )
    }
}

export default Login;