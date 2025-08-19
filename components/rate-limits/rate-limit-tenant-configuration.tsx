"use client";
import React, { useContext } from "react";
import { TenantRateLimitRelView, PortalUserProfile } from "@/graphql/generated/graphql-types";
import { TENANT_RATE_LIMIT_ASSIGN_MUTATION, TENANT_RATE_LIMIT_REMOVE_MUTATION, TENANT_RATE_LIMIT_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_RATE_LIMIT_REL_VIEW_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Grid2 from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { InputAdornment, TablePagination, TextField } from "@mui/material";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import TenantSelector from "../dialogs/tenant-selector";
import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import TenatRateLimitConfigurationDialog from "../dialogs/tenant-rate-limit-configuration-dialog";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { RATE_LIMIT_TENANT_ASSIGN_SCOPE, RATE_LIMIT_TENANT_REMOVE_SCOPE, RATE_LIMIT_TENANT_UPDATE_SCOPE } from "@/utils/consts";


export interface RateLimitTenantRelConfigurationProps {
    rateLimitServiceGroupId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
};

const RateLimitTenantRelConfiguration: React.FC<RateLimitTenantRelConfigurationProps> = ({
    rateLimitServiceGroupId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    // STATE VARIABLES
    
    const [page, setPage] = React.useState<number>(1);
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);
    const [tenantIdToAdd, setTenantIdToAdd] = React.useState<string | null>(null);
    const [tenantToRemove, setTenantToRemove] = React.useState<{ id: string, name: string } | null>(null);
    const [tenantRateLimitRelToEdit, setTenantRateLimitRelToEdit] = React.useState<TenantRateLimitRelView | null>(null);
    const [showTenantEditDialogOpen, setShowTenantEditDialogOpen] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [configureRateLimitDialogOpen, setConfigureRateLimitDialogOpen] = React.useState<boolean>(false);
    const [arr, setArr] = React.useState<Array<TenantRateLimitRelView>>([]);
    const [filteredArr, setFilteredArr] = React.useState<Array<TenantRateLimitRelView>>([]);
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [canAddRel] = React.useState<boolean>(containsScope(RATE_LIMIT_TENANT_ASSIGN_SCOPE, profile?.scope || []));
    const [canRemoveRel] = React.useState<boolean>(containsScope(RATE_LIMIT_TENANT_REMOVE_SCOPE, profile?.scope || []));
    const [canUpdateRel] = React.useState<boolean>(containsScope(RATE_LIMIT_TENANT_UPDATE_SCOPE, profile?.scope || []));
    

    // GRAPHQL FUNCTIONS
    const { data, loading, error } = useQuery(TENANT_RATE_LIMIT_REL_VIEW_QUERY, {
        variables: {
            rateLimitServiceGroupId: rateLimitServiceGroupId
        },
        onCompleted(data) {
            setArr(data.getRateLimitTenantRelViews);
            setFilteredArr(data.getRateLimitTenantRelViews);
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true
    });


    const [assignTenantToRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_ASSIGN_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setTenantIdToAdd(null);
            setErrorMessage(null);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANT_RATE_LIMIT_REL_VIEW_QUERY]
    });

    const [updateTenantRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_UPDATE_MUTATION, {
        variables: {

        },
        onCompleted() {
            onUpdateEnd(true);
            setShowTenantEditDialogOpen(false);
            setErrorMessage(null);
        },
        onError(error) {
            setShowTenantEditDialogOpen(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANT_RATE_LIMIT_REL_VIEW_QUERY]
    });

    const [removeTenantFromRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_REMOVE_MUTATION, {
        variables: {

        },
        onCompleted() {
            onUpdateEnd(true);
            setErrorMessage(null);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANT_RATE_LIMIT_REL_VIEW_QUERY]
    });


    // HANDLER FUNCTIONS
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePageChange = (evt: any, page: number) => {
        setPage(page + 1);
    }
    const filterValues = (searchTerm: string) => {        
        if(searchTerm.length < 3){            
            setFilteredArr([...arr]);
        }
        else{            
            const regExtTerm = searchTerm.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(regExtTerm, "i");
            const filteredVals = arr.filter(
                (item: TenantRateLimitRelView) => {
                    if(item.tenantName.match(regex)){
                        return true;
                    }
                    return false;
                }
            );            
            setFilteredArr(filteredVals);
        }        
    }

    return (
        <Typography component="div">
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
            }
            {selectDialogOpen &&
                <Dialog
                    open={selectDialogOpen}
                    onClose={() => setSelectDialogOpen(false)}
                    fullWidth={true}
                    maxWidth={"sm"}
                >
                    <TenantSelector
                        onCancel={() => setSelectDialogOpen(false)}
                        onSelected={(tenantId: string) => {                            
                            setTenantIdToAdd(tenantId);                            
                            setSelectDialogOpen(false);
                            setConfigureRateLimitDialogOpen(true);
                        }}
                        existingTenantIds={
                            (data && data.getRateLimitTenantRelViews.length === 0) ? 
                                [] :
                                data.getRateLimitTenantRelViews.map(
                                    (rel: TenantRateLimitRelView) => rel.tenantId
                                )                            
                        }
                    />
                </Dialog>
            }
            {configureRateLimitDialogOpen &&
                <Dialog
                    open={configureRateLimitDialogOpen}
                    onClose={() => setConfigureRateLimitDialogOpen(false)}
                    fullWidth={true}
                    maxWidth={"sm"}
                >                    
                    <TenatRateLimitConfigurationDialog
                        existingAllowUnlimited={null}
                        existingLimit={null}
                        tenantId={tenantIdToAdd || ""}                        
                        onCompleted={(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null) => {
                            setConfigureRateLimitDialogOpen(false);
                            onUpdateStart();                            
                            assignTenantToRateLimitGroupMutation({
                                variables: {
                                    tenantId: tenantId,
                                    allowUnlimited: allowUnlimited,
                                    serviceGroupId: serviceGroupId,
                                    limit: limit,
                                    rateLimitPeriodMinutes: rateLimitPeriodMinutes
                                }
                            });   
                        }} 
                        onCancel={() => {
                            setConfigureRateLimitDialogOpen(false);
                            setTenantIdToAdd(null);
                        }}
                        serviceGroupId={rateLimitServiceGroupId}
                    />
                </Dialog>
            }
            {showTenantEditDialogOpen &&
                <Dialog
                    open={showTenantEditDialogOpen}
                    onClose={() => setShowTenantEditDialogOpen(false)}
                    fullWidth={true}
                    maxWidth="sm"
                >
                    <TenatRateLimitConfigurationDialog
                        tenantId={tenantRateLimitRelToEdit?.tenantId || ""}
                        existingAllowUnlimited={tenantRateLimitRelToEdit?.allowUnlimitedRate || false}
                        existingLimit={tenantRateLimitRelToEdit?.rateLimit || null}
                        onCancel={() => {
                            setShowTenantEditDialogOpen(false);
                            setTenantRateLimitRelToEdit(null);

                        } }
                        onCompleted={(tenantId: string, serviceGroupId: string, allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null) => {
                            setShowTenantEditDialogOpen(false);
                            onUpdateStart();
                            updateTenantRateLimitGroupMutation({
                                variables: {
                                    tenantId: tenantId,
                                    allowUnlimited: allowUnlimited,
                                    serviceGroupId: serviceGroupId,
                                    limit: limit,
                                    rateLimitPeriodMinutes: rateLimitPeriodMinutes
                                }
                            });
                        } } 
                        serviceGroupId={rateLimitServiceGroupId}
                    />
                </Dialog>
            }
            {showRemoveConfirmationDialog &&
                <Dialog
                    open={showRemoveConfirmationDialog}
                    onClose={() => setShowRemoveConfirmationDialog(false)}
                    fullWidth={true}
                    maxWidth={"sm"}
                >
                    <DialogContent>
                        <Typography component="div">
                            <span>Confirm removal of tenant: </span><span style={{ fontWeight: "bold" }}>{tenantToRemove?.name || ""}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRemoveConfirmationDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setShowRemoveConfirmationDialog(false);
                            onUpdateStart();
                            removeTenantFromRateLimitGroupMutation({
                                variables: {
                                    tenantId: tenantToRemove?.id,
                                    serviceGroupId: rateLimitServiceGroupId
                                }
                            });
                        }}>Confirm</Button>
                    </DialogActions>
                </Dialog>
            }
            {canAddRel &&
                <Grid2 marginBottom={"32px"} marginTop={"16px"} spacing={2} container size={12}>
                    <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                        <AddBoxIcon
                            sx={{ cursor: "pointer" }}
                            onClick={() => setSelectDialogOpen(true)}
                        />
                        <div style={{ marginLeft: "8px", fontWeight: "bold" }}>Add Tenant</div>
                    </Grid2>
                </Grid2>
            }
            <Grid2 marginBottom={"32px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <TextField
                        value={filterTerm}
                        name="filterTenants"
                        id="filterTenants"
                        onChange={(evt) => {
                            setFilterTerm(evt.target.value);
                            filterValues(evt.target.value);

                        }}
                        size="small"
                        placeholder="Filter Tenants"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <CloseOutlinedIcon
                                            sx={{ cursor: "pointer" }}
                                            onClick={() =>{
                                                setFilterTerm("");
                                                setFilteredArr([...arr]);
                                            }}
                                        />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </Grid2>
            </Grid2>

            {!breakPoints.isMedium &&
                <>
                    <Grid2 marginTop={"16px"} marginBottom={"8px"} spacing={1} container size={12} fontWeight={"bold"}>
                        <Grid2 size={canUpdateRel ? 1 : 0} ></Grid2>
                        <Grid2 size={4} >Tenant Name</Grid2>
                        <Grid2 size={2} >Unlimited</Grid2>
                        <Grid2 size={2} >Limit</Grid2>
                        <Grid2 size={2} >Period (min)</Grid2>
                        <Grid2 size={1}></Grid2>
                    </Grid2>
                    <Divider />
                </>
            }
            {breakPoints.isMedium &&
                <>
                    <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                        <Grid2 size={canUpdateRel ? 2 : 0} ></Grid2>
                        <Grid2 size={9} >Tenant Name</Grid2>
                        <Grid2 size={1}></Grid2>
                    </Grid2>
                    <Divider />
                </>
            }
            {loading &&
                <Grid2 marginTop={"16px"} spacing={2} container size={12} textAlign={"center"} >
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        ...
                    </Grid2>
                </Grid2>
            }
            {error &&
                <Grid2 marginTop={"16px"} spacing={2} container size={12} textAlign={"center"} >
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        {error.message}
                    </Grid2>
                </Grid2>
            }
            {data && !loading && !error && filteredArr.length === 0 &&
                <Grid2 marginTop={"16px"} spacing={2} container size={12} textAlign={"center"} >
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No tenants to display
                    </Grid2>
                </Grid2>
            }
            {data && !loading && !error && filteredArr.length > 0 &&
                <>
                    {!breakPoints.isMedium &&
                        <>                            
                            <Grid2 marginTop={"16px"} spacing={1} container size={12}  >
                                {filteredArr.map(
                                    (item: TenantRateLimitRelView) => (
                                        <React.Fragment key={`${item.tenantId}`}>
                                            <Grid2 size={canUpdateRel ? 1 : 0}>
                                                {canUpdateRel &&
                                                    <EditOutlinedIcon
                                                        sx={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            setTenantRateLimitRelToEdit(item);
                                                            setShowTenantEditDialogOpen(true);
                                                        }}
                                                    />
                                                }
                                            </Grid2>
                                            <Grid2 size={4}>
                                                <span style={{ textDecoration: "underline" }}>
                                                    <Link 
                                                        href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${item.tenantId}`}
                                                    >
                                                        {item.tenantName}
                                                    </Link>
                                                </span>
                                            </Grid2>
                                            <Grid2 size={2}>
                                                {item.allowUnlimitedRate &&
                                                    <CheckOutlinedIcon />
                                                }
                                            </Grid2>
                                            <Grid2 size={2}>
                                                {item.rateLimit}
                                            </Grid2>
                                            <Grid2 size={2}>
                                                {item.rateLimitPeriodMinutes}
                                            </Grid2>
                                            <Grid2 minHeight={"26px"} size={1}>
                                                {canRemoveRel &&
                                                    <RemoveCircleOutlineIcon
                                                        sx={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            setTenantToRemove({ id: item.tenantId, name: item.tenantName || "" });
                                                            setShowRemoveConfirmationDialog(true);
                                                        }}
                                                    />
                                                }
                                            </Grid2>
                                            <Grid2 size={12}><Divider /></Grid2>
                                        </React.Fragment>
                                    )
                                )}
                            </Grid2>
                        </>
                    }
                    {breakPoints.isMedium &&
                        <>                            
                            <Grid2 marginTop={"16px"} spacing={1} container size={12}  >
                                {filteredArr.map(
                                    (item: TenantRateLimitRelView) => (
                                        <React.Fragment key={`${item.tenantId}`}>
                                            <Grid2 size={canUpdateRel ? 2 : 0}>
                                                {canUpdateRel &&
                                                    <EditOutlinedIcon
                                                        sx={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            setTenantRateLimitRelToEdit(item);
                                                            setShowTenantEditDialogOpen(true);
                                                        }}
                                                    />
                                                }
                                            </Grid2>
                                            <Grid2 size={9}>
                                                <span style={{ textDecoration: "underline" }}>
                                                    <Link 
                                                        href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${item.tenantId}`}
                                                    >
                                                        {item.tenantName}
                                                    </Link>
                                                </span>
                                            </Grid2>
                                            <Grid2 minHeight={"26px"} size={1}>
                                                {canRemoveRel &&
                                                    <RemoveCircleOutlineIcon
                                                        sx={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            setTenantToRemove({ id: item.tenantId, name: item.tenantName || "" });
                                                            setShowRemoveConfirmationDialog(true);
                                                        }}
                                                    />
                                                }
                                            </Grid2>
                                            <Grid2 size={12}><Divider /></Grid2>
                                        </React.Fragment>
                                    )
                                )}
                            </Grid2>
                        </>
                    }
                    <TablePagination
                        component={"div"}
                        page={page - 1}
                        rowsPerPage={10}
                        count={data.getRateLimitTenantRelViews.length}
                        onPageChange={handlePageChange}
                        rowsPerPageOptions={[]}
                    />
                </>
            }
        </Typography>
    )
}


export default RateLimitTenantRelConfiguration;