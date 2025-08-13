"use client";
import React, { useContext } from "react";
import { SYSTEM_SETTINGS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import DataLoading from "@/components/layout/data-loading";
import ErrorComponent from "@/components/error/error-component";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { SYSTEM_SETTINGS_READ_SCOPE } from "@/utils/consts";
import SystemSettingsDetail from "@/components/tenants/system-settings-detail";


const SystemSettingsDetailPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    
    const {data, loading, error} = useQuery(
        SYSTEM_SETTINGS_QUERY,
        {
            skip: !containsScope([SYSTEM_SETTINGS_READ_SCOPE], profile?.scope),
            fetchPolicy: "no-cache"
        }
    )

    if(!containsScope([SYSTEM_SETTINGS_READ_SCOPE], profile?.scope)) return <ErrorComponent message={"You do not have sufficient permission to view this page."} componentSize='lg' />
    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error ? error.message : "There was an unexpected error retrieving the system settings details."} componentSize='lg' />
    if (data && data.getSystemSettings === null) return <ErrorComponent message={"The System Settings could not be retrieved"} componentSize='lg' />

    return (
        <SystemSettingsDetail systemSettings={data.getSystemSettings} />
    )
}

export default SystemSettingsDetailPage;