"use client";
import React, { ReactNode } from "react";
import AuthenticationHeader from "./authentication-header";
import AuthenticationFooter from "./authentication-footer";
import Container from "@mui/material/Container";
import { Grid2 } from "@mui/material";

interface LayoutProps {
    children: ReactNode
}
const AuthenticationLayout: React.FC<LayoutProps> = ({
    children,
  }) => {

    return (
        <div
            style={{ }}
        >
            
            <AuthenticationHeader></AuthenticationHeader>
            <Container
                maxWidth="xl"
            >
                <Grid2 
                    container
                    spacing={0}
                    alignItems={"center"}
                    justifyContent={"center"}
                    sx={{minHeight: "90vh"}}
                >
                    <Grid2 
                        
                    >
                        <div>{children}</div>
                    </Grid2>
                </Grid2>
            
            </Container>
            <AuthenticationFooter></AuthenticationFooter>
            
        </div>
    )
}

export default AuthenticationLayout;