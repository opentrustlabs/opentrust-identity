"use client";
import { FederatedOidcProvider, FederatedOidcProviderUpdateInput, MarkForDeleteObjectType, SecretObjectType, PortalUserProfile, SecretShareObjectType } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import React, { useContext } from "react";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { CLIENT_TYPES_DISPLAY, DEFAULT_BACKGROUND_COLOR, FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, FEDERATED_OIDC_PROVIDER_RETURN_URI_PATH, FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY, FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT, OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST, OIDC_CLIENT_AUTH_TYPE_DISPLAY, OIDC_CLIENT_AUTH_TYPE_NONE, OIDC_EMAIL_SCOPE, OIDC_OFFLINE_ACCESS_SCOPE, OIDC_OPENID_SCOPE, OIDC_PROFILE_SCOPE, SECRET_ENTRY_DELEGATE_SCOPE, SOCIAL_OIDC_PROVIDERS, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import { AccordionSummary, AccordionDetails, Backdrop, CircularProgress, Snackbar, Alert, Select, MenuItem, Autocomplete, InputAdornment, Dialog, DialogContent, DialogActions, Button, Box, Chip, Stack, Tooltip, FormControlLabel, Switch } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { useMutation } from "@apollo/client";
import { FEDERATED_OIDC_PROVIDER_UPDATE_MUTATION, GENERATE_SECRET_SHARE_LINK_MUTATION } from "@/graphql/mutations/oidc-mutations";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { FEDERATED_OIDC_PROVIDER_DETAIL_QUERY } from "@/graphql/queries/oidc-queries";
import FederatedOIDCProviderDomainConfiguration from "./oidc-provider-domain-configuration";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import SecretViewerDialog from "../dialogs/secret-viewer-dialog";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import FederatedOIDCProviderTenantConfiguration from "./oidc-provider-tenant-configuration";
import { ERROR_CODES } from "@/lib/models/error";
import { useIntl } from 'react-intl';
import client from "../apollo-client/apollo-client";


export interface FederatedOIDCProviderDetailProps {
    federatedOIDCProvider: FederatedOidcProvider
}

const FederatedOIDCProviderDetail: React.FC<FederatedOIDCProviderDetailProps> = ({ federatedOIDCProvider }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();



    // STATE VARIABLES
    const initInput: FederatedOidcProviderUpdateInput = {
        clientAuthType: federatedOIDCProvider.clientAuthType,
        federatedOIDCProviderClientId: federatedOIDCProvider.federatedOIDCProviderClientId,
        federatedOIDCProviderId: federatedOIDCProvider.federatedOIDCProviderId,
        federatedOIDCProviderName: federatedOIDCProvider.federatedOIDCProviderName,
        federatedOIDCProviderType: federatedOIDCProvider.federatedOIDCProviderType,
        federatedOIDCProviderWellKnownUri: federatedOIDCProvider.federatedOIDCProviderWellKnownUri,
        refreshTokenAllowed: federatedOIDCProvider.refreshTokenAllowed,
        scopes: federatedOIDCProvider.scopes,
        usePkce: federatedOIDCProvider.usePkce,
        federatedOIDCProviderDescription: federatedOIDCProvider.federatedOIDCProviderDescription,
        socialLoginProvider: federatedOIDCProvider.socialLoginProvider,
        federatedOIDCProviderClientSecret: "",
        federatedOIDCProviderResponseType: federatedOIDCProvider.federatedOIDCProviderResponseType,
        federatedOIDCProviderSubjectType: federatedOIDCProvider.federatedOIDCProviderSubjectType
    };
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [oidcProviderInput, setOIDCProviderInput] = React.useState<FederatedOidcProviderUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [changeClientSecret, setChangeClientSecret] = React.useState<boolean>(false);
    const [secretDialogOpen, setSecretDialogOpen] = React.useState<boolean>(false);
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(federatedOIDCProvider.markForDelete);
    const [disableInputs] = React.useState<boolean>(federatedOIDCProvider.markForDelete || !containsScope(FEDERATED_OIDC_PROVIDER_UPDATE_SCOPE, profile?.scope || []));
    const [canViewSecret] = React.useState<boolean>(containsScope(FEDERATED_OIDC_PROVIDER_SECRET_VIEW_SCOPE, profile?.scope || []));
    const [canDeleteProvider] = React.useState<boolean>(containsScope(FEDERATED_OIDC_PROVIDER_DELETE_SCOPE, profile?.scope || []));
    const [sharedEmail, setSharedEmail] = React.useState<string>("");
    const [showSendSecretEntryEmail, setShowSendSecretEntryEmail] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [oidcProviderUpdateMutation] = useMutation(FEDERATED_OIDC_PROVIDER_UPDATE_MUTATION, {
        variables: {
            oidcProviderInput: oidcProviderInput
        },
        onCompleted() {
            setMarkDirty(false);
            setChangeClientSecret(false);
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({ id: error.message }));
        },
        refetchQueries: [FEDERATED_OIDC_PROVIDER_DETAIL_QUERY]
    });

    const [generateSecretShareLink] = useMutation(GENERATE_SECRET_SHARE_LINK_MUTATION, {
        onCompleted() {
            setShowSendSecretEntryEmail(false);
            setShowMutationBackdrop(false);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({ id: error.message }));
        },
    })


    const arrBreadcrumbs = [];
    arrBreadcrumbs.push({
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
        linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
    },);
    arrBreadcrumbs.push({
        linkText: "OIDC Providers",
        href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=oidc-providers`
    });
    arrBreadcrumbs.push({
        linkText: federatedOIDCProvider.federatedOIDCProviderName,
        href: null
    });


    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={arrBreadcrumbs}></BreadcrumbComponent>
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    {showSendSecretEntryEmail &&
                        <Dialog
                            open={showSendSecretEntryEmail}
                            onClose={() => setShowSendSecretEntryEmail(false)}
                            maxWidth="sm"
                            fullWidth={true}
                        >
                            <DialogContent>
                                <Typography component="div">
                                    <Grid2 container size={12} spacing={1}>
                                        <Grid2 marginBottom={"8px"} fontWeight={"bold"} size={12}>Enter the email of the person you want to receive the update link for the client secret:</Grid2>
                                        <Grid2 marginBottom={"8px"} fontWeight={"bold"} size={12}>
                                            <TextField
                                                fullWidth={true}
                                                name="sharedEmail"
                                                id="sharedEmail"
                                                onChange={(evt) => {
                                                    setSharedEmail(evt.target.value);
                                                }}
                                                error={sharedEmail.length < 6}
                                                size="small"
                                            />
                                        </Grid2>
                                    </Grid2>
                                </Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => setShowSendSecretEntryEmail(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    sx={{ cursor: "pointer" }}
                                    disabled={sharedEmail.length < 6}
                                    onClick={() => {
                                        setShowMutationBackdrop(true);
                                        generateSecretShareLink({
                                            variables: {
                                                objectId: federatedOIDCProvider.federatedOIDCProviderId,
                                                secretShareObjectType: SecretShareObjectType.OidcProvider,
                                                email: sharedEmail
                                            }
                                        })
                                    }}
                                >
                                    Send
                                </Button>
                            </DialogActions>
                        </Dialog>
                    }
                    {secretDialogOpen &&
                        <SecretViewerDialog
                            open={secretDialogOpen}
                            onClose={() => setSecretDialogOpen(false)}
                            objectId={federatedOIDCProvider.federatedOIDCProviderId}
                            secretObjectType={SecretObjectType.OidcProviderClientSecret}
                        />
                    }
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
                                        <AutoAwesomeMosaicIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {federatedOIDCProvider.federatedOIDCProviderName}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(federatedOIDCProvider.federatedOIDCProviderType)}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </Stack>
                                    </Box>
                                </Stack>
                                {isMarkedForDelete !== true && canDeleteProvider &&
                                    <SubmitMarkForDelete
                                        objectId={federatedOIDCProvider.federatedOIDCProviderId}
                                        objectType={MarkForDeleteObjectType.FederatedOidcProvider}
                                        confirmationMessage={`Confirm deletion of OIDC provider: ${federatedOIDCProvider.federatedOIDCProviderName}. Once submitted the operation cannot be undone.`}
                                        onDeleteEnd={(successful: boolean, errorMessage?: string) => {
                                            setShowMutationBackdrop(false);
                                            if (successful) {
                                                setShowMutationSnackbar(true);
                                                setIsMarkedForDelete(true);
                                            }
                                            else {
                                                if (errorMessage) {
                                                    setErrorMessage(intl.formatMessage({ id: errorMessage }));
                                                }
                                                else {
                                                    setErrorMessage(intl.formatMessage({ id: ERROR_CODES.DEFAULT.errorKey }));
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
                                {isMarkedForDelete !== true && canDeleteProvider &&
                                    <SubmitMarkForDelete 
                                        objectId={federatedOIDCProvider.federatedOIDCProviderId}
                                        objectType={MarkForDeleteObjectType.FederatedOidcProvider}
                                        confirmationMessage={`Confirm deletion of OIDC provider: ${federatedOIDCProvider.federatedOIDCProviderName}. Once submitted the operation cannot be undone.`}
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
                        {federatedOIDCProvider.usePkce === false && (federatedOIDCProvider.federatedOIDCProviderClientSecret === "") &&
                            <Alert sx={{ width: "100%", fontSize: "0.95em" }} severity="error">
                                Be aware that there is no client secret configured for this provider, and this provider does not use the PKCE extension
                                for OIDC (which does not require a client secret). Until the problem is corrected, this provider cannot be
                                used for authentication.
                            </Alert>
                        }
                        <Grid2 size={12}>
                            {errorMessage &&
                                <Grid2 size={12} marginBottom={"8px"}>
                                    <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                </Grid2>
                            }
                            {isMarkedForDelete === true &&
                                <MarkForDeleteAlert
                                    message={"This OIDC provider has been marked for deletion. No changes to the provider are permitted."}
                                />
                            }
                            <Paper sx={{ p: 1 }} elevation={1}>
                                <Grid2 container size={12} spacing={3}>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Stack spacing={3}>
                                            <TextField
                                                label="Provider Name"
                                                disabled={disableInputs}
                                                required name="providerName" id="providerName"
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderName = evt?.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true); }}
                                                value={oidcProviderInput.federatedOIDCProviderName}
                                                fullWidth={true}
                                            />

                                            <TextField
                                                label="Provider Description"
                                                disabled={disableInputs}
                                                name="providerDescription" id="providerDescription"
                                                value={oidcProviderInput.federatedOIDCProviderDescription}
                                                fullWidth={true}

                                                multiline={true}
                                                rows={2}
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderDescription = evt?.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true); }}
                                            />
                                            <TextField
                                                select

                                                label="Provider Type"
                                                fullWidth={true}
                                                value={oidcProviderInput.federatedOIDCProviderType}
                                                name="providerType"
                                                onChange={(evt) => {
                                                    oidcProviderInput.federatedOIDCProviderType = evt.target.value;
                                                    if (evt.target.value === FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE) {
                                                        oidcProviderInput.socialLoginProvider = "";
                                                    }
                                                    setOIDCProviderInput({ ...oidcProviderInput });
                                                    setMarkDirty(true);
                                                }}
                                                disabled={true}
                                            >
                                                <MenuItem value={FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE} >{FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE)}</MenuItem>
                                                <MenuItem value={FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL} >{FEDERATED_OIDC_PROVIDER_TYPES_DISPLAY.get(FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL)}</MenuItem>
                                            </TextField>

                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    Federated OIDC Provider ID
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
                                                        {federatedOIDCProvider.federatedOIDCProviderId}
                                                    </Typography>
                                                    <Tooltip title="Copy to clipboard">
                                                        <ContentCopyIcon
                                                            sx={{ cursor: "pointer", ml: 1, color: 'action.active' }}
                                                            onClick={() => {
                                                                copyContentToClipboard(federatedOIDCProvider.federatedOIDCProviderId, "OIDC Provider ID copied to clipboard");
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Paper>
                                            </Box>

                                            {oidcProviderInput.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL &&
                                                <Autocomplete
                                                    disabled={disableInputs}
                                                    id="socialLoginProvider"
                                                    options={SOCIAL_OIDC_PROVIDERS}
                                                    renderInput={(params) => (
                                                        <TextField {...params} variant="outlined" label="Social Provider (Requires an account with the provider)" />
                                                    )}
                                                    onChange={(_, value) => {
                                                        oidcProviderInput.socialLoginProvider = value;
                                                        setOIDCProviderInput({ ...oidcProviderInput });
                                                    }}
                                                    value={oidcProviderInput.socialLoginProvider}
                                                />
                                            }

                                            <TextField name="clientId" id="clientId"
                                                disabled={disableInputs}
                                                value={oidcProviderInput.federatedOIDCProviderClientId || ""}
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderClientId = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true); }}
                                                fullWidth={true}
                                                label="Provider Client ID"
                                            />

                                            <Grid2 marginLeft={"4px"} marginBottom={"16px"}>
                                                <div style={{ textDecoration: "underline" }} >Provider Client Secret</div>
                                                <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                    {changeClientSecret === true &&
                                                        <Grid2 size={12}>
                                                            <TextField type="password" name="clientSecret" id="clientSecret"
                                                                disabled={disableInputs}
                                                                value={oidcProviderInput.federatedOIDCProviderClientSecret}
                                                                onChange={(evt) => {
                                                                    oidcProviderInput.federatedOIDCProviderClientSecret = evt.target.value;
                                                                    setOIDCProviderInput({ ...oidcProviderInput });
                                                                    setMarkDirty(true);
                                                                }}
                                                                fullWidth={true} size="small"
                                                                slotProps={{
                                                                    input: {
                                                                        endAdornment: (
                                                                            <InputAdornment position="end">
                                                                                <CloseOutlinedIcon
                                                                                    sx={{ cursor: "pointer" }}
                                                                                    onClick={() => {
                                                                                        oidcProviderInput.federatedOIDCProviderClientSecret = "";
                                                                                        setOIDCProviderInput({ ...oidcProviderInput });
                                                                                        setChangeClientSecret(false);
                                                                                    }}
                                                                                />
                                                                            </InputAdornment>
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                        </Grid2>
                                                    }
                                                    {changeClientSecret !== true &&
                                                        <>
                                                            <Grid2 size={containsScope(SECRET_ENTRY_DELEGATE_SCOPE, profile?.scope) ? 9 : 10}>
                                                                <div>*******************************************</div>
                                                            </Grid2>
                                                            {containsScope(SECRET_ENTRY_DELEGATE_SCOPE, profile?.scope) &&
                                                                <Grid2 size={1}>
                                                                    {!disableInputs &&
                                                                        <SendOutlinedIcon
                                                                            sx={{ cursor: "pointer" }}
                                                                            onClick={() => {
                                                                                setShowSendSecretEntryEmail(true);
                                                                            }}
                                                                        />
                                                                    }
                                                                </Grid2>
                                                            }
                                                            <Grid2 size={1}>
                                                                {!disableInputs &&
                                                                    <EditOutlinedIcon
                                                                        sx={{ cursor: "pointer" }}
                                                                        onClick={() => {
                                                                            setChangeClientSecret(true);
                                                                        }}
                                                                    />
                                                                }
                                                            </Grid2>
                                                            <Grid2 size={1}>
                                                                {canViewSecret &&
                                                                    <VisibilityOutlinedIcon
                                                                        sx={{ cursor: "pointer" }}
                                                                        onClick={() => setSecretDialogOpen(true)}
                                                                    />
                                                                }
                                                            </Grid2>
                                                        </>
                                                    }
                                                </Grid2>
                                            </Grid2>
                                        </Stack>
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Stack spacing={2.5}>
                                            <TextField name="providerWellKnownUri" id="providerWellKnownUri"
                                                disabled={disableInputs}
                                                label="Well Known URI"
                                                value={oidcProviderInput.federatedOIDCProviderWellKnownUri}
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderWellKnownUri = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true); }}
                                                fullWidth={true}
                                            />

                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    Redirect URI (to be configured with the provider)
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
                                                        {`${location.protocol}//${location.host}${FEDERATED_OIDC_PROVIDER_RETURN_URI_PATH}`}
                                                    </Typography>
                                                    <Tooltip title="Copy to clipboard">
                                                        <ContentCopyIcon
                                                            sx={{ cursor: "pointer", ml: 1, color: 'action.active' }}
                                                            onClick={() => {
                                                                copyContentToClipboard(`${location.protocol}//${location.host}${FEDERATED_OIDC_PROVIDER_RETURN_URI_PATH}`, "Redirect URI copied to clipboard");
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Paper>
                                            </Box>
                                            <TextField
                                                select
                                                label="Authentication Type"
                                                disabled={disableInputs}
                                                fullWidth={true}
                                                value={oidcProviderInput.clientAuthType}
                                                name="providerType"
                                                onChange={(evt) => { oidcProviderInput.clientAuthType = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true); }}
                                            >
                                                <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST)}</MenuItem>
                                                <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_JWT)}</MenuItem>
                                                <MenuItem value={OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_BASIC)}</MenuItem>
                                                <MenuItem disabled={oidcProviderInput.usePkce === false} value={OIDC_CLIENT_AUTH_TYPE_NONE} >{OIDC_CLIENT_AUTH_TYPE_DISPLAY.get(OIDC_CLIENT_AUTH_TYPE_NONE)}</MenuItem>
                                            </TextField>

                                            <Autocomplete
                                                disabled={disableInputs}
                                                id="scopes"
                                                multiple={true}
                                                renderInput={(params) => <TextField {...params} label="Scope" />}
                                                options={[
                                                    { id: OIDC_OPENID_SCOPE, label: OIDC_OPENID_SCOPE },
                                                    { id: OIDC_EMAIL_SCOPE, label: OIDC_EMAIL_SCOPE },
                                                    { id: OIDC_PROFILE_SCOPE, label: OIDC_PROFILE_SCOPE },
                                                    { id: OIDC_OFFLINE_ACCESS_SCOPE, label: OIDC_OFFLINE_ACCESS_SCOPE }
                                                ]}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                value={oidcProviderInput.scopes.map(
                                                    (s: string) => {
                                                        return {
                                                            id: s,
                                                            label: s
                                                        }
                                                    }
                                                )}
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                onChange={(_, value: any) => {
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any                                              
                                                    oidcProviderInput.scopes = value.map((v: any) => v.id);
                                                    setOIDCProviderInput({ ...oidcProviderInput });
                                                    setMarkDirty(true);
                                                }}
                                            />
                                            <Stack spacing={1} >
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: 'grey.50',
                                                        height: '100%',
                                                    }}
                                                >
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                disabled={disableInputs}
                                                                checked={oidcProviderInput.usePkce}
                                                                onChange={(_, checked: boolean) => {
                                                                    oidcProviderInput.usePkce = checked;
                                                                    if (!checked && oidcProviderInput.clientAuthType === OIDC_CLIENT_AUTH_TYPE_NONE) {
                                                                        oidcProviderInput.clientAuthType = OIDC_CLIENT_AUTH_TYPE_CLIENT_SECRET_POST;
                                                                    }
                                                                    setOIDCProviderInput({ ...oidcProviderInput });
                                                                    setMarkDirty(true);
                                                                }}
                                                            />
                                                        }
                                                        label="Use PKCE"
                                                        sx={{ margin: "4px", justifyContent: 'space-between', width: '100%' }}
                                                        labelPlacement="start"
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                disabled={disableInputs}
                                                                checked={oidcProviderInput.refreshTokenAllowed}
                                                                onChange={(_, checked: boolean) => {
                                                                    oidcProviderInput.refreshTokenAllowed = checked;
                                                                    setOIDCProviderInput({ ...oidcProviderInput });
                                                                    setMarkDirty(true);
                                                                }}
                                                            />
                                                        }
                                                        label="Refresh Token Allowed"
                                                        sx={{ margin: "4px", justifyContent: 'space-between', width: '100%' }}
                                                        labelPlacement="start"
                                                    />
                                                </Paper>
                                            </Stack>
                                        </Stack>

                                        {/* <Grid2 marginBottom={"16px"}>
                                            <div>Response Type</div>
                                            <Select
                                                size="small"
                                                fullWidth={true}
                                                value={oidcProviderInput.federatedOIDCProviderResponseType}
                                                name="responseType"
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderResponseType = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true);}}
                                            >
                                                {FEDERATED_OIDC_RESPONSE_TYPES.map(
                                                    (type: string) => (
                                                        <MenuItem value={type} >{type}</MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Subject Type</div>
                                            <Select
                                                size="small"
                                                fullWidth={true}
                                                value={oidcProviderInput.federatedOIDCProviderSubjectType}
                                                name="subjectType"
                                                onChange={(evt) => { oidcProviderInput.federatedOIDCProviderSubjectType = evt.target.value; setOIDCProviderInput({ ...oidcProviderInput }); setMarkDirty(true);}}
                                            >
                                                {FEDERATED_OIDC_PROVIDER_SUBJECT_TYPES.map(
                                                    (type: string) => (
                                                        <MenuItem value={type} >{type}</MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </Grid2> */}
                                    </Grid2>
                                </Grid2>
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setOIDCProviderInput(initInput);
                                        setMarkDirty(false);
                                        setChangeClientSecret(false);
                                    }}
                                    onUpdateClickedHandler={() => {
                                        setShowMutationBackdrop(true);
                                        oidcProviderUpdateMutation();
                                    }}
                                    markDirty={markDirty}
                                />
                            </Paper>
                        </Grid2>
                        {federatedOIDCProvider.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE &&
                            <Grid2 size={12} marginBottom={"16px"}>
                                {!isMarkedForDelete &&
                                    <Accordion defaultExpanded={true}  >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            id={"domain-configuration"}
                                            sx={{ fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}

                                        >
                                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <AlternateEmailIcon /><div style={{ marginLeft: "8px" }}>Domains</div>
                                            </div>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <FederatedOIDCProviderDomainConfiguration
                                                federatedOIDCProviderId={federatedOIDCProvider.federatedOIDCProviderId}
                                                onUpdateEnd={(success: boolean) => {
                                                    setShowMutationBackdrop(false);
                                                    if (success) {
                                                        setShowMutationSnackbar(true);
                                                    }
                                                }}
                                                onUpdateStart={() => {
                                                    setShowMutationBackdrop(true);
                                                }}
                                                readOnly={disableInputs}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                }
                            </Grid2>
                        }
                        {federatedOIDCProvider.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL &&
                            <Grid2 size={12} marginBottom={"16px"}>
                                {!isMarkedForDelete &&
                                    <Accordion defaultExpanded={false}  >
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
                                            <FederatedOIDCProviderTenantConfiguration
                                                federatedOIDCProviderId={federatedOIDCProvider.federatedOIDCProviderId}
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
                </DetailPageMainContentContainer>
            </DetailPageContainer>
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
                anchorOrigin={{ horizontal: "center", vertical: "top" }}
            >
                <Alert sx={{ fontSize: "1em" }}
                    onClose={() => setShowMutationSnackbar(false)}
                >
                    Provider Updated
                </Alert>
            </Snackbar>
        </Typography>


    )
}

export default FederatedOIDCProviderDetail;