"use client";
import React from "react";
import { TENANT_DOMAIN_MANAGEMENT_REL_ADD_MUTATION, TENANT_DOMAIN_MANAGEMENT_REL_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_DOMAIN_MANAGEMENT_REL_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { Alert, Button, DialogActions, DialogTitle, Divider, Grid2, TextField, Typography } from "@mui/material";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { TenantManagementDomainRel } from "@/graphql/generated/graphql-types";

export interface TenantManagementDomainConfigurationProps {
    tenantId: string,
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

const TenantManagementDomainConfiguration: React.FC<TenantManagementDomainConfigurationProps> = ({
    tenantId,
    onUpdateEnd,
    onUpdateStart
}) => {


    const [selectedDomainToAdd, setSelectedDomainToAdd] = React.useState<string | null>(null);
    const [selectedDomainToDelete, setSelectedDomainToDelete] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);

    const { data, loading, error } = useQuery(TENANT_DOMAIN_MANAGEMENT_REL_QUERY, {
        variables: {
            tenantId: tenantId
        }
    })

    const [addTenantDomainManagementRel] = useMutation(TENANT_DOMAIN_MANAGEMENT_REL_ADD_MUTATION, {
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
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANT_DOMAIN_MANAGEMENT_REL_QUERY]
    });

    const [removeTenantDomainManagementRel] = useMutation(TENANT_DOMAIN_MANAGEMENT_REL_REMOVE_MUTATION, {
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
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANT_DOMAIN_MANAGEMENT_REL_QUERY]
    });

    if (loading) return <DataLoading dataLoadingSize="xs" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='xs' />

    return (
        <Typography component={"div"}>
            {errorMessage &&
                <Alert severity="error" onClose={() => { setErrorMessage(null) }}>{errorMessage}</Alert>
            }
            {deleteDialogOpen &&
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => { setDeleteDialogOpen(false); setSelectedDomainToDelete(null); }}
                >
                    <DialogContent>

                        <Typography ><span>Confirm removal of domain: </span> <span style={{ fontWeight: "bold" }}>{selectedDomainToDelete}</span></Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setDeleteDialogOpen(false); setSelectedDomainToDelete(null); }}>Cancel</Button>
                        <Button onClick={() => { onUpdateStart(); setDeleteDialogOpen(false); removeTenantDomainManagementRel(); }}>Confirm</Button>
                    </DialogActions>
                </Dialog>
            }
            {addDialogOpen &&
                <Dialog
                    open={addDialogOpen}
                    onClose={() => { setAddDialogOpen(false); setSelectedDomainToAdd(null); }}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle>Add domain</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth={true}
                            size="small"
                            name="domain"
                            onChange={(evt) => { if (evt.target.value.length > 0) { setSelectedDomainToAdd(evt.target.value) } }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setAddDialogOpen(false); setSelectedDomainToAdd(null); }}>Cancel</Button>
                        <Button onClick={() => { onUpdateStart(); setAddDialogOpen(false); addTenantDomainManagementRel(); }}>Submit</Button>
                    </DialogActions>
                </Dialog>
            }


            <Grid2 padding={"8px"} container size={12} spacing={0}>
                {data.getDomainsForTenantManagement && data.getDomainsForTenantManagement.length < 1 &&
                    <Grid2 size={12} textAlign={"center"}>No domains for tenant management</Grid2>
                }
                {data.getDomainsForTenantManagement.map(
                    (rel: TenantManagementDomainRel, idx: number) => (
                        <Grid2 container key={rel.domain} size={12}>
                            <Grid2 size={10.8}>{rel.domain}</Grid2>
                            <Grid2 size={1.2}><RemoveCircleOutlineIcon sx={{ cursor: "pointer" }} onClick={() => { setSelectedDomainToDelete(rel.domain); setDeleteDialogOpen(true); }} /></Grid2>
                        </Grid2>
                    )
                )}
            </Grid2>
            <Divider />
            <Grid2 padding={"8px"} container size={12} spacing={0}>
                <Grid2 size={1}>
                    <AddBoxIcon onClick={() => setAddDialogOpen(true)} sx={{ cursor: "pointer" }} />
                </Grid2>
                <Grid2 size={11}></Grid2>

            </Grid2>
        </Typography>

    )
}

export default TenantManagementDomainConfiguration;