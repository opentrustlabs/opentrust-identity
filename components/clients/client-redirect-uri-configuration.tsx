"use client";
import { REDIRECT_URIS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { ADD_REDIRECT_URI_MUTATION, REMOVE_REDIRECT_URI_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DialogTitle from "@mui/material/DialogTitle";
import { TextField } from "@mui/material";
import { isValidRedirectUri } from "@/utils/client-utils";
import { useIntl } from 'react-intl';




export interface ClientRedirectUriConfigurationProps {
    clientId: string,
    oidcEnabled: boolean,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const ClientRedirectUriConfiguration: React.FC<ClientRedirectUriConfigurationProps> = ({
    clientId,
    oidcEnabled,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();
    
    // STATE VARIABLES
    const [uriToAdd, setUriToAdd] = React.useState<string | null>(null);
    const [uriToRemove, setUriToRemove] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);


    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(REDIRECT_URIS_QUERY, {
        variables: {
            clientId: clientId
        }
    });

    const [addRedirectUriMutation] = useMutation(ADD_REDIRECT_URI_MUTATION, {
        variables: {
            clientId: clientId,
            uri: uriToAdd
        },
        onCompleted() {
            onUpdateEnd(true);
            setSelectDialogOpen(false);
        },
        onError(error) {
            onUpdateEnd(false);
            setSelectDialogOpen(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        refetchQueries: [REDIRECT_URIS_QUERY]
    });

    const [removeRedirectUriMutation] = useMutation(REMOVE_REDIRECT_URI_MUTATION, {
        variables: {
            clientId: clientId,
            uri: uriToRemove
        },
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        refetchQueries: [REDIRECT_URIS_QUERY]
    });



    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    return (
        <Typography  component="div">
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
            }
            {showRemoveConfirmationDialog &&
                <Dialog 
                    open={showRemoveConfirmationDialog}
                    onClose={() => setShowRemoveConfirmationDialog(false)}
                    fullWidth={true}
                    maxWidth={"sm"}
                >
                    <DialogContent>
                        <Typography component="div">
                            <span>Confirm removal of redirect URI: </span><span style={{fontWeight: "bold"}}>{uriToRemove}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRemoveConfirmationDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setShowRemoveConfirmationDialog(false);
                            onUpdateStart();
                            removeRedirectUriMutation();
                        }}>Confirm</Button>
                    </DialogActions>

                </Dialog>
            }
            {selectDialogOpen &&
                <Dialog
                    open={selectDialogOpen}
                    onClose={() => setSelectDialogOpen(false)}
                    maxWidth={"sm"}
                    fullWidth={true}
                >
                    <DialogTitle>Add a redirect URI</DialogTitle>
                    <DialogContent>
                        <TextField
                            size="small"
                            fullWidth={true}
                            onChange={(evt) => setUriToAdd(evt.target.value)}                            
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectDialogOpen(false)}>Cancel</Button>
                        <Button 
                            disabled={!isValidRedirectUri(uriToAdd || "")}
                            onClick={() =>{
                                onUpdateStart();
                                addRedirectUriMutation();
                            }}                            
                        >
                            Submit
                        </Button>
                    </DialogActions>
                    
                </Dialog>
            }
            {!oidcEnabled && 
                <Grid2 size={12} margin={"8px 0px 8px 0px"} container justifyContent={"center"} fontWeight={"bold"}>
                    Enable OIDC to add redirect URIs
                </Grid2>
            }
            {oidcEnabled &&
                <React.Fragment>
                    {!readOnly &&
                        <React.Fragment>
                            <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                                    <AddBoxIcon
                                        sx={{cursor: "pointer"}}
                                        onClick={() => setSelectDialogOpen(true)}
                                    />
                                    <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Redirect URI</div>
                                </Grid2>
                                
                            </Grid2>
                            <Divider />
                        </React.Fragment>
                    }
                    {data.getRedirectURIs.length === 0 &&
                        <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                            <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                                No redirect URIs
                            </Grid2>
                        </Grid2>
                    }
                    {data.getRedirectURIs.length > 0 &&
                        <Grid2 spacing={1} container size={12}>
                            {data.getRedirectURIs.map(
                                (uri: string) => (
                                    <React.Fragment key={uri}>
                                        <Grid2 size={12}><Divider /></Grid2>
                                        <Grid2 size={11}>
                                            {uri}                                    
                                        </Grid2>
                                        <Grid2 size={1}>
                                            {!readOnly &&
                                                <RemoveCircleOutlineIcon
                                                    sx={{cursor: "pointer"}}
                                                    onClick={() => {setUriToRemove(uri); setShowRemoveConfirmationDialog(true);}}
                                                />
                                            }
                                        </Grid2>                                
                                    </React.Fragment>
                                )
                            )}
                        </Grid2>
                    }  
                </React.Fragment> 
            }         
        </Typography>        
    )

}

export default ClientRedirectUriConfiguration;