"use client";
import { MarkForDelete, PortalUserProfile, SchedulerLock } from "@/graphql/generated/graphql-types";
import React, { useContext } from "react";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { useQuery } from "@apollo/client";
import { RUNNING_JOBS_QUERY } from "@/graphql/queries/oidc-queries";
import { containsScope } from "@/utils/authz-utils";
import { DEFAULT_BACKGROUND_COLOR, JOBS_READ_SCOPE } from "@/utils/consts";
import { useAuthSessionContext } from "../contexts/auth-session-context";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import { DetailPageContainer, DetailPageMainContentContainer } from "../layout/detail-page-container";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import { formatISODateFromMs } from "@/utils/date-utils";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Link from "next/link";
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import { Paper, Stack, Box } from "@mui/material";

const MAP_DELETION_OBJECT_TYPE_TO_VALUE: Map<string, string> = new Map([
    ["AUTHENTICATION_GROUP", "Authentication Group"],
    ["AUTHORIZATION_GROUP", "Authorization Group"],
    ["SIGNING_KEY", "Signing Key"],
    ["CLIENT", "Client"],
    ["FEDERATED_OIDC_PROVIDER", "OIDC Provider"],
    ["RATE_LIMIT_SERVICE_GROUP", "Rate Limit"],
    ["SCOPE", "Scope"],
    ["TENANT", "Tenant"],
    ["USER", "User"]
]);

const RunningJobs: React.FC = () => {

    // CONTEXT VARIABLES
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;    
    const sessionProps = useAuthSessionContext();
    const { copyContentToClipboard } = useClipboardCopyContext();
    

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
    );

    // HANDLER FUNCTIONS
    const getObjectLink = (objectType: string, objectId: string): string => {
        let p = "";
        if(objectType === "AUTHENTICATION_GROUP"){
            p = "authentication-groups";
        }
        else if(objectType === "AUTHORIZATION_GROUP"){
            p = "authorization-groups";
        }
        else if(objectType === "SIGNING_KEY"){
            p = "signing-keys";
        }
        else if(objectType === "CLIENT"){
            p = "clients";
        }
        else if(objectType === "FEDERATED_OIDC_PROVIDER"){
            p = "oidc-providers";
        }
        else if(objectType === "RATE_LIMIT_SERVICE_GROUP"){
            p = "rate-limits";
        }
        else if(objectType === "SCOPE"){
            p = "scope-access-control";
        }
        else if(objectType === "USER"){
            p = "users";
        }
        else if(objectType === "TENANT"){
            p = "tenants";
        }
        return profile ? `/${profile.managementAccessTenantId}/${p}/${objectId}` : "";
    }

    if (loading) return <DataLoading dataLoadingSize="xl" color={null} />
    if (error) return <ErrorComponent message={error ? error.message : "There was an unexpected error retrieving jobs data."} componentSize='lg' />
    
    if(data && data.getRunningJobs) return (
        <Typography component={"div"}>
            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 marginTop={"8px"} container size={12} spacing={2}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: "100%",
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            bgcolor: DEFAULT_BACKGROUND_COLOR,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <WorkHistoryOutlinedIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            Jobs Data
                                        </Typography>                                        
                                    </Box>
                                </Stack>
                                
                            </Stack>
                        </Paper>
                    </Grid2>
                    <Grid2 size={12} fontWeight={"bold"} marginTop={"16px"} sx={{textDecoration: "underline"}}>Items marked for deletion</Grid2>
                    <Grid2 fontWeight={"bold"} container size={12} marginTop={"16px"} marginBottom={"8px"}>
                        <Grid2 size={{md: 3, sm: 5, xs: 5}}>Object Type</Grid2>
                        <Grid2 size={{md: 4, sm: 6, xs: 6}}>Object ID</Grid2>
                        <Grid2 size={1}></Grid2>
                        <Grid2 size={{md: 4, sm: 12, xs: 12}}></Grid2>
                    </Grid2>
                    <Divider />
                    {data.getRunningJobs.markForDeleteItems.length === 0 &&
                        <Grid2 size={12} justifyContent={"center"} marginTop={"8px"} display={"flex"}>
                            <div>There are no objects marked for deletion</div>
                        </Grid2>
                    }                    
                    {data.getRunningJobs.markForDeleteItems.length > 0 &&
                        <React.Fragment>
                            {data.getRunningJobs.markForDeleteItems.map(
                                (m: MarkForDelete) => (
                                    <Grid2 container size={12} key={m.objectId} marginTop={"8px"}>
                                        <Grid2 size={{md: 3, sm: 5, xs: 5}}>{MAP_DELETION_OBJECT_TYPE_TO_VALUE.get(m.objectType)}</Grid2>                                        
                                        <Grid2 sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={{md: 4, sm: 6, xs: 6}}>
                                            <Link
                                                target="_blank"
                                                href={getObjectLink(m.objectType, m.objectId)}
                                            >
                                                {m.objectId}
                                            </Link>                                            
                                        </Grid2>
                                        <Grid2 size={1}>
                                            <ContentCopyIcon 
                                                sx={{cursor: "pointer"}}
                                                onClick={() => {
                                                    copyContentToClipboard(m.objectId, "Object ID copied to clipboard");
                                                }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{md: 4, sm: 12, xs: 12}} direction={"row"} container paddingLeft={"8px"} borderLeft={"solid 1px lightgrey"}>
                                            <Grid2 size={4}>Submitted:</Grid2>
                                            <Grid2 size={8}>{formatISODateFromMs(m.submittedDate)}</Grid2>
                                            <Grid2 size={4}>Started:</Grid2>
                                            <Grid2 size={8}>{m.startedDate ? formatISODateFromMs(m.startedDate) : ""}</Grid2>
                                            <Grid2 size={4}>Completed:</Grid2>
                                            <Grid2 size={8}>{m.completedDate ? formatISODateFromMs(m.completedDate) : ""}</Grid2>
                                        </Grid2>
                                        <Grid2 marginTop={"8px"} size={12}><Divider /></Grid2>
                                    </Grid2>
                                )
                            )}
                        </React.Fragment>
                    }

                    <Grid2 size={12} fontWeight={"bold"} marginTop={"32px"} sx={{textDecoration: "underline"}}>Current Scheduled Items</Grid2>
                    <Grid2 fontWeight={"bold"} container size={12} marginTop={"16px"} marginBottom={"8px"}>
                        <Grid2 size={{md: 4, sm: 5, xs: 5}}>Lock Name</Grid2>
                        <Grid2 size={{md: 3, sm: 6, xs: 6}}>Lock ID</Grid2>
                        <Grid2 size={1}></Grid2>
                        <Grid2 size={{md: 4, sm: 12, xs: 12}}></Grid2>
                    </Grid2>
                    <Divider />
                    {data.getRunningJobs.schedulerLocks.length === 0 &&
                        <Grid2 size={12} justifyContent={"center"} marginTop={"8px"} display={"flex"}>
                            <div>There are no scheduled items</div>
                        </Grid2>
                    }                    
                    {data.getRunningJobs.schedulerLocks.length > 0 &&
                        <React.Fragment>
                            {data.getRunningJobs.schedulerLocks.map(
                                (s: SchedulerLock) => (
                                    <Grid2 container size={12} key={s.lockInstanceId} marginTop={"8px"}>
                                        <Grid2 sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={{md: 4, sm: 5, xs: 5}}>{s.lockName}</Grid2>                                        
                                        <Grid2 sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={{md: 3, sm: 6, xs: 6}}>                                            
                                            {s.lockInstanceId}                                            
                                        </Grid2>
                                        <Grid2 size={1}>
                                            {/* <ContentCopyIcon 
                                                sx={{cursor: "pointer"}}
                                                onClick={() => {
                                                    copyContentToClipboard(m.objectId, "Object ID copied to clipboard");
                                                }}
                                            /> */}
                                        </Grid2>
                                        <Grid2 size={{md: 4, sm: 12, xs: 12}} direction={"row"} container paddingLeft={"8px"} borderLeft={"solid 1px lightgrey"}>
                                            <Grid2 size={4}>Start Time:</Grid2>
                                            <Grid2 size={8}>{formatISODateFromMs(s.lockStartTimeMS)}</Grid2>
                                            <Grid2 size={4}>Expires At:</Grid2>
                                            <Grid2 size={8}>{formatISODateFromMs(s.lockExpiresAtMS)}</Grid2>                                            
                                        </Grid2>
                                        <Grid2 marginTop={"8px"} size={12}><Divider /></Grid2>
                                    </Grid2>
                                )
                            )}
                        </React.Fragment>
                    }
                </DetailPageMainContentContainer>
            </DetailPageContainer>
        </Typography>
    )
}

export default RunningJobs;