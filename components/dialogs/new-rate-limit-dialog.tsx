"use client";
import { RateLimitServiceGroupCreateInput } from "@/graphql/generated/graphql-types";
import {  RATE_LIMIT_SERVICE_GROUP_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useMutation } from "@apollo/client";
import { Alert, Button, DialogActions, DialogContent, DialogTitle, Grid2, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';


export interface NewRateLimitDialogProps {
    onCancel: () => void,
    onClose: () => void,
    onCreateStart: () => void,
    onCreateEnd: (success: boolean) => void
}

const NewRateLimitDialog: React.FC<NewRateLimitDialogProps> = ({
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {

    const initInput: RateLimitServiceGroupCreateInput = {
        servicegroupname: "",
        servicegroupdescription: ""
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES    
    const [rateLimitServiceGroupInput, setRateLimitServiceGroupInput] = React.useState<RateLimitServiceGroupCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    

    // GRAPHQL FUNCTIONS
    const [createRateLimitServiceGroupMutation] = useMutation(
        RATE_LIMIT_SERVICE_GROUP_CREATE_MUTATION,
        {
            variables: {
                rateLimitServiceGroupInput: rateLimitServiceGroupInput
            },
            onCompleted(data) {
                onCreateEnd(true);
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}/rate-limits/${data.createRateLimitServiceGroup.servicegroupid}`);
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
            <DialogTitle>New Service Group</DialogTitle>
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
                                <div>Service Group Name</div>
                                <TextField name="serviceGroupName" id="authzGroupName" 
                                    value={rateLimitServiceGroupInput.servicegroupname} fullWidth={true} size="small" 
                                    onChange={(evt) => {rateLimitServiceGroupInput.servicegroupname = evt.target.value; setRateLimitServiceGroupInput({...rateLimitServiceGroupInput})}}
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>                                
                                <div>Service Group Description</div>
                                <TextField name="authzGroupDescription" id="authzGroupDescription" 
                                    value={rateLimitServiceGroupInput.servicegroupdescription} 
                                    onChange={(evt) => {rateLimitServiceGroupInput.servicegroupdescription = evt.target.value; setRateLimitServiceGroupInput({...rateLimitServiceGroupInput})}}
                                    fullWidth={true} size="small" multiline={true} rows={2}

                                />
                            </Grid2>                            
                        </Grid2>
                    </Grid2>

                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { onCancel();}}>Cancel</Button>
                <Button
                    onClick={() => { onCreateStart(); createRateLimitServiceGroupMutation(); }}
                    disabled={
                        rateLimitServiceGroupInput.servicegroupname === null || rateLimitServiceGroupInput.servicegroupname === ""}
                >
                    Create
                </Button>
            </DialogActions>

        </>
    )
}

export default NewRateLimitDialog;