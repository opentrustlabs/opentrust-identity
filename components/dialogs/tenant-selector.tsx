"use client";
import { SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Button, Checkbox, DialogActions, DialogContent, DialogTitle, Divider, Grid2, InputAdornment, TablePagination, TextField, Typography } from "@mui/material";
import { ObjectSearchResultItem, SearchResultType, Tenant } from "@/graphql/generated/graphql-types";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';


export interface TenantSelectorProps {
    onCancel: () => void,
    onSelected: (tenantId: string) => void,
    existingTenantIds?: Array<string>
    submitButtonText?: string
}

const TenantSelector: React.FC<TenantSelectorProps> = ({
    onCancel,
    onSelected,
    existingTenantIds,
    submitButtonText
}) => {


    const perPage: number = 10;

    // STATE VARIALBES
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [page, setPage] = React.useState<number>(1);
    const [selectedTenant, setSelectedTenant] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);


    let { data, loading, error, previousData } = useQuery(SEARCH_QUERY, {
        variables: {
            searchInput: {
                term: filterTerm,
                page: page,
                perPage: perPage,
                resultType: SearchResultType.Tenant,
                sortDirection: "asc",
                sortField: "name"
            }
        },
        skip: (filterTerm.length === 1 || filterTerm.length === 2)
    });

    // HANDLER FUNCTIONS
    const isExistingTenant = (tenantId: string): boolean => {
        if (!existingTenantIds) {
            return false;
        }
        if (existingTenantIds.length === 0) {
            return false;
        }
        if (existingTenantIds.includes(tenantId)) {
            return true;
        }
        return false;
    }

    const handlePageChange = async (evt: any, newPage: number) => {
        setPage(newPage + 1);
    }

    const getSearchResultItems = (): Array<ObjectSearchResultItem> => {
        if (loading && previousData) {
            return previousData.search.resultlist;
        }
        if (data && data.search) {
            return data.search.resultlist;
        }
        else return [];
    }

    return (
        <>
            <DialogTitle>Select Tenant</DialogTitle>
            <DialogContent>
                <Typography component="div">
                    {errorMessage &&
                        <div>{errorMessage}</div>
                    }
                    <Grid2 container size={12} paddingTop={"8px"} marginBottom={"16px"}>
                        <TextField
                            fullWidth={true}
                            value={filterTerm}
                            size="small"
                            label="Filter Tenants"
                            onChange={(evt) => {
                                setPage(1);
                                setFilterTerm(evt.target.value);
                                setSelectedTenant(null);
                            }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CloseOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    setFilterTerm("");

                                                }}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Grid2>
                    <Grid2 size={12} padding={"4px"}>
                        {loading && !previousData &&
                            <DataLoading dataLoadingSize="22vh" color={null} />
                        }
                        {error &&
                            <ErrorComponent message={error.message} componentSize={"sm"} />
                        }
                        {!error && !loading &&
                            <>
                                {getSearchResultItems().map(
                                    (item: ObjectSearchResultItem) => 
                                        {
                                            const existingTenant: boolean = isExistingTenant(item.objectid);
                                            return (<React.Fragment key={item.objectid}>
                                                        <Typography component="div">
                                                            <Grid2 spacing={0} alignItems={"center"} container size={12}>
                                                                <Grid2 size={11}>
                                                                    {item.name}
                                                                </Grid2>
                                                                <Grid2 size={1}>
                                                                    {!existingTenant &&
                                                                        <Checkbox
                                                                            icon={<RadioButtonUncheckedOutlinedIcon />}
                                                                            checkedIcon={<RadioButtonCheckedIcon />}
                                                                            sx={{ cursor: "pointer" }}
                                                                            checked={selectedTenant === item.objectid}
                                                                            onClick={() => {
                                                                                if (selectedTenant === item.objectid) {
                                                                                    setSelectedTenant(null);
                                                                                    // onIdSelected(null);
                                                                                    // setSelectedObjectId(null);
                                                                                }
                                                                                else {
                                                                                    // onIdSelected(item.childid);
                                                                                    // setSelectedObjectId(item.childid);
                                                                                    setSelectedTenant(item.objectid);
                                                                                }
                                                                            }}
                                                                        />
                                                                    }
                                                                    {existingTenant &&
                                                                        <Checkbox
                                                                            icon={<DoneOutlinedIcon />}
                                                                            disabled={true}
                                                                        />
                                                                    }

                                                                </Grid2>
                                                                <Grid2 size={12}><Divider /></Grid2>
                                                            </Grid2>
                                                        </Typography>
                                                    </React.Fragment>
                                                )
                                    
                                    }
                                )}
                            </>
                        }
                        {!data || !data.search &&
                            <div>No results to display</div>
                        }
                    </Grid2>
                </Typography>
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                    <Grid2 size={12}>
                        {loading && previousData &&
                            <TablePagination
                                component={"div"}
                                page={page - 1}
                                rowsPerPage={perPage}
                                count={previousData.search.total}
                                onPageChange={handlePageChange}
                                rowsPerPageOptions={[]}
                            />
                        }
                        {data &&
                            <TablePagination
                                component={"div"}
                                page={page - 1}
                                rowsPerPage={perPage}
                                count={data.search.total}
                                onPageChange={handlePageChange}
                                rowsPerPageOptions={[]}
                            />
                        }
                    </Grid2>
                </Grid2>

            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCancel()}>Cancel</Button>
                <Button disabled={selectedTenant === null}
                    onClick={() => {
                        if (selectedTenant !== null) {
                            onSelected(selectedTenant);
                        }
                        else {
                            setErrorMessage("Select a valid tenant");
                        }
                    }}
                >
                    {submitButtonText &&
                        submitButtonText
                    }
                    {!submitButtonText &&
                        "Next"
                    }

                </Button>
            </DialogActions>

        </>
    )

}

export default TenantSelector;