"use client";
import Alert from "@mui/material/Alert";
import React from "react";



const AuthSuccessPage: React.FC = () => {    
    return (
        <Alert severity="success">You have successfully authenticated with your 3rd party OIDC provider.</Alert>
    )
}

export const dynamic = 'force-dynamic';
export default AuthSuccessPage;