"use client";
import React, { MouseEventHandler, useState } from "react";
import { Button, CircularProgress, Divider, Grid2, Paper, Stack, TextField } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DEFAULT_TENANT_META_DATA, QUERY_PARAM_PREAUTH_REDIRECT_URI, QUERY_PARAM_PREAUTH_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN } from "@/utils/consts";
import { TENANT_META_DATA_QUERY } from "@/graphql/queries/oidc-queries";
import { useLazyQuery, useQuery } from "@apollo/client";


// TODO
// 1.   retrieve the tenant information if present, in order to show
//      background colors and logos

const MIN_USERNAME_LENGTH = 6;

const Login: React.FC = () => {

    const [userName, setUserName] = useState<string | null>(null);

    const theme = useTheme();
    const isMd: boolean = useMediaQuery(theme.breakpoints.down("md"));
    const isSm: boolean = useMediaQuery(theme.breakpoints.down("sm"));

    const params = useSearchParams();
    const preauthToken = params.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId = params.get(QUERY_PARAM_PREAUTH_TENANT_ID);
    const redirectUri = params.get(QUERY_PARAM_PREAUTH_REDIRECT_URI);

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

    // const {data: nextActionData, loading: nextActionLoading, error: nextActionError } = useLazyQuery(

    // );


    const maxWidth = isSm ? "90vw" : isMd ? "80vw" : "650px";

    const handleNextClick = (evt: any) => {
        console.log(evt);
    }
    const handleEnterButtonPress = (evt: React.KeyboardEvent) => {
        console.log(evt.key.valueOf());
        if(evt.key.valueOf().toLowerCase() === "enter"){
            if(userName && userName.length > MIN_USERNAME_LENGTH){
                
            }
        }
    }
    

    if(loading) return <CircularProgress />   
    
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
                            onChange={(evt) => setUserName(evt.target.value)}
                            onKeyDown={handleEnterButtonPress}
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
                                disabled={userName === null || userName.length < MIN_USERNAME_LENGTH || (!tenantMetaData.tenant.allowLoginByPhoneNumber && userName.indexOf("@") < 1)}
                                variant="contained"
                                sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px" }}
                                onClick={handleNextClick}
                            >Next</Button>
                            {preauthToken &&
                                <a href={`${redirectUri}?error=access_denied`}>
                                <Button
                                    disabled={false}
                                    variant="contained"
                                    sx={{ height: "100%", padding: "8px 32px 8px 32px" }}
                                >Cancel</Button>
                                </a>
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
                                    <a href="/authorize/register">
                                        <Button
                                            disabled={false}
                                            variant="contained"
                                            sx={{ height: "100%", padding: "8px 32px 8px 32px", marginLeft: "8px" }}
                                        >Register</Button>
                                    </a>

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