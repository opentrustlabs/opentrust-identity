"use client";
import { RateLimitServiceGroup, RateLimitServiceGroupUpdateInput } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import Backdrop from "@mui/material/Backdrop";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import RateLimitTenantRelConfiguration from "./rate-limit-tenant-configuration";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";

export interface RateLimitDetailProps {
    rateLimitDetail: RateLimitServiceGroup
}

const RateLimitDetail: React.FC<RateLimitDetailProps> = ({
    rateLimitDetail
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

    // STATE VARIABLES
    const initInput: RateLimitServiceGroupUpdateInput = {
        servicegroupid: rateLimitDetail.servicegroupid,
        servicegroupname: rateLimitDetail.servicegroupname,
        servicegroupdescription: rateLimitDetail.servicegroupdescription
    };

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [serviceGroupInput, setServiceGroupInput] = React.useState<RateLimitServiceGroupUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);

    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    arrBreadcrumbs.push({
        linkText: "Rate Limits",
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=rate-limits`
    });
    arrBreadcrumbs.push({
        linkText: rateLimitDetail.servicegroupname,
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
                    </Grid2>
                    <Grid2 size={12} marginBottom={"16px"} marginTop={"16px"}>
                        <Paper sx={{ padding: "8px" }} elevation={1}>
                            <Grid2 container size={12} spacing={2}>
                                {errorMessage &&
                                    <Grid2 size={12}>
                                        <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                    </Grid2>
                                }
                                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Service Group Name</div>
                                        <TextField
                                            required name="serviceGroupName" id="serviceGroupName"
                                            onChange={(evt) => { serviceGroupInput.servicegroupname = evt?.target.value; setServiceGroupInput({ ...serviceGroupInput }); setMarkDirty(true); }}
                                            value={serviceGroupInput.servicegroupname}
                                            fullWidth={true}
                                            size="small" />
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"}>
                                        <div style={{textDecoration: "underline"}}>Object ID</div>
                                        <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                            <Grid2  size={11}>
                                                {rateLimitDetail.servicegroupid}
                                            </Grid2>
                                            <Grid2 size={1}>
                                                <ContentCopyIcon 
                                                    sx={{cursor: "pointer"}}
                                                    onClick={() => {
                                                        copyContentToClipboard(rateLimitDetail.servicegroupid, "Service Group ID copied to clipboard");
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Service Group Description</div>
                                        <TextField
                                            name="serviceGroupDescription" id="serviceGroupDescription"
                                            value={serviceGroupInput.servicegroupdescription}
                                            fullWidth={true}
                                            size="small"
                                            multiline={true}
                                            rows={2}
                                            onChange={(evt) => { serviceGroupInput.servicegroupdescription = evt?.target.value; setServiceGroupInput({ ...serviceGroupInput }); setMarkDirty(true); }}
                                        />
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                            <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                <Button
                                    disabled={!markDirty}
                                    onClick={() => {
                                        setShowMutationBackdrop(true);
                                        //oidcProviderUpdateMutation();                                            
                                    }}
                                >
                                    Update
                                </Button>
                                <Button
                                    sx={{ marginRight: "8px" }}
                                    onClick={() => {
                                        //setOIDCProviderInput(initInput);
                                        setMarkDirty(false);
                                        //setChangeClientSecret(false);
                                    }}
                                    disabled={!markDirty}
                                >
                                    Undo Changes
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid2>
                    <Grid2 size={12} marginBottom={"16px"}>
                        <Accordion defaultExpanded={true}  >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                id={"login-failure-configuration"}
                                sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                            >
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <SettingsApplicationsIcon /><div style={{ marginLeft: "8px" }}>Tenants</div>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <RateLimitTenantRelConfiguration
                                    onUpdateEnd={(success: boolean) => {
                                        setShowMutationBackdrop(false);
                                        if(success){
                                            setShowMutationSnackbar(true);
                                        }
                                    }}
                                    onUpdateStart={() => {
                                        setShowMutationBackdrop(true);
                                    }}
                                    rateLimitServiceGroupId={rateLimitDetail.servicegroupid}

                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid2>
                </DetailPageMainContentContainer>
            </DetailPageContainer >
            <DetailPageRightNavContainer><div></div></DetailPageRightNavContainer>


            <Backdrop
                sx={{ color: '#fff' }}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
            <Snackbar
                open={showMutationSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowMutationSnackbar(false)}
                message="Rate Limit Updated"
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
            />
        </Typography >
    )
}

export default RateLimitDetail;