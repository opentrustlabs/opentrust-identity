"use client";
import SecretEntry from "@/components/authentication-components/secret-entry";
import React, { Suspense } from "react";


const SecretEntryPage: React.FC = () => {

    return (
        <Suspense>
            <SecretEntry />
        </Suspense>
    )
}

export default SecretEntryPage;