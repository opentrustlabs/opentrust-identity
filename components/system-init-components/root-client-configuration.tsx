"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";


const RootClientConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onError,
    onNext,
    systemInitInput

}) => {
    
    return (
        <div>root client</div>
    )
}

export default RootClientConfiguration;