"use client";
import { SEARCH_QUERY, USER_AUTHORIZATION_GROUP_QUERY, USER_TENANT_RELS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AuthorizationGroup, ObjectSearchResultItem, ObjectSearchResults, SearchFilterInputObjectType, SearchResultType, UserTenantRelView, PortalUserProfile } from "@/graphql/generated/graphql-types";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TablePagination, TextField } from "@mui/material";
import { AUTHORIZATION_GROUP_USER_ADD_MUTATION, AUTHORIZATION_GROUP_USER_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import TenantQuickInfo from "../tenants/tenant-quick-info";
import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, AUTHORIZATION_GROUP_USER_REMOVE_SCOPE } from "@/utils/consts";



export interface UserAuthorizationGroupConfigurationProps {
    userId: string
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const UserAuthorizationGroupConfiguration: React.FC<UserAuthorizationGroupConfigurationProps> = ({
    userId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = React.useState<boolean>(false);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);
    const [groupToAdd, setGroupToAdd] = React.useState<string | null>(null);
    const [groupToRemove, setGroupToRemove] = React.useState<string | null>(null);
    const [showTenantInfo, setShowTenantInfo] = React.useState<boolean>(false);
    const [tenantIdToShow, setTenantIdToShow] = React.useState<string | null>(null);
    const [canAddRel] = React.useState<boolean>(containsScope(AUTHORIZATION_GROUP_USER_ASSIGN_SCOPE, profile?.scope || []));
    const [canRemoveRel] = React.useState<boolean>(containsScope(AUTHORIZATION_GROUP_USER_REMOVE_SCOPE, profile?.scope || []));

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(USER_AUTHORIZATION_GROUP_QUERY, {
        variables: {
            userId: userId
        }
    });

    const [authorizationGroupUserAddMutation] = useMutation(AUTHORIZATION_GROUP_USER_ADD_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setShowAddDialog(false);
            setGroupToAdd(null);
        },
        onError(error) {
            onUpdateEnd(false);
            setShowAddDialog(false);
            setErrorMessage(error.message);
            setGroupToAdd(null);
        },
        refetchQueries: [USER_AUTHORIZATION_GROUP_QUERY]
    });

    const [authorizationGroupUserRemoveMutation] = useMutation(AUTHORIZATION_GROUP_USER_REMOVE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setShowAddDialog(false);
            setGroupToRemove(null);
        },
        onError(error) {
            onUpdateEnd(false);
            setShowAddDialog(false);
            setErrorMessage(error.message);
            setGroupToRemove(null);
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
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle>Select Authorization Group</DialogTitle>
                    <DialogContent>
                        <Typography component="div">
                            <AuthorizationGroupsAssignDialog
                                userId={userId}
                                existingGroups={data.getUserAuthorizationGroups.map(
                                    (authzGroup: AuthorizationGroup) => authzGroup.groupId
                                )}
                                onGroupSelected={(groupId: string | null) => {
                                    setGroupToAdd(groupId);
                                }}
                            />
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowAddDialog(false)}
                        >Cancel</Button>
                        <Button
                            disabled={groupToAdd === null}
                            onClick={() => {
                                onUpdateStart();
                                setShowAddDialog(false);
                                authorizationGroupUserAddMutation({
                                    variables: {
                                        userId: userId,
                                        groupId: groupToAdd
                                    }
                                });
                            }}
                        >Submit</Button>
                    </DialogActions>                    
                </Dialog>
            }
            {showRemoveDialog &&
                <Dialog
                    open={showRemoveDialog}
                    onClose={() => setShowRemoveDialog(false)}
                    maxWidth="xs"
                    fullWidth={true}
                >
                    <DialogContent>
                        Confirm removal of authorization group
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowRemoveDialog(false)}
                        >Cancel</Button>
                        <Button
                            disabled={groupToRemove === null}
                            onClick={() => {
                                onUpdateStart();
                                setShowRemoveDialog(false);
                                authorizationGroupUserRemoveMutation({
                                    variables: {
                                        userId: userId,
                                        groupId: groupToRemove
                                    }
                                }); 
                            }}
                        >Confirm</Button>
                    </DialogActions>                    
                </Dialog>
            }
            {showTenantInfo &&
                <Dialog
                    open={showTenantInfo}
                    onClose={() => setShowTenantInfo(false)}
                    maxWidth="xs"
                    fullWidth={true}
                >
                    <DialogContent>
                        <TenantQuickInfo tenantId={tenantIdToShow} />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowTenantInfo(false)}
                        >Close</Button>
                        
                    </DialogActions>                    
                </Dialog>
            }

            <Typography component={"div"} fontWeight={"bold"} >
                {errorMessage &&
                    <Grid2 marginBottom={"24px"} marginTop={"16px"} spacing={2} container size={12}>
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                    </Grid2>
                }
                {canAddRel &&                
                    <Grid2 marginBottom={"24px"} marginTop={"16px"} spacing={2} container size={12}>
                        <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                            <AddBoxIcon
                                sx={{cursor: "pointer"}}
                                onClick={() => setShowAddDialog(true)}
                            />
                            <div style={{marginLeft: "8px", fontWeight: "bold"}}>Assign User To Authorization Group</div>
                        </Grid2>                    
                    </Grid2>
                }
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                    <Grid2 size={9}>Group Name</Grid2>
                    {/** TODO display tenants only when in the ROOT tenant. All other types of users can only
                     * see users in their own tenant, and so no need to show which tenant.
                     */}
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
                (authzGroup: AuthorizationGroup) => (
                    <Typography key={`${authzGroup.groupId}`} component={"div"} >
                        <Divider></Divider>                        
                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                            <Grid2 size={9}>
                                <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authorization-groups/${authzGroup.groupId}`}
                                    target="_blank"
                                >
                                    {authzGroup.groupName}
                                </Link>
                            </Grid2>
                            
                            <Grid2 size={2}>
                                <InfoOutlinedIcon
                                    sx={{cursor: "pointer"}}
                                    onClick={() => {
                                        setTenantIdToShow(authzGroup.tenantId);
                                        setShowTenantInfo(true);
                                    }}
                                />
                            </Grid2>
                            <Grid2 minHeight={"26px"} size={1}>
                                {canRemoveRel &&
                                    <RemoveCircleOutlineIcon 
                                        onClick={() => {
                                            setGroupToRemove(authzGroup.groupId);
                                            setShowRemoveDialog(true);
                                        }}
                                        sx={{cursor: "pointer"}}
                                    />
                                }                                
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
    existingGroups: Array<string>,
    onGroupSelected: (groupId: string | null) => void
}

const AuthorizationGroupsAssignDialog: React.FC<AuthorizationGroupAssignDialogProps> = ({
    userId,
    existingGroups,
    onGroupSelected
}) => {


    // STATE VARIABLES
    const [selectedObjectId, setSelectedObjectId] = React.useState<string | null>(null);
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [page, setPage] = React.useState(1);


    // GRAPHQL FUNCTIONS
    const {data} = useQuery(USER_TENANT_RELS_QUERY, {
        variables: {
            userId: userId
        }
    });

    const { data: searchData, loading: searchLoading, previousData: searchPreviousData } = useQuery(SEARCH_QUERY, {
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
        // fetchPolicy: "no-cache",
        // nextFetchPolicy: "no-cache"
    });


    // HANDLER FUNCTIONS
    // @typescript-eslint/no-unused-vars
    // @typescript-eslint/no-explicit-any
    const handlePageChange = async (evt: any, page: number) => {
        setPage(page + 1);     
    }

    const isSelected = (groupId: string): boolean => {
        if(existingGroups.includes(groupId)){
            return true;
        }
        return false;
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
            <Typography component={"div"} fontWeight={"bold"} >
                <Grid2 container size={12} spacing={1} marginBottom={"16px"} paddingTop={"8px"}>
                    <Grid2 size={12}>
                        <TextField
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
                                            <CloseOutlinedIcon
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => { 
                                                    setFilterTerm("");
                                                    setPage(1);
                                                }}
                                            />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Grid2>                    
                </Grid2>
            </Typography>
            {!searchLoading && r.total < 1 &&
                <Typography component={"div"} >
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No groups to display
                    </Grid2>
                </Typography>
            }
            <Grid2 minHeight={"4vh"} sx={{ marginTop: "16px", padding: "8px" }} size={12}>
                {r.resultlist.map(
                    (item: ObjectSearchResultItem) => (
                        <React.Fragment key={`${item.objectid}`}>
                        <Typography  component={"div"} >
                            <Grid2 alignItems={"center"} container size={12} spacing={0}>
                                <Grid2 size={11}>
                                    {item.name}
                                </Grid2>                                
                                <Grid2 size={1}>
                                    {isSelected(item.objectid) &&
                                        <Checkbox
                                            icon={<DoneOutlinedIcon />}
                                            disabled={true}
                                        />
                                    }
                                    {!isSelected(item.objectid) && 
                                        <Checkbox 
                                            icon={<RadioButtonUncheckedOutlinedIcon />}
                                            checkedIcon={<RadioButtonCheckedIcon />}
                                            sx={{ cursor: "pointer" }}
                                            checked={selectedObjectId === item.objectid}
                                            onClick={() => {
                                                if (selectedObjectId === item.objectid) {
                                                    // onIdSelected(null);
                                                    setSelectedObjectId(null);
                                                    onGroupSelected(null);
                                                }
                                                else {
                                                    // onIdSelected(item.objectid);
                                                    setSelectedObjectId(item.objectid);
                                                    onGroupSelected(item.objectid);
                                                }
                                            }}

                                        />
                                    }
                                </Grid2>
                                
                            </Grid2>
                            <Divider />
                        </Typography>
                        </React.Fragment>
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