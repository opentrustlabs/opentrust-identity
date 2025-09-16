"use client";
import React from "react";
import { TENANT_RESTRICTED_DOMAIN_REL_ADD_MUTATION, TENANT_RESTRICTED_DOMAIN_REL_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_AUTHENTICATION_DOMAIN_REL_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { Alert, Button, DialogActions, DialogTitle, Divider, Grid2, TextField, Typography } from "@mui/material";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { TenantManagementDomainRel } from "@/graphql/generated/graphql-types";
import { useIntl } from 'react-intl';

export interface TenantAuthenticationDomainConfigurationProps {
    tenantId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const TenantAuthenticationDomainConfiguration: React.FC<TenantAuthenticationDomainConfigurationProps> = ({
    tenantId,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();


    // STATE VARIABLES
    const [selectedDomainToAdd, setSelectedDomainToAdd] = React.useState<string | null>(null);
    const [selectedDomainToDelete, setSelectedDomainToDelete] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);


    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(TENANT_AUTHENTICATION_DOMAIN_REL_QUERY, {
        variables: {
            tenantId: tenantId
        }
    });

    const [addTenantAuthenticationDomainRel] = useMutation(TENANT_RESTRICTED_DOMAIN_REL_ADD_MUTATION, {
        variables: {
            tenantId: tenantId,
            domain: selectedDomainToAdd
        },        
        onCompleted() {
            setSelectedDomainToAdd(null);
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        refetchQueries: [TENANT_AUTHENTICATION_DOMAIN_REL_QUERY]
    });

    const [removeTenantAuthenticationDomainRel] = useMutation(TENANT_RESTRICTED_DOMAIN_REL_REMOVE_MUTATION, {
        variables: {
            tenantId: tenantId,
            domain: selectedDomainToDelete
        },
        onCompleted() {
            setSelectedDomainToDelete(null);
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        },
        refetchQueries: [TENANT_AUTHENTICATION_DOMAIN_REL_QUERY]
    });

    if (loading) return <DataLoading dataLoadingSize="xs" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='xs' />

    return (
        <Typography component={"div"}>
            {errorMessage && 
                <Alert severity="error" onClose={() => {setErrorMessage(null)}}>{errorMessage}</Alert>
            }
            {deleteDialogOpen &&
                <Dialog 
                    open={deleteDialogOpen}
                    onClose={() => {setDeleteDialogOpen(false); setSelectedDomainToDelete(null);}}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>

                        <Typography ><span>Confirm removal of domain: </span> <span style={{fontWeight: "bold"}}>{selectedDomainToDelete}</span></Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {setDeleteDialogOpen(false); setSelectedDomainToDelete(null);}}>Cancel</Button>
                        <Button onClick={() => {onUpdateStart(); setDeleteDialogOpen(false); removeTenantAuthenticationDomainRel();}}>Confirm</Button>
                    </DialogActions>                    
                </Dialog>
            }
            {addDialogOpen &&
                <Dialog 
                    open={addDialogOpen}
                    onClose={() => {setAddDialogOpen(false); setSelectedDomainToAdd(null);}}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle>Add domain</DialogTitle>
                    <DialogContent>
                        <TextField 
                            fullWidth={true}
                            size="small"
                            name="domain"
                            onChange={(evt) => {if(evt.target.value.length > 0){setSelectedDomainToAdd(evt.target.value)}}}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {setAddDialogOpen(false); setSelectedDomainToAdd(null);}}>Cancel</Button>
                        <Button onClick={() => {onUpdateStart(); setAddDialogOpen(false); addTenantAuthenticationDomainRel();}}>Submit</Button>
                    </DialogActions>                    
                </Dialog>
            }
            
            <Grid2 padding={"8px"} container size={12} spacing={0}>
                {data.getDomainsForTenantAuthentication && data.getDomainsForTenantAuthentication.length < 1 &&
                    <Grid2 size={12} textAlign={"center"}>No restricted domains found</Grid2>
                }
                {data.getDomainsForTenantAuthentication.map(
                    (rel: TenantManagementDomainRel) => (
                        <Grid2 container key={rel.domain} size={12}>
                            <Grid2  size={10.8}>{rel.domain}</Grid2>
                            <Grid2 size={1.2}>
                                {readOnly !== true &&
                                    <RemoveCircleOutlineIcon sx={{cursor: "pointer"}} onClick={() => {setSelectedDomainToDelete(rel.domain); setDeleteDialogOpen(true); }} />
                                }
                             </Grid2>
                        </Grid2>
                    )
                )}
            </Grid2>
            <Divider />
            <Grid2 padding={"8px"} container size={12} spacing={0}>                
                <Grid2 size={1}>
                    {readOnly !== true &&
                        <AddBoxIcon onClick={() => setAddDialogOpen(true)} sx={{cursor: "pointer"}}/>
                    }
                </Grid2>
                <Grid2 size={11}></Grid2>
            </Grid2>
        </Typography>
    )
}

export default TenantAuthenticationDomainConfiguration;