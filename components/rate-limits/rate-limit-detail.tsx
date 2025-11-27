"use client";
import { MarkForDeleteObjectType, RateLimitServiceGroup, RateLimitServiceGroupUpdateInput, PortalUserProfile } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { DEFAULT_BACKGROUND_COLOR, RATE_LIMIT_DELETE_SCOPE, RATE_LIMIT_UPDATE_SCOPE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import Backdrop from "@mui/material/Backdrop";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
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
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import { useMutation } from "@apollo/client";
import { RATE_LIMIT_SERVICE_GROUP_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { RATE_LIMIT_BY_ID_QUERY } from "@/graphql/queries/oidc-queries";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { ERROR_CODES } from "@/lib/models/error";
import { useIntl } from 'react-intl';
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import SpeedIcon from '@mui/icons-material/Speed';
import Tooltip from "@mui/material/Tooltip";


export interface RateLimitDetailProps {
    rateLimitDetail: RateLimitServiceGroup
}

const RateLimitDetail: React.FC<RateLimitDetailProps> = ({
    rateLimitDetail
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();


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
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(rateLimitDetail.markForDelete);
    const [disableInputs] = React.useState<boolean>(rateLimitDetail.markForDelete || !containsScope(RATE_LIMIT_UPDATE_SCOPE, profile?.scope || []));
    const [canDeleteRateLimit] = React.useState<boolean>(containsScope(RATE_LIMIT_DELETE_SCOPE, profile?.scope || []));


    // GRAPHQL FUNCTIONS
    const [updateRateLimitServiceGroupMutation] = useMutation(RATE_LIMIT_SERVICE_GROUP_UPDATE_MUTATION, {
        variables: {
            rateLimitServiceGroupInput: serviceGroupInput
        },
        onCompleted() {
            setShowMutationBackdrop(false);
            setMarkDirty(false);
            setShowMutationSnackbar(true);
        }, 
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        refetchQueries: [RATE_LIMIT_BY_ID_QUERY]
    });

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
                        <Paper
                            elevation={0}

                            sx={{
                                width: "100%",
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: DEFAULT_BACKGROUND_COLOR,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <SpeedIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {rateLimitDetail.servicegroupname}
                                        </Typography>                                        
                                    </Box>
                                </Stack>
                                {isMarkedForDelete !== true && canDeleteRateLimit &&
                                    <SubmitMarkForDelete 
                                        objectId={rateLimitDetail.servicegroupid}
                                        objectType={MarkForDeleteObjectType.RateLimitServiceGroup}
                                        confirmationMessage={`Confirm deletion of rate limit: ${rateLimitDetail.servicegroupname}. Once submitted the operation cannot be undone.`}
                                        onDeleteEnd={(successful: boolean, errorMessage?: string) => {
                                            setShowMutationBackdrop(false);
                                            if(successful){
                                                setShowMutationSnackbar(true);
                                                setIsMarkedForDelete(true);
                                            }
                                            else{
                                                if(errorMessage){
                                                    setErrorMessage(intl.formatMessage({id: errorMessage}));    
                                                }
                                                else{
                                                    setErrorMessage(intl.formatMessage({id: ERROR_CODES.DEFAULT.errorKey}));
                                                } 
                                            }
                                        }}
                                        onDeleteStart={() => setShowMutationBackdrop(true)}
                                    />
                                }
                            </Stack>
                        </Paper>




                        {/* <Grid2 className="detail-page-subheader" alignItems={"center"} container size={12}>
                            <Grid2 size={11}>Overview</Grid2>
                            <Grid2 size={1} display={"flex"} >
                                {isMarkedForDelete !== true && canDeleteRateLimit &&
                                    <SubmitMarkForDelete 
                                        objectId={rateLimitDetail.servicegroupid}
                                        objectType={MarkForDeleteObjectType.RateLimitServiceGroup}
                                        confirmationMessage={`Confirm deletion of rate limit: ${rateLimitDetail.servicegroupname}. Once submitted the operation cannot be undone.`}
                                        onDeleteEnd={(successful: boolean, errorMessage?: string) => {
                                            setShowMutationBackdrop(false);
                                            if(successful){
                                                setShowMutationSnackbar(true);
                                                setIsMarkedForDelete(true);
                                            }
                                            else{
                                                if(errorMessage){
                                                    setErrorMessage(intl.formatMessage({id: errorMessage}));    
                                                }
                                                else{
                                                    setErrorMessage(intl.formatMessage({id: ERROR_CODES.DEFAULT.errorKey}));
                                                } 
                                            }
                                        }}
                                        onDeleteStart={() => setShowMutationBackdrop(true)}
                                    />
                                }
                            </Grid2>
                        </Grid2> */}
                    </Grid2>
                    <Grid2 size={12} marginBottom={"16px"} marginTop={"16px"}>
                        {errorMessage &&
                            <Grid2 size={12} marginBottom={"8px"}>
                                <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                            </Grid2>
                        }
                        {isMarkedForDelete === true &&
                            <MarkForDeleteAlert 
                                message={"This rate limit has been marked for deletion. No changes to the rate limit are permitted."}
                            />
                        }
                        <Paper sx={{ padding: "8px" }} elevation={1}>
                            <Grid2 container size={12} spacing={2}>
                                
                                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Stack spacing={3}>

                                        <TextField
                                            disabled={disableInputs}
                                            required name="serviceGroupName" id="serviceGroupName"
                                            onChange={(evt) => { serviceGroupInput.servicegroupname = evt?.target.value; setServiceGroupInput({ ...serviceGroupInput }); setMarkDirty(true); }}
                                            value={serviceGroupInput.servicegroupname}
                                            fullWidth={true}
                                            label="Service Group Name"
                                        />

                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Object ID
                                            </Typography>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    bgcolor: 'grey.50',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                    {rateLimitDetail.servicegroupid}
                                                </Typography>
                                                <Tooltip title="Copy to clipboard">
                                                    <ContentCopyIcon
                                                        sx={{ cursor: "pointer", ml: 1, color: 'action.active' }}
                                                        onClick={() => {
                                                            copyContentToClipboard(rateLimitDetail.servicegroupid, "Service Group ID copied to clipboard");
                                                        }}
                                                    />
                                                </Tooltip>
                                            </Paper>
                                        </Box>
                                    </Stack>
                                </Grid2>
                                <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Stack spacing={3}>
                                        
                                        <TextField
                                            disabled={disableInputs}
                                            name="serviceGroupDescription" id="serviceGroupDescription"
                                            value={serviceGroupInput.servicegroupdescription}
                                            fullWidth={true}
                                            label="Service Group Description"
                                            multiline={true}
                                            rows={2}
                                            onChange={(evt) => { serviceGroupInput.servicegroupdescription = evt?.target.value; setServiceGroupInput({ ...serviceGroupInput }); setMarkDirty(true); }}
                                        />
                                    
                                    </Stack>
                                </Grid2>
                            </Grid2>
                            <DetailSectionActionHandler
                                onDiscardClickedHandler={() => {
                                    setServiceGroupInput(initInput);
                                    setMarkDirty(false);
                                }}
                                onUpdateClickedHandler={() => {
                                    setShowMutationBackdrop(true);
                                    updateRateLimitServiceGroupMutation();
                                }}
                                markDirty={markDirty}
                            />
                        </Paper>
                    </Grid2>
                    <Grid2 size={12} marginBottom={"16px"}>
                        {!isMarkedForDelete &&
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
                        }
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
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            >
                <Alert sx={{fontSize: "1em"}}
                    onClose={() => setShowMutationSnackbar(false)}
                >
                    Rate Limit Updated
                </Alert>
            </Snackbar>	            
        </Typography >
    )
}

export default RateLimitDetail;