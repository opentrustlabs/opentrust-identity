"use client";
import React, { useContext } from "react";
import { Tenant, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import { TENANT_RATE_LIMIT_ASSIGN_MUTATION, TENANT_RATE_LIMIT_REMOVE_MUTATION, TENANT_RATE_LIMIT_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_RATE_LIMIT_REL_QUERY } from "@/graphql/queries/oidc-queries";
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
import { Checkbox, DialogTitle, InputAdornment, TablePagination, TextField } from "@mui/material";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import TenantSelector from "../dialogs/tenant-selector";


export interface RateLimitTenantRelConfigurationProps {
    rateLimitServiceGroupId: string,
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
};

const RateLimitTenantRelConfiguration: React.FC<RateLimitTenantRelConfigurationProps> = ({
    rateLimitServiceGroupId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // STATE VARIABLES
    const perPage = 10;
    const [page, setPage] = React.useState<number>(1);
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);
    const [tenantIdToAdd, setTenantIdToAdd] = React.useState<string | null>(null);
    const [tenantToAdd, setTenantToAdd] = React.useState<Tenant | null>(null);
    const [tenantToRemove, setTenantToRemove] = React.useState<{ id: string, name: string } | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [configureRateLimitDialogOpen, setConfigureRateLimitDialogOpen] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const { data, loading, error } = useQuery(TENANT_RATE_LIMIT_REL_QUERY, {
        variables: {
            rateLimitServiceGroupId: rateLimitServiceGroupId
        }
    });

    const [assignTenantToRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_ASSIGN_MUTATION, {
        variables: {

        },
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
    });

    const [updateTenantRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_UPDATE_MUTATION, {
        variables: {

        },
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
    });

    const [removeTenantFromRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_REMOVE_MUTATION, {
        variables: {

        },
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
    });


    // HANDLER FUNCTIONS
    const handlePageChange = (evt: any, page: number) => {
        setPage(page + 1);   
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
                        onSelected={(tenantId: string, tenant?: Tenant) => {
                            console.log("tenant id selected: " + tenantId);
                            setTenantIdToAdd(tenantId);
                            if(tenant){
                                setTenantToAdd(tenant);
                            }                            
                            setSelectDialogOpen(false);
                            setConfigureRateLimitDialogOpen(true);
                        }}
                        filterTenants={(tenants: Array<Tenant>) => {
                            if(data && data.getRateLimitTenantRelViews.length === 0){
                                return tenants;
                            }
                            else{
                                const arr: Array<TenantRateLimitRelView> = data.getRateLimitTenantRelViews;
                                const filtered = tenants.filter(
                                    (t: Tenant) => {
                                        const exists = arr.find(
                                            (rel: TenantRateLimitRelView) => rel.tenantId === t.tenantId
                                        )
                                        if(exists){
                                            return false;
                                        }
                                        else{
                                            return true;
                                        }
                                    }
                                )
                                return filtered
                            }
                        }}
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
                    
                    <DialogContent>
                        <AddNewTenatRateLimitConfiguration
                            tenantName={tenantToAdd?.tenantName || ""}
                            tenantAllowUnlimited={tenantToAdd?.allowUnlimitedRate || false}
                            tenantRatePeriodMinutes={tenantToAdd?.defaultRateLimitPeriodMinutes || null}
                            totalRateLimit={tenantToAdd?.defaultRateLimit || null}
                            onCompleted={(allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number) => {
                                console.log("on completed")
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfigureRateLimitDialogOpen(false)}>Cancel</Button>
                    </DialogActions>
                                      
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
                            removeTenantFromRateLimitGroupMutation();
                        }}>Confirm</Button>
                    </DialogActions>
                </Dialog>
            }
            <Grid2 marginBottom={"24px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <AddBoxIcon
                        sx={{ cursor: "pointer" }}
                        onClick={() => setSelectDialogOpen(true)}
                    />
                    <div style={{ marginLeft: "8px", fontWeight: "bold" }}>Add Tenant</div>
                </Grid2>
            </Grid2>
            <Grid2 marginBottom={"32px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <TextField
                        name="filter"
                        id="filter"
                        onChange={(evt) => setFilterTerm(evt.target.value)}
                        size="small"
                        placeholder="Filter Tenants"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <CloseOutlinedIcon

                                            sx={{ cursor: "pointer" }}
                                        />
                                    </InputAdornment>
                                )
                            }
                        }}

                    />
                </Grid2>
            </Grid2>

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
            {data && data.getRateLimitTenantRelViews.length === 0 &&
                <Grid2 marginTop={"16px"} spacing={2} container size={12} textAlign={"center"} >
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No tenants to display
                    </Grid2>
                </Grid2>
            }
            {data && data.getRateLimitTenantRelViews.length > 0 &&
                <>
                    {!breakPoints.isMedium &&
                        <>
                            <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                                <Grid2 size={1} ></Grid2>
                                <Grid2 size={4} >Tenant Name</Grid2>
                                <Grid2 size={2} >Unlimited</Grid2>
                                <Grid2 size={2} >Limit</Grid2>
                                <Grid2 size={2} >Period (min)</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                            <Divider />
                            <Grid2 marginTop={"16px"} spacing={1} container size={12}  >
                                {data.getRateLimitTenantRelViews.map(
                                    (item: TenantRateLimitRelView) => (
                                        <React.Fragment key={`${item.tenantId}`}>
                                            <Grid2 size={1}>
                                                <EditOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                />
                                            </Grid2>
                                            <Grid2 size={4}>
                                                <span style={{ textDecoration: "underline" }}>
                                                    {item.tenantName}
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
                                            <Grid2 size={1}>
                                                <RemoveCircleOutlineIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setTenantToRemove({ id: item.tenantId, name: item.tenantName || "" });
                                                        setShowRemoveConfirmationDialog(true);
                                                    }}
                                                />
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
                            <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                                <Grid2 size={2} ></Grid2>
                                <Grid2 size={9} >Tenant Name</Grid2>
                                <Grid2 size={1}></Grid2>
                            </Grid2>
                            <Divider />
                            <Grid2 marginTop={"16px"} spacing={1} container size={12}  >
                                {data.getRateLimitTenantRelViews.map(
                                    (item: TenantRateLimitRelView) => (
                                        <React.Fragment key={`${item.tenantId}`}>
                                            <Grid2 size={2}>
                                                <EditOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                />
                                            </Grid2>
                                            <Grid2 size={9}>
                                                <span style={{ textDecoration: "underline" }}>
                                                    {item.tenantName}
                                                </span>
                                            </Grid2>
                                            {/* <Grid2 size={2}>
                                                {item.allowUnlimitedRate &&
                                                    <CheckOutlinedIcon />
                                                }
                                            </Grid2>
                                            <Grid2 size={2}>
                                                {item.rateLimit}
                                            </Grid2>
                                            <Grid2 size={2}>
                                                {item.rateLimitPeriodMinutes}
                                            </Grid2> */}
                                            <Grid2 size={1}>
                                                <RemoveCircleOutlineIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setTenantToRemove({ id: item.tenantId, name: item.tenantName || "" });
                                                        setShowRemoveConfirmationDialog(true);
                                                    }}
                                                />
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
                        rowsPerPage={perPage}
                        count={data.getRateLimitTenantRelViews.length}
                        onPageChange={handlePageChange}
                        rowsPerPageOptions={[]}
                    />
                </>
            }
        </Typography>
    )
}

interface AddNewTenatRateLimitConfigurationProps {
    tenantName: string,
    tenantAllowUnlimited: boolean,
    tenantRatePeriodMinutes: number | null,
    totalRateLimit: number | null,
    onCompleted: (allowUnlimited: boolean, limit: number, rateLimitPeriodMinutes: number) => void
}


const AddNewTenatRateLimitConfiguration: React.FC<AddNewTenatRateLimitConfigurationProps> = ({
    tenantName,
    tenantAllowUnlimited,
    tenantRatePeriodMinutes,
    totalRateLimit,
    onCompleted
}) => {

    // STATE VARIABLES
    const [allowUnlimited, setAllowUnlimited] = React.useState<boolean>(false);
    const [limit, setLimit] = React.useState<number | string>("");
    const [rateLimitPeriodMinutes, setRateLimitPeriodMinutes] = React.useState<number | string>(tenantRatePeriodMinutes || "");

    return (
        <Typography component="div">
        <Grid2 size={12} container spacing={1}>
            <Grid2 marginBottom={"16px"} sx={{textDecoration: "underline"}} size={12} fontWeight={"bold"}>
                <span>Tenant: </span>
                <span>{tenantName} </span>
                
                    <span>Total limit: {totalRateLimit}</span>
                
            </Grid2>
            <Grid2 size={11}>Allow unlimited</Grid2>
            <Grid2 size={1}>
                <Checkbox 
                    value={allowUnlimited}
                    onChange={(_, checked: boolean) => {
                        setAllowUnlimited(checked);
                        if(checked){
                            setLimit("");
                            setRateLimitPeriodMinutes("");
                        }
                        else{
                            if(tenantRatePeriodMinutes !== null){
                                setRateLimitPeriodMinutes(tenantRatePeriodMinutes);
                            }
                        }
                    }}
                />            
            </Grid2>
            <Grid2 size={12}>Limit</Grid2>
            <Grid2 size={12} marginBottom={"16px"}>
                <TextField
                    name="limit"
                    type="number"
                    fullWidth={true}
                    size="small"
                    onChange={(evt) => setLimit(parseInt(evt.target.value))}
                    value={limit}
                    disabled={allowUnlimited === true}
                />
            </Grid2>
            <Grid2 size={12}>Rate Limit Period (minutes)</Grid2>
            <Grid2 size={12}>
                <TextField
                    name="limitPeriod"
                    type="number"
                    fullWidth={true}
                    size="small"
                    value={rateLimitPeriodMinutes}
                    onChange={(evt) => setRateLimitPeriodMinutes(parseInt(evt.target.value))}
                    disabled={allowUnlimited === true || tenantRatePeriodMinutes !== null}
                />
            </Grid2>
        </Grid2>
        </Typography>
    )
}

export default RateLimitTenantRelConfiguration;