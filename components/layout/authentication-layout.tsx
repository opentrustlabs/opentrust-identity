"use client";
import React, { ReactNode } from "react";
import AuthenticationHeader from "./authentication-header";
import AuthenticationFooter from "./authentication-footer";

interface LayoutProps {
    children: ReactNode
}
const AuthenticationLayout: React.FC<LayoutProps> = ({
    children,
  }) => {

    return (
        <div>
            <AuthenticationHeader></AuthenticationHeader>
            <div>{children}</div>
            <AuthenticationFooter></AuthenticationFooter>
        </div>
    )
}

export default AuthenticationLayout;