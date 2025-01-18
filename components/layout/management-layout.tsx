"use client";
import React, { ReactNode, useContext } from "react";
import Container from "@mui/material/Container";
import ManagementHeader from "./management-header";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";


interface Props {
    children: ReactNode
}
const ManagementLayout: React.FC<Props> = ({children}) => {
  

    // // CONTEXT OBJECTS
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);

        return (
            <div
                style={{ }}
            >
                <ManagementHeader
                    tenantMetaData={
                        tenantBean.getTenantMetaData()
                    }
                />             
                <Container
                    maxWidth="xl"                    
                    disableGutters={true}
                    sx={{minHeight: "94vh"}}
                >{children}
                    
                </Container>

                
            </div>
        )
}

export default ManagementLayout;