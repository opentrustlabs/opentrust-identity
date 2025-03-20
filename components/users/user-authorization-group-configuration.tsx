"use client";
import { USER_AUTHORIZATION_GROUP_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import GradeIcon from '@mui/icons-material/Grade';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { AuthorizationGroup, UserTenantRelView } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY, USER_TENANT_REL_TYPES_DISPLAY } from "@/utils/consts";

import { Tooltip } from "@mui/material";
import { USER_TENANT_REL_REMOVE_MUTATION, USER_TENANT_REL_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";


export interface UserAuthorizationGroupConfigurationProps {
    userId: string
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

const UserAuthorizationGroupConfiguration: React.FC<UserAuthorizationGroupConfigurationProps> = ({
    userId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);


    const {data, loading, error} = useQuery(USER_AUTHORIZATION_GROUP_QUERY, {
        variables: {
            userId: userId
        }
    });

    const [assignUserToTenantMutation] = useMutation(USER_TENANT_REL_UPDATE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message)
        },
        refetchQueries: [USER_AUTHORIZATION_GROUP_QUERY]
    });

    const [removeUserFromTenantMutation] = useMutation(USER_TENANT_REL_REMOVE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message)
        },
        refetchQueries: [USER_AUTHORIZATION_GROUP_QUERY]
    });


    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    
    return (
        <>
            <Typography component={"div"} fontWeight={"bold"} >
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                    <Grid2 size={5}>Group Name</Grid2>
                    <Grid2 size={6}>Description</Grid2>
                    <Grid2 size={1}></Grid2>                                                                                        
                </Grid2>
            </Typography>
            <Divider />
            {data.getUserAuthorizationGroups.map(                                            
                (authnGroup: AuthorizationGroup) => (
                    <Typography key={`${authnGroup.groupId}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                        <Divider></Divider>                        
                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                            <Grid2 size={5}>{authnGroup.groupName}</Grid2>                            
                            <Grid2 size={6}>{authnGroup.groupDescription}</Grid2>
                            <Grid2 size={1}>                                
                                    <RemoveCircleOutlineIcon 
                                        onClick={() => {
                                            // onUpdateStart();
                                            // removeUserFromTenantMutation({
                                            //     variables: {
                                            //         userId: userTenantRelView.userId,
                                            //         tenantId: userTenantRelView.tenantId
                                            //     }
                                            // })
                                        }}
                                        sx={{cursor: "pointer"}}
                                    />
                                
                            </Grid2>
                        </Grid2>
                    </Typography>                                                
                )
            )}
        
        </>
    )
}

export default UserAuthorizationGroupConfiguration;