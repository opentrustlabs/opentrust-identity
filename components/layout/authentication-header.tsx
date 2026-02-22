"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "@/utils/consts";
import { Container, Stack } from "@mui/material";
import React from "react";

export interface AuthenticationHeaderProps {
    tenantMetaData: TenantMetaData,
    isAuthenticateToPortal: boolean
}

const AuthenticationHeader: React.FC<AuthenticationHeaderProps> = ({
    tenantMetaData,
    isAuthenticateToPortal
}) => {

    let backgroundColor = DEFAULT_BACKGROUND_COLOR;
    let textColor = DEFAULT_TEXT_COLOR;
    if(!isAuthenticateToPortal){
        backgroundColor = tenantMetaData.tenantLookAndFeel?.headerbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
        textColor = tenantMetaData.tenantLookAndFeel?.headertextcolor || DEFAULT_TEXT_COLOR;
    } 

    return (
        <div 
            style={{
                backgroundColor: backgroundColor, 
                width: "100%", 
                height: "5vh",
                minHeight: "70px",
                color: textColor,
                borderBottom: "1px solid lightgrey"
            }}
        >
            <Container
                maxWidth="xl"
                sx={{height: "100%", alignItems: "center", display: "flex"}}                
            >
                <Stack 
                    direction={"row"}
                    justifyItems={"center"}
                    alignItems={"center"}                    
                >                    
                    {!isAuthenticateToPortal && tenantMetaData.tenantLookAndFeel?.logouri &&
                        <div style={{verticalAlign: "center"}}>
                            <img 
                                alt="tenant logo"
                                style={{display: "block"}} 
                                src={tenantMetaData.tenantLookAndFeel?.logouri}
                                height="48px" >
                            </img>
                        </div>
                    }
                    {!isAuthenticateToPortal && tenantMetaData.tenantLookAndFeel?.headertext &&                        
                        <div style={{verticalAlign: "center", fontWeight: "bold", marginLeft: "24px"}}>{tenantMetaData.tenantLookAndFeel?.headertext}</div>                        
                    }
                    {isAuthenticateToPortal &&
                        <div style={{verticalAlign: "center", fontWeight: "bold", marginLeft: "24px"}}>OpenTrust Identity</div>                        
                    }
                </Stack>
            </Container>
        </div>
        
    )
}

export default AuthenticationHeader;

