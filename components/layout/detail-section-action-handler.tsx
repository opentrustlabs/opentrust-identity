"use client";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Stack from "@mui/material/Stack";
import React from "react";
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { Grid2, Tooltip } from "@mui/material";



export interface DetailSectionActionHandlerProps {
    onUpdateClickedHandler: () => void,
    onDiscardClickedHandler: () => void,
    markDirty: boolean,
    disableSubmit?: boolean,
    enableRestoreDefault?: boolean,
    restoreDefaultHandler?: () => void,
    tooltipTitle?: string
}

const DetailSectionActionHandler: React.FC<DetailSectionActionHandlerProps> = ({
    onDiscardClickedHandler,
    onUpdateClickedHandler,
    markDirty,
    disableSubmit,
    enableRestoreDefault,
    restoreDefaultHandler,
    tooltipTitle
}) => {



    return (
        <Grid2 container spacing={1}>
            <Grid2 marginTop={"8px"} size={1}>
                {enableRestoreDefault && restoreDefaultHandler &&
                        <Button
                            sx={{marginRight: "8px", marginLeft: "8px"}}
                            onClick={() => restoreDefaultHandler()}
                        >
                            <Tooltip title={tooltipTitle ? tooltipTitle : "Revert to system defaults"}>
                                <RestoreOutlinedIcon sx={{height: "25px", width: "35px"}} />
                            </Tooltip>
                        </Button>
                    }
            </Grid2>
            <Grid2 size={11}>
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
            </Grid2>
        </Grid2>
    )
}

export default DetailSectionActionHandler;