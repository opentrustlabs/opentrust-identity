"use client";
import { SEARCH_QUERY, USER_AUTHORIZATION_GROUP_QUERY, USER_TENANT_RELS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import GradeIcon from '@mui/icons-material/Grade';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { AuthorizationGroup, ObjectSearchResultItem, ObjectSearchResults, SearchFilterInputObjectType, SearchResultType, UserTenantRelView } from "@/graphql/generated/graphql-types";
import { DEFAULT_BACKGROUND_COLOR, MAX_SEARCH_PAGE_SIZE, USER_TENANT_REL_TYPE_GUEST, USER_TENANT_REL_TYPE_PRIMARY, USER_TENANT_REL_TYPES_DISPLAY } from "@/utils/consts";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Pagination, TablePagination, TextField, Tooltip } from "@mui/material";
import { USER_TENANT_REL_REMOVE_MUTATION, USER_TENANT_REL_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import AuthorizationGroupList from "../authorization-groups/authorization-group-list";


export interface UserAuthorizationGroupConfigurationProps {
    userId: string
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

const UserAuthorizationGroupConfiguration: React.FC<UserAuthorizationGroupConfigurationProps> = ({
    userId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = React.useState<boolean>(false);

    const {data, loading, error} = useQuery(USER_AUTHORIZATION_GROUP_QUERY, {
        variables: {
            userId: userId
        }
    });

    const [assignUserToTenantMutation] = useMutation(USER_TENANT_REL_UPDATE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message)
        },
        refetchQueries: [USER_AUTHORIZATION_GROUP_QUERY]
    });

    const [removeUserFromTenantMutation] = useMutation(USER_TENANT_REL_REMOVE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message)
        },
        refetchQueries: [USER_AUTHORIZATION_GROUP_QUERY]
    });


    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    
    return (
        <>
            {showAddDialog &&
                <Dialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    maxWidth="xs"
                    fullWidth={true}
                >
                    <DialogContent>
                        <AuthorizationGroupsAssignDialog
                            userId={userId}
                            existingGroups={data.getUserAuthorizationGroups.map(
                                (authnGroup: AuthorizationGroup) => authnGroup.groupId
                            )}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowAddDialog(false)}
                        >Cancel</Button>
                    </DialogActions>
                    
                </Dialog>
            }

            <Typography component={"div"} fontWeight={"bold"} >
                <Grid2 marginBottom={"24px"} marginTop={"16px"} spacing={2} container size={12}>
                    <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                        <AddBoxIcon
                            sx={{cursor: "pointer"}}
                            onClick={() => setShowAddDialog(true)}
                        />
                        <div style={{marginLeft: "8px", fontWeight: "bold"}}>Assign Authorization Group</div>
                    </Grid2>                    
                </Grid2>
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                    <Grid2 size={4}>Group Name</Grid2>
                    <Grid2 size={5}>Description</Grid2>
                    <Grid2 size={2}>Tenant</Grid2>
                    <Grid2 size={1}></Grid2>                                                                                        
                </Grid2>
                <Divider />
                {data.getUserAuthorizationGroups.length === 0 &&
                    <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                        <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                            No authorization groups
                        </Grid2>
                    </Grid2>
                }
                
            </Typography>
            
            
            {data.getUserAuthorizationGroups.map(                                            
                (authnGroup: AuthorizationGroup) => (
                    <Typography key={`${authnGroup.groupId}`} component={"div"} fontSize={"0.9em"} fontWeight={"bold"}>
                        <Divider></Divider>                        
                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                            <Grid2 size={4}>{authnGroup.groupName}</Grid2>                            
                            <Grid2 size={5}>{authnGroup.groupDescription}</Grid2>
                            <Grid2 size={2}>{authnGroup.tenantId}</Grid2>
                            <Grid2 size={1}>                                
                                    <RemoveCircleOutlineIcon 
                                        onClick={() => {
                                            // onUpdateStart();
                                            // removeUserFromTenantMutation({
                                            //     variables: {
                                            //         userId: userTenantRelView.userId,
                                            //         tenantId: userTenantRelView.tenantId
                                            //     }
                                            // })
                                        }}
                                        sx={{cursor: "pointer"}}
                                    />
                                
                            </Grid2>
                        </Grid2>
                    </Typography>                                                
                )
            )}
        
        </>
    )
}


interface AuthorizationGroupAssignDialogProps {
    userId: string,
    existingGroups: Array<string>
}

const AuthorizationGroupsAssignDialog: React.FC<AuthorizationGroupAssignDialogProps> = ({
    userId
}) => {


    // STATE VARIABLES
    const [selectedObjectId, setSelectedObjectId] = React.useState<string | null>(null);
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [page, setPage] = React.useState(1);

    const {data, loading, error} = useQuery(USER_TENANT_RELS_QUERY, {
        variables: {
            userId: userId
        }
    });

    let { data: searchData, loading: searchLoading, error: searchError, previousData: searchPreviousData } = useQuery(SEARCH_QUERY, {
        variables: {
            searchInput: {
                term: filterTerm,
                filters: data.getUserTenantRels.map( (userTenantRelView: UserTenantRelView) => { return {objectType: SearchFilterInputObjectType.TenantId, objectValue: userTenantRelView.tenantId}}),
                page: 1,
                perPage: 10,
                resultType: SearchResultType.AuthorizationGroup
            }
        },
        skip: !data,
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });

    const handlePageChange = async (evt: any, page: number) => {
        setPage(page + 1);     
    }


    {
        const r: ObjectSearchResults = searchLoading && searchPreviousData ? searchPreviousData.search : searchData ? searchData.search : {
            endtime: 0,
            page: 1,
            perpage: 10,
            resultlist:[],
            starttime: 0,
            took: 0,
            total: 0
        };
        
        return (
        <>
            <Typography component={"div"} fontWeight={"bold"} fontSize={"0.9em"}>
                <Grid2 container size={12} spacing={1} marginBottom={"16px"} >
                    <Grid2 size={12}>
                        <TextField
                            autoFocus={true}
                            label={"Filter"}
                            fullWidth={true}
                            size={"small"}
                            name={"filter"}
                            value={filterTerm}
                            onChange={(evt) => {setFilterTerm(evt.target.value)}}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => { setFilterTerm(""); }}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Grid2>                    
                </Grid2>
            </Typography>
            <Divider></Divider>
            {r.total < 1 &&
                <Typography component={"div"} fontSize={"0.9em"}>
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No groups to display
                    </Grid2>
                </Typography>
            }
            {/* {searchData.search.total > 0 &&
                <Autocomplete 
                    sx={{paddingTop: "8px"}}
                    renderInput={(params) => <TextField {...params} label="Select Tenant" />}
                    options={createTenantOptions()}
                    onChange={ (_, value: any) => setSelectedTenant(value.id)}
                />
            } */}
            <Grid2 minHeight={"4vh"} sx={{ marginTop: "16px", padding: "8px" }} size={12}>
            {r.resultlist.map(
                (item: ObjectSearchResultItem) => (
                    <Typography key={`${item.objectid}`} component={"div"} fontSize={"0.9em"}>
                        <Grid2 alignItems={"center"} container size={12} spacing={1}>
                            <Grid2 size={11}>
                                {item.name}
                            </Grid2>
                            <Grid2 size={1}>
                                <Checkbox 
                                    icon={<RadioButtonUncheckedOutlinedIcon />}
                                    checkedIcon={<RadioButtonCheckedIcon />}
                                    sx={{ cursor: "pointer" }}
                                    checked={selectedObjectId === item.objectid}
                                    onClick={() => {
                                        if (selectedObjectId === item.objectid) {
                                            // onIdSelected(null);
                                            setSelectedObjectId(null);
                                        }
                                        else {
                                            // onIdSelected(item.objectid);
                                            setSelectedObjectId(item.objectid);
                                        }
                                    }}

                                />
                            </Grid2>
                            
                        </Grid2>
                        <Divider />
                    </Typography>
                )
            )}
            </Grid2>
            <TablePagination
                component={"div"}
                page={page - 1}
                rowsPerPage={10}
                count={r.total}
                onPageChange={handlePageChange}
                rowsPerPageOptions={[]}
            />
        </>
        
        
    )
    }
}

export default UserAuthorizationGroupConfiguration;