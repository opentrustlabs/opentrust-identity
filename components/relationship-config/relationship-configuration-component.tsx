"use client";
import { RelSearchInput, RelSearchResultItem, RelSearchResults, SearchFilterInput, SearchFilterInputObjectType, SearchResultType } from "@/graphql/generated/graphql-types";
import { REL_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2, InputAdornment, Stack, TablePagination, TextField, Typography } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { DEFAULT_SEARCH_PAGE_SIZE, MAX_SEARCH_PAGE_SIZE } from "@/utils/consts";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";



export interface RelationshipConfigurationComponentProps {
    relSearchInput: RelSearchInput,
    tenantId: string,
    canAdd: boolean,
    canDelete: boolean,
    addObjectText: string,
    filterObjectsText: string,
    searchObjectsText: string,
    confirmRemovalText: string,
    noObjectsFoundText: string,
    onRemove: (id: string) => void,
    onAdd: (id: string) => void
}

const RelationshipConfigurationComponent: React.FC<RelationshipConfigurationComponentProps> = ({
    relSearchInput,
    tenantId,
    canAdd,
    canDelete,
    addObjectText,
    filterObjectsText,
    searchObjectsText,
    confirmRemovalText,
    noObjectsFoundText,
    onRemove,
    onAdd
}) => {

    // CONTEXT VARIABLES

    // STATE VARIABLES
    const perPage = relSearchInput && relSearchInput.perPage < MAX_SEARCH_PAGE_SIZE ? relSearchInput.perPage : DEFAULT_SEARCH_PAGE_SIZE;

    const [filterTerm, setFilterTerm] = React.useState<string | null>(relSearchInput.term || "");
    const [page, setPage] = React.useState<number>(relSearchInput.page);    
    const [idToAdd, setIdToAdd] = React.useState<string | null>(null);
    const [idToRemove, seIdToRemove] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [addErrorMessage, setAddErrorMessage] = React.useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = React.useState<boolean>(false);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const { data, loading, error, refetch, previousData } = useQuery(REL_SEARCH_QUERY, {
        variables: {
            relSearchInput: {
                parentid: relSearchInput.parentid,
                childtype: relSearchInput.childtype,
                page: page,
                perPage: perPage,
                term: filterTerm
            }
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });

    // HANDLER FUNCTIONS
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePageChange = async (evt: any, newPage: number) => {
        setPage(newPage + 1);
        refetch({
            relSearchInput: {
                parentid: relSearchInput.parentid,
                childtype: relSearchInput.childtype,
                page: (newPage + 1),
                perPage: perPage,
                term: filterTerm
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFilterTermChange = async (evt: any) => {
        const term = evt.target.value || "";
        setFilterTerm(term);
        if (term && term.length >= 3) {
            setPage(1);
            refetch({
                relSearchInput: {
                    parentid: relSearchInput.parentid,
                    childtype: relSearchInput.childtype,
                    page: 1,
                    perPage: perPage,
                    term: term
                }
            });
        }
        if (!term || term.length < 3) {
            setPage(1);
            refetch({
                relSearchInput: {
                    parentid: relSearchInput.parentid,
                    childtype: relSearchInput.childtype,
                    page: 1,
                    perPage: perPage,
                    term: ""
                }
            });
        }
    }

    // For user names, 
    const usernameFormatter = (name: string): string => {
        return name.replace(/\s+/, ", ");        
    }

    return (
        <Typography component="div">
            {canAdd &&
                <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                    <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                        <AddBoxIcon
                            sx={{ cursor: "pointer" }}
                            onClick={() => setShowAddDialog(true)}
                        />
                        <div style={{ marginLeft: "8px", fontWeight: "bold" }}>{addObjectText}</div>                    
                    </Grid2>
                </Grid2>
            }
            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"24px 0px 24px 0px"}>
                <div style={{ display: "inline-flex", alignItems: "center" }}>
                    <TextField
                        label={filterObjectsText}
                        size={"small"}
                        name={"filter"}
                        value={filterTerm}
                        onChange={handleFilterTermChange}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <CloseOutlinedIcon
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => { setFilterTerm(""); setPage(1); }}
                                        />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </div>
            </Stack>
            {loading && !previousData &&
                <DataLoading dataLoadingSize="24vh" color={null} />
            }
            {error &&
                <ErrorComponent message={error.message || "Unknown Error Occurred."} componentSize='lg' />
            }
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
            }
            {showRemoveDialog &&
                <Dialog
                    open={showRemoveDialog}
                    onClose={() => setShowRemoveDialog(false)}
                    maxWidth="xs"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography component="div">
                            <span>{confirmRemovalText}</span><span style={{ fontWeight: "bold" }}>{""}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setShowRemoveDialog(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if(idToRemove){
                                    onRemove(idToRemove);
                                }
                                setShowRemoveDialog(false);
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
                    <DialogTitle>{searchObjectsText}</DialogTitle>
                    <DialogContent>
                        <Grid2 spacing={2} container size={12}>
                            {addErrorMessage &&
                                <Grid2 size={12}>
                                    <Alert onClose={() => setAddErrorMessage(null)} severity="error">
                                        <div>{addErrorMessage}</div>

                                    </Alert>
                                </Grid2>
                            }
                            <Grid2 size={12}>
                                {relSearchInput.parentid && relSearchInput.childtype &&
                                    <RelSearch
                                        parentType={relSearchInput.parenttype}
                                        parentId={relSearchInput.parentid || ""}
                                        tenantId={tenantId}
                                        childType={relSearchInput.childtype}
                                        onIdSelected={
                                            (id: string | null) => {
                                                setIdToAdd(id);
                                            }
                                        }
                                    />
                                }                                
                            </Grid2>
                        </Grid2>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setIdToAdd(null);
                            setShowAddDialog(false);
                            setAddErrorMessage(null);
                        }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowAddDialog(false)
                                if(idToAdd){
                                    onAdd(idToAdd);
                                }
                            }}
                            disabled={
                                idToAdd === null
                            }
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            
            {loading && previousData &&
                <RelList
                    relSearchResults={previousData.relSearch}
                    noObjectsFoundText={noObjectsFoundText}
                    removeRelAction={(id: string) => {
                        seIdToRemove(id);
                        setShowRemoveDialog(true);
                    }}
                    nameFormatter={relSearchInput.childtype === SearchResultType.User ? usernameFormatter : undefined}
                    canDelete={canDelete}
                />
            }
            {data &&
                <RelList
                    relSearchResults={data.relSearch}
                    noObjectsFoundText={noObjectsFoundText}
                    removeRelAction={(id: string) => {
                        seIdToRemove(id);
                        setShowRemoveDialog(true);
                    }}
                    nameFormatter={relSearchInput.childtype === SearchResultType.User ? usernameFormatter : undefined}
                    canDelete={canDelete}
                />
            }
            {loading && previousData &&
                <TablePagination
                    component={"div"}
                    page={page - 1}
                    rowsPerPage={perPage}
                    count={previousData.relSearch.total}
                    onPageChange={handlePageChange}
                    rowsPerPageOptions={[]}
                />
            }
            {data &&
                <TablePagination
                    component={"div"}
                    page={page - 1}
                    rowsPerPage={perPage}
                    count={data.relSearch.total}
                    onPageChange={handlePageChange}
                    rowsPerPageOptions={[]}
                />
            }
        </Typography>
    )
}

interface RelSearchProps {
    parentType?: SearchResultType | null,
    parentId: string,
    tenantId: string,
    childType: SearchResultType,
    onIdSelected: (objectId: string | null) => void
}

const RelSearch: React.FC<RelSearchProps> = ({
    parentId,
    tenantId,
    childType,
    onIdSelected
}) => {

    // CONTEXT HOOKS
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    
    // STATE VARIABLES
    const [page, setPage] = React.useState<number>(1);
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const [selectedObjectId, setSelectedObjectId] = React.useState<string | null>(null);

    // GRAPHQL FUNCTIONS
    const filters: Array<SearchFilterInput> = [];

    filters.push({
        objectType: SearchFilterInputObjectType.TenantId,
        objectValue: tenantBean.getTenantMetaData().tenant.tenantId
    });



    const { data, loading, previousData, error } = useQuery(REL_SEARCH_QUERY, {
        variables: {
            relSearchInput: {
                parentid: tenantId,
                childtype: childType,
                page: page,
                perPage: 10,
                term: searchTerm
            }
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });

    const shouldSkip = (): boolean => {
        let skip = false;
        if(loading){
            skip = true;
        }
        else if(error !== undefined){
            skip = true;
        }
        else if(data === null || data === undefined){
            skip = true;
        }
        return skip;
    }

    const { data: childData, loading: childDataLoading } = useQuery(REL_SEARCH_QUERY, {
        variables: {
            relSearchInput: {
                parentid: parentId,
                childtype: childType,
                page: 1,
                perPage: 10,
                childids: data ? data.relSearch.resultlist.map( (item: RelSearchResultItem) => item.childid) : []
            }
        }, 
        skip: shouldSkip(),
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });


    // HANDLER FUNCTIONS
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePageChange = async (evt: any, newPage: number) => {
        setPage(newPage + 1);
    }

    const isSelected = (userId: string): boolean => {
        if (childData) {
            const existing: Array<RelSearchResultItem> = childData.relSearch.resultlist;
            const isSelected = existing.find(
                (r: RelSearchResultItem) => r.childid === userId
            )
            if (isSelected) {
                return true;
            }
            return false;
        }
        return false
    }

    const getSearchResults = () => {
        if(loading && previousData){
            return previousData
        }
        else if(data){
            return data;
        }
    }

    return (
        <Typography component="div">
            <Grid2 container size={12}>
                <Grid2 size={12}>
                    <TextField
                        fullWidth={true}
                        value={searchTerm}
                        onChange={(evt) => {
                            setSelectedObjectId(null);
                            onIdSelected(null);
                            setSearchTerm(evt.target.value);
                            setPage(1);
                        }}
                        autoFocus={true}
                        size="small"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <CloseOutlinedIcon
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => {
                                                setPage(1);
                                                setSearchTerm("");
                                            }}
                                        />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </Grid2>
                <Grid2 sx={{ marginTop: "16px", padding: "8px" }} size={12}>
                    { (loading || childDataLoading) &&
                        <DataLoading dataLoadingSize="24vh" color={null} />
                    }
                    {!loading && !childDataLoading && ((data && data.relSearch.total > 0) || (previousData && previousData.relSearch.total > 0)) && childData &&
                        <>
                            {getSearchResults().relSearch.resultlist.map(
                                (item: RelSearchResultItem) => (
                                    <React.Fragment key={item.childid}>
                                        <Typography component="div">
                                            <Grid2 spacing={2} alignItems={"center"} sx={{ borderBottom: "solid 1px lightgrey" }} container size={12}>
                                                <Grid2 size={11}>
                                                    {item.childname}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    {isSelected(item.childid) &&
                                                        <Checkbox
                                                            icon={<DoneOutlinedIcon />}
                                                            disabled={true}
                                                        />
                                                    }
                                                    {!isSelected(item.childid) &&
                                                        <Checkbox
                                                            icon={<RadioButtonUncheckedOutlinedIcon />}
                                                            checkedIcon={<RadioButtonCheckedIcon />}
                                                            sx={{ cursor: "pointer" }}
                                                            checked={selectedObjectId === item.childid}
                                                            onClick={() => {
                                                                if (selectedObjectId === item.childid) {
                                                                    onIdSelected(null);
                                                                    setSelectedObjectId(null);
                                                                }
                                                                else {
                                                                    onIdSelected(item.childid);
                                                                    setSelectedObjectId(item.childid);
                                                                }
                                                            }}
                                                        />
                                                    }
                                                </Grid2>
                                            </Grid2>
                                        </Typography>
                                    </React.Fragment>
                                )
                            )}
                        </>
                    }
                </Grid2>
                                                          
            </Grid2>
            {loading && previousData &&
                <TablePagination
                    component={"div"}
                    page={page - 1}
                    rowsPerPage={10}
                    count={previousData.relSearch.total}
                    onPageChange={handlePageChange}
                    rowsPerPageOptions={[]}
                />
            }
            {data &&
                <TablePagination
                    component={"div"}
                    page={page - 1}
                    rowsPerPage={10}
                    count={data.relSearch.total}
                    onPageChange={handlePageChange}
                    rowsPerPageOptions={[]}
                />
            }   
        </Typography>
    )

}



interface RelListProps {
    relSearchResults: RelSearchResults,
    noObjectsFoundText: string,
    removeRelAction: (id: string) => void,
    nameFormatter?: (name: string) => string,
    canDelete: boolean
}
const RelList: React.FC<RelListProps> = ({
    relSearchResults,
    noObjectsFoundText,
    removeRelAction,
    nameFormatter,
    canDelete
}) => {

    return (
        <>
            <Grid2 marginTop={"16px"} marginBottom={"16px"} spacing={1} container size={12} fontWeight={"bold"}>
                <Grid2 size={11}>Name</Grid2>
                <Grid2 size={1}></Grid2>
            </Grid2>
            <Divider />
            
            {relSearchResults.total > 0 &&
                <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                        {relSearchResults.resultlist.map(
                            (item: RelSearchResultItem) => (
                                <React.Fragment key={item.childid}>
                                    
                                    <Grid2 size={11}>
                                        { nameFormatter ? nameFormatter(item.childname) : item.childname}
                                    </Grid2>
                                    <Grid2 minHeight={"26px"} size={1}>
                                        {canDelete &&
                                            <RemoveCircleOutlineIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => removeRelAction(item.childid)}
                                            />
                                        }
                                    </Grid2>
                                    <Grid2 size={12}><Divider /></Grid2>
                                </React.Fragment>
                            )
                        )}
                </Grid2>
            }
            {relSearchResults.total === 0 &&
                <Grid2 marginTop={"16px"} spacing={2} container size={12} textAlign={"center"} >
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        {noObjectsFoundText}
                    </Grid2>
                </Grid2>
            }
        </>
    )


}

export default RelationshipConfigurationComponent;