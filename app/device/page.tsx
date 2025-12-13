"use client";

import Login from "@/components/authentication-components/login";
import { AuthenticationState, UserAuthenticationState } from "@/graphql/generated/graphql-types";
import React, { Suspense } from "react";


const DevicePage: React.FC = () => {

    const initUserAuthenticationState: UserAuthenticationState = {
        authenticationSessionToken: "",
        authenticationState: AuthenticationState.EnterUserCode,
        authenticationStateOrder: 0,
        authenticationStateStatus: "",
        expiresAtMs: 0,
        tenantId: "",
        userId: ""
    };

    return (
        <Suspense>
            <Login initialUserAuthenticationState={initUserAuthenticationState} />
        </Suspense>

    )

}

export const dynamic = 'force-dynamic';
export default DevicePage;