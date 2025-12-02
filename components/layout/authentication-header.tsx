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
    if(isAuthenticateToPortal){
        backgroundColor = tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
        textColor = tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor || DEFAULT_TEXT_COLOR;
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
                    {tenantMetaData.tenantLookAndFeel?.authenticationlogo &&
                        <div style={{verticalAlign: "center"}}>
                            <img 
                                alt="tenant logo"
                                style={{display: "block"}} 
                                src={`/api/${tenantMetaData.tenant.tenantId}/logo`}
                                height="48px" >
                            </img>
                        </div>
                    }
                    {tenantMetaData.tenantLookAndFeel?.authenticationlogouri &&
                        <div style={{verticalAlign: "center"}}>
                            <img 
                                alt="tenant logo"
                                style={{display: "block"}} 
                                src={tenantMetaData.tenantLookAndFeel?.authenticationlogouri}
                                height="48px" >
                            </img>
                        </div>
                    }
                    {tenantMetaData.tenantLookAndFeel?.authenticationheadertext &&                        
                        <div style={{verticalAlign: "center", fontWeight: "bold", marginLeft: "24px"}}>{tenantMetaData.tenantLookAndFeel?.authenticationheadertext}</div>                        
                    }
                    {!tenantMetaData.tenantLookAndFeel?.authenticationheadertext &&                        
                        <div style={{verticalAlign: "center", fontWeight: "bold", marginLeft: "24px"}}>OpenTrust Identity</div>                        
                    }
                </Stack>
            </Container>
        </div>
        
    )
}

export default AuthenticationHeader;

