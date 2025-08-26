"use client";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Stack from "@mui/material/Stack";
import React from "react";
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { Tooltip } from "@mui/material";



export interface DetailSectionActionHandlerProps {
    onUpdateClickedHandler: () => void,
    onDiscardClickedHandler: () => void,
    markDirty: boolean,
    disableSubmit?: boolean,
    enableRestoreDefault?: boolean,
    restoreDefaultHandler?: () => void
}

const DetailSectionActionHandler: React.FC<DetailSectionActionHandlerProps> = ({
    onDiscardClickedHandler,
    onUpdateClickedHandler,
    markDirty,
    disableSubmit,
    enableRestoreDefault,
    restoreDefaultHandler
}) => {



    return (
        <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >
            {enableRestoreDefault && restoreDefaultHandler &&
                <Button
                    sx={{marginRight: "8px", marginLeft: "8px"}}
                    onClick={() => restoreDefaultHandler()}
                >
                    <Tooltip title={"Revert to system settings"}>
                        <RestoreOutlinedIcon />
                    </Tooltip>
                </Button>
            }
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