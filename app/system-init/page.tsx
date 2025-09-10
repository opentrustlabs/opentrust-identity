"use client";
import SystemInit from "@/components/system-init-components/system-init";
import React, { Suspense } from "react";


const SystemInitPage: React.FC = () => {
    return (
        <Suspense>
            <SystemInit />
        </Suspense>
    )
}

export default SystemInitPage;