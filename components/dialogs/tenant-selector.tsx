"use client";
import { TENANTS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Autocomplete, AutocompleteRenderInputParams, Button, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Tenant } from "@/graphql/generated/graphql-types";

export interface TenantSelectorProps {
    onCancel: () => void,
    onSelected: (tenantId: string) => void
}

const TenantSelector: React.FC<TenantSelectorProps> = ({
    onCancel,
    onSelected
}) => {

    // STATE VARIALBES
    const [selectedTenant, setSelectedTenant] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(TENANTS_QUERY);

    // HANDLER FUNCTIONS
    const createTenantOptions = () => {
        return data ? 
            data.getTenants.map(
                (tenant: Tenant) => {
                    return {
                        id: tenant.tenantId,
                        label: tenant.tenantName
                    }        
                }
            )
            : []
    }

    if(loading) return <DataLoading dataLoadingSize="22vh" color={null} />
    if(error) return <ErrorComponent message={error.message} componentSize={"sm"} />
    if(data) return (
        <>
            <DialogTitle>Select Tenant</DialogTitle>
            <DialogContent>
                {errorMessage &&
                    <div>{errorMessage}</div>
                }
                <Autocomplete 
                    sx={{paddingTop: "8px"}}
                    renderInput={(params) => <TextField {...params} label="Select Tenant" />}
                    options={createTenantOptions()}
                    onChange={ (_, value: any) => setSelectedTenant(value.id)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()}>Cancel</Button>
                <Button disabled={selectedTenant === null} onClick={() => {selectedTenant !== null ? onSelected(selectedTenant) : setErrorMessage("Select a valid tenant")}}>Next</Button>
            </DialogActions>
        
        </>
    )

}

export default TenantSelector;