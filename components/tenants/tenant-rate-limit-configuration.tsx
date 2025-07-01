"use client";
import { RateLimitServiceGroup, TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import {  RATE_LIMITS_QUERY, TENANT_RATE_LIMIT_REL_QUERY, TENANT_RATE_LIMIT_REL_VIEW_QUERY } from "@/graphql/queries/oidc-queries";
import { TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { useMutation, useQuery } from "@apollo/client";
import { Typography, Grid2, Alert, Dialog, DialogContent, DialogActions, Button, Divider, TablePagination } from "@mui/material";
import Link from "next/link";
import React, { useContext } from "react";
import GeneralSelector from "../dialogs/general-selector";
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { TENANT_RATE_LIMIT_ASSIGN_MUTATION, TENANT_RATE_LIMIT_REMOVE_MUTATION, TENANT_RATE_LIMIT_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import TenatRateLimitConfigurationDialog from "../dialogs/tenant-rate-limit-configuration-dialog";

export interface TenantRateLimitConfigurationProps {
    tenantId: string,
    rateLimitSummaryHandler: (totalUsed: number) => void,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const TenantRateLimitConfiguration: React.FC<TenantRateLimitConfigurationProps> = ({
    tenantId,
    rateLimitSummaryHandler,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    
    // STATE VARIABLES
    const [page, setPage] = React.useState<number>(1);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState<boolean>(false);
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);
    const [rateLimitToAdd, setRateLimitToAdd] = React.useState<null | string>(null);
    const [rateLimitToRemove, setRateLimitToRemove] = React.useState<{ id: string, name: string } | null>(null);
    const [tenantRateLimitRelToEdit, setTenantRateLimitRelToEdit] = React.useState<TenantRateLimitRelView | null>(null);
    const [showTenantEditDialogOpen, setShowTenantEditDialogOpen] = React.useState<boolean>(false);
    const [configureRateLimitDialogOpen, setConfigureRateLimitDialogOpen] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const { data, loading, error } = useQuery(TENANT_RATE_LIMIT_REL_VIEW_QUERY, {
        variables: {
            tenantId: tenantId
        },        
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache",
        onCompleted(data) {
            const arr: Array<TenantRateLimitRelView> = data.getRateLimitTenantRelViews as Array<TenantRateLimitRelView>;
            let totalUsed: number = 0;
            arr.forEach(
                (rel: TenantRateLimitRelView) => {
                    if(rel.allowUnlimitedRate !== true){
                        const toAdd = rel.rateLimit ? rel.rateLimit : 0;
                        totalUsed = totalUsed + toAdd;
                    }
                }
            );
            rateLimitSummaryHandler(totalUsed);
        },
        onError(error) {
            rateLimitSummaryHandler(0);
            setErrorMessage(error.message)
        },
        notifyOnNetworkStatusChange: true
    });

    const [assignTenantToRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_ASSIGN_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setRateLimitToAdd(null);
            setErrorMessage(null);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANT_RATE_LIMIT_REL_VIEW_QUERY]
    });

    const [updateTenantRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_UPDATE_MUTATION, {
        variables: {

        },
        onCompleted() {
            onUpdateEnd(true);
            setShowTenantEditDialogOpen(false);
            setTenantRateLimitRelToEdit(null);
            setErrorMessage(null);
        },
        onError(error) {
            setShowTenantEditDialogOpen(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANT_RATE_LIMIT_REL_VIEW_QUERY]
    });

    const [removeTenantFromRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_REMOVE_MUTATION, {
        variables: {

        },
        onCompleted() {
            onUpdateEnd(true);
            setRateLimitToRemove(null);
            setErrorMessage(null);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANT_RATE_LIMIT_REL_VIEW_QUERY]
    });


    // HANDLER FUNCTIONS
    const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
        setPage(page + 1);
    }


    if (loading) return <DataLoading dataLoadingSize="sm" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='lg' />

    if(data) return (
        <Typography component="div">
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
            }
            {showRemoveConfirmationDialog &&
                <Dialog 
                    open={showRemoveConfirmationDialog}
                    onClose={() => setShowRemoveConfirmationDialog(false)}
                    fullWidth={true}
                    maxWidth={"sm"}
                >
                    <DialogContent>
                        <Typography component="div">
                            <span>Confirm removal of service group: </span><span style={{fontWeight: "bold"}}>{rateLimitToRemove?.name || ""}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRemoveConfirmationDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setShowRemoveConfirmationDialog(false);
                            onUpdateStart();
                            removeTenantFromRateLimitGroupMutation({
                                variables: {
                                    tenantId: tenantId,
                                    serviceGroupId: rateLimitToRemove?.id
                                }
                            });
                        }}>Confirm</Button>
                    </DialogActions>

                </Dialog>
            
            }
            {selectDialogOpen &&
                <Dialog
                    open={selectDialogOpen}
                    onClose={() => setSelectDialogOpen(false)}
                    maxWidth={"sm"}
                    fullWidth={true}
                >
                    <GeneralSelector 
                        query={RATE_LIMITS_QUERY}
                        queryVars={{}}
                        dataMapper={(d) => {
                            const preExistingIds = data.getRateLimitTenantRelViews.map( (serviceGroup: TenantRateLimitRelView) => serviceGroup.servicegroupid);                            
                            if(d && d.getRateLimitServiceGroups){
                                return d.getRateLimitServiceGroups
                                .filter(
                                    (serviceGroup: RateLimitServiceGroup) => {
                                        return !preExistingIds.includes(serviceGroup.servicegroupid)
                                    }
                                )                                
                                .map(
                                    (serviceGroup: RateLimitServiceGroup) => {
                                        return {
                                            id: serviceGroup.servicegroupid,
                                            label: serviceGroup.servicegroupname
                                        }
                                    }
                                )
                            }
                            else{
                                return [];
                            }
                        }}
                        helpText="Select a valid service group"
                        onCancel={() => setSelectDialogOpen(false)}
                        multiSelect={false}
                        onSelected={(serviceGroupId: string | Array<string>) => {
                            setSelectDialogOpen(false); 
                            setRateLimitToAdd(serviceGroupId as string);
                            setConfigureRateLimitDialogOpen(true);
                        }}
                        selectorLabel="Select a service group"
                        submitButtonText="Next"
                    />
                </Dialog>
            }
            {configureRateLimitDialogOpen &&
                <Dialog
                    open={configureRateLimitDialogOpen}
                    onClose={() => setConfigureRateLimitDialogOpen(false)}
                    fullWidth={true}
                    maxWidth={"sm"}
                >                    
                    <TenatRateLimitConfigurationDialog
                        existingAllowUnlimited={null}
                        existingLimit={null}
                        tenantId={tenantId}
                        onCompleted={(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null) => {
                            setConfigureRateLimitDialogOpen(false);
                            onUpdateStart();                            
                            assignTenantToRateLimitGroupMutation({
                                variables: {
                                    tenantId: tenantId,
                                    allowUnlimited: allowUnlimited,
                                    serviceGroupId: serviceGroupId,
                                    limit: limit,
                                    rateLimitPeriodMinutes: rateLimitPeriodMinutes
                                }
                            });   
                        }} 
                        onCancel={() => {
                            setConfigureRateLimitDialogOpen(false);
                            setRateLimitToAdd(null);
                        }}
                        serviceGroupId={rateLimitToAdd || ""}
                    />
                </Dialog>
            }
            {showTenantEditDialogOpen &&
                <Dialog
                    open={showTenantEditDialogOpen}
                    onClose={() => setShowTenantEditDialogOpen(false)}
                    fullWidth={true}
                    maxWidth="sm"
                >
                    <TenatRateLimitConfigurationDialog
                        tenantId={tenantRateLimitRelToEdit?.tenantId || ""}
                        existingAllowUnlimited={tenantRateLimitRelToEdit?.allowUnlimitedRate || false}
                        existingLimit={tenantRateLimitRelToEdit?.rateLimit || null}
                        onCancel={() => {
                            setShowTenantEditDialogOpen(false);
                            setTenantRateLimitRelToEdit(null);

                        } }
                        onCompleted={(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null) => {
                            setShowTenantEditDialogOpen(false);
                            onUpdateStart();
                            updateTenantRateLimitGroupMutation({
                                variables: {
                                    tenantId: tenantId,
                                    allowUnlimited: allowUnlimited,
                                    serviceGroupId: serviceGroupId,
                                    limit: limit,
                                    rateLimitPeriodMinutes: rateLimitPeriodMinutes
                                }
                            });
                        } } 
                        serviceGroupId={tenantRateLimitRelToEdit?.servicegroupid || ""}
                    />
                </Dialog>
            }
            <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <AddBoxIcon
                        sx={{cursor: "pointer"}}
                        onClick={() => {
                            setSelectDialogOpen(true);
                        }}
                    />
                    <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Rate Limit</div>
                </Grid2>                
            </Grid2>
            <Divider />
            
            <React.Fragment>
                <Grid2 marginTop={"16px"} marginBottom={"8px"} spacing={1} container size={12} fontWeight={"bold"}>
                    <Grid2 size={1}></Grid2>
                    <Grid2 size={breakPoints.isMedium ? 7 : 3}>Service Group Name</Grid2>
                    <Grid2 size={3}>Rate Limit</Grid2>
                    {!breakPoints.isMedium &&
                        <Grid2 size={4}>Rate Limit Period (minutes)</Grid2>
                    }
                    <Grid2 size={1}></Grid2>
                </Grid2>
                <Grid2 marginBottom={"16px"}><Divider /></Grid2>
            </React.Fragment>
            
            {data.getRateLimitTenantRelViews.length === 0 &&
                <Grid2 marginTop={"16px"} spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No service groups found
                    </Grid2>
                </Grid2>
            }
            {data.getRateLimitTenantRelViews.length > 0 &&
                <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                    {data.getRateLimitTenantRelViews.map(
                        (rateLimitRel: TenantRateLimitRelView) => (
                            <React.Fragment key={rateLimitRel.servicegroupid}>
                                <Grid2 size={1} >
                                <EditOutlinedIcon
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setTenantRateLimitRelToEdit(rateLimitRel);
                                        setShowTenantEditDialogOpen(true);
                                    }}
                                />
                                </Grid2>
                                <Grid2 size={breakPoints.isMedium ? 7 : 3}>
                                    <span style={{textDecoration: "underline"}}>
                                        {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/rate-limits/${rateLimitRel.servicegroupid}`}>{rateLimitRel.servicegroupname}</Link>
                                        }
                                        {tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                            <>{rateLimitRel.servicegroupid}</>
                                        }
                                    </span>
                                </Grid2>
                                <Grid2 size={3}>
                                    {rateLimitRel.rateLimit ? rateLimitRel.rateLimit : "Unlimited"}
                                </Grid2>
                                
                                {!breakPoints.isMedium &&
                                    <Grid2 size={4}>
                                        {rateLimitRel.rateLimitPeriodMinutes}
                                    </Grid2>
                                }
                                <Grid2 size={1}>
                                    <RemoveCircleOutlineIcon
                                        sx={{cursor: "pointer"}}
                                        onClick={() => {
                                            setRateLimitToRemove({id: rateLimitRel.servicegroupid, name: rateLimitRel.servicegroupname});
                                            setShowRemoveConfirmationDialog(true);                                            
                                        }}
                                    />
                                </Grid2>
                                <Grid2 size={12}><Divider /></Grid2>
                            </React.Fragment>
                        )
                    )}
                </Grid2>
            }
            <TablePagination
                component={"div"}
                page={page - 1}
                rowsPerPage={10}
                count={data.getRateLimitTenantRelViews.length}
                onPageChange={handlePageChange}
                rowsPerPageOptions={[]}
            />
        </Typography>
    )
}

export default TenantRateLimitConfiguration;