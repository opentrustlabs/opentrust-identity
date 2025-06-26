"use client";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import Container from "@mui/material/Container";
import React from "react";


export interface AuthenticationFooterProps {
    tenantMetaData: TenantMetaData
}

const AuthenticationFooter: React.FC<AuthenticationFooterProps> = ({
    tenantMetaData
}) => {


    return (
        <div 
            style={{
                backgroundColor: tenantMetaData.tenantLookAndFeel?.authenticationheaderbackgroundcolor || "#1976d2", 
                width: "100%", 
                minHeight: "5vh", 
                color: tenantMetaData.tenantLookAndFeel?.authenticationheadertextcolor || "white"
            }}

        >
        
            <Container
                maxWidth="xl"
            >
                <div style={{fontSize: "0.8em", padding: "8px"}}>
                    {tenantMetaData.tenant.allowSocialLogin &&
                        <div style={{alignItems: "center", justifyItems: "center"}}>
                            <div style={{textDecoration: "underline", marginBottom: "4px"}}>Social Media Icons Curtesy of</div>
                            <div>
                                <a className="undecorated" href="https://www.flaticon.com/free-icons/google" title="google icons">Google icons created by Freepik - Flaticon</a>, 
                                <a className="undecorated" href="https://www.flaticon.com/free-icons/facebook" title="facebook icons">Facebook icons created by Freepik - Flaticon</a>, 
                                <a className="undecorated" href="https://www.flaticon.com/free-icons/linkedin" title="linkedin icons">Linkedin icons created by riajulislam - Flaticon</a>, 
                                <a className="undecorated" href="https://www.flaticon.com/free-icons/logos" title="logos icons">Logos icons created by Freepik - Flaticon</a>,
                                <a className="undecorated" href="https://www.flaticon.com/free-icons/salesforce" title="salesforce icons">Salesforce icons created by Freepik - Flaticon</a>
                            </div>
                        </div>
                        
                    }
                </div>
            </Container>
        </div>


        
    )
}

export default AuthenticationFooter;