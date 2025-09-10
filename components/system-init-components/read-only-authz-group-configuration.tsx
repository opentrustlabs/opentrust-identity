"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";


const ReadOnlyAuthzGroupConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onError,
    onNext,
    systemInitInput

}) => {
    
    return (
        <div>readonly authz</div>
    )
}

export default ReadOnlyAuthzGroupConfiguration;