"use client";
import { ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION, REMOVE_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { FEDERATED_OIDC_PROVIDERS_QUERY, SCOPE_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { FederatedOidcProvider, Scope } from "@/graphql/generated/graphql-types";
import { FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, SCOPE_USE_IAM_MANAGEMENT, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Divider from "@mui/material/Divider";
import { Alert, Button, Dialog, DialogActions, DialogContent, TablePagination } from "@mui/material";
import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import GeneralSelector from "../dialogs/general-selector";

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

    // STATE VARIABLES
    const [selectedScopeToRemove, setSelectedScopeToRemove] = React.useState<{id: string, name: string} | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);
    const [page, setPage] = React.useState<number>(1);


    // GRAPHQL 
    const {data, loading, error, refetch} = useQuery(SCOPE_QUERY, {
        variables: {
            tenantId: tenantId
        }
    });

    // data.getScope

    // const [assignTenantFederatedOIDCProviderMutation] = useMutation(ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION, {        
    //     onCompleted() {
    //         onUpdateEnd(true);
    //         refetch();

    //     },
    //     onError(error) {
    //         onUpdateEnd(false);
    //         setErrorMessage(error.message);
    //     },
        
    // });

    // const [removeTenantFederatedOIDCProviderMutation] = useMutation(REMOVE_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION, {
    //     variables: {
    //         tenantId: tenantId,
    //         federatedOIDCProviderId: selectedOIDCProviderToRemove?.id
    //     },
    //     onCompleted() {
    //         onUpdateEnd(true);
    //         refetch();

    //     },
    //     onError(error) {
    //         onUpdateEnd(false);
    //         setErrorMessage(error.message);
    //     },
    // });

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
                            <span>Confirm removal of OIDC provider: </span><span style={{fontWeight: "bold"}}>{selectedScopeToRemove?.name || ""}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRemoveConfirmationDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setShowRemoveConfirmationDialog(false);
                            onUpdateStart();
                            //removeTenantFederatedOIDCProviderMutation();
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
                        queryVars={{}}
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
                                            label: scope.scopeName //`${scope.scopeName} (${scope.scopeDescription})`
                                        }
                                    }
                                )
                            }
                            else{
                                return [];
                            }
                        }}
                        helpText="Select a Scope"
                        onCancel={() => setSelectDialogOpen(false)}
                        onSelected={(oidcProviderId: string) => {
                            setSelectDialogOpen(false); 
                            onUpdateStart();
                            // assignTenantFederatedOIDCProviderMutation({
                            //     variables: {
                            //         tenantId: tenantId,
                            //         federatedOIDCProviderId: oidcProviderId
                            //     }
                            // }); 
                        }}
                        selectorLabel="Select a provider"
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
                                <Grid2 size={4}>
                                    <span style={{textDecoration: "underline"}}>
                                        {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${scope.scopeId}`}>{scope.scopeName}</Link>
                                        }
                                        {tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                            <>{scope.scopeName}</>
                                        }
                                    </span>
                                </Grid2>
                                <Grid2 size={7}>
                                    {scope.scopeDescription}
                                </Grid2>
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