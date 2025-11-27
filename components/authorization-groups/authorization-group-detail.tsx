"use client";
import React, { useContext } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Paper, TextField, Alert, Backdrop, CircularProgress, Snackbar, Stack, Box, Tooltip, FormControlLabel, Switch } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { AuthorizationGroup, AuthorizationGroupUpdateInput, MarkForDeleteObjectType, SearchResultType, PortalUserProfile } from "@/graphql/generated/graphql-types";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { AUTHORIZATION_GROUP_DELETE_SCOPE, AUTHORIZATION_GROUP_UPDATE_SCOPE, AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE, DEFAULT_BACKGROUND_COLOR, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PolicyIcon from '@mui/icons-material/Policy';
import PeopleIcon from '@mui/icons-material/People';
import TenantHighlight from "../tenants/tenant-highlight";
import RelationshipConfigurationComponent from "../relationship-config/relationship-configuration-component";
import { useMutation } from "@apollo/client";
import { AUTHORIZATION_GROUP_UPDATE_MUTATION, AUTHORIZATION_GROUP_USER_ADD_MUTATION, AUTHORIZATION_GROUP_USER_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { AUTHORIZATION_GROUP_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";
import ScopeRelConfiguration, { ScopeRelType } from "../scope/scope-rel-configuration";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { ERROR_CODES } from "@/lib/models/error";
import { useIntl } from 'react-intl';

export interface AuthorizationGroupDetailProps {
    authorizationGroup: AuthorizationGroup
}

const AuthorizationGroupDetail: React.FC<AuthorizationGroupDetailProps> = ({ authorizationGroup }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();

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
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(authorizationGroup.markForDelete);
    const [disableInputs] = React.useState<boolean>(authorizationGroup.markForDelete || !containsScope(AUTHORIZATION_GROUP_UPDATE_SCOPE, profile?.scope || []));
    const [canAddUserToAuthzGroup] = React.useState<boolean>(containsScope(AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, profile?.scope || []));
    const [canRemoveUserFromAuthzGroup] = React.useState<boolean>(containsScope(AUTHORIZATION_GROUP_USER_REMOVE_SCOPE, profile?.scope || []));
    const [canDeleteAuthzGroup] = React.useState<boolean>(containsScope(AUTHORIZATION_GROUP_DELETE_SCOPE, profile?.scope || []));

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
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        refetchQueries: [AUTHORIZATION_GROUP_DETAIL_QUERY]
    });

    const [authorizationGroupUserAddMutation] = useMutation(AUTHORIZATION_GROUP_USER_ADD_MUTATION, {
        onCompleted() {
            setShowMutationBackdrop(false);            
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [authorizationGroupUserRemoveMutation] = useMutation(AUTHORIZATION_GROUP_USER_REMOVE_MUTATION, {
        onCompleted() {
            setShowMutationBackdrop(false);            
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
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
                                        <PeopleIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {authorizationGroup.groupName}
                                        </Typography>                                        
                                    </Box>
                                </Stack>
                                {isMarkedForDelete !== true && canDeleteAuthzGroup &&
                                    <SubmitMarkForDelete 
                                        objectId={authorizationGroup.groupId}
                                        objectType={MarkForDeleteObjectType.AuthorizationGroup}
                                        confirmationMessage={`Confirm deletion of authorization group: ${authorizationGroup.groupName}. Once submitted the operation cannot be undone.`}
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
                        <Grid2 size={12} marginBottom={"16px"}>
                            {errorMessage &&
                                <Grid2 size={12} marginBottom={"8px"}>
                                    <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                </Grid2>   
                            }
                            {isMarkedForDelete === true &&
                                <MarkForDeleteAlert 
                                    message={"This authorization group has been marked for deletion. No changes to the group are permitted."}
                                />
                            }
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Stack spacing={3}>
                                            <TextField name="authzGroupName" id="authzGroupName" 
                                                disabled={disableInputs}
                                                value={authzGroupInput.groupName} 
                                                onChange={(evt) => {authzGroupInput.groupName = evt.target.value; setAuthzGroupInput({...authzGroupInput}); setMarkDirty(true)}}
                                                fullWidth={true}
                                                label="Group Name" 
                                            />

                                            <TextField name="authzGroupDescription" id="authzGroupDescription" 
                                                disabled={disableInputs}
                                                multiline={true}
                                                rows={2}
                                                value={authzGroupInput.groupDescription} 
                                                onChange={(evt) => {authzGroupInput.groupDescription = evt.target.value; setAuthzGroupInput({...authzGroupInput}); setMarkDirty(true)}}
                                                fullWidth={true} 
                                                label="Group Description"
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
                                                        {authorizationGroup.groupId}
                                                    </Typography>
                                                    <Tooltip title="Copy to clipboard">
                                                        <ContentCopyIcon
                                                            sx={{ cursor: "pointer", ml: 1, color: 'action.active' }}
                                                            onClick={() => {
                                                                copyContentToClipboard(authorizationGroup.groupId, "AuthZ ID copied to clipboard");
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Paper>
                                            </Box>
                                        </Stack>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    disabled={disableInputs}
                                                    name="default" 
                                                    checked={authzGroupInput.default}
                                                    onChange={(_, checked) => {
                                                        authzGroupInput.default = checked;
                                                        setAuthzGroupInput({...authzGroupInput});
                                                        setMarkDirty(true);
                                                    }}
                                                />
                                            }
                                            label="Default"
                                            sx={{ margin: "4px", fontSize: "revert", justifyContent: 'space-between', width: '100%' }}
                                            labelPlacement="start"
                                        />

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    disabled={disableInputs}
                                                    name="allowForAnonymous"
                                                    checked={authzGroupInput.allowForAnonymousUsers}
                                                    onChange={(_, checked) => {
                                                        authzGroupInput.allowForAnonymousUsers = checked;
                                                        setAuthzGroupInput({...authzGroupInput});
                                                        setMarkDirty(true);
                                                    }}
                                                />
                                            }
                                            label="Allow for Anonymous Users"
                                            sx={{ margin: "4px", fontSize: "revert", justifyContent: 'space-between', width: '100%' }}
                                            labelPlacement="start"
                                        />
                                    </Grid2>    
                                </Grid2>
                            </Paper>
                            <Paper elevation={1} sx={{ padding: "8px" }}>
                                
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setAuthzGroupInput(initInput);
                                        setMarkDirty(false);
                                    }}
                                    onUpdateClickedHandler={() => {
                                        setShowMutationBackdrop(true);
                                        updateAuthzGroupMutation();
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
                                        id={"authorization-group-user-configuration"}
                                        sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                    >
                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <PersonIcon /><div style={{ marginLeft: "8px" }}>Users</div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
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
                                                        select users individually, uncheck the Default checkbox above and save your changes.
                                                    </Typography>
                                                </Grid2>
                                            </Grid2>
                                        }
                                        {!authzGroupInput.default && 
                                            <RelationshipConfigurationComponent                                            
                                                addObjectText="Add user to authorization group"
                                                canAdd={canAddUserToAuthzGroup}
                                                canDelete={canRemoveUserFromAuthzGroup}
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
                            }
                        </Grid2>
                        <Grid2 size={12} >
                            {!isMarkedForDelete &&
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
                                        <ScopeRelConfiguration
                                            tenantId={authorizationGroup.tenantId}
                                            id={authorizationGroup.groupId}
                                            scopeRelType={ScopeRelType.AUTHORIZATION_GROUP}
                                            onUpdateEnd={(success: boolean) => {
                                                setShowMutationBackdrop(false);
                                                if (success) {
                                                    setShowMutationSnackbar(true);
                                                }
                                            }}
                                            onUpdateStart={() => {
                                                setShowMutationBackdrop(true);
                                            }}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            }
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
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            >
                <Alert sx={{fontSize: "1em"}}
                    onClose={() => setShowMutationSnackbar(false)}
                >
                    Authorization Group Updated
                </Alert>
            </Snackbar>	            
        </Typography >
    )
}

export default AuthorizationGroupDetail;