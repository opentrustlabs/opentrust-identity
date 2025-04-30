"use client";
import React, { useContext } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, Paper, Stack, TextField, Alert, Backdrop, CircularProgress, Snackbar } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { AuthorizationGroup, AuthorizationGroupUpdateInput, SearchResultType } from "@/graphql/generated/graphql-types";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TenantHighlight from "../tenants/tenant-highlight";
import RelationshipConfigurationComponent from "../relationship-config/relationship-configuration-component";
import { useMutation } from "@apollo/client";
import { AUTHORIZATION_GROUP_UPDATE_MUTATION, AUTHORIZATION_GROUP_USER_ADD_MUTATION, AUTHORIZATION_GROUP_USER_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { AUTHORIZATION_GROUP_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";

export interface AuthorizationGroupDetailProps {
    authorizationGroup: AuthorizationGroup
}

const AuthorizationGroupDetail: React.FC<AuthorizationGroupDetailProps> = ({ authorizationGroup }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();

    const initInput: AuthorizationGroupUpdateInput = {
        allowForAnonymousUsers: authorizationGroup.allowForAnonymousUsers,
        default: authorizationGroup.default,
        groupId: authorizationGroup.groupId,
        groupName: authorizationGroup.groupName,
        tenantId: authorizationGroup.tenantId,
        groupDescription: authorizationGroup.groupDescription
    }
    // STATE VARIABLES
    const [authzGroupInput, setAuthzGroupInput] = React.useState<AuthorizationGroupUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [renderKey, setRenderKey] = React.useState<string>(Date.now().toString());

    // GRAPHQL FUNCTIONS
    const [updateAuthzGroupMutation] = useMutation(AUTHORIZATION_GROUP_UPDATE_MUTATION, {
        variables: {
            groupInput: authzGroupInput
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
        refetchQueries: [AUTHORIZATION_GROUP_DETAIL_QUERY]
    });

    const [authorizationGroupUserAddMutation] = useMutation(AUTHORIZATION_GROUP_USER_ADD_MUTATION, {
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

    const [authorizationGroupUserRemoveMutation] = useMutation(AUTHORIZATION_GROUP_USER_REMOVE_MUTATION, {
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
            {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                <div style={{marginBottom: "16px"}}>
                    <TenantHighlight tenantId={authorizationGroup.tenantId} />
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
                                            <TextField name="authzGroupName" id="authzGroupName" 
                                                value={authzGroupInput.groupName} 
                                                onChange={(evt) => {authzGroupInput.groupName = evt.target.value; setAuthzGroupInput({...authzGroupInput}); setMarkDirty(true)}}
                                                fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Group Description</div>
                                            <TextField name="authzGroupDescription" id="authzGroupDescription" 
                                                multiline={true}
                                                rows={2}
                                                value={authzGroupInput.groupDescription} 
                                                onChange={(evt) => {authzGroupInput.groupDescription = evt.target.value; setAuthzGroupInput({...authzGroupInput}); setMarkDirty(true)}}
                                                fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>Object ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2  size={11}>
                                                    {authorizationGroup.groupId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            copyContentToClipboard(authorizationGroup.groupId, "AuthZ ID copied to clipboard");
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
                                                    name="default" 
                                                    checked={authzGroupInput.default}
                                                    onChange={(_, checked) => {
                                                        authzGroupInput.default = checked;
                                                        setAuthzGroupInput({...authzGroupInput});
                                                        setMarkDirty(true);
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>
                                        <Grid2 container size={12} marginBottom={"16px"}>
                                            <Grid2 alignContent={"center"} size={10}>Allow for anonymous users</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox 
                                                    name="allowForAnonymous"
                                                    checked={authzGroupInput.allowForAnonymousUsers}
                                                    onChange={(_, checked) => {
                                                        authzGroupInput.allowForAnonymousUsers = checked;
                                                        setAuthzGroupInput({...authzGroupInput});
                                                        setMarkDirty(true);
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>                                        
                                    </Grid2>
                                    
                                </Grid2>
                                <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
                                    
                                    <Button sx={{ border: "solid 1px lightgrey", borderRadius: "4px" }} 
                                        disabled={!markDirty}
                                        onClick={() => {
                                            setShowMutationBackdrop(true);
                                            updateAuthzGroupMutation();
                                        }}                                        
                                    >
                                        Update
                                    </Button>
                                    <Button sx={{ border: "solid 1px lightgrey", borderRadius: "4px", marginRight: "8px" }}
                                        disabled={!markDirty}
                                        onClick={() => {
                                            setAuthzGroupInput(initInput);
                                            setMarkDirty(false);
                                        }}
                                    >
                                        Cancel
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
                                    {authzGroupInput.default &&
                                        <Grid2 size={12} container spacing={2} marginTop={"16px"}>
                                            <Grid2 size={1}>
                                                <InfoOutlinedIcon
                                                    sx={{color: "red"}}
                                                />
                                            </Grid2>
                                            <Grid2 size={11}>
                                                <Typography>
                                                    For default authorization groups, ALL users who belong to the tenant will also automatically belong to this group. To
                                                    select users individually, uncheck the "Default" checkbox above and save your changes.
                                                </Typography>
                                            </Grid2>
                                        </Grid2>
                                    }
                                    {!authzGroupInput.default && 
                                        <RelationshipConfigurationComponent                                            
                                            addObjectText="Add user to authorization group"
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
                                                owningtenantid: authorizationGroup.tenantId,
                                                parentid: authorizationGroup.groupId,
                                                term: ""
                                            }}                                            
                                            tenantId={authorizationGroup.tenantId}
                                            onAdd={(id: string) => {
                                                setShowMutationBackdrop(true);
                                                authorizationGroupUserAddMutation({
                                                    variables: {
                                                        userId: id,
                                                        groupId: authorizationGroup.groupId
                                                    }
                                                });
                                            }}
                                            onRemove={(id: string) => {
                                                setShowMutationBackdrop(true);
                                                authorizationGroupUserRemoveMutation({
                                                    variables: {
                                                        userId: id,
                                                        groupId: authorizationGroup.groupId
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
                message="Authorization Group Updated"
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            />
        </Typography >
    )
}

export default AuthorizationGroupDetail;