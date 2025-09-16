"use client";
import { ResponsiveBreakpoints, ResponsiveContext } from "@/components/contexts/responsive-context";
import Alert from "@mui/material/Alert";
import { useSearchParams } from "next/navigation";
import React, { useContext } from "react";

const DEFAULT_ERROR_MESSAGE = "The resource which you have requested is not available to your account."

const AccessError: React.FC = () => {

    // CONTEXT OBJECTS
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // QUERY PARAMS
    const params = useSearchParams();
    const errorCode = params?.get("access_error_code") as string;
    const extendedMessage = params?.get("extended_message") as string;

    let errorMessage = DEFAULT_ERROR_MESSAGE;
    switch (errorCode) {
        case "00023" : {
            errorMessage = "You do not have access to view or manage this tenant.";
            break;
        }
        case "00024" : {
            errorMessage = "There was an error retrieving the tenant information.";            
            break;
        }
        case "00025" : {
            errorMessage = "Your profile is not currently configured for access to this portal. Please contact your administrator for access.";
            break;
        }
        case "00075": {
            errorMessage = "Device registration has been cancelled.";
            break;
        }
        case "00076": {
            errorMessage = "There was an error in authentication with a 3rd party OIDC provider. "
        }
    }

    if(extendedMessage){
        errorMessage += " " + extendedMessage;
    }

    return (
        
            <Alert sx={{maxWidth: breakPoints.isMedium ? "80vw" : "30vw"}}  severity="error">{errorMessage}</Alert>
        
    )
}
export const dynamic = 'force-dynamic';

export default AccessError;