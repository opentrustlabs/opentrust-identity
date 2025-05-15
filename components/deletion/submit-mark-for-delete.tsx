"use client";
import React from "react";
import AutoDeleteOutlinedIcon from '@mui/icons-material/AutoDeleteOutlined';
import { MarkForDeleteInput, MarkForDeleteObjectType } from "@/graphql/generated/graphql-types";
import Dialog from "@mui/material/Dialog";
import { Alert, Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useMutation } from "@apollo/client";
import { MARK_FOR_DELETE_MUTATION } from "@/graphql/mutations/oidc-mutations";


export interface SubmitMarkForDeleteProps {
    objectId: string,
    objectType: MarkForDeleteObjectType,
    confirmationMessage: string,
    onDeleteStart: () => void,
    onDeleteEnd: (successful: boolean, errorMessage?: string) => void
}


const SubmitMarkForDelete: React.FC<SubmitMarkForDeleteProps> = ({
    objectId,
    objectType,
    confirmationMessage,
    onDeleteEnd,
    onDeleteStart
}) => {


    // STATE VARIABLES
    const [showConfirmDialogOpen, setShowConfirmDialogOpen] = React.useState<boolean>(false);
    
    const input: MarkForDeleteInput = {
        markForDeleteObjectType: objectType,
        objectId: objectId
    }
    // GRAPHQL FUNCTIONS
    const [markForDeleteMutaion] = useMutation(MARK_FOR_DELETE_MUTATION, {
        variables: {
            markForDeleteInput: input
        },
        onCompleted() {
            onDeleteEnd(true);
            setShowConfirmDialogOpen(false);
        },
        onError(error) {
            onDeleteEnd(false, error.message);
            setShowConfirmDialogOpen(false);
        },
    });


    return (
        <React.Fragment>
            {showConfirmDialogOpen &&
                <Dialog
                    open={showConfirmDialogOpen}
                    onClose={() => setShowConfirmDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                            <Alert sx={{fontSize: "0.90em", backgroundColor: "white"}} severity="warning">
                                <div>{confirmationMessage}</div>                                
                                <div style={{margin: "16px 0px 8px 0px"}}>
                                    The deletion process may take some time to complete.
                                </div>
                            </Alert>
                    </DialogContent>
                    <DialogActions >
                        <Button
                            onClick={() => {
                                setShowConfirmDialogOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                onDeleteStart();
                                markForDeleteMutaion();
                            }}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            <AutoDeleteOutlinedIcon 
                sx={{color: "white", cursor: "pointer"}}
                onClick={() => setShowConfirmDialogOpen(true)}
            />
        </React.Fragment>
    )
}

export default SubmitMarkForDelete