"use client";
import { FooterLink, TenantMetaData } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "@/utils/consts";
import Container from "@mui/material/Container";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Link from "next/link";
import React from "react";


export interface AuthenticationFooterProps {
    tenantMetaData: TenantMetaData,
    isAuthenticateToPortal: boolean
}

const AuthenticationFooter: React.FC<AuthenticationFooterProps> = ({
    tenantMetaData,
    isAuthenticateToPortal
}) => {

    let backgroundColor = DEFAULT_BACKGROUND_COLOR;
    let textColor = DEFAULT_TEXT_COLOR;
    if(!isAuthenticateToPortal){
        backgroundColor = tenantMetaData.tenantLookAndFeel?.footerbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
        textColor = tenantMetaData.tenantLookAndFeel?.footertextcolor || DEFAULT_TEXT_COLOR;
    } 

    return (
        <div
            style={{
                backgroundColor: backgroundColor,
                width: "100%",
                height: "5vh",
                minHeight: "45px",
                display: "flex",
                alignItems: "center",
                color: textColor
            }}
        >        
            <Container
                maxWidth="xl"
            >
                <Grid2 height={"100%"} container size={12} alignItems={"center"} style={{fontSize: "0.95em"}}>
                    {tenantMetaData.tenantLookAndFeel && tenantMetaData.tenantLookAndFeel.footerlinks.length > 0 &&
                        <Stack direction="row" spacing={1} >
                            {tenantMetaData.tenantLookAndFeel.footerlinks.map(
                                (link: FooterLink) => (
                                    <span>
                                        <Link
                                            href={link.uri}
                                            target="_blank"
                                        >
                                            {link.linktext}
                                        </Link>
                                    </span>
                                )
                            )}
                        </Stack>
                    }                    
                </Grid2>
            </Container>
        </div>


        
    )
}

export default AuthenticationFooter;