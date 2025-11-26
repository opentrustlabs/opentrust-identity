"use client";
import React, { useContext } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Backdrop, Box, Chip, CircularProgress, Divider, FormControlLabel, InputAdornment, MenuItem, Paper, Snackbar, Stack, Switch, TextField, Tooltip } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { CLIENT_DELETE_SCOPE, CLIENT_SECRET_VIEW_SCOPE, CLIENT_TYPE_DEVICE, CLIENT_TYPE_IDENTITY, CLIENT_TYPE_SERVICE_ACCOUNT, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS, CLIENT_TYPES, CLIENT_TYPES_DISPLAY, CLIENT_UPDATE_SCOPE, DEFAULT_BACKGROUND_COLOR, DEFAULT_END_USER_TOKEN_TTL_SECONDS, DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, MAX_END_USER_TOKEN_TTL_SECONDS, MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, MIN_END_USER_TOKEN_TTL_SECONDS, MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Client, ClientUpdateInput, MarkForDeleteObjectType, SecretObjectType, PortalUserProfile } from "@/graphql/generated/graphql-types";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncIcon from '@mui/icons-material/Sync';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TenantHighlight from "../tenants/tenant-highlight";
import ContactConfiguration from "../contacts/contact-configuration";
import { useMutation } from "@apollo/client";
import { CLIENT_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import ClientRedirectUriConfiguration from "./client-redirect-uri-configuration";
import ClientAuthenticationGroupConfiguration from "./client-authentication-group-configuration";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import SecretViewerDialog from "../dialogs/secret-viewer-dialog";
import { CLIENT_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import PolicyIcon from '@mui/icons-material/Policy';
import ScopeRelConfiguration, { ScopeRelType } from "../scope/scope-rel-configuration";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { ERROR_CODES } from "@/lib/models/error";
import { useIntl } from 'react-intl';


export interface ClientDetailProps {
    client: Client
}
const ClientDetail: React.FC<ClientDetailProps> = ({ client }) => {

    // CONTEXT OBJECTS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();


    // STATE VARIABLES
    const initInput: ClientUpdateInput = {
        clientId: client.clientId,
        clientName: client.clientName,
        clientType: client.clientType,
        tenantId: client.tenantId,
        clientDescription: client.clientDescription,
        clientTokenTTLSeconds: client.clientTokenTTLSeconds || DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS,
        enabled: client.enabled,
        maxRefreshTokenCount: client.maxRefreshTokenCount,
        oidcEnabled: client.oidcEnabled,
        pkceEnabled: client.pkceEnabled,
        userTokenTTLSeconds: client.userTokenTTLSeconds || DEFAULT_END_USER_TOKEN_TTL_SECONDS,
        audience: client.audience
    };

    const [clientUpdateInput, setClientUpdateInput] = React.useState<ClientUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [secretDialogOpen, setSecretDialogOpen] = React.useState<boolean>(false);
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(client.markForDelete);
    const [disableInputs] = React.useState<boolean>(client.markForDelete || !containsScope(CLIENT_UPDATE_SCOPE, profile?.scope || []));
    const [canViewClientSecret] = React.useState<boolean>(containsScope(CLIENT_SECRET_VIEW_SCOPE, profile?.scope || []));
    const [canDeleteClient] = React.useState<boolean>(containsScope(CLIENT_DELETE_SCOPE, profile?.scope || []));

    // GRAPHQLQL FUNCTIONS
    const [clientUpdateMutation] = useMutation(CLIENT_UPDATE_MUTATION, {
        variables: {
            clientInput: clientUpdateInput
        },
        onCompleted() {
            setMarkDirty(false);
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setErrorMessage(intl.formatMessage({id: error.message}));
            setShowMutationBackdrop(false);
        },
        refetchQueries: [CLIENT_DETAIL_QUERY]
    })

    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={[
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
                    linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
                },
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=clients`,
                    linkText: "Clients"
                },
                {
                    href: null,
                    linkText: client.clientName
                }
            ]} />

            {/**  If we are in the root tenant, then show the owning tenant for this client */}
            {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                <Box sx={{ mb: 2 }}>
                    <TenantHighlight tenantId={client.tenantId} />
                </Box>
            }

            <Grid2 container size={12} spacing={3} sx={{ mb: 2 }}>
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Stack spacing={2}>
                        <Paper
                            elevation={0}
                            sx={{
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
                                        <SettingsSystemDaydreamIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {client.clientName}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={CLIENT_TYPES_DISPLAY.get(client.clientType)}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                            <Chip
                                                icon={client.enabled ? <CheckCircleIcon /> : <CancelIcon />}
                                                label={client.enabled ? "Enabled" : "Disabled"}
                                                size="small"
                                                color={client.enabled ? "success" : "default"}
                                                sx={{ fontWeight: 500 }}
                                            />                                            
                                        </Stack>
                                    </Box>                                    
                                </Stack>
                                {isMarkedForDelete !== true && canDeleteClient &&
                                    <SubmitMarkForDelete
                                        objectId={client.clientId}
                                        objectType={MarkForDeleteObjectType.Client}
                                        confirmationMessage={`Confirm deletion of client: ${client.clientName}. Once submitted the operation cannot be undone.`}
                                        onDeleteEnd={(successful: boolean, errorMessage?: string) => {
                                            setShowMutationBackdrop(false);
                                            if (successful) {
                                                setShowMutationSnackbar(true);
                                                setIsMarkedForDelete(true);
                                            }
                                            else {
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

                        {/* Error and Delete Alerts */}
                        {errorMessage &&
                            <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ borderRadius: 2 }}>
                                {errorMessage}
                            </Alert>
                        }
                        {isMarkedForDelete === true &&
                            <MarkForDeleteAlert
                                message={"This client has been marked for deletion. No changes to the client are permitted."}
                            />
                        }
                        <Paper
                            elevation={1}
                            sx={{
                                p: 1
                            }}
                        >
                            <Grid2 container size={12} spacing={3}>
                                {/* Left Column - Basic Info */}
                                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Stack spacing={3}>
                                        <TextField
                                            disabled={disableInputs}
                                            label="Client Name"
                                            name="clientName"
                                            id="clientName"
                                            value={clientUpdateInput.clientName}
                                            fullWidth
                                            onChange={(evt) => {
                                                clientUpdateInput.clientName = evt.target.value;
                                                setClientUpdateInput({ ...clientUpdateInput });
                                                setMarkDirty(true);
                                            }}
                                        />

                                        <TextField
                                            disabled={disableInputs}
                                            label="Client Description"
                                            name="clientDescription"
                                            id="clientDescription"
                                            value={clientUpdateInput.clientDescription}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            onChange={(evt) => {
                                                clientUpdateInput.clientDescription = evt.target.value;
                                                setClientUpdateInput({ ...clientUpdateInput });
                                                setMarkDirty(true);
                                            }}
                                        />

                                        <TextField
                                            disabled={disableInputs}
                                            select
                                            label="Client Type"
                                            fullWidth
                                            value={clientUpdateInput.clientType}
                                            name="clientType"
                                            onChange={(evt) => {
                                                clientUpdateInput.clientType = evt.target.value;
                                                if(clientUpdateInput.clientType === CLIENT_TYPE_SERVICE_ACCOUNT){
                                                    clientUpdateInput.oidcEnabled = false;
                                                    clientUpdateInput.pkceEnabled = false;
                                                }
                                                setClientUpdateInput({ ...clientUpdateInput });
                                                setMarkDirty(true);
                                            }}
                                        >
                                            {CLIENT_TYPES.map((val: string) => (
                                                <MenuItem key={val} value={val}>
                                                    {CLIENT_TYPES_DISPLAY.get(val)}
                                                </MenuItem>
                                            ))}
                                        </TextField>

                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Client ID
                                            </Typography>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: 'grey.50',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                    {client.clientId}
                                                </Typography>
                                                <Tooltip title="Copy to clipboard">
                                                    <ContentCopyIcon
                                                        sx={{ cursor: "pointer", ml: 1, color: 'action.active' }}
                                                        onClick={() => {
                                                            copyContentToClipboard(client.clientId, "Client ID copied to clipboard");
                                                        }}
                                                    />
                                                </Tooltip>
                                            </Paper>
                                        </Box>

                                        {canViewClientSecret &&
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    Client Secret
                                                </Typography>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: 'grey.50',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                        ••••••••••••••••••••••••••••••••
                                                    </Typography>
                                                    <Tooltip title="View secret">
                                                        <VisibilityOutlinedIcon
                                                            sx={{ cursor: "pointer", ml: 1, color: 'action.active' }}
                                                            onClick={() => setSecretDialogOpen(true)}
                                                        />
                                                    </Tooltip>
                                                </Paper>
                                            </Box>
                                        }

                                        <TextField
                                            disabled={disableInputs}
                                            label="Audience for Access Tokens"
                                            helperText="If left blank, defaults to client ID"
                                            name="audience"
                                            id="audience"
                                            value={clientUpdateInput.audience || ""}
                                            fullWidth
                                            onChange={(evt) => {
                                                clientUpdateInput.audience = evt.target.value;
                                                setClientUpdateInput({ ...clientUpdateInput });
                                                setMarkDirty(true);
                                            }}
                                        />
                                    </Stack>
                                </Grid2>

                                {/* Right Column - Settings */}
                                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            bgcolor: 'grey.50',
                                            height: '100%',
                                        }}
                                    >
                                        <Stack spacing={2.5}>
                                            {/* Toggle Switches */}
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        disabled={disableInputs}
                                                        checked={clientUpdateInput.enabled}
                                                        onChange={(_, checked: boolean) => {
                                                            clientUpdateInput.enabled = checked;
                                                            setClientUpdateInput({ ...clientUpdateInput });
                                                            setMarkDirty(true);
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Stack>
                                                        <Typography variant="body2" fontWeight={500}>Enabled</Typography>                                                        
                                                    </Stack>
                                                }
                                            />

                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        disabled={disableInputs || clientUpdateInput.clientType === CLIENT_TYPE_SERVICE_ACCOUNT}
                                                        checked={clientUpdateInput.oidcEnabled}
                                                        onChange={(_, checked: boolean) => {
                                                            clientUpdateInput.oidcEnabled = checked;
                                                            if (checked === false) {
                                                                clientUpdateInput.pkceEnabled = false;
                                                            }
                                                            setClientUpdateInput({ ...clientUpdateInput });
                                                            setMarkDirty(true);
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Stack>
                                                        <Typography variant="body2" fontWeight={500}>OIDC (SSO) Enabled</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Enable OpenID Connect single sign-on
                                                        </Typography>
                                                    </Stack>
                                                }
                                            />

                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={clientUpdateInput.pkceEnabled}
                                                        disabled={clientUpdateInput.oidcEnabled === false || disableInputs}
                                                        onChange={(_, checked: boolean) => {
                                                            clientUpdateInput.pkceEnabled = checked;
                                                            setClientUpdateInput({ ...clientUpdateInput });
                                                            setMarkDirty(true);
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Stack>
                                                        <Typography variant="body2" fontWeight={500}>PKCE Enabled</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Proof Key for Code Exchange (recommended for public clients)
                                                        </Typography>
                                                    </Stack>
                                                }
                                            />

                                            <Divider sx={{ my: 1 }} />

                                            {/* Token TTL Section */}
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <TimerIcon color="action" sx={{ fontSize: 20 }} />
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Token Expiration
                                                </Typography>
                                            </Stack>

                                            <TextField
                                                type="number"
                                                label="User Token TTL (Seconds)"
                                                helperText={`Min: ${MIN_END_USER_TOKEN_TTL_SECONDS}, Max: ${MAX_END_USER_TOKEN_TTL_SECONDS}`}
                                                disabled={disableInputs}
                                                value={clientUpdateInput.userTokenTTLSeconds || ""}
                                                error={
                                                    clientUpdateInput.userTokenTTLSeconds ?
                                                        (clientUpdateInput.userTokenTTLSeconds < MIN_END_USER_TOKEN_TTL_SECONDS || clientUpdateInput.userTokenTTLSeconds > MAX_END_USER_TOKEN_TTL_SECONDS) :
                                                        false
                                                }
                                                onChange={(evt) => {
                                                    if (!Number.isNaN(evt.target.value)) {
                                                        const v: number = parseInt(evt.target.value);
                                                        clientUpdateInput.userTokenTTLSeconds = v;
                                                        setClientUpdateInput({ ...clientUpdateInput });
                                                        setMarkDirty(true);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <TimerIcon fontSize="small" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />

                                            <TextField
                                                type="number"
                                                label="Client Token TTL (Seconds)"
                                                helperText={`Min: ${MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS}, Max: ${MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS}`}
                                                disabled={disableInputs}
                                                value={clientUpdateInput.clientTokenTTLSeconds || ""}
                                                error={
                                                    clientUpdateInput.clientTokenTTLSeconds ?
                                                        (clientUpdateInput.clientTokenTTLSeconds < MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS || clientUpdateInput.clientTokenTTLSeconds > MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS) :
                                                        false
                                                }
                                                onChange={(evt) => {
                                                    if (!Number.isNaN(evt.target.value)) {
                                                        const v: number = parseInt(evt.target.value);
                                                        clientUpdateInput.clientTokenTTLSeconds = v;
                                                        setClientUpdateInput({ ...clientUpdateInput });
                                                        setMarkDirty(true);
                                                    }
                                                }}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <TimerIcon fontSize="small" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />

                                            <TextField
                                                type="number"
                                                label="Max Refresh Token Count"
                                                helperText="Maximum number of refresh tokens. Leave blank for unlimited."
                                                disabled={disableInputs}
                                                value={clientUpdateInput.maxRefreshTokenCount || ""}
                                                onChange={(evt) => {
                                                    if (!Number.isNaN(evt.target.value)) {
                                                        const v: number = parseInt(evt.target.value);
                                                        clientUpdateInput.maxRefreshTokenCount = v;
                                                    }
                                                    else {
                                                        clientUpdateInput.maxRefreshTokenCount = null;
                                                    }
                                                    setClientUpdateInput({ ...clientUpdateInput });
                                                    setMarkDirty(true);
                                                }}
                                                fullWidth
                                            />
                                        </Stack>
                                    </Paper>
                                </Grid2>
                            </Grid2>

                            <DetailSectionActionHandler
                                onDiscardClickedHandler={() => {
                                    setClientUpdateInput(initInput);
                                    setMarkDirty(false);
                                }}
                                onUpdateClickedHandler={() => {
                                    setShowMutationBackdrop(true);
                                    clientUpdateMutation();
                                }}
                                markDirty={markDirty}
                            />
                        </Paper>

                        {/* Redirect URI Configuration */}
                        {client.clientType !== CLIENT_TYPE_SERVICE_ACCOUNT &&
                            <Grid2 size={12} marginBottom={"16px"}>
                                {!isMarkedForDelete &&
                                    <Accordion
                                        defaultExpanded={true}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            id={"redirect-uri-configuration"}
                                            sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                        >
                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <SyncIcon /><div style={{ marginLeft: "8px" }}>Redirect URI Configuration</div>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <ClientRedirectUriConfiguration
                                                oidcEnabled={client.oidcEnabled}
                                                clientId={client.clientId}
                                                onUpdateStart={() => setShowMutationBackdrop(true)}
                                                onUpdateEnd={(success: boolean) => {
                                                    setShowMutationBackdrop(false);
                                                    if (success) {
                                                        setShowMutationSnackbar(true);
                                                    }
                                                }}
                                                readOnly={disableInputs}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                }
                            </Grid2>
                        }

                        {/* Authentication Groups */}
                        {client.clientType !== CLIENT_TYPE_SERVICE_ACCOUNT &&
                            <Box>
                                {!isMarkedForDelete &&
                                    <Accordion
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            id={"authentication-groups-configuration"}
                                            sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                        >
                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <GroupIcon /><div style={{ marginLeft: "8px" }}>Authentication Groups</div>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <ClientAuthenticationGroupConfiguration
                                                tenantId={client.tenantId}
                                                clientId={client.clientId}
                                                onUpdateEnd={(success: boolean) => {
                                                    setShowMutationBackdrop(false);
                                                    if (success) {
                                                        setShowMutationSnackbar(true);
                                                    }
                                                }}
                                                onUpdateStart={() => setShowMutationBackdrop(true)}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                }
                            </Box>
                        }

                        {/* Access Control */}
                        {client.clientType !== CLIENT_TYPE_IDENTITY &&
                            <Box>
                                {!isMarkedForDelete &&
                                    <Accordion
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            id={"redirect-uri-configuration"}
                                            sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <PolicyIcon /><div style={{ marginLeft: "8px" }}>
                                                {(client.clientType === CLIENT_TYPE_USER_DELEGATED_PERMISSIONS || client.clientType === CLIENT_TYPE_DEVICE )&&
                                                    <span>Delegated Access Control</span>
                                                }
                                                {client.clientType === CLIENT_TYPE_SERVICE_ACCOUNT &&
                                                    <span>Service Account Access Control</span>
                                                }                                              
                                            </div>
                                        </div>
                                    </AccordionSummary>
                                        <AccordionDetails>
                                            <ScopeRelConfiguration
                                                tenantId={client.tenantId}
                                                id={client.clientId}
                                                scopeRelType={ScopeRelType.CLIENT}
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
                            </Box>
                        }
                    </Stack>
                </Grid2>

                {/* Right Sidebar - Contact Configuration */}
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 3, xl: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            overflow: 'hidden',
                        }}
                    >
                        <ContactConfiguration
                            contactForId={client.clientId}
                            contactForType={"client"}
                            onUpdateEnd={(success: boolean) => {
                                setShowMutationBackdrop(false);
                                if (success) {
                                    setShowMutationSnackbar(true);
                                }
                            }}
                            onUpdateStart={() => {
                                setShowMutationBackdrop(true);
                            }}
                            readOnly={isMarkedForDelete}
                        />
                    </Paper>
                </Grid2>
            </Grid2>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>

            <Snackbar
                open={showMutationSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowMutationSnackbar(false)}
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
            >
                <Alert
                    onClose={() => setShowMutationSnackbar(false)}
                    severity="success"
                    sx={{
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                >
                    Client Updated Successfully
                </Alert>
            </Snackbar>

            {secretDialogOpen &&
                <SecretViewerDialog
                    open={secretDialogOpen}
                    onClose={() => setSecretDialogOpen(false)}
                    objectId={client.clientId}
                    secretObjectType={SecretObjectType.ClientSecret}
                />
            }
        </Typography>
    )
}

export default ClientDetail;
