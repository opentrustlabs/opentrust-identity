"use client";
import { AUTHENTICATION_GROUPS_QUERY, SEARCH_QUERY, USER_TENANT_RELS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext, useImperativeHandle, forwardRef  } from "react";
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
import { AuthenticationGroup, ObjectSearchResultItem, ObjectSearchResults, SearchFilterInputObjectType, SearchResultType, UserTenantRelView, PortalUserProfile } from "@/graphql/generated/graphql-types";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, TablePagination, TextField } from "@mui/material";
import { AUTHENTICATION_GROUP_USER_ADD_MUTATION, AUTHENTICATION_GROUP_USER_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import TenantQuickInfo from "../tenants/tenant-quick-info";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Link from "next/link";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { useIntl } from 'react-intl';

export interface UserAuthenticationGroupConfigurationProps {
    userId: string
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

export interface UserAuthenticationGroupConfigurationRef {
    refetch: () => void;
}


const UserAuthenticationGroupConfiguration = forwardRef<
    UserAuthenticationGroupConfigurationRef,
    UserAuthenticationGroupConfigurationProps
    
>(({
    userId,
    onUpdateEnd,
    onUpdateStart
}, ref) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();


    // STATE VARIABLES
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = React.useState<boolean>(false);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);
    const [groupToAdd, setGroupToAdd] = React.useState<string | null>(null);
    const [groupToRemove, setGroupToRemove] = React.useState<string | null>(null);
    const [showTenantInfo, setShowTenantInfo] = React.useState<boolean>(false);
    const [tenantIdToShow, setTenantIdToShow] = React.useState<string | null>(null);
    const [canAddRel] = React.useState<boolean>(containsScope(AUTHENTICATION_GROUP_USER_ASSIGN_SCOPE, profile?.scope || []));
    const [canRemoveRel] = React.useState<boolean>(containsScope(AUTHENTICATION_GROUP_USER_REMOVE_SCOPE, profile?.scope || []));


    // GRAPHQL FUNCTIONS
    const {data, loading, error, refetch} = useQuery(AUTHENTICATION_GROUPS_QUERY, {
        variables: {
            userId: userId
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });

    const [authenticationGroupUserAddMutation] = useMutation(AUTHENTICATION_GROUP_USER_ADD_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setShowAddDialog(false);
            setGroupToAdd(null);
            refetch();
        },
        onError(error) {            
            onUpdateEnd(false);
            setShowAddDialog(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
            setGroupToAdd(null);
        }
    });

    const [authenticationGroupUserRemoveMutation] = useMutation(AUTHENTICATION_GROUP_USER_REMOVE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setShowAddDialog(false);
            setGroupToRemove(null);
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setShowAddDialog(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
            setGroupToRemove(null);
        }
    });

    useImperativeHandle(ref, () => ({
        refetch: () => {
            refetch();
        }
    }));


    if (loading) return <DataLoading dataLoadingSize="sm" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='sm' />
    
    return (
        <>
            {showAddDialog &&
                <Dialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle>Select Authentication Group</DialogTitle>
                    <DialogContent>
                        <Typography component="div">
                        <AuthenticationGroupsAssignDialog
                            userId={userId}
                            existingGroups={data.getAuthenticationGroups.map(
                                (authnGroup: AuthenticationGroup) => authnGroup.authenticationGroupId
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
                                authenticationGroupUserAddMutation({
                                    variables: {
                                        userId: userId,
                                        authenticationGroupId: groupToAdd
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
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>
                            Confirm removal of authentication group
                        </Typography>
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
                                authenticationGroupUserRemoveMutation({
                                    variables: {
                                        userId: userId,
                                        authenticationGroupId: groupToRemove
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
                    maxWidth="sm"
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
                        <Alert sx={{width: "100%"}} severity="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                    </Grid2>
                }
                {canAddRel &&
                    <Grid2 marginBottom={"24px"} marginTop={"16px"} spacing={2} container size={12}>
                        <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                            <AddBoxIcon
                                sx={{cursor: "pointer"}}
                                onClick={() => setShowAddDialog(true)}
                            />
                            <div style={{marginLeft: "8px", fontWeight: "bold"}}>Assign User To Authentication Group</div>
                        </Grid2>                    
                    </Grid2>
                }
                <Grid2 container size={12} spacing={1} marginTop={"16px"} marginBottom={"16px"} >
                    <Grid2 size={9}>Group Name</Grid2>
                    <Grid2 size={tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ?  2: 0}>Tenant</Grid2>
                    <Grid2 size={1}></Grid2>                                                                                        
                </Grid2>
                <Divider />
                {data.getAuthenticationGroups.length === 0 &&
                    <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                        <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                            No authentication groups
                        </Grid2>
                    </Grid2>
                }                
            </Typography>
            
            
            {data.getAuthenticationGroups.map(                                            
                (authnGroup: AuthenticationGroup) => (
                    <Typography key={`${authnGroup.authenticationGroupId}`} component={"div"}>
                        <Divider></Divider>                        
                        <Grid2 margin={"8px 0px 8px 0px"} container size={12} spacing={1}>
                            <Grid2 size={9}>
                                <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authentication-groups/${authnGroup.authenticationGroupId}`} target="_blank">
                                    {authnGroup.authenticationGroupName}
                                </Link>                                    
                            </Grid2>
                            
                            <Grid2 size={tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ?  2: 0}>
                                {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                    <InfoOutlinedIcon
                                        sx={{cursor: "pointer"}}
                                        onClick={() => {
                                            setTenantIdToShow(authnGroup.tenantId);
                                            setShowTenantInfo(true);
                                        }}
                                    />
                                }
                            </Grid2>
                            <Grid2 minHeight={"26px"} size={1}>
                                {canRemoveRel &&
                                    <RemoveCircleOutlineIcon 
                                        onClick={() => {
                                            setGroupToRemove(authnGroup.authenticationGroupId);
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
)

UserAuthenticationGroupConfiguration.displayName = 'UserAuthenticationGroupConfiguration';

interface AuthenticationGroupAssignDialogProps {
    userId: string,
    existingGroups: Array<string>,
    onGroupSelected: (groupId: string | null) => void
}

const AuthenticationGroupsAssignDialog: React.FC<AuthenticationGroupAssignDialogProps> = ({
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
                resultType: SearchResultType.AuthenticationGroup
            }
        },
        skip: !data || (data.getUserTenantRels && data.getUserTenantRels.length === 0),
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });


    // HANDLER FUNCTIONS
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    <Grid2 margin={"8px 0px 0px 0px"} textAlign={"center"} size={12} spacing={1}>
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

export default UserAuthenticationGroupConfiguration;