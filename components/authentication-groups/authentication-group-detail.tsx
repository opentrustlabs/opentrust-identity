"use client";
import { AuthenticationGroup, AuthenticationGroupUpdateInput, MarkForDeleteObjectType, SearchResultType, PortalUserProfile } from "@/graphql/generated/graphql-types";
import { AUTHENTICATION_GROUP_DELETE_SCOPE, AUTHENTICATION_GROUP_UPDATE_SCOPE, AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, DEFAULT_BACKGROUND_COLOR, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Typography, Grid2, Paper, TextField, Accordion, AccordionSummary, AccordionDetails, Backdrop, CircularProgress, Snackbar, Alert, Stack, Box, Tooltip, FormControlLabel, Switch } from "@mui/material";
import React, { useContext } from "react";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import TenantHighlight from "../tenants/tenant-highlight";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useMutation } from "@apollo/client";
import { AUTHENTICATION_GROUP_UPDATE_MUTATION, AUTHENTICATION_GROUP_USER_ADD_MUTATION, AUTHENTICATION_GROUP_USER_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { AUTHENTICATION_GROUP_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import RelationshipConfigurationComponent from "../relationship-config/relationship-configuration-component";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { ERROR_CODES } from "@/lib/models/error";
import { useIntl } from 'react-intl';


export interface AuthenticationGroupDetailProps {
    authenticationGroup: AuthenticationGroup
}

const AuthenticationGroupDetail: React.FC<AuthenticationGroupDetailProps> = ({ authenticationGroup }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();

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
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(authenticationGroup.markForDelete);
    const [disableInputs] = React.useState<boolean>(authenticationGroup.markForDelete || !containsScope(AUTHENTICATION_GROUP_UPDATE_SCOPE, profile?.scope || []));
    const [canAddUserToAuthnGroup] = React.useState<boolean>(containsScope(AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, profile?.scope || []));
    const [canRemoveUserFromAuthnGroup] = React.useState<boolean>(containsScope(AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, profile?.scope || []));
    const [canDeleteAuthnGroup] = React.useState<boolean>(containsScope(AUTHENTICATION_GROUP_DELETE_SCOPE, profile?.scope || []));

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
            setErrorMessage(intl.formatMessage({id: error.message}));
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
            setErrorMessage(intl.formatMessage({id: error.message}));
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
            setErrorMessage(intl.formatMessage({id: error.message}));
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
                                        <GroupIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {authenticationGroup.authenticationGroupName}
                                        </Typography>                                        
                                    </Box>
                                </Stack>
                                {isMarkedForDelete !== true && canDeleteAuthnGroup &&
                                    <SubmitMarkForDelete 
                                        objectId={authenticationGroup.authenticationGroupId}
                                        objectType={MarkForDeleteObjectType.AuthenticationGroup}
                                        confirmationMessage={`Confirm deletion of authentication group: ${authenticationGroup.authenticationGroupName}. Once submitted the operation cannot be undone.`}
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
                                    message={"This authentication group has been marked for deletion. No changes to the group are permitted."}
                                />
                            }
                            <Paper elevation={0} sx={{ padding: "8px" }}>                                
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Stack spacing={3}>

                                            <TextField name="authnGroupName" id="authnGroupName" 
                                                disabled={disableInputs}
                                                value={authnGroupInput.authenticationGroupName} 
                                                onChange={(evt) => {authnGroupInput.authenticationGroupName = evt.target.value; setMarkDirty(true); setAuthnGroupInput({...authnGroupInput})}}                                            
                                                fullWidth={true} 
                                                label="Group Name"
                                            />

                                            <TextField  
                                                disabled={disableInputs}
                                                name="authnGroupDescription" id="authnGroupDescription" 
                                                value={authnGroupInput.authenticationGroupDescription} 
                                                fullWidth={true} 
                                                label="Group Description"
                                                multiline={true} rows={2}
                                                onChange={(evt) => {authnGroupInput.authenticationGroupDescription = evt.target.value; setMarkDirty(true); setAuthnGroupInput({...authnGroupInput})}}
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
                                                        {authenticationGroup.authenticationGroupId}
                                                    </Typography>
                                                    <Tooltip title="Copy to clipboard">
                                                        <ContentCopyIcon
                                                            sx={{ cursor: "pointer", ml: 1, color: 'action.active' }}
                                                            onClick={() => {
                                                                copyContentToClipboard(authenticationGroup.authenticationGroupId, "AuthN ID copied to clipboard");
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Paper>
                                            </Box>
                                        </Stack>                                        
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Stack spacing={3}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        disabled={disableInputs}
                                                        name="defaultGroup"
                                                        checked={authnGroupInput.defaultGroup}
                                                        onChange={(_, checked) => {
                                                            authnGroupInput.defaultGroup = checked;
                                                            setAuthnGroupInput({...authnGroupInput})
                                                            setMarkDirty(true);
                                                        }}
                                                    />
                                                }
                                                label="Default"
                                                sx={{ margin: "4px", fontSize: "revert", justifyContent: 'space-between', width: '100%' }}
                                                labelPlacement="start"
                                            />
                                        </Stack>
                                                                           
                                    </Grid2>                                    
                                </Grid2> 
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setMarkDirty(false);
                                        setAuthnGroupInput(initInput);
                                    }}
                                    onUpdateClickedHandler={() => {
                                        setShowMutationBackdrop(true);
                                        updateAuthnGroupMutation();
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
                                                        select users individually, uncheck the Default checkbox above and save your changes.
                                                    </Typography>
                                                </Grid2>
                                            </Grid2>
                                        }
                                        {!authnGroupInput.defaultGroup && 
                                            <RelationshipConfigurationComponent                                            
                                                addObjectText="Add user to authentication group"
                                                canAdd={canAddUserToAuthnGroup}
                                                canDelete={canRemoveUserFromAuthnGroup}
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
                    Authentication Group Updated
                </Alert>
            </Snackbar>
        </Typography >
    )
}

export default AuthenticationGroupDetail;