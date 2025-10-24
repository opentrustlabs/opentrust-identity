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
import { UserTenantRelView, PortalUserProfile } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, TENANT_USER_REMOVE_SCOPE, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY, USER_TENANT_REL_TYPES_DISPLAY } from "@/utils/consts";
import { Alert, Tooltip } from "@mui/material";
import { USER_TENANT_REL_REMOVE_MUTATION, USER_TENANT_REL_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Link from "next/link";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { useIntl } from 'react-intl';

export interface UserTenantConfigurationProps {
    userId: string,
    onLoadCompleted: (tenants: Array<UserTenantRelView>) => void,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const UserTenantConfiguration: React.FC<UserTenantConfigurationProps> = ({
    userId,
    onLoadCompleted,
    onUpdateEnd,
    onUpdateStart
}) => {


    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [canRemoveRel] = React.useState<boolean>(containsScope(TENANT_USER_REMOVE_SCOPE, profile?.scope || []));

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(USER_TENANT_RELS_QUERY, {
        variables: {
            userId: userId
        },
        onCompleted(data) {
            onLoadCompleted(data.getUserTenantRels);
        },
        notifyOnNetworkStatusChange: true
    });

    const [assignUserToTenantMutation] = useMutation(USER_TENANT_REL_UPDATE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        refetchQueries: [USER_TENANT_RELS_QUERY]
    });

    const [removeUserFromTenantMutation] = useMutation(USER_TENANT_REL_REMOVE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        refetchQueries: [USER_TENANT_RELS_QUERY]
    });


    if (loading) return <DataLoading dataLoadingSize="xs" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    
    return (
        <>
            <Typography component={"div"} fontWeight={"bold"} >
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                    </Grid2>
                }
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >                    
                    
                        <Grid2 size={1}></Grid2>
                        <Grid2 size={7}>Tenant Name</Grid2>
                    
                                        
                    <Grid2 size={3}>Membership Type</Grid2>
                    <Grid2 size={1}></Grid2>                                                                                        
                </Grid2>
            </Typography>
            <Divider />
            {data && data.getUserTenantRels.length === 0 &&
                <Typography component={"div"} fontSize={"0.9em"} >
                    <Grid2 marginTop={"16px"} display={"flex"} justifyContent={"center"}>
                        <div>This user does not belong to any tenants.</div>
                    </Grid2>
                </Typography>
            }
            {data.getUserTenantRels.map(                                            
                (userTenantRelView: UserTenantRelView) => (
                    <Typography key={`${userTenantRelView.tenantId}`} component={"div"} fontSize={"0.9em"} >
                        <Divider></Divider>                        
                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                            {/* {data.getUserTenantRels.length === 1 &&
                                <Grid2 size={8}>
                                    <Link target="_blank" href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${userTenantRelView.tenantId}`}>
                                        {userTenantRelView.tenantName}
                                    </Link>
                                </Grid2>
                            } */}
                            {data.getUserTenantRels.length > 0 &&
                                <>
                                    <Grid2 size={1}>
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
                                    <Grid2 size={7}>
                                        <Link target="_blank" href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${userTenantRelView.tenantId}`}>
                                            {userTenantRelView.tenantName}
                                        </Link>
                                    </Grid2>
                                </>
                            }
                            <Grid2 size={3}>{USER_TENANT_REL_TYPES_DISPLAY.get(userTenantRelView.relType)}</Grid2>
                            <Grid2 minHeight={"26px"} size={1}>
                                {userTenantRelView.relType === USER_TENANT_REL_TYPE_GUEST && canRemoveRel &&
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