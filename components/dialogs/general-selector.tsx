"use client";
import { DocumentNode, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Button, Checkbox, DialogActions, DialogContent, DialogTitle, Divider, Grid2, InputAdornment, TablePagination, TextField, Typography } from "@mui/material";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

export interface GeneralSelectorProps {
    query: DocumentNode,
    // @typescript-eslint/no-explicity-any
    queryVars: any,
    // @typescript-eslint/no-explicity-any
    dataMapper: (data: any) => Array<{ id: string, label: string }>,
    onCancel: () => void,
    multiSelect: boolean,
    onSelected: (value: string | Array<string>) => void,
    selectorLabel: string,
    helpText: string,
    submitButtonText?: string
}

const GeneralSelector: React.FC<GeneralSelectorProps> = ({
    query,
    queryVars,
    dataMapper,
    onCancel,
    onSelected,
    multiSelect,
    selectorLabel,
    helpText,
    submitButtonText
}) => {

    const perPage: number = 10;
    // STATE VARIALBES
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [selectedIds, setSelectedIds] = React.useState<Map<string, string>>(new Map());
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [page, setPage] = React.useState(1);
    const [arr, setArr] = React.useState<Array<{ id: string, label: string }>>([]);
    const [filteredArr, setFilteredArr] = React.useState<Array<{ id: string, label: string }>>([]);
    const [filterTerm, setFilterTerm] = React.useState<string>("");

    // GRAPHQL FUNCTIONS
    const { data, loading, error } = useQuery(query, {
        variables: queryVars,
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache",
        onCompleted(data) {
            const options: Array<{ id: string, label: string }> = dataMapper(data);
            setArr(options);
            setFilteredArr(options);
        },
    });

    // HANDLER FUNCTIONS
    const filterValues = (searchTerm: string) => {        
        if(searchTerm.length < 3){            
            setFilteredArr([...arr]);
        }
        else{            
            const regExtTerm = searchTerm.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(regExtTerm, "i");
            const filteredVals = arr.filter(
                (item: {id: string, label: string}) => {
                    if(item.label.match(regex)){
                        return true;
                    }
                    return false;
                }
            );            
            setFilteredArr(filteredVals);
        }        
    }

    if (loading) return <DataLoading dataLoadingSize="22vh" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize={"sm"} />
    if (data) return (
        <>
            <DialogTitle>{selectorLabel}</DialogTitle>
            <DialogContent>
                <Typography component="div">
                    {errorMessage &&
                        <Grid2 container size={12} spacing={1}>
                            <Grid2 size={12}>
                                {errorMessage}
                            </Grid2>
                        </Grid2>
                    }
                    <Grid2 container size={12} paddingTop={"8px"} marginBottom={"16px"}>
                        <TextField
                            fullWidth={true}
                            value={filterTerm}
                            size="small"
                            label=""
                            onChange={(evt) => {
                                setPage(1);
                                setFilterTerm(evt.target.value);
                                filterValues(evt.target.value);
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CloseOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    setFilterTerm("");
                                                    setPage(1);
                                                    setFilteredArr([...arr]);
                                                }}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Grid2> 
                    <Grid2 size={12} padding={"4px"}>
                        {loading &&
                            <DataLoading dataLoadingSize="22vh" color={null} />
                        }
                    </Grid2>
                    {data && !loading && !error && filteredArr.length === 0 &&
                        <Grid2 container justifyContent={"center"} size={12}>
                            <Grid2>No results to display</Grid2>                            
                        </Grid2>
                    }
                    {data && !loading && !error && filteredArr.length > 0 &&
                        <Typography component="div">
                            <Grid2 paddingLeft={"4px"} container size={12} spacing={0} alignItems={"center"} >
                                {filteredArr.slice((page - 1) * perPage, (page * perPage)).map(
                                    (item: { id: string, label: string }) => (
                                        <React.Fragment key={item.id}>
                                            <Grid2 size={11}>
                                                {item.label}
                                            </Grid2>
                                            <Grid2 size={1}>
                                                {multiSelect === false &&
                                                    <Checkbox
                                                        icon={<RadioButtonUncheckedOutlinedIcon />}
                                                        checkedIcon={<RadioButtonCheckedIcon />}
                                                        checked={selectedId === item.id}
                                                        sx={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            if (selectedId === item.id) {
                                                                setSelectedId(null);
                                                            }
                                                            else {
                                                                setSelectedId(item.id);
                                                            }
                                                        }}
                                                    />
                                                }
                                                {multiSelect === true &&
                                                    <Checkbox
                                                        checked={selectedIds.has(item.id)}                                                        
                                                        onChange={(_, checked: boolean) => {
                                                            if(checked){
                                                                selectedIds.set(item.id, item.id);                                                                
                                                            }
                                                            else{
                                                                selectedIds.delete(item.id);
                                                            }
                                                            setSelectedIds(new Map(selectedIds));
                                                        }}
                                                    />
                                                }
                                            </Grid2>
                                            <Grid2 size={12}><Divider /></Grid2>
                                        </React.Fragment>
                                    )
                                )}
                            </Grid2>

                            <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                                <Grid2 size={12}>
                                    <TablePagination
                                        component={"div"}
                                        page={page - 1}
                                        rowsPerPage={perPage}
                                        count={arr.length}
                                        onPageChange={(_, page) => setPage(page + 1)}
                                        rowsPerPageOptions={[]}
                                    />
                                </Grid2>
                            </Grid2>
                        </Typography>

                    }
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()}>Cancel</Button>
                {multiSelect === false &&
                    <Button 
                        disabled={selectedId === null} 
                        onClick={() => { 
                            if(selectedId !== null){
                                onSelected(selectedId);
                             }
                             else{
                                setErrorMessage(helpText);
                             }
                        }}
                    >
                        {submitButtonText ? submitButtonText : "Submit"}
                    </Button>
                }
                {multiSelect === true &&
                    <Button disabled={selectedIds.size === 0} 
                        onClick={() => {                             
                            if(selectedIds.size > 0){
                                onSelected(Array.from(selectedIds.keys()));
                            }
                            else{
                                setErrorMessage(helpText);
                            }
                        }}
                    >
                        {submitButtonText ? submitButtonText : "Submit"}
                    </Button>
                }                
            </DialogActions>
        </>
    )

}

export default GeneralSelector;