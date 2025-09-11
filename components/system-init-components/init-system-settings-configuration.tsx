"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { SystemSettingsUpdateInput } from "@/graphql/generated/graphql-types";
import { DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS } from "@/utils/consts";
import Checkbox from "@mui/material/Checkbox";


const InitSystemSettingsConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onNext,
    systemInitInput

}) => {
    // STATE VARIABLES    
    const initInput: SystemSettingsUpdateInput = {
        allowRecoveryEmail: systemInitInput.systemSettingsInput.allowRecoveryEmail,
        allowDuressPassword: systemInitInput.systemSettingsInput.allowDuressPassword,
        rootClientId: systemInitInput.systemSettingsInput.rootClientId,
        enablePortalAsLegacyIdp: systemInitInput.systemSettingsInput.enablePortalAsLegacyIdp,
        auditRecordRetentionPeriodDays: systemInitInput.systemSettingsInput.auditRecordRetentionPeriodDays || DEFAULT_AUDIT_RECORD_RETENTION_PERIOD_DAYS,
        noReplyEmail: systemInitInput.systemSettingsInput.noReplyEmail,
        contactEmail: systemInitInput.systemSettingsInput.contactEmail
    };    
    
    const [systemSettingsUpdateInput, setSystemSettingsUpdateInput] = React.useState<SystemSettingsUpdateInput>(initInput);

    return (
        <Typography component="div">
            <Paper
                elevation={1}
                sx={{ padding: "8px", border: "solid 1px lightgrey" }}
            >
                <Grid2 container size={12} spacing={1}>
                    <Grid2 size={12} marginBottom={"8px"} fontWeight={"bold"}>
                        Configure Global System Settings
                    </Grid2>
                    <Grid2 size={11}>
                        Allow recovery emails
                    </Grid2>
                    <Grid2 size={1}>
                        <Checkbox
                            sx={{ height: "25px", width: "25px" }}
                            value={systemSettingsUpdateInput.allowRecoveryEmail}
                            checked={systemSettingsUpdateInput.allowRecoveryEmail}
                            onChange={(_, checked: boolean) => {                                                
                                systemSettingsUpdateInput.allowRecoveryEmail = checked;
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
                            onChange={(_, checked: boolean) => {                                                
                                systemSettingsUpdateInput.allowDuressPassword = checked;
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
                                setSystemSettingsUpdateInput({...systemSettingsUpdateInput});                                                
                            }}                         
                        />                                        
                    </Grid2>
                </Grid2>
                <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                    <Button
                        onClick={() => {
                            systemInitInput.systemSettingsInput = systemSettingsUpdateInput;
                            onNext(systemInitInput);
                        }}
                        disabled={false}
                    >
                        Next
                    </Button>                    
                    <Button
                        onClick={() => {
                            onBack();
                        }}
                    >
                        Back
                    </Button>
                </Stack>
            </Paper>
        </Typography>
    )
}

export default InitSystemSettingsConfiguration;