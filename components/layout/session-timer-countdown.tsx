"use client";
import React from "react";
import { useAuthSessionContext } from "../contexts/auth-session-context";
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import Dialog from "@mui/material/Dialog";
import { Button, DialogActions, DialogContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_RETURN_URI, QUERY_PARAM_TENANT_ID } from "@/utils/consts";
import { getManagementTenantAccessId } from "@/utils/client-utils";

const SessionTimerCountdown: React.FC = () => {

    // CONTEXT VARIABLES AND HOOKS
    const props = useAuthSessionContext();
    const router = useRouter();
        
    // How many minutes left to re-authenticate?    
    const ttl = props.getTokenTtlMs()
    const minutes = Math.floor(ttl / (1000 * 60));

    const getLoginUri = (): string => {
        const tenantId = getManagementTenantAccessId();
        if(tenantId){
            return `/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true&${QUERY_PARAM_TENANT_ID}=${tenantId}&${QUERY_PARAM_RETURN_URI}=${window.location.href}`
        }
        else{
            return `/authorize/login?${QUERY_PARAM_AUTHENTICATE_TO_PORTAL}=true&${QUERY_PARAM_RETURN_URI}=${window.location.href}`;
        }
    }

    return (
        <React.Fragment>
            <Dialog
                open={ttl < 0}
                maxWidth="sm"
                fullWidth={true}
            >
                <DialogContent>
                    <Typography fontWeight={"bold"}>
                        Your session has expired. You will need to log in again.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button                        
                        onClick={() => {
                            router.push(getLoginUri());
                        }}
                    >
                        Login
                    </Button>
                </DialogActions>
            </Dialog>
            {minutes < 15 && minutes >= 10 &&
                <HourglassTopOutlinedIcon />
            }
            {minutes < 10 &&
                <HourglassBottomOutlinedIcon 
                    sx={{cursor: "pointer"}}
                    onClick={() => {
                        router.push(getLoginUri())
                    }}
                />
            }            
        </React.Fragment>
    )

}

export default SessionTimerCountdown;