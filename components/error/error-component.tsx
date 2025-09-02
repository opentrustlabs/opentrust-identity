"use client";
import React from "react";
import Alert from "@mui/material/Alert";
import { Box } from "@mui/material";
import { useIntl } from "react-intl";

type ErrorComponentSizeType = "full-page" | "xl" | "lg" | "md" | "sm" | "xs";

export interface ErrorComponentProps {
    componentSize: ErrorComponentSizeType,
    message: string
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
    componentSize,
    message
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    let height = "86vh"; // default is full page height
    switch (componentSize) {
        case "lg" : {
            height = "70vh";
            break;
        }
        case "md" : {
            height = "60vh";
            break;
        }
        case "sm" : {
            height = "30vh";
            break;
        }
        case "xs" : {
            height = "15vh";
            break;
        }
    }

    return (
        <Box display={"flex"} height={height} justifyContent={"center"} alignItems={"center"}>
            
            <Alert severity="error">
                {intl.formatMessage({id: message})}
            </Alert>
        </Box>
    )
}

export default ErrorComponent