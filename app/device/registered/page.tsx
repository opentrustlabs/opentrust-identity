"use client";
import { ResponsiveBreakpoints, ResponsiveContext } from "@/components/contexts/responsive-context";
import Alert from "@mui/material/Alert";
import React, { useContext } from "react";


const DeviceRegisteredPage: React.FC = () => {

    // CONTEXT OBJECTS
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    return (        
        <Alert sx={{maxWidth: breakPoints.isMedium ? "80vw" : "30vw"}}  severity="success">You have successfully registered your device.</Alert>        
    )
}
export const dynamic = 'force-dynamic';
export default DeviceRegisteredPage;