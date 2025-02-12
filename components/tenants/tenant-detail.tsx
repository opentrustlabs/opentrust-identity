"use client";
import React, { useContext } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, Divider, List, ListItem, Paper, Stack, TextField } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Tenant } from "@/graphql/generated/graphql-types";
import { useQuery } from "@apollo/client";
import { TENANT_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import PasswordIcon from '@mui/icons-material/Password';
import LoginIcon from '@mui/icons-material/Login';
import FaceIcon from '@mui/icons-material/Face';
import InputIcon from '@mui/icons-material/Input';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import PolicyIcon from '@mui/icons-material/Policy';

export interface TenantDetailProps {
    tenantId: string
}
const TenantDetail: React.FC<TenantDetailProps> = ({ tenantId }) => {


    const { data, loading, error } = useQuery(
        TENANT_DETAIL_QUERY,
        {
            skip: tenantId === null || tenantId === undefined,
            variables: {
                tenantId: tenantId
            },
            onError(error) {

            },
        }

    );

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='lg' />

    return <InnerComponent tenant={data.getTenantById} />
}

interface InnerComponentProps {
    tenant: Tenant
}

const InnerComponent: React.FC<InnerComponentProps> = ({
    tenant
}) => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    const arrBreadcrumbs = [];
    if (tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT) {
        arrBreadcrumbs.push({
            href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
            linkText: `Tenant List`
        })
    }
    arrBreadcrumbs.push({
        linkText: tenant.tenantName,
        href: null
    });

    return (

        <Typography component={"div"}>
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />

            <Grid2 container size={12} spacing={3} marginBottom={"16px"} >
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" sx={{backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px"}}  fontWeight={"bold"} size={12}>Overview</Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Name</div>
                                            <TextField name="tenantName" id="tenantName" value={tenant.tenantName} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Descripton</div>
                                            <TextField name="tenantDescription" id="tenantDescription" value={tenant.tenantDescription} fullWidth={true} size="small" multiline={true} rows={2} />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Tenant Type</div>
                                            <TextField name="tenantType" id="tenantType" value={tenant.tenantType} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>External OIDC Provider Constraint</div>
                                            <TextField name="tenantType" id="tenantType" value={tenant.tenantType} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Claims Supported</div>
                                            <TextField name="tenantType" id="tenantType" value={tenant.tenantType} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Default Rate Limit</div>
                                            <TextField name="defaultRateLimit" id="defaultRateLimit" value={tenant.defaultRateLimit} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Default Rate Limit Period (minutes)</div>
                                            <TextField name="defaultRateLimitPeriodMinutes" id="defaultRateLimitPeriodMinutes" value={tenant.defaultRateLimitPeriodMinutes} fullWidth={true} size="small" />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 borderLeft={"dotted 1px lightgrey"} paddingLeft={"8px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={10}>Enabled</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Mark for delete</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow unlimited rate</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow user self-registration</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow anonymous users</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow social login</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Verify email on registration</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Migrate legacy users</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow login by phone number</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Allow password recovery</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                            <Grid2 alignContent={"center"} size={10}>Require CAPTCHA on Registration</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                        </Grid2>
                                    </Grid2>                                    
                                </Grid2>
                                <Stack sx={{marginTop: "8px"}} direction={"row"} flexDirection={"row-reverse"} >
                                    <Button sx={{border: "solid 1px lightgrey", borderRadius: "4px", color: "black"}} >Update</Button>
                                </Stack>
                            </Paper>
                        </Grid2>                        
                        
                        <Grid2 size={12}>
                            <Accordion defaultExpanded={true}  >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"login-failure-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <LoginIcon /><div style={{marginLeft: "8px"}}>Login Failure Configuration</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>

                                    <Grid2 container size={12} spacing={2}>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Login Failure Policy Type</div>
                                            <TextField name="tenantType" id="tenantType" value={"Lock"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Failure Threshold</div>
                                            <TextField name="tenantType" id="tenantType" value={"6"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Pause Duration (in minutes)</div>
                                            <TextField name="tenantType" id="tenantType" value={"30"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Number of pause cycles before locking</div>
                                            <TextField name="tenantType" id="tenantType" value={"5"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Initial backoff duration (in minutes)</div>
                                            <TextField name="tenantType" id="tenantType" value={"4"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Number of backoff cycles before locking</div>
                                            <TextField name="tenantType" id="tenantType" value={"4"} fullWidth={true} size="small" />
                                        </Grid2>
                                    </Grid2>
                                    <Stack sx={{marginTop: "8px"}} direction={"row"} flexDirection={"row-reverse"} >
                                        <Button sx={{border: "solid 1px lightgrey", borderRadius: "4px", color: "black"}} >Update</Button>
                                    </Stack>

                                </AccordionDetails>
                            </Accordion>
                        </Grid2>

                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"password-rules-configuration"}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <PasswordIcon /><div style={{marginLeft: "8px"}}>Password Rules Configuration</div>
                                    </div>                                    
                                </AccordionSummary>
                                <AccordionDetails>

                                    <Grid2 container size={12} spacing={2}>
                                        <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <Grid2 marginBottom={"16px"}>
                                                <div>Password Minimum Length</div>
                                                <TextField name="tenantType" id="tenantType" value={"8"} fullWidth={true} size="small" />
                                            </Grid2>
                                            <Grid2 marginBottom={"16px"} >
                                                <div>Password Maximum Length</div>
                                                <TextField name="tenantType" id="tenantType" value={"64"} fullWidth={true} size="small" />
                                            </Grid2>
                                            <Grid2 marginBottom={"16px"} >
                                                <div>Maximum Consecutive Length Of Identical Characters</div>
                                                <TextField name="tenantType" id="tenantType" value={"2"} fullWidth={true} size="small" />
                                            </Grid2>
                                            <Grid2 marginBottom={"16px"} >
                                                <div>Password Reuse Period</div>
                                                <TextField name="tenantType" id="tenantType" value={"20"} fullWidth={true} size="small" />
                                            </Grid2>
                                            <Grid2 marginBottom={"16px"} >
                                                <div>Change Password Period (days)</div>
                                                <TextField name="tenantType" id="tenantType" value={"720"} fullWidth={true} size="small" />
                                            </Grid2>
                                            <Grid2 marginBottom={"16px"} >
                                                <div>Password Hashing Algorithm</div>
                                                <TextField name="tenantType" id="tenantType" value={"Blowfish 12 Rounds"} fullWidth={true} size="small" />
                                            </Grid2>
                                        </Grid2>

                                        <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <Grid2 borderLeft={"dotted 1px lightgrey"} paddingLeft={"8px"} container size={12}>
                                                <Grid2 alignContent={"center"} size={10}>
                                                    Require Uppercase
                                                </Grid2>
                                                <Grid2 size={2}><Checkbox /></Grid2>

                                                <Grid2 alignContent={"center"} size={10}>
                                                    Require Lowercase
                                                </Grid2>
                                                <Grid2 size={2}><Checkbox /></Grid2>

                                                <Grid2 alignContent={"center"} size={10}>
                                                    Require Numbers
                                                </Grid2>
                                                <Grid2 size={2}><Checkbox /></Grid2>

                                                <Grid2 alignContent={"center"} size={10}>
                                                    Require Special Characters
                                                </Grid2>
                                                <Grid2 size={2}><Checkbox /></Grid2>

                                                <Grid2 marginTop={"8px"} alignContent={"center"} size={10}>
                                                    <div>Special Characters Allowed</div>
                                                    <TextField name="tenantType" id="tenantType" value={"4"} fullWidth={true} size="small" />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                    <Divider sx={{ marginTop: "16px" }} />
                                    <Grid2 marginTop={"24px"} container size={12} spacing={2}>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <Grid2 container size={12}>
                                                <Grid2 alignContent={"center"} size={12}>Allow Or Require Multi-factor Auth Dropdown?</Grid2>
                                                <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                    <TextField name="tenantType" id="tenantType" value={"30"} fullWidth={true} size="small" />
                                                </Grid2>
                                                <Grid2 alignContent={"center"} size={12}>
                                                    MFA Auth Types Allowed/Required
                                                </Grid2>
                                                <Grid2 alignContent={"center"} size={12}>
                                                    <TextField name="tenantType" id="tenantType" value={"30"} fullWidth={true} size="small" />
                                                </Grid2>

                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                    <Stack sx={{marginTop: "8px"}} direction={"row"} flexDirection={"row-reverse"} >
                                        <Button sx={{border: "solid 1px lightgrey", borderRadius: "4px", color: "black"}} >Update</Button>
                                    </Stack>

                                </AccordionDetails>
                            </Accordion>
                        </Grid2>

                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"anonymous-user-configuration"}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <FaceIcon /><div style={{marginLeft: "8px"}}>Anonymous User Configuration</div>
                                    </div>
                                    
                                </AccordionSummary>
                                <AccordionDetails>


                                    <Grid2 container size={12} spacing={2}>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Default Country Code</div>
                                            <TextField name="tenantType" id="tenantType" value={"US"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Default Language Code</div>
                                            <TextField name="tenantType" id="tenantType" value={"en"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Token Time-To-Live (in seconds)</div>
                                            <TextField name="tenantType" id="tenantType" value={"30000000"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Scope Values</div>
                                            <TextField name="tenantType" id="tenantType" value={"5"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Member Groups</div>
                                            <TextField name="tenantType" id="tenantType" value={"4"} fullWidth={true} size="small" />
                                        </Grid2>
                                    </Grid2>
                                    <Stack sx={{marginTop: "8px"}} direction={"row"} flexDirection={"row-reverse"} >
                                        <Button sx={{border: "solid 1px lightgrey", borderRadius: "4px", color: "black"}} >Update</Button>
                                    </Stack>

                                </AccordionDetails>
                            </Accordion>
                        </Grid2>

                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"legacy-user-migration-configuration"}
                                    sx={{ fontWeight: "bold"}}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <InputIcon /><div style={{marginLeft: "8px"}}>Legacy User Migration Configuration</div>
                                    </div>
                                    
                                </AccordionSummary>
                                <AccordionDetails>

                                    <Grid2 container size={12} spacing={2}>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>Authentication URI</div>
                                            <TextField name="tenantType" id="tenantType" value={"https://sigmaaldrich.com/ecommerce/users/login"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>User Profile URI</div>
                                            <TextField name="tenantType" id="tenantType" value={"https://sigmaaldrich.com/ecommerce/users/profile"} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                                            <div>User Name-Check URI</div>
                                            <TextField name="tenantType" id="tenantType" value={"https://sigmaaldrich.com/ecommerce/users/userexists"} fullWidth={true} size="small" />
                                        </Grid2>
                                    </Grid2>
                                    <Stack sx={{marginTop: "8px"}} direction={"row"} flexDirection={"row-reverse"} >
                                        <Button sx={{border: "solid 1px lightgrey", borderRadius: "4px", color: "black"}} >Update</Button>
                                    </Stack>

                                </AccordionDetails>
                            </Accordion>
                        </Grid2>


                        <Grid2 size={12}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"tenant-look-and-feel-configuration"}
                                    sx={{ fontWeight: "bold" }}
                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <DisplaySettingsIcon /><div style={{marginLeft: "8px"}}>Tenant Look and Feel</div>
                                    </div>
                                    
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid2 container size={12} spacing={2}>
                                        <Paper sx={{ padding: "8px" }} elevation={3}>
                                            <div style={{ height: "128px", backgroundColor: "lightgray" }}></div>
                                        </Paper>
                                    </Grid2>
                                    <Stack sx={{marginTop: "8px"}} direction={"row"} flexDirection={"row-reverse"} >
                                        <Button sx={{border: "solid 1px lightgrey", borderRadius: "4px", color: "black"}} >Update</Button>
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>

                    </Grid2>
                </Grid2>

                <Grid2 spacing={2} size={{ xs: 12, sm: 12, md: 12, lg: 3, xl: 3 }}>
                    <Grid2 container spacing={2} size={12}>
                        <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >                            
                            <Paper elevation={3} >
                                <div className="detail-page-subheader">Tenant Management Domains</div>
                                <List sx={{padding: "8px"}}>
                                    <ListItem disablePadding>opentrust.org</ListItem>
                                    <ListItem disablePadding>opentrust.com</ListItem>
                                    <ListItem disablePadding>megacorp.com</ListItem>
                                    <ListItem disablePadding><MoreHorizOutlinedIcon /></ListItem>
                                </List>

                                <Divider />
                                <Stack sx={{ padding: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    <EditOutlinedIcon />
                                </Stack>
                            </Paper>

                        </Grid2>


                        <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >                            
                            <Paper elevation={3} >
                            <div className="detail-page-subheader">Tenant Authentication Domains</div>
                                <List sx={{ padding: "8px" }}>
                                    <ListItem disablePadding>opentrust.org</ListItem>
                                    <ListItem disablePadding>opentrust.com</ListItem>
                                    <ListItem disablePadding>megacorp.com</ListItem>
                                </List>

                                <Divider />
                                <Stack sx={{ padding: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    <EditOutlinedIcon />
                                </Stack>
                            </Paper>
                        </Grid2>


                        <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >                            
                            <Paper elevation={3} >
                            <div className="detail-page-subheader">Federated OIDC Providers</div>
                                <List sx={{ padding: "8px" }}>
                                    <ListItem disablePadding>opentrust.org</ListItem>
                                    <ListItem disablePadding>opentrust.com</ListItem>
                                    <ListItem disablePadding>megacorp.com</ListItem>
                                </List>

                                <Divider />
                                <Stack sx={{ padding: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    <EditOutlinedIcon />
                                </Stack>
                            </Paper>
                        </Grid2>


                        <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >
                            <Paper elevation={3} >                                
                                <div className="detail-page-subheader">Social Identity Providers</div>
                                <List sx={{ padding: "8px" }}>
                                    <ListItem disablePadding>opentrust.org</ListItem>
                                    <ListItem disablePadding>opentrust.com</ListItem>
                                    <ListItem disablePadding>megacorp.com</ListItem>
                                </List>

                                <Divider />
                                <Stack sx={{ padding: "8px" }} direction={"row"} flexDirection={"row-reverse"} paddingTop={"8px"} >
                                    <EditOutlinedIcon />
                                </Stack>
                            </Paper>
                        </Grid2>
                    </Grid2>
                </Grid2>

            </Grid2>
        </Typography >
    )
}

export default TenantDetail;