"use client";
import React, { useContext } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Backdrop, Checkbox, CircularProgress, MenuItem, Paper, Select, Snackbar, TextField } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { CLIENT_DELETE_SCOPE, CLIENT_SECRET_VIEW_SCOPE, CLIENT_TYPE_DEVICE, CLIENT_TYPE_IDENTITY, CLIENT_TYPE_SERVICE_ACCOUNT, CLIENT_TYPE_USER_DELEGATED_PERMISSIONS, CLIENT_TYPES, CLIENT_TYPES_DISPLAY, CLIENT_UPDATE_SCOPE, DEFAULT_END_USER_TOKEN_TTL_SECONDS, DEFAULT_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, MAX_END_USER_TOKEN_TTL_SECONDS, MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, MIN_END_USER_TOKEN_TTL_SECONDS, MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Client, ClientUpdateInput, MarkForDeleteObjectType, SecretObjectType, PortalUserProfile } from "@/graphql/generated/graphql-types";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncIcon from '@mui/icons-material/Sync';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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

export interface ClientDetailProps {
    client: Client
}
const ClientDetail: React.FC<ClientDetailProps> = ({ client }) => {

    // CONTEXT OBJECTS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;


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
            setErrorMessage(error.message);
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
                <div style={{ marginBottom: "16px" }}>
                    <TenantHighlight tenantId={client.tenantId} />
                </div>
            }
            <Grid2 container size={12} spacing={3} marginBottom={"16px"}>
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 9, xl: 9 }}>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={11}>Overview</Grid2>
                            <Grid2 size={1} display={"flex"} >
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
                                                setErrorMessage(errorMessage || "ERROR");
                                            }
                                        }}
                                        onDeleteStart={() => setShowMutationBackdrop(true)}
                                    />
                                }
                            </Grid2>
                        </Grid2>
                        <Grid2 size={12} marginBottom={"16px"}>
                            {errorMessage &&
                                <Grid2 size={12} marginBottom={"8px"}>
                                    <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                </Grid2>
                            }
                            {isMarkedForDelete === true &&
                                <MarkForDeleteAlert
                                    message={"This client has been marked for deletion. No changes to the client are permitted."}
                                />
                            }
                            <Paper elevation={1} sx={{ padding: "8px" }}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Name</div>
                                            <TextField
                                                disabled={disableInputs}
                                                name="clientName" id="clientName" value={clientUpdateInput.clientName} fullWidth={true} size="small"
                                                onChange={(evt) => { clientUpdateInput.clientName = evt.target.value; setClientUpdateInput({ ...clientUpdateInput }); setMarkDirty(true); }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Descripton</div>
                                            <TextField
                                                disabled={disableInputs}
                                                name="clientDescription" id="clientDescription" value={clientUpdateInput.clientDescription} fullWidth={true} size="small" multiline={true} rows={2}
                                                onChange={(evt) => { clientUpdateInput.clientDescription = evt.target.value; setClientUpdateInput({ ...clientUpdateInput }); setMarkDirty(true); }}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Client Type</div>
                                            <Select
                                                disabled={disableInputs}
                                                size="small"
                                                fullWidth={true}
                                                value={clientUpdateInput.clientType}
                                                name="clientType"
                                                onChange={(evt) => { 
                                                    clientUpdateInput.clientType = evt.target.value; 
                                                    if(clientUpdateInput.clientType === CLIENT_TYPE_SERVICE_ACCOUNT){
                                                        clientUpdateInput.oidcEnabled = false;
                                                        clientUpdateInput.pkceEnabled = false;
                                                    }
                                                    setClientUpdateInput({ ...clientUpdateInput }); 
                                                    setMarkDirty(true); }}
                                            >
                                                {CLIENT_TYPES.map(
                                                    (val: string) => (
                                                        <MenuItem value={val} >{CLIENT_TYPES_DISPLAY.get(val)}</MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{ textDecoration: "underline" }}>Client ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2 size={11}>
                                                    {client.clientId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon
                                                        sx={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            copyContentToClipboard(client.clientId, "Client ID copied to clipboard");
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                        {canViewClientSecret &&
                                            <Grid2 marginBottom={"16px"}>
                                                <div style={{ textDecoration: "underline" }}>Client Secret</div>
                                                <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                    <Grid2 size={10}>
                                                        <span>*******************************************</span>
                                                    </Grid2>
                                                    <Grid2 size={1}></Grid2>
                                                    <Grid2 size={1}>
                                                        <VisibilityOutlinedIcon
                                                            sx={{ cursor: "pointer" }}
                                                            onClick={() => setSecretDialogOpen(true)}
                                                        />
                                                    </Grid2>
                                                </Grid2>
                                            </Grid2>
                                        }
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Audience for access tokens (If left blank, defaults to client ID)</div>
                                            <TextField
                                                disabled={disableInputs}
                                                name="audience" id="audience" value={clientUpdateInput.audience || ""} fullWidth={true} size="small"
                                                onChange={(evt) => { clientUpdateInput.audience = evt.target.value; setClientUpdateInput({ ...clientUpdateInput }); setMarkDirty(true); }}
                                            />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 borderLeft={"dotted 1px lightgrey"} paddingLeft={"8px"} container size={12}>
                                            <Grid2 alignContent={"center"} size={10}>Enabled</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox
                                                    disabled={disableInputs}
                                                    checked={clientUpdateInput.enabled}
                                                    onChange={(_, checked: boolean) => { clientUpdateInput.enabled = checked; setClientUpdateInput({ ...clientUpdateInput }); setMarkDirty(true); }}
                                                />
                                            </Grid2>

                                            <Grid2 alignContent={"center"} size={10}>OIDC (SSO) Enabled</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox
                                                    disabled={disableInputs || clientUpdateInput.clientType === CLIENT_TYPE_SERVICE_ACCOUNT}
                                                    checked={clientUpdateInput.oidcEnabled}
                                                    onChange={(_, checked: boolean) => {
                                                        clientUpdateInput.oidcEnabled = checked;
                                                        // Make sure that we also disable the pkce since it does not
                                                        // make any sense to have it enabled if SSO is dislabed.
                                                        if (checked === false) {
                                                            clientUpdateInput.pkceEnabled = false;
                                                        }
                                                        setClientUpdateInput({ ...clientUpdateInput });
                                                        setMarkDirty(true);
                                                    }}
                                                />
                                            </Grid2>

                                            <Grid2 alignContent={"center"} size={10}>PKCE Enabled</Grid2>
                                            <Grid2 size={2}>
                                                <Checkbox

                                                    checked={clientUpdateInput.pkceEnabled}
                                                    disabled={clientUpdateInput.oidcEnabled === false || disableInputs}
                                                    onChange={(_, checked: boolean) => {
                                                        clientUpdateInput.pkceEnabled = checked;
                                                        setClientUpdateInput({ ...clientUpdateInput });
                                                        setMarkDirty(true);
                                                    }}
                                                />
                                            </Grid2>

                                            <Grid2 marginTop={"16px"} alignContent={"center"} size={12}>User Token TTL (Seconds) - Max: {MAX_END_USER_TOKEN_TTL_SECONDS}, Min: {MIN_END_USER_TOKEN_TTL_SECONDS}</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField type="number" name="userTokenTTL" id="userTokenTTL"
                                                    disabled={disableInputs}
                                                    value={
                                                        clientUpdateInput.userTokenTTLSeconds || ""
                                                    }
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
                                                    fullWidth={true} size="small" />
                                            </Grid2>

                                            <Grid2 alignContent={"center"} size={12}>Client Token TTL (Seconds) - Max: {MAX_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS}, Min: {MIN_SERVICE_ACCOUNT_TOKEN_TTL_SECONDS}</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField type="number" name="clientTokenTTLSeconds" id="clientTokenTTLSeconds"
                                                    disabled={disableInputs}
                                                    value={
                                                        clientUpdateInput.clientTokenTTLSeconds || ""
                                                    }
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
                                                    fullWidth={true} size="small" />
                                            </Grid2>

                                            <Grid2 alignContent={"center"} size={12}>Max Refresh Token Count</Grid2>
                                            <Grid2 marginBottom={"16px"} alignContent={"center"} size={12}>
                                                <TextField type="number" name="maxRefreshTokenCount" id="maxRefreshTokenCount"
                                                    disabled={disableInputs}
                                                    value={
                                                        clientUpdateInput.maxRefreshTokenCount || ""
                                                    }
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
                                                    fullWidth={true} size="small" />
                                            </Grid2>
                                        </Grid2>
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
                        </Grid2>

                        {client.clientType !== CLIENT_TYPE_SERVICE_ACCOUNT &&
                            <Grid2 size={12} marginBottom={"16px"}>
                                {!isMarkedForDelete &&
                                    <Accordion defaultExpanded={true}  >
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
                        {client.clientType !== CLIENT_TYPE_SERVICE_ACCOUNT &&
                            <Grid2 size={12} marginBottom={"16px"}>
                                {!isMarkedForDelete &&
                                    <Accordion >
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
                            </Grid2>
                        }
                    </Grid2>
                    {client.clientType !== CLIENT_TYPE_IDENTITY &&
                        <Grid2 size={12} >
                            {!isMarkedForDelete &&
                                <Accordion >
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
                        </Grid2>
                    }
                </Grid2>
                <Grid2 spacing={2} size={{ xs: 12, sm: 12, md: 12, lg: 3, xl: 3 }}>
                    <Grid2 container spacing={2} size={12}>
                        <Grid2 size={{ xs: 12, sm: 6, lg: 12, md: 6, xl: 12 }} >
                            <Paper elevation={3} >

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
                </Grid2>

            </Grid2>
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
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
            >
                <Alert sx={{ fontSize: "1em" }}
                    onClose={() => setShowMutationSnackbar(false)}
                >
                    Client Updated
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
        </Typography >
    )
}

export default ClientDetail;