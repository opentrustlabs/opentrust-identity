"use client";
import Alert from "@mui/material/Alert";
import React from "react";

export interface MarkForDeleteAlertProps {
    message: string
}

const MarkForDeleteAlert: React.FC<MarkForDeleteAlertProps> = ({
    message
}) => {


    return (
        <Alert style={{marginBottom: "8px", justifyContent: "center", textAlign: "center",  fontSize: "0.90em", fontWeight: "bold"}} severity={"error"}>
            {message}
        </Alert>
    )
}

export default MarkForDeleteAlert;