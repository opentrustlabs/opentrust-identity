"use client";
import { AuthorizationGroupCreateInput } from "@/graphql/generated/graphql-types";
import { AUTHORIZATION_GROUP_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import { Alert, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Grid2, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';


export interface NewAuthorizationGroupDialogProps {
    tenantId: string,
    onCancel: () => void,
    onClose: () => void,
    onCreateStart: () => void,
    onCreateEnd: (success: boolean) => void
}

const NewAuthorizationGroupDialog: React.FC<NewAuthorizationGroupDialogProps> = ({
    tenantId,
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {

    const initInput: AuthorizationGroupCreateInput = {
        groupName: "",
        groupDescription: "",
        default: false,
        tenantId: tenantId,
        allowForAnonymousUsers: false
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES    
    const [authzGroupInput, setAuthzGroupInput] = React.useState<AuthorizationGroupCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    

    // GRAPHQL FUNCTIONS
    const [createAuthorizationGroupMutation] = useMutation(
        AUTHORIZATION_GROUP_CREATE_MUTATION,
        {
            variables: {
                groupInput: authzGroupInput
            },
            onCompleted(data) {
                onCreateEnd(true);
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}/authorization-groups/${data.createAuthorizationGroup.groupId}`);
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
            <DialogTitle>New Authorization Group</DialogTitle>

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
                                <div>Group Name</div>
                                <TextField name="authzGroupName" id="authzGroupName" 
                                    value={authzGroupInput.groupName} fullWidth={true} size="small" 
                                    onChange={(evt) => {authzGroupInput.groupName = evt.target.value; setAuthzGroupInput({...authzGroupInput})}}
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>                                
                                <div>Group Description</div>
                                <TextField name="authzGroupDescription" id="authzGroupDescription" 
                                    value={authzGroupInput.groupDescription} 
                                    onChange={(evt) => {authzGroupInput.groupDescription = evt.target.value; setAuthzGroupInput({...authzGroupInput})}}
                                    fullWidth={true} size="small" multiline={true} rows={2}

                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <Grid2 alignContent={"center"} size={10}>Default</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        name="default"
                                        checked={authzGroupInput.default}
                                        onChange={(_, checked) => {authzGroupInput.default = checked; setAuthzGroupInput({...authzGroupInput})}}
                                    />
                                </Grid2>
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <Grid2 alignContent={"center"} size={10}>Allow for anonymous users</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        name="allowForAnonymous"
                                        checked={authzGroupInput.allowForAnonymousUsers}
                                        onChange={(_, checked) => {authzGroupInput.allowForAnonymousUsers = checked; setAuthzGroupInput({...authzGroupInput})}}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>
                    </Grid2>

                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { onCancel();}}>Cancel</Button>
                <Button
                    onClick={() => { onCreateStart(); createAuthorizationGroupMutation(); }}
                    disabled={
                        authzGroupInput.groupName === null || authzGroupInput.groupName === ""}
                >
                    Create
                </Button>
            </DialogActions>

        </>
    )
}

export default NewAuthorizationGroupDialog;