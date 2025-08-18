"use client";
import { FEDERATED_OIDC_PROVIDERS_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Autocomplete, Button, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { FederatedOidcProvider } from "@/graphql/generated/graphql-types";

export interface OIDCSelectorProps {
    onCancel: () => void,
    onSelected: (oidcProviderId: string) => void,
    preExistingIds: Array<string>
}

const OIDCSelector: React.FC<OIDCSelectorProps> = ({
    onCancel,
    onSelected,
    preExistingIds
}) => {

    // STATE VARIALBES
    const [selectedProvider, setSelectedProvider] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(FEDERATED_OIDC_PROVIDERS_QUERY);

    // HANDLER FUNCTIONS
    const createProviderOptions = () => {
        const options: Array<{id: string, label: string}>= [];        
        if(data && data.getFederatedOIDCProviders){
            data.getFederatedOIDCProviders
                .filter(
                    (provider: FederatedOidcProvider) => {
                        return !preExistingIds.includes(provider.federatedOIDCProviderId)
                    }
                )
                .forEach(
                    (provider: FederatedOidcProvider) => {
                        options.push({
                            id: provider.federatedOIDCProviderId,
                            label: provider.federatedOIDCProviderName
                        });
                    }
                )
        }
        return options;
    }

    if(loading) return <DataLoading dataLoadingSize="22vh" color={null} />
    if(error) return <ErrorComponent message={error.message} componentSize={"sm"} />
    if(data) return (
        <>
            <DialogTitle>Select Provider</DialogTitle>
            <DialogContent>
                {errorMessage &&
                    <div>{errorMessage}</div>
                }
                <Autocomplete 
                    sx={{paddingTop: "8px"}}
                    renderInput={(params) => <TextField {...params} label="Select Provider" />}
                    options={createProviderOptions()}
                    // @typescript-eslint/no-explicit-any
                    onChange={ (_, value: any) => setSelectedProvider(value.id)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()}>Cancel</Button>
                <Button 
                    disabled={selectedProvider === null}                 
                    onClick={() => {
                        if(selectedProvider !== null){
                            onSelected(selectedProvider);
                        }
                        else{
                            setErrorMessage("Select a valid provider")
                        }
                    }}
                >
                    Submit
                </Button>
            </DialogActions>
        
        </>
    )

}

export default OIDCSelector;