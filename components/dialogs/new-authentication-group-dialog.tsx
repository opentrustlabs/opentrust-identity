"use client";
import { AuthenticationGroupCreateInput } from "@/graphql/generated/graphql-types";
import { AUTHENTICATION_GROUP_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import { Alert, Button, Checkbox, DialogActions, DialogContent, DialogTitle, Grid2, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';


export interface NewAuthenticationGroupDialogProps {
    tenantId: string,
    onCancel: () => void,
    onClose: () => void,
    onCreateStart: () => void,
    onCreateEnd: (success: boolean) => void
}

const NewAuthenticationGroupDialog: React.FC<NewAuthenticationGroupDialogProps> = ({
    tenantId,
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {

    const initInput: AuthenticationGroupCreateInput = {
        authenticationGroupName: "",
        authenticationGroupDescription: "",
        defaultGroup: false,
        tenantId: tenantId
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES    
    const [authnGroupInput, setAuthnGroupInput] = React.useState<AuthenticationGroupCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    

    // GRAPHQL FUNCTIONS
    const [createAuthenticatioGroupMutation] = useMutation(
        AUTHENTICATION_GROUP_CREATE_MUTATION,
        {
            variables: {
                authenticationGroupInput: authnGroupInput
            },
            onCompleted(data) {
                onCreateEnd(true);
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}/authentication-groups/${data.createAuthenticationGroup.authenticationGroupId}`);
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
            <DialogTitle>New Authentication Group</DialogTitle>

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
                                <TextField name="authnGroupName" id="authnGroupName" 
                                    value={authnGroupInput.authenticationGroupName} fullWidth={true} size="small" 
                                    onChange={(evt) => {authnGroupInput.authenticationGroupName = evt.target.value; setAuthnGroupInput({...authnGroupInput})}}
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>                                
                                <div>Group Description</div>
                                <TextField name="authnGroupDescription" id="authnGroupDescription" 
                                    value={authnGroupInput.authenticationGroupDescription} 
                                    onChange={(evt) => {authnGroupInput.authenticationGroupDescription = evt.target.value; setAuthnGroupInput({...authnGroupInput})}}
                                    fullWidth={true} size="small" multiline={true} rows={2}

                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <Grid2 alignContent={"center"} size={10}>Default</Grid2>
                                <Grid2 size={2}>
                                    <Checkbox 
                                        checked={authnGroupInput.defaultGroup}
                                        onChange={(_, checked) => {authnGroupInput.defaultGroup = checked; setAuthnGroupInput({...authnGroupInput})}}
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
                    onClick={() => { onCreateStart(); createAuthenticatioGroupMutation(); }}
                    disabled={
                        authnGroupInput.authenticationGroupName === null || authnGroupInput.authenticationGroupName === ""}
                >
                    Create
                </Button>
            </DialogActions>

        </>
    )
}

export default NewAuthenticationGroupDialog;