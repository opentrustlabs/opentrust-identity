"use client";
import { DocumentNode, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Autocomplete, Button, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

export interface GeneralSelectorProps {
    query: DocumentNode,
    queryVars: any,
    dataMapper: (data: any) => Array<{id: string, label: string}>,
    onCancel: () => void,
    onSelected: (id: string) => void,
    selectorLabel: string,
    helpText: string
}

const GeneralSelector: React.FC<GeneralSelectorProps> = ({
    query,
    queryVars,
    dataMapper,
    onCancel,
    onSelected,
    selectorLabel,
    helpText
}) => {

    // STATE VARIALBES
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(query, {
        variables: queryVars,
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });

    // HANDLER FUNCTIONS
    const createProviderOptions = () => {
        let options: Array<{id: string, label: string}>= dataMapper(data);        
        return options;
    }

    if(loading) return <DataLoading dataLoadingSize="22vh" color={null} />
    if(error) return <ErrorComponent message={error.message} componentSize={"sm"} />
    if(data) return (
        <>
            <DialogTitle>{selectorLabel}</DialogTitle>
            <DialogContent>
                {errorMessage &&
                    <div>{errorMessage}</div>
                }
                <Autocomplete 
                    sx={{paddingTop: "8px"}}
                    renderInput={(params) => <TextField {...params} label={selectorLabel} />}
                    options={createProviderOptions()}
                    onChange={ (_, value: any) => setSelectedId(value.id)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()}>Cancel</Button>
                <Button disabled={selectedId === null} onClick={() => {selectedId !== null ? onSelected(selectedId) : setErrorMessage(helpText)}}>Submit</Button>
            </DialogActions>
        
        </>
    )

}

export default GeneralSelector;