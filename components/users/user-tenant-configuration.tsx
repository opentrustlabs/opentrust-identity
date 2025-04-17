"use client";
import { USER_TENANT_RELS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import GradeIcon from '@mui/icons-material/Grade';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { UserTenantRelView } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY, USER_TENANT_REL_TYPES_DISPLAY } from "@/utils/consts";

import { Tooltip } from "@mui/material";
import { USER_TENANT_REL_REMOVE_MUTATION, USER_TENANT_REL_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Link from "next/link";


export interface UserTenantConfigurationProps {
    userId: string
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

const UserTenantConfiguration: React.FC<UserTenantConfigurationProps> = ({
    userId,
    onUpdateEnd,
    onUpdateStart
}) => {


    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);


    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(USER_TENANT_RELS_QUERY, {
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
        refetchQueries: [USER_TENANT_RELS_QUERY]
    });

    const [removeUserFromTenantMutation] = useMutation(USER_TENANT_REL_REMOVE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message)
        },
        refetchQueries: [USER_TENANT_RELS_QUERY]
    });


    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    
    return (
        <>
            <Typography component={"div"} fontWeight={"bold"} >
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                    {data.getUserTenantRels.length === 1 &&
                        <Grid2 size={8}>Tenant Name</Grid2>
                    }
                    {data.getUserTenantRels.length > 1 &&
                        <Grid2 container size={8}>
                            <Grid2 size={1.4}></Grid2>
                            <Grid2 size={6.6}>Tenant Name</Grid2>
                        </Grid2>
                    }
                    
                    <Grid2 size={3}>Membership Type</Grid2>
                    <Grid2 size={1}></Grid2>                                                                                        
                </Grid2>
            </Typography>
            <Divider />
            {data.getUserTenantRels.map(                                            
                (userTenantRelView: UserTenantRelView) => (
                    <Typography key={`${userTenantRelView.tenantId}`} component={"div"} fontSize={"0.9em"} >
                        <Divider></Divider>                        
                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                            {data.getUserTenantRels.length === 1 &&
                                <Grid2 size={8}>
                                    <Link target="_blank" href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${userTenantRelView.tenantId}`}>
                                        {userTenantRelView.tenantName}
                                    </Link>
                                </Grid2>
                            }
                            {data.getUserTenantRels.length > 1 &&
                                <Grid2 container size={8}>
                                    <Grid2 size={1.4}>
                                        {userTenantRelView.relType === USER_TENANT_REL_TYPE_GUEST &&
                                            <Tooltip title={"Assign as primary tenant"}
                                            >
                                                <StarOutlineOutlinedIcon 
                                                    onClick={() => {
                                                        onUpdateStart();
                                                        assignUserToTenantMutation({
                                                            variables: {
                                                                userId: userTenantRelView.userId,
                                                                tenantId: userTenantRelView.tenantId,
                                                                relType: USER_TENANT_REL_TYPE_PRIMARY
                                                            }
                                                        });
                                                    }}
                                                    sx={{cursor: "pointer"}}
                                                />
                                            </Tooltip>
                                        }                                         
                                        {userTenantRelView.relType === USER_TENANT_REL_TYPE_PRIMARY &&
                                            <GradeIcon sx={{color: DEFAULT_BACKGROUND_COLOR}}  />
                                        }                                       
                                    </Grid2>
                                    <Grid2 size={6.6}>
                                        <Link target="_blank" href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${userTenantRelView.tenantId}`}>
                                            {userTenantRelView.tenantName}
                                        </Link>
                                    </Grid2>
                                </Grid2>
                            }
                            <Grid2 size={3}>{USER_TENANT_REL_TYPES_DISPLAY.get(userTenantRelView.relType)}</Grid2>
                            <Grid2 size={1}>
                                {userTenantRelView.relType === USER_TENANT_REL_TYPE_GUEST &&
                                    <RemoveCircleOutlineIcon 
                                        onClick={() => {
                                            onUpdateStart();
                                            removeUserFromTenantMutation({
                                                variables: {
                                                    userId: userTenantRelView.userId,
                                                    tenantId: userTenantRelView.tenantId
                                                }
                                            })
                                        }}
                                        sx={{cursor: "pointer"}}
                                    />
                                }
                            </Grid2>
                        </Grid2>
                    </Typography>                                                
                )
            )}
        
        </>
    )
}

export default UserTenantConfiguration;