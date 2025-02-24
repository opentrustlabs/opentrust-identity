"use client";
import { TENANTS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Autocomplete, AutocompleteRenderInputParams, TextField } from "@mui/material";
import { Tenant } from "@/graphql/generated/graphql-types";

export interface TenantSelectorProps {
    onSelected: (tenantId: string) => void
}

const TenantSelector: React.FC<TenantSelectorProps> = ({
    onSelected
}) => {

    const {data, loading, error} = useQuery(TENANTS_QUERY);

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
        <Autocomplete 
            sx={{paddingTop: "8px"}}
            renderInput={(params) => <TextField {...params} label="Select Tenant" />}
            options={createTenantOptions()}

        />
    )

}

export default TenantSelector;