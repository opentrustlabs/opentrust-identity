"use client";
import { CategoryEntry, PortalUserProfile, SystemCategory, SystemSettings, SystemSettingsUpdateInput } from "@/graphql/generated/graphql-types";
import { Alert, Backdrop, Checkbox, CircularProgress, Grid2, Paper, Snackbar, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { DetailPageContainer, DetailPageMainContentContainer } from "../layout/detail-page-container";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS, SYSTEM_SETTINGS_UPDATE_SCOPE } from "@/utils/consts";
import { containsScope } from "@/utils/authz-utils";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import { useMutation } from "@apollo/client";
import { UPDATE_SYSTEM_SETTINGS_MUTATION } from "@/graphql/mutations/oidc-mutations";


export interface SystemSettingsDetailProps {
    systemSettings: SystemSettings
}

const SystemSettingsDetail: React.FC<SystemSettingsDetailProps> = ({
    systemSettings
}) => {

    

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    // STATE VARIABLES    
    const initInput: SystemSettingsUpdateInput = {
        allowRecoveryEmail: systemSettings.allowRecoveryEmail,
        allowDuressPassword: systemSettings.allowDuressPassword,
        rootClientId: systemSettings.rootClientId,
        enablePortalAsLegacyIdp: systemSettings.enablePortalAsLegacyIdp,
        auditRecordRetentionPeriodDays: systemSettings.auditRecordRetentionPeriodDays || DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS
    }
    const [systemSettingsUpdateInput, setSystemSettingsUpdateInput] = React.useState<SystemSettingsUpdateInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);

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
                auditRecordRetentionPeriodDays: data.updateSystemSettings.auditRecordRetentionPeriodDays
            });
            setShowMutationSnackbar(true);
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(error.message);
        }
    });

    // HELPER VARIABLES AND FUNCTIONS
    const categoriesMidpoint = Math.floor(systemSettings.systemCategories.length / 2);

    return (
        <Typography component={"div"}>
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
                                        Enable Portal as Legacy IdP (Note, if enabled, some IdP features will not be available):
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
                                    <Grid2 size={12}>
                                        Root Client ID:
                                    </Grid2>
                                    <Grid2 size={12}>
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
                                    <Grid2 size={12}>
                                        Audit Record Retention Period (Days) Defaults to {DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS}:
                                    </Grid2>
                                    <Grid2 size={12}>
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
                                        <Grid2 sx={{ textDecoration: "underline" }} size={12} fontWeight={"bold"}>
                                            {systemCategory.categoryName}
                                        </Grid2>
                                        {systemCategory.categoryEntries.map(
                                            (categoryEntry: CategoryEntry) => (
                                                <Grid2 size={12} paddingTop={"4px"} container key={categoryEntry.categoryKey}>
                                                    <Grid2 size={6}>
                                                        {categoryEntry.categoryKey}
                                                    </Grid2>
                                                    <Grid2 size={6}>
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
                            {systemSettings.systemCategories.slice(categoriesMidpoint).map(
                                (systemCategory: SystemCategory) => (                                
                                    <Paper sx={{ padding: "8px", marginTop: "16px"}} elevation={2} key={systemCategory.categoryName}>
                                        <Grid2 sx={{ textDecoration: "underline" }} size={12} fontWeight={"bold"}>
                                            {systemCategory.categoryName}
                                        </Grid2>
                                        {systemCategory.categoryEntries.map(
                                            (categoryEntry: CategoryEntry) => (
                                                <Grid2 size={12} paddingTop={"4px"} container key={categoryEntry.categoryKey}>
                                                    <Grid2 size={6}>
                                                        {categoryEntry.categoryKey}
                                                    </Grid2>
                                                    <Grid2 size={6}>
                                                        {categoryEntry.categoryValue}
                                                    </Grid2>
                                                </Grid2>
                                            )
                                        )}
                                    </Paper>
                                )
                            )}
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