"use client";
import React, { useContext } from "react";
import ErrorComponent from "@/components/error/error-component";
import { AuthContext, AuthContextProps } from "@/components/contexts/auth-context";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import { containsScope } from "@/utils/authz-utils";
import { JOBS_READ_SCOPE } from "@/utils/consts";

import RunningJobs from "@/components/tenants/jobs";


const RunningJobsPage: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;


    if(!containsScope([JOBS_READ_SCOPE], profile?.scope)) return <ErrorComponent message={"You do not have sufficient permission to view this page."} componentSize='lg' />
    
    return (
        <RunningJobs />
    )
}

export default RunningJobsPage;