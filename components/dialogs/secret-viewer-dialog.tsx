"use client";
import React from "react";
import { SecretObjectType } from "@/graphql/generated/graphql-types";
import { GET_SECRET_VALUE_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import { Alert, Button, DialogActions, DialogContent, Grid2 } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DataLoading from "../layout/data-loading";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";



export interface SecretViewerDialogProps {
    open: boolean,
    onClose: () => void
    objectId: string,
    secretObjectType: SecretObjectType
}

const SecretViewerDialog: React.FC<SecretViewerDialogProps> = ({
    open,
    onClose,
    objectId,
    secretObjectType
}) => {


    // CONTEXT OBJECTS
    const { copyContentToClipboard } = useClipboardCopyContext();

    // GRAPHQL QUERIES
    const {data, loading, error} = useQuery(GET_SECRET_VALUE_QUERY, {
        variables: {
            objectId: objectId, 
            objectType: secretObjectType
        }
    });

    let clipboardMessage = "Client Secret Copied";
    if(secretObjectType === SecretObjectType.OidcProviderClientSecret){
        clipboardMessage = "OIDC Provider Client Secret Copied"
    }
    if(secretObjectType === SecretObjectType.PrivateKey){
        clipboardMessage = "Private Key Copied"
    }
    if(secretObjectType === SecretObjectType.PrivateKeyPassword){
        clipboardMessage = "Private Key Password Copied"
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth={true}
        >
            <DialogTitle>
                <Grid2 container size={12}>
                    <Grid2 size={1}>
                        <PriorityHighOutlinedIcon sx={{color: "red"}} />
                    </Grid2>
                    <Grid2 fontWeight={"bold"} size={11}>
                        All views of secret values are logged and alerts are sent to the application administrators.
                    </Grid2>
                </Grid2>
                              
            </DialogTitle>
            <DialogContent>
                <Grid2 size={12} sx={{marginBottom: "8px", textDecoration: "underline"}}>
                    {secretObjectType === SecretObjectType.ClientSecret &&
                        `Client Secret`
                    }
                    {secretObjectType === SecretObjectType.OidcProviderClientSecret &&
                        `OIDC Provider Client Secret`
                    }
                    {secretObjectType === SecretObjectType.PrivateKey &&
                        `Private Key`
                    }
                    {secretObjectType === SecretObjectType.PrivateKeyPassword &&
                        `Private Key Password`
                    }
                </Grid2>  
                {loading &&
                    <DataLoading dataLoadingSize="xs" color={null} />
                }
                {error &&
                    <Alert severity="error">{error.message}</Alert>
                }
                {data &&
                    <Grid2 container size={12}>
                        <Grid2 size={11.5}>
                            <pre>{data.getSecretValue}</pre>
                        </Grid2>
                        <Grid2 size={0.5}>
                            <ContentCopyIcon 
                                sx={{cursor: "pointer"}}
                                onClick={() => copyContentToClipboard(data.getSecretValue, clipboardMessage)}
                            />
                        </Grid2>
                    </Grid2>
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Close</Button>
            </DialogActions>

            
        </Dialog>
    )
}

export default SecretViewerDialog;