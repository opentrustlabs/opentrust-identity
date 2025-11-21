"use client";
import React from "react";
import { TenantMetaData } from "@/graphql/generated/graphql-types";
import Container from "@mui/material/Container";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "@/utils/consts";


export interface ManagementFooterProps {
    tenantMetaData: TenantMetaData
}

const ManagementFooter: React.FC<ManagementFooterProps> = ({
    tenantMetaData
}) => {


    return (
        <div 
            style={{
                backgroundImage: `linear-gradient(${DEFAULT_BACKGROUND_COLOR}, #34111194)`,
                backgroundColor: DEFAULT_BACKGROUND_COLOR, 
                width: "100%", 
                minHeight: "4vh", 
                color: tenantMetaData.tenantLookAndFeel?.adminheadertextcolor || DEFAULT_TEXT_COLOR,
                borderTop: "solid 1px lightgray",
                boxShadow: "0px 0px 1vh 0px grey",
            }}

        >        
            <Container
                maxWidth={false}
            >
                <div>
                    {
                        /* TODO
                            Add footer links
                        */
                    }
                </div>
            </Container>
        </div>
        
    )
}

export default ManagementFooter;