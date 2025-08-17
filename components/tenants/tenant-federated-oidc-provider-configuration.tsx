"use client";
import { ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION, REMOVE_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { FEDERATED_OIDC_PROVIDERS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { FederatedOidcProvider, PortalUserProfile } from "@/graphql/generated/graphql-types";
import { FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE, FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import Divider from "@mui/material/Divider";
import { Alert, Button, Dialog, DialogActions, DialogContent, TablePagination } from "@mui/material";
import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import GeneralSelector from "../dialogs/general-selector";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";

export interface TenantFederatedOIDCProviderConfigurationProps {
    tenantId: string,
    allowSocialLogin: boolean,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const TenantFederatedOIDCProviderConfiguration: React.FC<TenantFederatedOIDCProviderConfigurationProps> = ({
    tenantId,
    allowSocialLogin,
    onUpdateEnd,
    onUpdateStart
}) => {


    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    // STATE VARIABLES
    const [selectedOIDCProviderToRemove, setSelectedOIDCProviderToRemove] = React.useState<{id: string, name: string} | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);
    const [page, setPage] = React.useState<number>(1);
    const [canAddRel] = React.useState<boolean>(containsScope(FEDERATED_OIDC_PROVIDER_TENANT_ASSIGN_SCOPE, profile?.scope || []));
    const [canRemoveRel] = React.useState<boolean>(containsScope(FEDERATED_OIDC_PROVIDER_TENANT_REMOVE_SCOPE, profile?.scope || []));


    // GRAPHQL FUNCTIONS
    const {data, loading, error, refetch} = useQuery(FEDERATED_OIDC_PROVIDERS_QUERY, {
        variables: {
            tenantId: tenantId
        }
    });

    const [assignTenantFederatedOIDCProviderMutation] = useMutation(ASSIGN_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION, {        
        onCompleted() {
            onUpdateEnd(true);
            refetch();

        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message);
        },
        
    });

    const [removeTenantFederatedOIDCProviderMutation] = useMutation(REMOVE_TENANT_FEDERATED_OIDC_PROVIDER_MUTATION, {
        variables: {
            tenantId: tenantId,
            federatedOIDCProviderId: selectedOIDCProviderToRemove?.id
        },
        onCompleted() {
            onUpdateEnd(true);
            refetch();

        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message);
        },
    });

    // HANDLER FUNCTIONS
    const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, page: number) => {
        setPage(page + 1);
    }


    if (loading) return <DataLoading dataLoadingSize="lg" color={null} />
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
                            <span>Confirm removal of Social OIDC provider: </span><span style={{fontWeight: "bold"}}>{selectedOIDCProviderToRemove?.name || ""}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRemoveConfirmationDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setShowRemoveConfirmationDialog(false);
                            onUpdateStart();
                            removeTenantFederatedOIDCProviderMutation();
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
                        query={FEDERATED_OIDC_PROVIDERS_QUERY}
                        queryVars={{}}
                        dataMapper={(d) => {
                            const preExistingIds = data.getFederatedOIDCProviders.map( (provider: FederatedOidcProvider) => provider.federatedOIDCProviderId);                            
                            if(d && d.getFederatedOIDCProviders){
                                return d.getFederatedOIDCProviders
                                .filter(
                                    (provider: FederatedOidcProvider) => {  
                                        if(provider.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE){
                                            return false;
                                        }
                                        if(provider.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_SOCIAL && !allowSocialLogin){
                                            return false;
                                        }
                                        return true;
                                    }
                                )
                                .filter(
                                    (provider: FederatedOidcProvider) => {
                                        return !preExistingIds.includes(provider.federatedOIDCProviderId)
                                    }
                                )                                
                                .map(
                                    (provider: FederatedOidcProvider) => {
                                        return {
                                            id: provider.federatedOIDCProviderId,
                                            label: provider.federatedOIDCProviderName
                                        }
                                    }
                                )
                            }
                            else{
                                return [];
                            }
                        }}
                        multiSelect={false}
                        helpText="Select a valid provider"
                        onCancel={() => setSelectDialogOpen(false)}
                        onSelected={(oidcProviderId: string | Array<string>) => {
                            setSelectDialogOpen(false); 
                            onUpdateStart();
                            assignTenantFederatedOIDCProviderMutation({
                                variables: {
                                    tenantId: tenantId,
                                    federatedOIDCProviderId: oidcProviderId as string
                                }
                            }); 
                        }}
                        selectorLabel="Select a social provider"
                    />
                </Dialog>
            }
            {canAddRel &&
                <React.Fragment>
                    <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>                    
                            <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>                        
                                <AddBoxIcon
                                    sx={{cursor: "pointer"}}
                                    onClick={() => setSelectDialogOpen(true)}
                                />
                                <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Social OIDC Provider</div>                        
                            </Grid2>
                        
                    </Grid2>
                    <Divider />
                </React.Fragment>
            }
            <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={1} container size={12} fontWeight={"bold"}>
                <Grid2 size={8}>Provider Name</Grid2>
                <Grid2 size={3}>Type</Grid2>
                <Grid2 size={1}></Grid2>
            </Grid2>
            <Divider />
            {data.getFederatedOIDCProviders.length === 0 &&
                <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No Social OIDC Providers
                    </Grid2>
                </Grid2>
            }
            {data.getFederatedOIDCProviders.length > 0 &&
                <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                    {data.getFederatedOIDCProviders.map(
                        (provider: FederatedOidcProvider) => (
                            <React.Fragment key={provider.federatedOIDCProviderId}>                                
                                <Grid2 size={8}>
                                    <span style={{textDecoration: "underline"}}>
                                        {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                            <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/oidc-providers/${provider.federatedOIDCProviderId}`}>{provider.federatedOIDCProviderName}</Link>
                                        }
                                        {tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                            <>{provider.federatedOIDCProviderName}</>
                                        }
                                    </span>
                                </Grid2>
                                <Grid2 size={3}>
                                    {provider.federatedOIDCProviderType === FEDERATED_OIDC_PROVIDER_TYPE_ENTERPRISE ?
                                        "Enterprise" :
                                        "Social"                                    
                                    }
                                </Grid2>
                                <Grid2 minHeight={"26px"} size={1}>
                                    {canRemoveRel &&
                                        <RemoveCircleOutlineIcon
                                            sx={{cursor: "pointer"}}
                                            onClick={() => {setSelectedOIDCProviderToRemove({id:provider.federatedOIDCProviderId, name: provider.federatedOIDCProviderName}); setShowRemoveConfirmationDialog(true);}}
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
                count={data.getFederatedOIDCProviders.length}
                onPageChange={handlePageChange}
                rowsPerPageOptions={[]}
            />
        </Typography>
    )
}



export default TenantFederatedOIDCProviderConfiguration;