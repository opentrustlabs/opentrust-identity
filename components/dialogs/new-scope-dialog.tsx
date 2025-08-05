"use client";
import { ScopeCreateInput } from "@/graphql/generated/graphql-types";
import { SCOPE_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import { Alert, Button, DialogActions, DialogContent, DialogTitle, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';
import { SCOPE_USE_APPLICATION_MANAGEMENT, SCOPE_USE_DISPLAY, SCOPE_USE_IAM_MANAGEMENT } from "@/utils/consts";


export interface NewScopeDialogProps {
    onCancel: () => void,
    onClose: () => void,
    onCreateStart: () => void,
    onCreateEnd: (success: boolean) => void
}

const NewScopeDialog: React.FC<NewScopeDialogProps> = ({
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {

    const initInput: ScopeCreateInput = {
        scopeName: "",
        scopeDescription: "",
        scopeAccessRuleSchemaId: "",
        scopeUse: SCOPE_USE_IAM_MANAGEMENT
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES    
    const [scopeCreateInput, setScopeCreateInput] = React.useState<ScopeCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    

    // GRAPHQL FUNCTIONS
    const [createScopeMutation] = useMutation(
        SCOPE_CREATE_MUTATION,
        {
            variables: {
                scopeInput: scopeCreateInput
            },
            onCompleted(data) {
                onCreateEnd(true);
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${data.createScope.scopeId}`);
                onClose();
                
            },
            onError(error) {
                onCreateEnd(false);
                setErrorMessage(error.message)
            },
        }
    );
    

    return (
        <>
            <DialogTitle>New Scope / Access Control</DialogTitle>
            <DialogContent>
                <Typography component={"div"}>
                    <Grid2 container size={12} spacing={3} marginBottom={"16px"} >
                        <Grid2 size={12}>
                            {errorMessage &&
                                <Grid2 size={{ xs: 12 }} textAlign={"center"}>
                                    <Stack
                                        direction={"row"}
                                        justifyItems={"center"}
                                        alignItems={"center"}
                                        sx={{ width: "100%" }}
                                    >
                                        <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                    </Stack>
                                </Grid2>
                            }
                            <Grid2 marginBottom={"16px"}>
                                <div>Scope Name (suggested format: dot-separated values - e.g. users.create)</div>
                                <TextField name="scopeName" id="scopeName" 
                                    value={scopeCreateInput.scopeName} fullWidth={true} size="small" 
                                    onChange={(evt) => {scopeCreateInput.scopeName = evt.target.value; setScopeCreateInput({...scopeCreateInput})}}
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>                                
                                <div>Scope Description</div>
                                <TextField name="scopeDescription" id="scopeDescription" 
                                    value={scopeCreateInput.scopeDescription} 
                                    onChange={(evt) => {scopeCreateInput.scopeDescription = evt.target.value; setScopeCreateInput({...scopeCreateInput})}}
                                    fullWidth={true} size="small" multiline={true} rows={2}
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>                                
                                <div>Scope Use</div>
                                <Select
                                    fullWidth={true}
                                    value={scopeCreateInput.scopeUse}
                                    name="scopeUse" id="scopeUse"
                                    onChange={(evt) => {
                                        scopeCreateInput.scopeUse = evt.target.value;
                                        setScopeCreateInput({...scopeCreateInput});
                                    }}
                                >
                                    <MenuItem value={SCOPE_USE_IAM_MANAGEMENT}>{SCOPE_USE_DISPLAY.get(SCOPE_USE_IAM_MANAGEMENT)}</MenuItem>
                                    <MenuItem value={SCOPE_USE_APPLICATION_MANAGEMENT}>{SCOPE_USE_DISPLAY.get(SCOPE_USE_APPLICATION_MANAGEMENT)}</MenuItem>
                                    
                                </Select>
                                {/* <TextField name="scopeUse" id="scopeUse" 
                                    value={SCOPE_USE_DISPLAY.get(SCOPE_USE_APPLICATION_MANAGEMENT)} 
                                    disabled={true}
                                    fullWidth={true} size="small"
                                /> */}
                            </Grid2>
                        </Grid2>
                    </Grid2>

                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { onCancel();}}>Cancel</Button>
                <Button
                    onClick={() => { onCreateStart(); createScopeMutation(); }}
                    disabled={
                        scopeCreateInput.scopeName === null || scopeCreateInput.scopeName === "" || scopeCreateInput.scopeDescription === null || scopeCreateInput.scopeDescription === ""}
                >
                    Create
                </Button>
            </DialogActions>

        </>
    )
}

export default NewScopeDialog;