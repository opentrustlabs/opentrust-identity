"use client";
import { MarkForDeleteObjectType, PortalUserProfile, Scope, ScopeUpdateInput } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { ROOT_TENANT_EXCLUSIVE_INTERNAL_SCOPE_NAMES, SCOPE_DELETE_SCOPE, SCOPE_UPDATE_SCOPE, SCOPE_USE_DISPLAY, SCOPE_USE_IAM_MANAGEMENT, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Typography from "@mui/material/Typography";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { SCOPE_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import { SCOPE_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import ScopeTenantConfiguration from "./scope-tenant-configuration";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";

export interface ScopeDetailProps {
    scope: Scope
}

const ScopeDetail: React.FC<ScopeDetailProps> = ({ scope }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    const initInput: ScopeUpdateInput = {
        scopeDescription: scope.scopeDescription,
        scopeId: scope.scopeId,
        scopeName: scope.scopeName
    }

    // STATE VARIABLES
    const [scopeUpdateInput, setScopeUpdateInput] = React.useState<ScopeUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(scope.markForDelete);
    const [disableInputs] = React.useState<boolean>(scope.markForDelete || !containsScope(SCOPE_UPDATE_SCOPE, profile?.scope || []));
    const [canDeleteScope] = React.useState<boolean>(containsScope(SCOPE_DELETE_SCOPE, profile?.scope || []));


    // GRAPHQL FUNCTIONS
    const [updateScopeMutation] = useMutation(SCOPE_UPDATE_MUTATION, {
        variables: {
            scopeInput: scopeUpdateInput
        },
        onCompleted() {
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
            setMarkDirty(false);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [SCOPE_DETAIL_QUERY]
    })

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
    });

    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs}></BreadcrumbComponent>
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={11}>Overview</Grid2>
                            <Grid2 size={1} display={"flex"} >
                                {isMarkedForDelete !== true && scope.scopeUse !== SCOPE_USE_IAM_MANAGEMENT && canDeleteScope &&
                                    <SubmitMarkForDelete 
                                        objectId={scope.scopeId}
                                        objectType={MarkForDeleteObjectType.Scope}
                                        confirmationMessage={`Confirm deletion of scope: ${scope.scopeName}. Once submitted the operation cannot be undone.`}
                                        onDeleteEnd={(successful: boolean, errorMessage?: string) => {
                                            setShowMutationBackdrop(false);
                                            if(successful){
                                                setShowMutationSnackbar(true);
                                                setIsMarkedForDelete(true);
                                            }
                                            else{
                                                setErrorMessage(errorMessage || "ERROR");
                                            }
                                        }}
                                        onDeleteStart={() => setShowMutationBackdrop(true)}
                                    />
                                }
                            </Grid2>
                        </Grid2>
                        <Grid2 size={12}>
                            {errorMessage &&
                                <Grid2 size={12} marginBottom={"8px"}>
                                    <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                </Grid2>                                
                            }
                            {isMarkedForDelete === true &&
                                <MarkForDeleteAlert 
                                    message={"This scope definition has been marked for deletion. No changes to the scope definition are permitted."}
                                />
                            }
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    {ROOT_TENANT_EXCLUSIVE_INTERNAL_SCOPE_NAMES.includes(scope.scopeName) &&
                                        <Grid2 size={12} marginBottom={"8px"}>
                                            <Alert severity="info">This scope is exclusive to the Root Tenant and cannot be added to any other tenant and cannot be edited.</Alert>                                            
                                        </Grid2>
                                    }
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Name</div>
                                            <TextField 
                                                disabled={scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT || disableInputs === true} 
                                                name="scopeName" 
                                                id="scopeName" 
                                                value={scopeUpdateInput.scopeName} 
                                                fullWidth={true} 
                                                size="small" 
                                                onChange={(evt) => {
                                                    scopeUpdateInput.scopeName = evt.target.value;
                                                    setScopeUpdateInput({...scopeUpdateInput});
                                                    setMarkDirty(true);
                                                }}
                                                
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Description</div>
                                            <TextField
                                                disabled={scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT || disableInputs === true}
                                                name="scopeDescription"
                                                id="scopeDescription"
                                                value={scopeUpdateInput.scopeDescription}
                                                fullWidth={true}
                                                size="small"
                                                multiline={true}
                                                rows={2}
                                                onChange={(evt) => {
                                                    scopeUpdateInput.scopeDescription = evt.target.value;
                                                    setScopeUpdateInput({...scopeUpdateInput});
                                                    setMarkDirty(true);
                                                }}
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
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setMarkDirty(false);
                                        setScopeUpdateInput(initInput);
                                    }}
                                    onUpdateClickedHandler={() => {
                                        setShowMutationBackdrop(true);
                                        updateScopeMutation();
                                    }}
                                    markDirty={markDirty}
                                    disableSubmit={scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT}
                                />
                            </Paper>
                        </Grid2>
                        
                        {/* TODO
                            work out the access rule schema using FGA or ABAC
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
                                    {[].map(                                            
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
                        </Grid2> */}

                        <Grid2 size={12} marginBottom={"16px"}>
                            {!isMarkedForDelete &&
                                <Accordion defaultExpanded={true}  >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        id={"scope-tenant-configuration"}
                                        sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center"}}

                                    >
                                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                            <SettingsApplicationsIcon /><div style={{marginLeft: "8px"}}>Tenants</div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <ScopeTenantConfiguration 
                                            scopeId={scope.scopeId}
                                            scopeUse={scope.scopeUse}
                                            onUpdateStart={() => {
                                                setShowMutationBackdrop(true);
                                            } } 
                                            onUpdateEnd={(success: boolean) => {
                                                setShowMutationBackdrop(false);
                                                if(success){
                                                    setShowMutationSnackbar(true);
                                                }
                                            } }
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            }
                        </Grid2>

                    </Grid2>
                </DetailPageMainContentContainer>
                <DetailPageRightNavContainer>
                    <Grid2 container spacing={2} size={12}>
                        
                    </Grid2>
                </DetailPageRightNavContainer>
            </DetailPageContainer>
            <Backdrop
                sx={{ color: '#fff'}}
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
                    Scope Updated
                </Alert>
            </Snackbar>

        </Typography>

    )
}

export default ScopeDetail;