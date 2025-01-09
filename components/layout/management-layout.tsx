"use client";
import React, { ReactNode } from "react";
import ManagementFooter from "./management-footer";
import ManagementHeader from "./management-header";


interface LayoutProps {
    children: ReactNode
}
const ManagementLayout: React.FC<LayoutProps> = ({
    children,
  }) => {

    return (
        <div>
            <ManagementHeader></ManagementHeader>
            <div>{children}</div>
            <ManagementFooter></ManagementFooter>
        </div>
    )
}

export default ManagementLayout;