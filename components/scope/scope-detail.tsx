"use client";
import { Scope } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { SCOPE_USE_DISPLAY, SCOPE_USE_IAM_MANAGEMENT, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Divider from "@mui/material/Divider";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import SchemaIcon from '@mui/icons-material/Schema';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import InputAdornment from "@mui/material/InputAdornment";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";


export interface ScopeDetailProps {
    scope: Scope
}

const ScopeDetail: React.FC<ScopeDetailProps> = ({ scope }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();


    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    arrBreadcrumbs.push({
        linkText: "Scope / Access Control",
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=scope-access-control`
    });
    arrBreadcrumbs.push({
        linkText: scope.scopeName,
        href: null
    })



    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs}></BreadcrumbComponent>
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2
                            className="detail-page-subheader"
                            sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }}
                            fontWeight={"bold"}
                            size={12}
                        >
                            Overview
                        </Grid2>
                        <Grid2 size={12}>
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Name</div>
                                            <TextField disabled={scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT} name="scopeName" id="scopeName" value={scope.scopeName} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Description</div>
                                            <TextField
                                                disabled={scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT}
                                                name="scopeDescription"
                                                id="scopeDescription"
                                                value={scope.scopeDescription}
                                                fullWidth={true}
                                                size="small"
                                                multiline={true}
                                                rows={2}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>Object ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2  size={11}>
                                                    {scope.scopeId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            copyContentToClipboard(scope.scopeId, "Scope ID copied to clipboard");
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"8px"}>
                                            <div>Scope Use</div>
                                            <TextField disabled={true} name="scopeUse" id="scopeUse" value={SCOPE_USE_DISPLAY.get(scope.scopeUse)} fullWidth={true} size="small" />
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                                {/* TODO Show the button only when the scope is editable, which it will not be for IAM Management types of scope */}
                                <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    <Button disabled={scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT} sx={{ border: "solid 1px lightgrey", borderRadius: "4px"}} >Update</Button>
                                </Stack>
                            </Paper>
                        </Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion defaultExpanded={true}  >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"login-failure-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <SchemaIcon /><div style={{marginLeft: "8px"}}>Access Rule Schema</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add New Version</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    
                                    <Typography component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                            <Grid2 size={5}>Schema Name</Grid2>
                                            <Grid2 size={4}>Mark for delete</Grid2>
                                            <Grid2 size={2}>Version</Grid2>                                                    
                                            <Grid2 size={1}></Grid2>
                                        </Grid2>
                                    </Typography>
                                    <Divider />
                                    {["1", "2", "3"].map(                                            
                                        (name: string) => (
                                            <Typography key={`${name}`} component={"div"} fontSize={"0.9em"} >
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={5}>Schema Name</Grid2>
                                                    <Grid2 size={4}>Mark for delete</Grid2>
                                                    <Grid2 size={2}>{name}</Grid2>                                                    
                                                    <Grid2 size={1}><EditOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>                                                
                                        )
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>

                        <Grid2 size={12} marginBottom={"16px"}>
                            <Accordion defaultExpanded={true}  >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={"login-failure-configuration"}
                                    sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                >
                                    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <SettingsApplicationsIcon /><div style={{marginLeft: "8px"}}>Tenants</div>
                                    </div>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                                <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <AddBoxIcon sx={{ marginRight: "8px", cursor: "pointer" }} />
                                                    <span>Add Tenant</span>
                                                </div>
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    <Typography component={"div"} fontWeight={"bold"} >
                                        <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                                            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} fontSize={"0.95em"} margin={"8px 0px 24px 0px"}>
                                            <TextField
                                                label={"Filter Tenants"}
                                                size={"small"}
                                                name={"filter"}
                                                value={""}
                                                
                                                slotProps={{
                                                    input: {
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <CloseOutlinedIcon
                                                                    sx={{ cursor: "pointer" }}
                                                                    onClick={() => {  }}
                                                                />
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }}
                                            />
                                            </Stack>
                                        </Grid2>
                                    </Typography>
                                    
                                    <Typography component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                            <Grid2 size={8}>Tenant</Grid2>
                                            <Grid2 size={3}>Access Rule</Grid2>
                                            <Grid2 size={1}></Grid2>
                                        </Grid2>
                                    </Typography>
                                    <Divider />
                                    {["Home Depot Prod", "Amgen", "Pfizer", "AirBnB", "MilliporeSigma", ].map(                                            
                                        (name: string, idx: number) => (
                                            <Typography key={`${name}`} component={"div"} fontSize={"0.9em"} >
                                                <Divider></Divider>
                                                <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                                                    <Grid2 size={8}>{name}</Grid2>                                                                                                        
                                                    <Grid2 size={3}>{idx === 1 || idx === 4 ? <StraightenIcon /> : <AddBoxIcon />}</Grid2>
                                                    <Grid2 size={1}><DeleteForeverOutlinedIcon /></Grid2>
                                                </Grid2>
                                            </Typography>                                                
                                        )
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>

                    </Grid2>
                </DetailPageMainContentContainer>
                <DetailPageRightNavContainer>
                    <Grid2 container spacing={2} size={12}>
                        
                    </Grid2>
                </DetailPageRightNavContainer>
            </DetailPageContainer>

        </Typography>

    )
}

export default ScopeDetail;