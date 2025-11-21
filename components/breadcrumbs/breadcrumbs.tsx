"use client";
import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export interface BreadcrumbDetail {
    href: string | null,
    linkText: string
}

export interface BreadcrumbComponentProps {
    breadCrumbs: Array<BreadcrumbDetail>
}

const BreadcrumbComponent: React.FC<BreadcrumbComponentProps> = ({breadCrumbs}) => {

    return (
        <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small"/>}
            sx={{minHeight: "40px", paddingTop: "8px"}}
        >
            {breadCrumbs.map(
                (breadCrumb: BreadcrumbDetail) => (
                    
                    <Link
                        className="undecorated"
                        key={breadCrumb.linkText}
                        href={breadCrumb.href || ""}
                        aria-disabled={breadCrumb.href === null ? true : false}
                        style={{cursor: breadCrumb.href !== null ? "pointer" : "not-allowed"}}
                    >
                        {breadCrumb.linkText}
                    </Link>
                                     
                )
            )}
        </Breadcrumbs>
    )
}

export default BreadcrumbComponent