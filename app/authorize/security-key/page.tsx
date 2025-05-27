"use client";
import React, { Suspense } from "react";
import { QRCodeSVG } from 'qrcode.react';
import Paper from "@mui/material/Paper";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GENERATE_TOTP_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Button from "@mui/material/Button";
import { VALIDATE_TOTP_TOKEN_QUERY } from "@/graphql/queries/oidc-queries";
import { TextField } from "@mui/material";
import { TotpResponse } from "@/graphql/generated/graphql-types";
import SecurityKey from "@/components/authentication-components/security-key";


const SecurityKeyPage: React.FC = () => {



    
    return (
        <Suspense>
            <SecurityKey />
        </Suspense>
    )
}


export default SecurityKeyPage;