"use client";
import { BULK_TENANT_SCOPE_ASSIGN_MUTATION, TENANT_SCOPE_ASSIGN_MUTATION, TENANT_SCOPE_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { SCOPE_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { BulkScopeInput, Scope, ScopeFilterCriteria } from "@/graphql/generated/graphql-types";
import { SCOPE_USE_DISPLAY, SCOPE_USE_IAM_MANAGEMENT, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Divider from "@mui/material/Divider";
import { Alert, Button, Dialog, DialogActions, DialogContent, TablePagination } from "@mui/material";
import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import GeneralSelector from "../dialogs/general-selector";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";

export interface TenantScopeConfigurationProps {
    tenantId: string,
    tenantType: string,
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

const TenantScopeConfiguration: React.FC<TenantScopeConfigurationProps> = ({
    tenantId,
    tenantType,
    onUpdateEnd,
    onUpdateStart
}) => {


    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const responseBreakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // STATE VARIABLES
    const [selectedScopeToRemove, setSelectedScopeToRemove] = React.useState<{id: string, name: string} | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);
    const [page, setPage] = React.useState<number>(1);


    // GRAPHQL 
    const {data, loading, error} = useQuery(SCOPE_QUERY, {
        variables: {
            tenantId: tenantId,
            filterBy: ScopeFilterCriteria.Existing
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });

    const [bulkAssignTenantToScopeMutation] = useMutation(BULK_TENANT_SCOPE_ASSIGN_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setErrorMessage(null);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
        refetchQueries: [SCOPE_QUERY]
    });

    const [removeTenantFromScopeMutation] = useMutation(TENANT_SCOPE_REMOVE_MUTATION, {
        variables: {
            scopeId: selectedScopeToRemove?.id,
            tenantId: tenantId
        },
        onCompleted() {
            onUpdateEnd(true);
            setErrorMessage(null);
        },
        onError(error) {
            onUpdateEnd(true);
            setErrorMessage(error.message);
        },
        refetchQueries: [SCOPE_QUERY]
    });

    // HANDLER FUNCTIONS
    const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
        setPage(page + 1);
    }

    if (loading) return <DataLoading dataLoadingSize="sm" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='sm' />

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
                            <span>Confirm removal of scope: </span><span style={{fontWeight: "bold"}}>{selectedScopeToRemove?.name || ""}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRemoveConfirmationDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setShowRemoveConfirmationDialog(false);
                            onUpdateStart();
                            removeTenantFromScopeMutation();
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
                        query={SCOPE_QUERY}
                        queryVars={{tenantId: tenantId, filterBy: ScopeFilterCriteria.Available}}
                        dataMapper={(d) => {
                            const preExistingIds = data.getScope.map( (scope: Scope) => scope.scopeId);                            
                            if(d && d.getScope){
                                return d.getScope
                                .filter(
                                    (scope: Scope) => {
                                        return !preExistingIds.includes(scope.scopeId)
                                    }
                                )                                
                                .map(
                                    (scope: Scope) => {
                                        return {
                                            id: scope.scopeId,
                                            label: scope.scopeName
                                        }
                                    }
                                )
                            }
                            else{
                                return [];
                            }
                        }}
                        multiSelect={true}
                        helpText="Select a Scope"
                        onCancel={() => setSelectDialogOpen(false)}
                        onSelected={(value: string | Array<string>) => {
                            setSelectDialogOpen(false); 
                            onUpdateStart();
                            const bulkScopeInput: Array<BulkScopeInput> = [];
                            if(Array.isArray(value)){
                                for(let i = 0; i < value.length; i++){
                                    bulkScopeInput.push({
                                        scopeId: value[i],
                                        accessRuleId: null
                                    });
                                }                                
                            } 
                            else{
                                bulkScopeInput.push({
                                    scopeId: value as string,
                                    accessRuleId: null
                                });
                            }  
                            bulkAssignTenantToScopeMutation({
                                variables: {
                                    bulkScopeInput: bulkScopeInput,
                                    tenantId: tenantId
                                }
                            });                       
                        }}
                        selectorLabel="Select a scope"
                    />
                </Dialog>
            }
            <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <AddBoxIcon
                        sx={{cursor: "pointer"}}
                        onClick={() => setSelectDialogOpen(true)}
                    />
                    <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Scope</div>
                </Grid2>                
            </Grid2>
            <Divider />
            <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={1} container size={12} fontWeight={"bold"}>
                <Grid2 size={responseBreakPoints.isMedium ? 11 : 3}>Name</Grid2>
                {!responseBreakPoints.isMedium &&
                    <Grid2 size={4.5}>
                        Description
                    </Grid2>
                }
                {!responseBreakPoints.isMedium &&
                    <Grid2 size={3.5}>
                        Use
                    </Grid2>
                }
                <Grid2 size={1}></Grid2>
            </Grid2>
            <Divider />
            {data.getScope.length === 0 &&
                <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No scope assigned to tenant
                    </Grid2>
                </Grid2>
            }
            {data.getScope.length > 0 &&
                <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                    {data.getScope.slice((page - 1) * 10, page * 10).map(
                        (scope: Scope) => (
                            <React.Fragment key={scope.scopeId}>                                
                                <Grid2 size={responseBreakPoints.isMedium ? 11 : 3}>
                                    <span style={{textDecoration: "underline"}}>
                                        {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${scope.scopeId}`}>{scope.scopeName}</Link>
                                        }
                                        {tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                            <>{scope.scopeName}</>
                                        }
                                    </span>
                                </Grid2>
                                {!responseBreakPoints.isMedium &&
                                    <Grid2 size={4.5}>
                                        {scope.scopeDescription}
                                    </Grid2>
                                }
                                {!responseBreakPoints.isMedium &&
                                    <Grid2 size={3.5}>
                                        {SCOPE_USE_DISPLAY.get(scope.scopeUse)}
                                    </Grid2>
                                }
                                
                                <Grid2 size={1}>
                                    { !(tenantType === TENANT_TYPE_ROOT_TENANT && scope.scopeUse === SCOPE_USE_IAM_MANAGEMENT) &&
                                        <RemoveCircleOutlineIcon
                                            sx={{cursor: "pointer"}}
                                            onClick={() => {setSelectedScopeToRemove({id: scope.scopeId, name: scope.scopeName}); setShowRemoveConfirmationDialog(true);}}
                                        />
                                    }                                    
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
                count={data.getScope.length}
                onPageChange={handlePageChange}
                rowsPerPageOptions={[]}
            />

        </Typography>
    )
}



export default TenantScopeConfiguration;