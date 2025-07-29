"use client";
import { PortalUserProfile } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { useQuery } from "@apollo/client";
import { RUNNING_JOBS_QUERY } from "@/graphql/queries/oidc-queries";
import { containsScope } from "@/utils/authz-utils";
import { JOBS_READ_SCOPE } from "@/utils/consts";
import { useAuthSessionContext } from "../contexts/auth-session-context";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import { DetailPageContainer, DetailPageMainContentContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";


const RunningJobs: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const sessionProps = useAuthSessionContext();
    

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(
        RUNNING_JOBS_QUERY,
        {
            fetchPolicy: "no-cache",
            nextFetchPolicy: "no-cache",
            initialFetchPolicy: "no-cache",
            notifyOnNetworkStatusChange: true,
            pollInterval: 5 * 60 * 1000, // every 5 minutes
            skip: !containsScope([JOBS_READ_SCOPE], profile?.scope) || sessionProps.getTokenTtlMs() < 0
        }
    )

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error ? error.message : "There was an unexpected error retrieving jobs data."} componentSize='lg' />
    
    if(data && data.getRunningJobs) return (
        <Typography component={"div"}>
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={12}>Jobs Data</Grid2>
                        </Grid2>
                    </Grid2>
                    <>
                        {JSON.stringify(data.getRunningJobs)}
                    </>
                </DetailPageMainContentContainer>
            </DetailPageContainer>
        </Typography>
    )
}

export default RunningJobs;