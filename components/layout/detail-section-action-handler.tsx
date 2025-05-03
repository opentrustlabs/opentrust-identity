"use client";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Stack from "@mui/material/Stack";
import React from "react";



export interface DetailSectionActionHandlerProps {
    onUpdateClickedHandler: () => void,
    onDiscardClickedHandler: () => void,
    markDirty: boolean,
    disableSubmit?: boolean
}

const DetailSectionActionHandler: React.FC<DetailSectionActionHandlerProps> = ({
    onDiscardClickedHandler,
    onUpdateClickedHandler,
    markDirty,
    disableSubmit
}) => {



    return (
        <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
            <Button
                onClick={() => onUpdateClickedHandler()}
                disabled={disableSubmit ? disableSubmit : !markDirty}
                sx={{ border: "solid 1px lightgrey", borderRadius: "4px" }}
            >
                Update
            </Button>
            <Fade in={markDirty} timeout={500}>
                <Button
                    disabled={!markDirty}
                    sx={{ marginRight: "8px" }}
                    onClick={() => onDiscardClickedHandler()}
                >
                    Discard
                </Button>
            </Fade>
        </Stack>
    )
}

export default DetailSectionActionHandler;