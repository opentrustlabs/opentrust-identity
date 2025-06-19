"use client";
import React, { useContext } from "react";
import {  useSearchParams } from 'next/navigation';
import { QUERY_PARAM_AUTHENTICATE_TO_PORTAL, QUERY_PARAM_REDIRECT_URI, QUERY_PARAM_TENANT_ID, QUERY_PARAM_PREAUTHN_TOKEN } from "@/utils/consts";
import { PageTitleContext } from "@/components/contexts/page-title-context";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import PortalLogin from "./portal-login";
import ClientLogin from "./client-login";


const Login: React.FC = () => {

    // CONTEXT VARIABLES
    const titleSetter = useContext(PageTitleContext);
    titleSetter.setPageTitle("Login");    
    const tenantBean: TenantMetaDataBean  = useContext(TenantContext);

    // QUERY PARAMS
    const params = useSearchParams();
    const preauthToken = params?.get(QUERY_PARAM_PREAUTHN_TOKEN);
    const tenantId = params?.get(QUERY_PARAM_TENANT_ID);
    const redirectUri = params?.get(QUERY_PARAM_REDIRECT_URI);
    const authenticateToPortal = params?.get(QUERY_PARAM_AUTHENTICATE_TO_PORTAL);
    

    // if(tenantId === undefined || tenantId === null || tenantBean.getTenantMetaData().tenant.tenantId === "" || authenticateToPortal === "true")
    return (
        <PortalLogin tenantId={tenantId || undefined} redirectUri={redirectUri || undefined} preAuthToken={preauthToken || undefined} tenantBean={tenantBean} />
    )

    // if (tenantId && tenantBean.getTenantMetaData().tenant.tenantId !== "") return (
    //     <ClientLogin tenantId={tenantId} redirectUri={redirectUri || ""} preauthToken={preauthToken || ""} tenantBean={tenantBean} />
    // )

    
        
}

export default Login;