"use client";
import { TENANTS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import { ASSIGN_FEDERATED_OIDC_PROVIDER_TO_TENANT_MUTATION, REMOVE_FEDERATED_OIDC_PROVIDER_FROM_TENANT_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Dialog from "@mui/material/Dialog";
import { Button, DialogActions, DialogContent, Divider, TablePagination } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Tenant, PortalUserProfile } from "@/graphql/generated/graphql-types";
import Link from "next/link";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import TenantSelector from "../dialogs/tenant-selector";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE } from "@/utils/consts";

export interface FederatedOIDCProviderTenantConfigurationProps {
    federatedOIDCProviderId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const FederatedOIDCProviderTenantConfiguration: React.FC<FederatedOIDCProviderTenantConfigurationProps> = ({
    federatedOIDCProviderId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    // STATE VARIABLES
    const [tenantToAdd, setTenantToAdd] = React.useState<string | null>(null);
    const [tenantToRemove, setTenantToRemove] = React.useState<Tenant | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = React.useState<boolean>(false);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);
    const [page, setPage] = React.useState<number>(1);
    const [canAddRel] = React.useState<boolean>(containsScope(FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, profile?.scope || []));
    const [canRemoveRel] = React.useState<boolean>(containsScope(FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, profile?.scope || []));


    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(TENANTS_QUERY, {
        variables: {
            federatedOIDCProviderId: federatedOIDCProviderId
        }
    });

    const [assignFederatedOIDCTenantMutation] = useMutation(ASSIGN_FEDERATED_OIDC_PROVIDER_TO_TENANT_MUTATION,{
        variables: {
            federatedOIDCProviderId: federatedOIDCProviderId,
            tenantId: tenantToAdd
        },
        onCompleted() {
            onUpdateEnd(true);
            setShowAddDialog(false);
            setTenantToAdd(null);
        },
        onError(error){
            onUpdateEnd(false);
            setShowAddDialog(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANTS_QUERY]
    });

    const [removeFederatedOIDCDomainMutation] = useMutation(REMOVE_FEDERATED_OIDC_PROVIDER_FROM_TENANT_MUTATION, {
        variables: {
            tenantId: tenantToRemove?.tenantId,
            federatedOIDCProviderId: federatedOIDCProviderId
        },
        onCompleted() {
            onUpdateEnd(true);
            setShowRemoveDialog(false);
            setTenantToRemove(null);
        },
        onError(error){
            onUpdateEnd(false);
            setShowRemoveDialog(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANTS_QUERY]
    });

    // HANDLER FUNCTIONS
    const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
        setPage(page + 1);
    }


    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    return (
        <Typography component="div">
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
            }
            {showRemoveDialog &&
                <Dialog
                    open={showRemoveDialog}
                    onClose={() => setShowRemoveDialog(false)}
                >
                    <DialogContent>
                        <Typography component={"div"}>
                            <span>Confirm removal of tenant: </span><span style={{fontWeight: "bold"}}>{tenantToRemove?.tenantName}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => {
                                setTenantToRemove(null);
                                setShowRemoveDialog(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => {
                                onUpdateStart();
                                removeFederatedOIDCDomainMutation();
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            {showAddDialog &&
                <Dialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    maxWidth={"sm"}
                    fullWidth={true}
                >
                    <TenantSelector
                        onCancel={() => {
                            setShowAddDialog(false);
                            setTenantToAdd(null) ;
                        }}
                        onSelected={(tenantId: string) => {
                            setTenantToAdd(tenantId);
                            onUpdateStart();
                            assignFederatedOIDCTenantMutation({
                                variables: {
                                    tenantId: tenantId,
                                    federatedOIDCProviderId: federatedOIDCProviderId
                                }
                            });
                        }}
                        existingTenantIds={
                            data.getTenants.length === 0 ?
                                [] :
                                data.getTenants.map(
                                    (t: Tenant) => t.tenantId
                                )
                        }
                        submitButtonText="Submit"
                    />
                </Dialog>
            }
            {canAddRel &&
                <Grid2 marginBottom={"24px"} marginTop={"16px"} spacing={2} container size={12}>
                    <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                        <AddBoxIcon
                            sx={{cursor: "pointer"}}
                            onClick={() => setShowAddDialog(true)}
                        />
                        <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Tenant</div>
                    </Grid2>                
                </Grid2>
            }
            <Grid2 marginBottom={"8px"} marginTop={"16px"} spacing={1} container size={12} fontWeight={"bold"}>
                <Grid2 size={11} >Tenant Name</Grid2>                        
                <Grid2 size={1}></Grid2>
            </Grid2>
            <Divider />
            {data.getTenants.length === 0 &&
                <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No tenants found
                    </Grid2>
                </Grid2>
            }
            {data.getTenants.length > 0 &&
                <Grid2 spacing={1} container size={12}>
                    {data.getTenants.slice((page - 1) * 10, page * 10).map(                    
                        (tenant: Tenant) => (
                            <React.Fragment key={tenant.tenantId}>
                                <Grid2 size={12}><Divider /></Grid2>
                                <Grid2 size={11}>
                                    <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${tenant.tenantId}`}>{tenant.tenantName}</Link>
                                </Grid2>
                                <Grid2 minHeight={"26px"} size={1}>
                                    {canRemoveRel &&
                                        <RemoveCircleOutlineIcon
                                            sx={{cursor: "pointer"}}
                                            onClick={() => {setTenantToRemove(tenant); setShowRemoveDialog(true);}}
                                        />
                                    }
                                </Grid2>                                
                            </React.Fragment>
                        )
                    )}
                </Grid2>
            }
            <TablePagination
                component={"div"}
                page={page - 1}
                rowsPerPage={10}
                count={data.getTenants.length}
                onPageChange={handlePageChange}
                rowsPerPageOptions={[]}
            />

        </Typography>
    )

}

export default FederatedOIDCProviderTenantConfiguration;