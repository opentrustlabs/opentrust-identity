"use client";
import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";

export interface BreadcrumbDetail {
    href: string | null,
    linkText: string
}

export interface BreadcrumbComponentProps {
    breadCrumbs: Array<BreadcrumbDetail>
}

const BreadcrumbComponent: React.FC<BreadcrumbComponentProps> = ({breadCrumbs}) => {

    return (
        <Breadcrumbs sx={{height: "40px", paddingTop: "8px"}}>
            {breadCrumbs.map(
                (breadCrumb: BreadcrumbDetail) => (                   
                    <Link
                        key={breadCrumb.linkText}
                        href={breadCrumb.href || ""}
                    >
                        {breadCrumb.linkText}
                    </Link>
                )
            )}
        </Breadcrumbs>
    )
}

export default BreadcrumbComponent