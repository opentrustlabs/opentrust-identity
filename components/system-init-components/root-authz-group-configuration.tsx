"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";


const RootAuthzConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onError,
    onNext,
    systemInitInput

}) => {
    
    return (
        <div>root authz</div>
    )
}

export default RootAuthzConfiguration;