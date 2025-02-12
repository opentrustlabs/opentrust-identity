"use client";
import React, { useContext } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, Divider, Paper, Stack, TextField, InputAdornment } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { AuthorizationGroup } from "@/graphql/generated/graphql-types";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PolicyIcon from '@mui/icons-material/Policy';
import Link from "next/link";
import UserList from "../users/user-list";

export interface AuthorizationGroupDetailProps {
    authorizationGroup: AuthorizationGroup
}

const AuthorizationGroupDetail: React.FC<AuthorizationGroupDetailProps> = ({ authorizationGroup }) => {

    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    arrBreadcrumbs.push({
        linkText: "Authorization Groups",
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=authorization-groups`
    });
    arrBreadcrumbs.push({
        linkText: authorizationGroup.groupName,
        href: null
    })


    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
            <Grid2 container size={12} spacing={3} marginBottom={"16px"}>
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} size={12}>Overview</Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            <Paper elevation={0} sx={{ padding: "8px" }}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Group Name</div>
                                            <TextField name="tenantName" id="tenantName" value={authorizationGroup.groupName} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 container size={12} marginBottom={"16px"}>
                                            <Grid2 alignContent={"center"} size={10}>Default</Grid2>
                                            <Grid2 size={2}><Checkbox /></Grid2>
                                        </Grid2>
                                        <Grid2 >Object ID</Grid2>
                                        <Grid2 container size={12} marginBottom={"16px"}>
                                            <Grid2 alignContent={"center"} size={10}>{authorizationGroup.groupId}</Grid2>
                                            <Grid2 size={2}><ContentCopyIcon /></Grid2>
                                        </Grid2>
                                        <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                            <Button sx={{ border: "solid 1px lightgrey", borderRadius: "4px", color: "black" }} >Update</Button>
                                        </Stack>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>

                                    </Grid2>
                                </Grid2>
                            </Paper>
                        </Grid2>

                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion defaultExpanded={true}  >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"redirect-uri-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                >
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <PersonIcon /><div style={{ marginLeft: "8px" }}>Users</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"8px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 16px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add User To Authorization Group</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    <UserList
                                        tenantId={tenantBean.getTenantMetaData().tenant.tenantId}
                                        authorizationGroupId={authorizationGroup.groupId}
                                        authenticationGroupId={null}
                                        page={0}
                                        perPage={10}
                                        embedded={true}
                                    />
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>


                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"redirect-uri-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                >
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <PolicyIcon /><div style={{ marginLeft: "8px" }}>Access Control</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add Scope</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    <Divider></Divider>
                                    {["Read Reports in QA", "Update Reports in QA", "Delete Reports in QA"].map(
                                        (uri: string) => (
                                            <Typography key={`${uri}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={11}><Link href={`/123412341234/authentication-groups/1234372987349`}>{uri}</Link></Grid2>
                                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>
                                        )
                                    )}

                                </AccordionDetails>
                            </Accordion>
                        </Grid2>



                    </Grid2>
                </Grid2>

                <Grid2 spacing={2} size={3}>

                </Grid2>

            </Grid2>
        </Typography >
    )
}

export default AuthorizationGroupDetail;