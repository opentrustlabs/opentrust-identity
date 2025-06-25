"use client";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { Alert, Snackbar, Typography } from "@mui/material";

export interface ClipboardCopyContextProps {
    children: ReactNode
}

export interface ClipboardCopyProps {
    message: string,
    open: boolean,
    closeSnackbar: () => void,
    copyContentToClipboard: (val: string, message: string) => void
}

const ClipboardCopyContext = createContext<ClipboardCopyProps>({
    message: "",
    open: false,
    closeSnackbar: () => {},
    copyContentToClipboard: () => {}
});

const ClipboardCopyContextProvider: React.FC<ClipboardCopyContextProps> = ({ children }) => {

    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [navigatorAvailable, setNavigatorAvailable] = React.useState(false);
    const [userAgent, setUserAgent] = React.useState("");

    const copyContentToClipboard = async (val: string, message: string) => {
        try {
            if(navigatorAvailable){
                await navigator.clipboard.writeText(val);
                setMessage(message);
            }
        }
        catch (error: any){
            setMessage(`Error copying data to the clipboard: ${error.message}`);
        }        
        setOpen(true);
    }

    useEffect(() => {
        if(typeof window !== "undefined"){
            setNavigatorAvailable(true);
            setUserAgent(navigator.userAgent);
        }
    }, []);
    
    const closeSnackbar = () => {
        setOpen(false);
    }

    const value: ClipboardCopyProps = {
        message,
        open,
        copyContentToClipboard,
        closeSnackbar
    }

    return (
        <ClipboardCopyContext.Provider value={value}>
            {children}
            <Typography component="div" sx={{fontSize: "0.9em"}}>
                <Snackbar
                    open={open}                    
                    autoHideDuration={4000}
                    onClose={closeSnackbar}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}                    
                    sx={{width: "100%"}}
                >
                    <Alert>
                        {message}
                    </Alert>
                </Snackbar>

            </Typography>
        </ClipboardCopyContext.Provider>
    )

}

const useClipboardCopyContext = () => {
    return useContext(ClipboardCopyContext);
}

export { ClipboardCopyContextProvider, useClipboardCopyContext }