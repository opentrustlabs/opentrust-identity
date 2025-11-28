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
import AddBoxIcon from '@mui/icons-material/AddBox';
import { UserTenantRelView, PortalUserProfile, UserTenantRel } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, TENANT_USER_ASSIGN_SCOPE, TENANT_USER_REMOVE_SCOPE, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY, USER_TENANT_REL_TYPES_DISPLAY } from "@/utils/consts";
import { Alert, Button, Dialog, DialogActions, DialogContent, Tooltip } from "@mui/material";
import { USER_TENANT_REL_ASSIGN_MUTATION, USER_TENANT_REL_REMOVE_MUTATION, USER_TENANT_REL_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Link from "next/link";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { useIntl } from 'react-intl';
import TenantSelector from "../dialogs/tenant-selector";

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
    const [canAddRel] = React.useState<boolean>(containsScope(TENANT_USER_ASSIGN_SCOPE, profile?.scope || []));
    const [showAddDialog, setShowAddDialog] = React.useState<boolean>(false);
    const [tenantIdToRemove, setTenantIdToRemove] = React.useState<string | null>(null);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const {data, loading, error, refetch} = useQuery(USER_TENANT_RELS_QUERY, {
        variables: {
            userId: userId
        },
        onCompleted(data) {
            onLoadCompleted(data.getUserTenantRels);
        },
        fetchPolicy: "network-only",
        nextFetchPolicy: "network-only",
        notifyOnNetworkStatusChange: true
    });

    const [updateUserTenantRelMutation] = useMutation(USER_TENANT_REL_UPDATE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            refetch();
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
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        //refetchQueries: [USER_TENANT_RELS_QUERY]
    });

    const [assignUserToTenantMutation] = useMutation(USER_TENANT_REL_ASSIGN_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        //refetchQueries: [USER_TENANT_RELS_QUERY]
    });


    if (loading) return <DataLoading dataLoadingSize="xs" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    
    return (
        <>
            {showAddDialog &&
                <Dialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <TenantSelector
                        onCancel={() => setShowAddDialog(false)}
                        onSelected={(tenantId: string) => {                            
                            setShowAddDialog(false);
                            assignUserToTenantMutation({
                                variables: {
                                    userId: userId,
                                    tenantId: tenantId,
                                    relType: data.getUserTenantRels && data.getUserTenantRels.length > 0 ? USER_TENANT_REL_TYPE_GUEST : USER_TENANT_REL_TYPE_PRIMARY
                                }
                            });
                        }}
                        existingTenantIds={
                            (data && data.getUserTenantRels.length === 0) ?
                                [] :
                                data.getUserTenantRels.map(
                                    (rel: UserTenantRel) => rel.tenantId
                                )
                        }
                        submitButtonText="Submit"
                    />                 
                </Dialog>
            }
            {showRemoveDialog &&
                <Dialog
                    open={showRemoveDialog}
                    onClose={() => setShowRemoveDialog(false)}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>Confirm removal of user from tenant</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowRemoveDialog(false)}
                        >Cancel</Button>
                        <Button
                            onClick={() => {
                                onUpdateStart();
                                setShowRemoveDialog(false);
                                removeUserFromTenantMutation({
                                    variables: {
                                        userId: userId,
                                        tenantId: tenantIdToRemove
                                    }
                                })
                                
                            }}
                        >Confirm</Button>
                    </DialogActions>

                </Dialog>
            }
            <Typography component={"div"} fontWeight={"bold"} >
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                    </Grid2>
                }
                {canAddRel &&                
                    <Grid2 marginBottom={"24px"} marginTop={"16px"} spacing={2} container size={12}>
                        <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                            <AddBoxIcon
                                sx={{cursor: "pointer"}}
                                onClick={() => setShowAddDialog(true)}
                            />
                            <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add User To Tenant</div>
                        </Grid2>                    
                    </Grid2>
                }
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >                    
                    
                        <Grid2 size={1}>Primary</Grid2>
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
                                                        updateUserTenantRelMutation({
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
                                            setTenantIdToRemove(userTenantRelView.tenantId);
                                            setShowRemoveDialog(true);
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