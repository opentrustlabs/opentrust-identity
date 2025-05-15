"use client";
import React from "react";
import AutoDeleteOutlinedIcon from '@mui/icons-material/AutoDeleteOutlined';
import { MarkForDeleteInput, MarkForDeleteObjectType } from "@/graphql/generated/graphql-types";
import Dialog from "@mui/material/Dialog";
import { Button, DialogActions, DialogContent, Typography } from "@mui/material";


export interface SubmitMarkForDeleteProps {
    objectId: string,
    objectType: MarkForDeleteObjectType,
    confirmationMessage: string,
    onDeleteStart: () => void,
    onDeleteEnd: (successful: boolean) => void
}


const SubmitMarkForDelete: React.FC<SubmitMarkForDeleteProps> = ({
    objectId,
    objectType,
    confirmationMessage,
    onDeleteEnd,
    onDeleteStart
}) => {


    const [showConfirmDialogOpen, setShowConfirmDialogOpen] = React.useState<boolean>(false);

    const input: MarkForDeleteInput = {
        markForDeleteObjectType: objectType,
        objectId: objectId
    }


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
                        <Typography>{confirmationMessage}</Typography>                        
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowConfirmDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                        
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