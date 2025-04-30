"use client";
import { AuthenticationGroup, AuthenticationGroupUpdateInput, SearchResultType } from "@/graphql/generated/graphql-types";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Typography, Grid2, Paper, TextField, Checkbox, Stack, Button, Accordion, AccordionSummary, AccordionDetails, Backdrop, CircularProgress, Snackbar, Alert } from "@mui/material";
import React, { useContext } from "react";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import TenantHighlight from "../tenants/tenant-highlight";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useMutation } from "@apollo/client";
import { AUTHENTICATION_GROUP_UPDATE_MUTATION, AUTHENTICATION_GROUP_USER_ADD_MUTATION, AUTHENTICATION_GROUP_USER_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { AUTHENTICATION_GROUP_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import RelationshipConfigurationComponent from "../relationship-config/relationship-configuration-component";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";


export interface AuthenticationGroupDetailProps {
    authenticationGroup: AuthenticationGroup
}

const AuthenticationGroupDetail: React.FC<AuthenticationGroupDetailProps> = ({ authenticationGroup }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

    const initInput: AuthenticationGroupUpdateInput = {
        authenticationGroupId: authenticationGroup.authenticationGroupId,
        authenticationGroupName: authenticationGroup. authenticationGroupName,
        defaultGroup: authenticationGroup.defaultGroup,
        tenantId: authenticationGroup.tenantId,
        authenticationGroupDescription: authenticationGroup.authenticationGroupDescription

    }
    // STATE VARIABLES
    const [authnGroupInput, setAuthnGroupInput] = React.useState<AuthenticationGroupUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [renderKey, setRenderKey] = React.useState<string>(Date.now().toString());

    // GRAPHQL FUNCTIONS
    const [updateAuthnGroupMutation] = useMutation(AUTHENTICATION_GROUP_UPDATE_MUTATION, {
        variables: {
            authenticationGroupInput: authnGroupInput
        },
        onCompleted() {
            setShowMutationBackdrop(false);
            setMarkDirty(false);
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [AUTHENTICATION_GROUP_DETAIL_QUERY]
    });

    const [authenticationGroupUserAddMutation] = useMutation(AUTHENTICATION_GROUP_USER_ADD_MUTATION, {
        onCompleted() {
            setShowMutationBackdrop(false);            
            setShowMutationSnackbar(true);
            setRenderKey(Date.now().toString() + Math.random().toString());
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        }
    });

    const [authenticationGroupUserRemoveMutation] = useMutation(AUTHENTICATION_GROUP_USER_REMOVE_MUTATION, {
        onCompleted() {
            setShowMutationBackdrop(false);            
            setShowMutationSnackbar(true);
            setRenderKey( Date.now().toString() + Math.random().toString());
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        },
    });

    // HANDLER FUNCTIONS
    

    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    arrBreadcrumbs.push({
        linkText: "Authentication Groups",
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=authentication-groups`
    });
    arrBreadcrumbs.push({
        linkText: authenticationGroup.authenticationGroupName,
        href: null
    });


    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs} />
            {/**  If we are in the root tenant, then show the owning tenant for this client */}
            {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                <div style={{marginBottom: "16px"}}>
                    <TenantHighlight tenantId={authenticationGroup.tenantId} />
                </div>
            }
            <Grid2 container size={12} spacing={3} marginBottom={"16px"}>
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} size={12}>Overview</Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            {errorMessage &&
                                <Alert severity={"error"} onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                            }
                            <Paper elevation={0} sx={{ padding: "8px" }}>                                
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Group Name</div>
                                            <TextField name="authnGroupName" id="authnGroupName" 
                                                value={authnGroupInput.authenticationGroupName} 
                                                onChange={(evt) => {authnGroupInput.authenticationGroupName = evt.target.value; setMarkDirty(true); setAuthnGroupInput({...authnGroupInput})}}                                            
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Group Description</div>
                                            <TextField  
                                                name="authnGroupDescription" id="authnGroupDescription" 
                                                value={authnGroupInput.authenticationGroupDescription} fullWidth={true} size="small" multiline={true} rows={2}
                                                onChange={(evt) => {authnGroupInput.authenticationGroupDescription = evt.target.value; setMarkDirty(true); setAuthnGroupInput({...authnGroupInput})}}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>Object ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2  size={11}>
                                                    {authenticationGroup.authenticationGroupId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            copyContentToClipboard(authenticationGroup.authenticationGroupId, "AuthN ID copied to clipboard");
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 container size={12} marginBottom={"16px"}>
                                            <Grid2 alignContent={"center"} size={10}>Default</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    name="defaultGroup"
                                                    checked={authnGroupInput.defaultGroup}
                                                    onChange={(_, checked) => {
                                                        authnGroupInput.defaultGroup = checked;
                                                        setAuthnGroupInput({...authnGroupInput})
                                                        setMarkDirty(true);
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>                                      
                                    </Grid2>                                    
                                </Grid2>                                
                                <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    <Button sx={{ border: "solid 1px lightgrey", borderRadius: "4px"}} 
                                        onClick={() => {
                                            setShowMutationBackdrop(true);
                                            updateAuthnGroupMutation();
                                        }}
                                        disabled={!markDirty}
                                    >
                                        Update
                                    </Button>
                                    <Button sx={{ border: "solid 1px lightgrey", borderRadius: "4px", marginRight: "8px"}} 
                                        disabled={!markDirty}
                                        onClick={() => {
                                            setMarkDirty(false);
                                            setAuthnGroupInput(initInput);
                                        }}
                                    >
                                        Undo
                                    </Button>
                                </Stack>
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
                                <AccordionDetails key={renderKey}>
                                    {authnGroupInput.defaultGroup &&
                                        <Grid2 size={12} container spacing={2} marginTop={"16px"}>
                                            <Grid2 size={1}>
                                                <InfoOutlinedIcon
                                                    sx={{color: "red"}}
                                                />
                                            </Grid2>
                                            <Grid2 size={11}>
                                                <Typography>
                                                    For default authentication groups, ALL users who belong to the tenant will also automatically belong to this group. To
                                                    select users individually, uncheck the "Default" checkbox above and save your changes.
                                                </Typography>
                                            </Grid2>
                                        </Grid2>
                                    }
                                    {!authnGroupInput.defaultGroup && 
                                        <RelationshipConfigurationComponent                                            
                                            addObjectText="Add user to authentication group"
                                            canAdd={true}
                                            canDelete={true}
                                            confirmRemovalText="Confirm removal of user"
                                            filterObjectsText="Filter users"
                                            noObjectsFoundText="No users found"
                                            searchObjectsText="Search users"
                                            relSearchInput={{
                                                page: 1,
                                                perPage: 10,
                                                childtype: SearchResultType.User,
                                                owningtenantid: authenticationGroup.tenantId,
                                                parentid: authenticationGroup.authenticationGroupId,
                                                term: ""
                                            }}                                            
                                            tenantId={authenticationGroup.tenantId}
                                            onAdd={(id: string) => {
                                                setShowMutationBackdrop(true);
                                                authenticationGroupUserAddMutation({
                                                    variables: {
                                                        userId: id,
                                                        authenticationGroupId: authenticationGroup.authenticationGroupId
                                                    }
                                                });
                                            }}
                                            onRemove={(id: string) => {
                                                setShowMutationBackdrop(true);
                                                authenticationGroupUserRemoveMutation({
                                                    variables: {
                                                        userId: id,
                                                        authenticationGroupId: authenticationGroup.authenticationGroupId
                                                    } 
                                                });
                                            }}
                                        />
                                    }
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>
                    </Grid2>
                </Grid2>

                <Grid2 spacing={2} size={3}>

                </Grid2>

            </Grid2>
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
                message="Authentication Group Updated"
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            />
        </Typography >
    )
}

export default AuthenticationGroupDetail;