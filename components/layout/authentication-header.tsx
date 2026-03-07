"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, LOGO_HEADER_POSITION_CENTER, LOGO_HEADER_POSITION_LEFT, LOGO_HEADER_POSITION_RIGHT } from "@/utils/consts";
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
    let logoJustification = "left";
    if(!isAuthenticateToPortal){
        backgroundColor = tenantMetaData.tenantLookAndFeel?.headerbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
        textColor = tenantMetaData.tenantLookAndFeel?.headertextcolor || DEFAULT_TEXT_COLOR;
        if(tenantMetaData.tenantLookAndFeel?.headerlogoposition === LOGO_HEADER_POSITION_CENTER){
            logoJustification = "center";
        }
        else if(tenantMetaData.tenantLookAndFeel?.headerlogoposition === LOGO_HEADER_POSITION_RIGHT){
            logoJustification = "right";
        }
    } 

    return (
        <div 
            style={{
                backgroundColor: backgroundColor, 
                width: "100%", 
                height: "5vh",
                minHeight: "70px",
                color: textColor
            }}
        >
            <Container
                maxWidth="xl"
                sx={{height: "100%", alignItems: "center", display: "flex", justifyContent: logoJustification}}
            >
                <Stack 
                    direction={"row"}
                    justifyItems={"center"}
                    alignItems={"center"}
                    justifyContent={"center"}
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

