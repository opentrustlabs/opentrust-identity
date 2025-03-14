"use client";
import { FederatedOidcProviderDomainRel, RelSearchResultItem, RelSearchResults, SearchResultType } from "@/graphql/generated/graphql-types";
import { REL_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React, { useRef } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2, InputAdornment, Link, Stack, TablePagination, TextField, Typography } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { MAX_SEARCH_PAGE_SIZE } from "@/utils/consts";



export interface AuthenticationGroupUserConfigurationProps {
    authenticationGroupId: string,
    tenantId: string,
    page: number,
    perPage: number
}

const AuthenticationGroupUserConfiguration: React.FC<AuthenticationGroupUserConfigurationProps> = ({
    authenticationGroupId,
    tenantId,
    page: p,
    perPage: pp
}) => {


    // CONTEXT VARIABLES

    // STATE VARIABLES
    const perPage = pp && pp < MAX_SEARCH_PAGE_SIZE ? pp : 20;

    const [filterTerm, setFilterTerm] = React.useState<string | null>("");
    const [page, setPage] = React.useState<number>(p);

    const [userToAdd, setUserToAdd] = React.useState<string | null>(null);
    const [userToRemove, seUserToRemove] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [addErrorMessage, setAddErrorMessage] = React.useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = React.useState<boolean>(false);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const { data, loading, error, refetch, previousData } = useQuery(REL_SEARCH_QUERY, {
        variables: {
            relSearchInput: {
                parentid: authenticationGroupId,
                childtype: SearchResultType.User,
                page: p,
                perPage: perPage,
                term: ""
            }
        },
        fetchPolicy: "cache-first",
        nextFetchPolicy: "cache-first"
    });

    // HANDLER FUNCTIONS
    const handlePageChange = async (evt: any, newPage: number) => {
        setPage(newPage + 1);
        refetch({
            relSearchInput: {
                parentid: authenticationGroupId,
                childtype: SearchResultType.User,
                page: (newPage + 1),
                perPage: perPage,
                term: filterTerm
            }
        });
    }

    const handleFilterTermChange = async (evt: any) => {
        const term = evt.target.value || "";
        setFilterTerm(term);
        if (term && term.length >= 3) {
            setPage(1);
            refetch({
                relSearchInput: {
                    parentid: authenticationGroupId,
                    childtype: SearchResultType.User,
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
                    parentid: authenticationGroupId,
                    childtype: SearchResultType.User,
                    page: 1,
                    perPage: perPage,
                    term: ""
                }
            });
        }
    }

    return (
        <Typography component="div">
            <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <AddBoxIcon
                        sx={{ cursor: "pointer" }}
                        onClick={() => setShowAddDialog(true)}
                    />
                    <div style={{ marginLeft: "8px", fontWeight: "bold" }}>Add User</div>
                </Grid2>
            </Grid2>
            <Stack spacing={1} justifyContent={"space-between"} direction={"row"} fontWeight={"bold"} margin={"24px 0px 24px 0px"}>
                <div style={{ display: "inline-flex", alignItems: "center" }}>
                    <TextField
                        label={"Filter users"}
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
                                            onClick={() => { setFilterTerm(""); setPage(1) }}
                                        />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </div>
            </Stack>
            {loading && !previousData &&
                <DataLoading dataLoadingSize="44vh" color={null} />
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
                >
                    <DialogContent>
                        <Typography component="div">
                            <span>Confirm removal of user: </span><span style={{ fontWeight: "bold" }}>{""}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {

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
                    <DialogTitle>Search users</DialogTitle>
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
                                <UserRelSearch
                                    authnId={authenticationGroupId}
                                    tenantId={tenantId}
                                    onUserSelected={
                                        (userId: string | null) => {
                                            setUserToAdd(userId);
                                        }
                                    }
                                />
                            </Grid2>
                        </Grid2>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setUserToAdd(null);
                            setShowAddDialog(false);
                            setAddErrorMessage(null);
                        }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {

                            }}
                            disabled={
                                userToAdd === null
                            }
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            }

            <Divider />
            {loading && previousData &&
                <UserList
                    relSearchResults={previousData.relSearch}
                />
            }
            {data &&
                <UserList
                    relSearchResults={loading && previousData ? previousData.relSearch : data.relSearch}
                />
            }
            <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                <Grid2 size={12}>
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
                </Grid2>
            </Grid2>
        </Typography>
    )
}

interface UserRelSearchProps {
    authnId: string,
    tenantId: string,
    onUserSelected: (userId: string | null) => void
}

const UserRelSearch: React.FC<UserRelSearchProps> = ({
    authnId,
    tenantId,
    onUserSelected
}) => {

    // STATE VARIABLES
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);

    // GRAPHQL FUNCTIONS
    const { data, loading, error, refetch, previousData } = useQuery(REL_SEARCH_QUERY, {
        variables: {
            relSearchInput: {
                parentid: tenantId,
                childtype: SearchResultType.User,
                page: 1,
                perPage: 10,
                term: searchTerm
            }
        },
        skip: searchTerm.length < 3,
        fetchPolicy: "cache-first",
        nextFetchPolicy: "cache-first"
    });

    const { data: childData } = useQuery(REL_SEARCH_QUERY, {
        variables: {
            relSearchInput: {
                parentid: authnId,
                childtype: SearchResultType.User,
                page: 1,
                perPage: 10,
                term: searchTerm
            }
        },
        skip: searchTerm.length < 3,
        fetchPolicy: "cache-first",
        nextFetchPolicy: "cache-first"
    });

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

    return (
        <Typography component="div">
            <Grid2 container size={12}>
                <Grid2 size={12}>
                    <TextField
                        fullWidth={true}
                        onChange={(evt) => {
                            setSelectedUserId(null);
                            onUserSelected(null);
                            setSearchTerm(evt.target.value);
                        }}
                        size="small"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon
                                            onClick={() => console.log('searching users')}
                                            sx={{ cursor: "pointer" }}
                                        />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </Grid2>
                <Grid2 minHeight={"12vh"} sx={{ marginTop: "16px", padding: "8px" }} size={12}>
                    {data && data.relSearch.total > 0 &&
                        <>
                            {data.relSearch.resultlist.map(
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
                                                            checked={selectedUserId === item.childid}
                                                            onClick={() => {
                                                                if (selectedUserId === item.childid) {
                                                                    onUserSelected(null);
                                                                    setSelectedUserId(null);
                                                                }
                                                                else {
                                                                    onUserSelected(item.childid);
                                                                    setSelectedUserId(item.childid);
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
        </Typography>
    )

}



interface UserListProps {
    relSearchResults: RelSearchResults
}
const UserList: React.FC<UserListProps> = ({
    relSearchResults
}) => {

    return (
        <>
            {relSearchResults.total > 0 &&
                <Grid2 spacing={1} container size={12}>
                    {relSearchResults.resultlist.map(
                        (item: RelSearchResultItem) => (
                            <React.Fragment key={item.childid}>
                                <Grid2 size={12}><Divider /></Grid2>
                                <Grid2 size={11}>
                                    {item.childname}
                                </Grid2>
                                <Grid2 size={1}>
                                    <RemoveCircleOutlineIcon
                                        sx={{ cursor: "pointer" }}
                                    />
                                </Grid2>
                            </React.Fragment>
                        )
                    )}
                </Grid2>
            }
            {relSearchResults.total === 0 &&
                <Grid2 marginTop={"16px"} spacing={2} container size={12} textAlign={"center"} >
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No users found
                    </Grid2>
                </Grid2>
            }
        </>
    )


}

export default AuthenticationGroupUserConfiguration;