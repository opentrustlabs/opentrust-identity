"use client";
import { AuthenticationGroup } from "@/graphql/generated/graphql-types";
import React from "react";


export interface AuthenticationGroupDetailProps {
    authenticationGroup: AuthenticationGroup
}

const AuthenticationGroupDetail: React.FC<AuthenticationGroupDetailProps> = ({ authenticationGroup }) => {

    return (
        <div>
            
        <div>{JSON.stringify(authenticationGroup)}</div>
        </div>
    )
}

export default AuthenticationGroupDetail;