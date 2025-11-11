"use client";
import { CaptchaConfig, CaptchaConfigInput, CategoryEntry, PortalUserProfile, SecretObjectType, SystemCategory, SystemSettings, SystemSettingsUpdateInput } from "@/graphql/generated/graphql-types";
import { Alert, Backdrop, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, Grid2, InputAdornment, Paper, Snackbar, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { DetailPageContainer, DetailPageMainContentContainer } from "../layout/detail-page-container";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { CAPTCHA_CONFIG_SCOPE, DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS, SYSTEM_SETTINGS_UPDATE_SCOPE } from "@/utils/consts";
import { containsScope } from "@/utils/authz-utils";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import { useMutation, useQuery } from "@apollo/client";
import { REMOVE_CAPTCHA_CONFIG_MUTATION, SET_CAPTCHA_CONFIG_MUTATION, UPDATE_SYSTEM_SETTINGS_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useIntl } from 'react-intl';
import { CAPTCHA_CONFIG_QUERY } from "@/graphql/queries/oidc-queries";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SecretViewerDialog from "../dialogs/secret-viewer-dialog";


export interface SystemSettingsDetailProps {
    systemSettings: SystemSettings
}

const SystemSettingsDetail: React.FC<SystemSettingsDetailProps> = ({
    systemSettings
}) => {

    

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();


    // STATE VARIABLES    
    const initInput: SystemSettingsUpdateInput = {
        allowRecoveryEmail: systemSettings.allowRecoveryEmail,
        allowDuressPassword: systemSettings.allowDuressPassword,
        rootClientId: systemSettings.rootClientId,
        enablePortalAsLegacyIdp: systemSettings.enablePortalAsLegacyIdp,
        auditRecordRetentionPeriodDays: systemSettings.auditRecordRetentionPeriodDays || DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS,
        noReplyEmail: systemSettings.noReplyEmail,
        contactEmail: systemSettings.contactEmail
    };

    const initCaptchaInput: CaptchaConfigInput = {
        alias: "",
        apiKey: "",
        siteKey: "",
        useCaptchaV3: false,
        useEnterpriseCaptcha: false,
        minScoreThreshold: 0,
        projectId: ""
    }
    const [systemSettingsUpdateInput, setSystemSettingsUpdateInput] = React.useState<SystemSettingsUpdateInput>(initInput);
    const [captchaConfigInput, setCaptchaConfigInput] = React.useState<CaptchaConfigInput>(initCaptchaInput);
    const [captchaConfigRevertToInput, setCaptchaRevertToInput] = React.useState<CaptchaConfigInput>(initCaptchaInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [captchaConfigMarkDirty, setCaptchaConfigMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [changeApiKey, setChangeApiKey] = React.useState<boolean>(false);
    const [secretDialogOpen, setSecretDialogOpen] = React.useState<boolean>(false);
    const [showConfirmRecaptchaRemoveDialogOpen, setShowConfirmRecaptchaRemoveDialogOpen] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const [updateSystemSettingsMutation] = useMutation(UPDATE_SYSTEM_SETTINGS_MUTATION, {
        onCompleted(data) {
            setShowMutationBackdrop(false);
            setMarkDirty(false);
            setSystemSettingsUpdateInput({
                allowRecoveryEmail: data.updateSystemSettings.allowRecoveryEmail,
                allowDuressPassword: data.updateSystemSettings.allowDuressPassword,
                rootClientId: data.updateSystemSettings.rootClientId,
                enablePortalAsLegacyIdp: data.updateSystemSettings.enablePortalAsLegacyIdp,
                auditRecordRetentionPeriodDays: data.updateSystemSettings.auditRecordRetentionPeriodDays,
                contactEmail: data.updateSystemSettings.contactEmail,
                noReplyEmail: data.updateSystemSettings.noReplyEmail
            });
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const {data, refetch} = useQuery(CAPTCHA_CONFIG_QUERY, {
        notifyOnNetworkStatusChange: true,
        onCompleted(data) {
            if(data && data.getCaptchaConfig){                
                const config: CaptchaConfig = data.getCaptchaConfig;                
                const input: CaptchaConfigInput = {
                    alias: config.alias,
                    apiKey: config.apiKey,
                    siteKey: config.siteKey,
                    useCaptchaV3: config.useCaptchaV3,
                    useEnterpriseCaptcha: config.useEnterpriseCaptcha,
                    minScoreThreshold: config.minScoreThreshold,
                    projectId: config.projectId
                }
                setCaptchaConfigInput(input);
                setCaptchaRevertToInput({...input});
            }
        },
        skip: !containsScope(CAPTCHA_CONFIG_SCOPE, profile?.scope)
    });

    const [updateCaptchaConfigMutation] = useMutation(SET_CAPTCHA_CONFIG_MUTATION, {
        onCompleted() {
            setShowMutationBackdrop(false);
            setCaptchaConfigMarkDirty(false);
            setShowMutationSnackbar(true);
            setChangeApiKey(false);
            refetch();
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setCaptchaConfigMarkDirty(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    const [removeCaptchaConfigMutation] = useMutation(REMOVE_CAPTCHA_CONFIG_MUTATION, {
        onCompleted() {
            setShowMutationBackdrop(false);
            setCaptchaConfigMarkDirty(false);
            setShowMutationSnackbar(true);
            refetch();
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setCaptchaConfigMarkDirty(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });


    // HELPER VARIABLES AND FUNCTIONS
    const categoriesMidpoint = Math.floor(systemSettings.systemCategories.length / 2);

    return (
        <Typography component={"div"}>
            {secretDialogOpen &&                    
                <SecretViewerDialog 
                    open={secretDialogOpen}
                    onClose={() => setSecretDialogOpen(false)}
                    objectId={captchaConfigInput.alias}
                    secretObjectType={SecretObjectType.CaptchaApiKey}                     
                />
            }
            {showConfirmRecaptchaRemoveDialogOpen &&
                <Dialog
                    open={showConfirmRecaptchaRemoveDialogOpen}
                    onClose={() => setShowConfirmRecaptchaRemoveDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>Confirm removal of ReCaptcha configuration</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowConfirmRecaptchaRemoveDialogOpen(false)}
                        >
                            {intl.formatMessage({id: "CANCEL"})}
                        </Button>
                        <Button
                            onClick={() => {
                                setShowConfirmRecaptchaRemoveDialogOpen(false);
                                setShowMutationBackdrop(true);
                                removeCaptchaConfigMutation();
                            }}
                        >
                            {intl.formatMessage({id: "CONFIRM"})}
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2} marginTop={"16px"}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={12}>System Settings</Grid2>
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={1} >
                        <Grid2 marginTop={"8px"} size={{ sm: 12, md: 6 }}>
                            <Paper sx={{ padding: "8px", marginTop: "16px" }} elevation={2}>
                                {errorMessage &&
                                    <Alert severity="error" onClose={() => setErrorMessage(null)} >{errorMessage}</Alert>
                                }
                                <Grid2 marginBottom={"8px"} sx={{ textDecoration: "underline" }} size={12} fontWeight={"bold"}>
                                    Global Settings
                                </Grid2>
                                <Grid2 alignItems={"stretch"} container size={12} spacing={1}>
                                    <Grid2 size={11}>
                                        Software version:
                                    </Grid2>
                                    <Grid2 size={1}>
                                        {systemSettings.softwareVersion}
                                    </Grid2>
                                    <Grid2 size={11}>
                                        Allow recovery emails
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Checkbox
                                            sx={{ height: "25px", width: "25px" }}
                                            value={systemSettingsUpdateInput.allowRecoveryEmail}
                                            checked={systemSettingsUpdateInput.allowRecoveryEmail}
                                            disabled={!containsScope(SYSTEM_SETTINGS_UPDATE_SCOPE, profile?.scope)}
                                            onChange={(_, checked: boolean) => {                                                
                                                systemSettingsUpdateInput.allowRecoveryEmail = checked;
                                                setMarkDirty(true);
                                                setSystemSettingsUpdateInput({...systemSettingsUpdateInput});                                                
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 size={11}>
                                        Allow duress passwords:
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Checkbox
                                            sx={{ height: "25px", width: "25px" }}
                                            value={systemSettingsUpdateInput.allowDuressPassword}
                                            checked={systemSettingsUpdateInput.allowDuressPassword}
                                            disabled={!containsScope(SYSTEM_SETTINGS_UPDATE_SCOPE, profile?.scope)}
                                            onChange={(_, checked: boolean) => {                                                
                                                systemSettingsUpdateInput.allowDuressPassword = checked;
                                                setMarkDirty(true);
                                                setSystemSettingsUpdateInput({...systemSettingsUpdateInput});                                                
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 size={11}>
                                        Enable Portal as Legacy IdP:
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Checkbox
                                            sx={{ height: "25px", width: "25px" }}
                                            value={systemSettingsUpdateInput.enablePortalAsLegacyIdp}
                                            checked={systemSettingsUpdateInput.enablePortalAsLegacyIdp}
                                            disabled={!containsScope(SYSTEM_SETTINGS_UPDATE_SCOPE, profile?.scope)}
                                            onChange={(_, checked: boolean) => {                                                
                                                systemSettingsUpdateInput.enablePortalAsLegacyIdp = checked;
                                                setMarkDirty(true);
                                                setSystemSettingsUpdateInput({...systemSettingsUpdateInput});                                                
                                            }}
                                        />
                                    </Grid2>
                                    <Grid2 marginBlock={"8px"} size={12}>
                                        <div>Root Client ID:</div>
                                        <TextField
                                            size="small"
                                            fullWidth={true}
                                            value={systemSettingsUpdateInput.rootClientId}
                                            onChange={(evt) => {
                                                systemSettingsUpdateInput.rootClientId = evt.target.value;
                                                setMarkDirty(true);
                                                setSystemSettingsUpdateInput({...systemSettingsUpdateInput});
                                            }}                         
                                        />                                        
                                    </Grid2>
                                    <Grid2 marginBlock={"8px"} size={12}>
                                        <div>Audit Record Retention Period (Days). Defaults to {DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS}</div>
                                        <TextField
                                            size="small"
                                            fullWidth={true}
                                            type="number"
                                            value={systemSettingsUpdateInput.auditRecordRetentionPeriodDays}
                                            onChange={(evt) => {
                                                const v = parseInt(evt.target.value);
                                                if(!isNaN(v)){
                                                    systemSettingsUpdateInput.auditRecordRetentionPeriodDays = v;
                                                    setMarkDirty(true);
                                                    setSystemSettingsUpdateInput({...systemSettingsUpdateInput});
                                                }
                                            }}                         
                                        />                                        
                                    </Grid2>
                                    <Grid2 marginBlock={"8px"} size={12}>
                                        <div>No-Reply Email</div>
                                        <TextField
                                            size="small"
                                            fullWidth={true}
                                            value={systemSettingsUpdateInput.noReplyEmail || ""}
                                            onChange={(evt) => {
                                                systemSettingsUpdateInput.noReplyEmail = evt.target.value;
                                                setMarkDirty(true);
                                                setSystemSettingsUpdateInput({...systemSettingsUpdateInput});
                                            }}                         
                                        />                                        
                                    </Grid2>

                                    <Grid2 marginBlock={"8px"} size={12}>
                                        <div>Contact Email</div>
                                        <TextField
                                            size="small"
                                            fullWidth={true}
                                            value={systemSettingsUpdateInput.contactEmail || ""}
                                            onChange={(evt) => {
                                                systemSettingsUpdateInput.contactEmail = evt.target.value;
                                                setMarkDirty(true);
                                                setSystemSettingsUpdateInput({...systemSettingsUpdateInput});                                                
                                            }}                         
                                        />                                        
                                    </Grid2>

                                    {containsScope(SYSTEM_SETTINGS_UPDATE_SCOPE, profile?.scope) &&
                                        <Grid2 size={12}>
                                            <DetailSectionActionHandler
                                                onDiscardClickedHandler={() => {
                                                    setSystemSettingsUpdateInput({...initInput}); 
                                                    setMarkDirty(false);
                                                }}
                                                onUpdateClickedHandler={() => {
                                                    setShowMutationBackdrop(true);
                                                    updateSystemSettingsMutation({
                                                        variables: {
                                                            systemSettingsUpdateInput: systemSettingsUpdateInput
                                                        }
                                                    })
                                                }}
                                                markDirty={markDirty}
                                                disableSubmit={false}                                                
                                            />
                                        </Grid2>
                                    }                                    
                                </Grid2>
                            </Paper>
                            {systemSettings.systemCategories.slice(0, categoriesMidpoint).map(
                                (systemCategory: SystemCategory) => (
                                    <Paper sx={{ padding: "8px", marginTop: "16px" }} elevation={2} key={systemCategory.categoryName}>
                                        <Grid2 marginBottom={"8px"} sx={{ textDecoration: "underline" }} size={12} fontWeight={"bold"}>
                                            {systemCategory.categoryName}
                                        </Grid2>
                                        {systemCategory.categoryEntries.map(
                                            (categoryEntry: CategoryEntry) => (
                                                <Grid2 size={12} paddingTop={"2px"} container key={categoryEntry.categoryKey}>
                                                    <Grid2 sx={{overflowWrap: "break-word"}} paddingRight={"2px"} size={6}>
                                                        {categoryEntry.categoryKey}
                                                    </Grid2>
                                                    <Grid2 sx={{overflowWrap: "break-word"}} size={6}>
                                                        {categoryEntry.categoryValue}
                                                    </Grid2>
                                                </Grid2>
                                            )
                                        )}
                                    </Paper>
                                )
                            )}
                        </Grid2>
                    
                        <Grid2 marginTop={"8px"} size={{ sm: 6, md: 6 }}>
                            {containsScope(CAPTCHA_CONFIG_SCOPE, profile?.scope) &&
                                <Paper sx={{ padding: "8px", marginTop: "16px" }} elevation={2}>
                                    <Grid2 sx={{marginBottom: "16px", textDecoration: "underline", fontWeight: "bold"}}>
                                        ReCaptcha Configuration
                                    </Grid2>
                                    <Grid2 alignItems={"center"} container size={12} spacing={1}>                                        
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Alias</div>
                                            <TextField
                                                id="captchaAlias" name="captchaAlias"
                                                onChange={(evt) => {
                                                    captchaConfigInput.alias = evt.target.value;
                                                    setCaptchaConfigInput({...captchaConfigInput});
                                                    setCaptchaConfigMarkDirty(true);
                                                }}
                                                value={captchaConfigInput.alias}
                                                size="small"
                                                fullWidth={true}
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Project ID (Optional)</div>
                                            <TextField
                                                id="projectId" name="projectId"
                                                onChange={(evt) => {
                                                    captchaConfigInput.projectId = evt.target.value;
                                                    setCaptchaConfigInput({...captchaConfigInput});
                                                    setCaptchaConfigMarkDirty(true);
                                                }}
                                                value={captchaConfigInput.projectId}
                                                size="small"
                                                fullWidth={true}
                                            />
                                        </Grid2>

                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Site Key</div>
                                            <TextField
                                                id="siteKey" name="siteKey"
                                                onChange={(evt) => {
                                                    captchaConfigInput.siteKey = evt.target.value;
                                                    setCaptchaConfigInput({...captchaConfigInput});
                                                    setCaptchaConfigMarkDirty(true);
                                                }}
                                                value={captchaConfigInput.siteKey}
                                                size="small"
                                                fullWidth={true}
                                            />
                                        </Grid2>

                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Api (Secret) Key</div>
                                            {changeApiKey === true &&
                                                <Grid2 size={12}>
                                                    <TextField type="password" name="apiKey" id="apiKey"
                                                        value={captchaConfigInput.apiKey}
                                                        onChange={(evt) => {
                                                            captchaConfigInput.apiKey = evt.target.value;
                                                            setCaptchaConfigInput({ ...captchaConfigInput });
                                                            setCaptchaConfigMarkDirty(true);
                                                        }}
                                                        fullWidth={true} size="small"
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <CloseOutlinedIcon
                                                                            sx={{ cursor: "pointer" }}
                                                                            onClick={() => {
                                                                                captchaConfigInput.apiKey = "";
                                                                                setCaptchaConfigInput({ ...captchaConfigInput });
                                                                                setChangeApiKey(false);
                                                                            }}
                                                                        />
                                                                    </InputAdornment>
                                                                )
                                                            }
                                                        }}
                                                    />
                                                </Grid2>
                                            }
                                            {changeApiKey !== true &&
                                                <Grid2 container size={12} spacing={1}>
                                                    <Grid2 size={10}>
                                                        {(!data || data.getCaptchaConfig === null) &&
                                                            <TextField disabled={true} size="small" fullWidth={true} sx={{backgroundColor: "#efefef"}}></TextField>
                                                        }
                                                        {data && data.getCaptchaConfig &&
                                                            <div>*******************************************</div>
                                                        }
                                                    </Grid2>
                                                    <Grid2 size={1}>
                                                        <EditOutlinedIcon
                                                            sx={{ cursor: "pointer" }}
                                                            onClick={() => {
                                                                setChangeApiKey(true);
                                                            }}
                                                        />
                                                    </Grid2>
                                                    <Grid2 size={1}>
                                                        <VisibilityOutlinedIcon
                                                            sx={{ cursor: "pointer" }}
                                                            onClick={() => setSecretDialogOpen(true)}
                                                        />
                                                    </Grid2>
                                                </Grid2>
                                            }
                                        </Grid2>

                                        <Grid2 size={11} marginBottom={"8px"}>
                                            Use ReCaptcha V3
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Checkbox
                                                checked={captchaConfigInput.useCaptchaV3 === true}
                                                onChange={(_, checked: boolean) => {
                                                    captchaConfigInput.useCaptchaV3 = checked;
                                                    setCaptchaConfigInput({...captchaConfigInput});
                                                    setCaptchaConfigMarkDirty(true);
                                                }}
                                            />
                                        </Grid2>

                                        <Grid2 marginBottom={"8px"} size={12}>
                                            <div>Min. Score Threshold (for V3 ReCaptcha) 0.0 to 1.0</div>
                                            <TextField
                                                disabled={captchaConfigInput.useCaptchaV3 === false}
                                                type="number"
                                                id="minScore" name="minScore"
                                                onChange={(evt) => {
                                                    if(evt.target.value === ""){                                                        
                                                        captchaConfigInput.minScoreThreshold = undefined;
                                                        setCaptchaConfigInput({...captchaConfigInput});
                                                    }
                                                    else{
                                                        const v: number = parseFloat(evt.target.value);
                                                        if(!isNaN(v)){
                                                            captchaConfigInput.minScoreThreshold = v;
                                                            setCaptchaConfigInput({...captchaConfigInput});
                                                        }
                                                        else{
                                                            captchaConfigInput.minScoreThreshold = undefined;
                                                            setCaptchaConfigInput({...captchaConfigInput});
                                                        }
                                                    }
                                                    setCaptchaConfigMarkDirty(true);                                                    
                                                }}
                                                value={captchaConfigInput.useCaptchaV3 ? captchaConfigInput.minScoreThreshold : ""}
                                                size="small"
                                                fullWidth={true}
                                            />
                                        </Grid2>
                                        <Grid2 size={11} marginBottom={"8px"}>
                                            Use Enterprise ReCaptcha
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <Checkbox
                                                checked={captchaConfigInput.useEnterpriseCaptcha === true}
                                                onChange={(_, checked: boolean) => {
                                                    captchaConfigInput.useEnterpriseCaptcha = checked;
                                                    setCaptchaConfigInput({...captchaConfigInput});
                                                    setCaptchaConfigMarkDirty(true);
                                                }}
                                            />
                                        </Grid2>
                                    </Grid2>
                                    <Grid2 size={12}>
                                        <DetailSectionActionHandler
                                            onDiscardClickedHandler={() => {
                                                setCaptchaConfigInput({...captchaConfigRevertToInput}); 
                                                setCaptchaConfigMarkDirty(false);
                                            }}
                                            onUpdateClickedHandler={() => {
                                                setShowMutationBackdrop(true);
                                                updateCaptchaConfigMutation({
                                                    variables: {
                                                        captchaConfigInput: captchaConfigInput
                                                    }
                                                });
                                                
                                            }}
                                            markDirty={captchaConfigMarkDirty}
                                            disableSubmit={false}
                                            enableRestoreDefault={data && data.getCaptchaConfig !== null}
                                            restoreDefaultHandler={() => {
                                                setShowConfirmRecaptchaRemoveDialogOpen(true);
                                            }}
                                            tooltipTitle="Remove ReCaptcha Configuration"
                                        />
                                    </Grid2>
                                </Paper>
                            }

                            <React.Fragment>
                            {systemSettings.systemCategories.slice(categoriesMidpoint).map(
                                (systemCategory: SystemCategory) => (                                
                                    <Paper sx={{ padding: "8px", marginTop: "16px"}} elevation={2} key={systemCategory.categoryName}>
                                        <Grid2 marginBottom={"8px"}  sx={{ textDecoration: "underline" }} size={12} fontWeight={"bold"}>
                                            {systemCategory.categoryName}
                                        </Grid2>
                                        {systemCategory.categoryEntries.map(
                                            (categoryEntry: CategoryEntry) => (
                                                <Grid2 size={12} paddingTop={"2px"} container key={categoryEntry.categoryKey}>
                                                    <Grid2 sx={{overflowWrap: "break-word"}} paddingRight={"2px"} size={6}>
                                                        {categoryEntry.categoryKey}
                                                    </Grid2>
                                                    <Grid2 sx={{overflowWrap: "break-word"}} size={6}>
                                                        {categoryEntry.categoryValue}
                                                    </Grid2>
                                                </Grid2>
                                            )
                                        )}
                                    </Paper>
                                )
                            )}
                            </React.Fragment>
                        </Grid2>
                    </Grid2>
                </DetailPageMainContentContainer>
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
                    System Settings Updated
                </Alert>
            </Snackbar>	
        </Typography>
    )
}

export default SystemSettingsDetail;