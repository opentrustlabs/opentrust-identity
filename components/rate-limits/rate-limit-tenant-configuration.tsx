"use client";
import React, { useContext } from "react";
import { TenantRateLimitRel, TenantRateLimitRelView } from "@/graphql/generated/graphql-types";
import { TENANT_RATE_LIMIT_ASSIGN_MUTATION, TENANT_RATE_LIMIT_REMOVE_MUTATION, TENANT_RATE_LIMIT_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_DETAIL_QUERY, TENANT_RATE_LIMIT_REL_QUERY, TENANT_RATE_LIMIT_REL_VIEW_QUERY } from "@/graphql/queries/oidc-queries";
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
import { Checkbox, InputAdornment, TablePagination, TextField } from "@mui/material";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import TenantSelector from "../dialogs/tenant-selector";
import { DEFAULT_RATE_LIMIT_PERIOD_MINUTES } from "@/utils/consts";

import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";


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
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

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
    

    // GRAPHQL FUNCTIONS
    const { data, loading, error } = useQuery(TENANT_RATE_LIMIT_REL_VIEW_QUERY, {
        variables: {
            rateLimitServiceGroupId: rateLimitServiceGroupId
        },
        onCompleted(data) {
            setArr(data.getRateLimitTenantRelViews);
            setFilteredArr(data.getRateLimitTenantRelViews);
        },
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
                    <TenatRateLimitConfiguration
                        existingAllowUnlimited={null}
                        existingLimit={null}
                        tenantId={tenantIdToAdd || ""}                        
                        onCompleted={(allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null) => {
                            setConfigureRateLimitDialogOpen(false);
                            onUpdateStart();                            
                            assignTenantToRateLimitGroupMutation({
                                variables: {
                                    tenantId: tenantIdToAdd,
                                    allowUnlimited: allowUnlimited,
                                    serviceGroupId: rateLimitServiceGroupId,
                                    limit: limit,
                                    rateLimitPeriodMinutes: rateLimitPeriodMinutes
                                }
                            });   
                        }} 
                        onCancel={() => {
                            setConfigureRateLimitDialogOpen(false);
                            setTenantIdToAdd(null);
                        }}                        
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
                    <TenatRateLimitConfiguration
                        tenantId={tenantRateLimitRelToEdit?.tenantId || ""}
                        existingAllowUnlimited={tenantRateLimitRelToEdit?.allowUnlimitedRate || false}
                        existingLimit={tenantRateLimitRelToEdit?.rateLimit || null} 
                        onCancel={() => {
                            setShowTenantEditDialogOpen(false);
                            setTenantRateLimitRelToEdit(null);

                        }}
                        onCompleted={ (allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null) => {
                            setShowTenantEditDialogOpen(false);
                            onUpdateStart();
                            updateTenantRateLimitGroupMutation({
                                variables: {
                                    tenantId: tenantRateLimitRelToEdit?.tenantId,
                                    allowUnlimited: allowUnlimited,
                                    serviceGroupId: rateLimitServiceGroupId,
                                    limit: limit,
                                    rateLimitPeriodMinutes: rateLimitPeriodMinutes
                                }
                            })
                        }}
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
            <Grid2 marginBottom={"32px"} marginTop={"16px"} spacing={2} container size={12}>
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
                                {filteredArr.map(
                                    (item: TenantRateLimitRelView) => (
                                        <React.Fragment key={`${item.tenantId}`}>
                                            <Grid2 size={1}>
                                                <EditOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setTenantRateLimitRelToEdit(item);
                                                        setShowTenantEditDialogOpen(true);
                                                    }}
                                                />
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
                                {filteredArr.map(
                                    (item: TenantRateLimitRelView) => (
                                        <React.Fragment key={`${item.tenantId}`}>
                                            <Grid2 size={2}>
                                                <EditOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setTenantRateLimitRelToEdit(item);
                                                        setShowTenantEditDialogOpen(true);
                                                    }}
                                                />
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
                        rowsPerPage={10}
                        count={data.getRateLimitTenantRelViews.length}
                        onPageChange={handlePageChange}
                        rowsPerPageOptions={[]}
                    />
                    {/* <TablePagination
                        component={"div"}
                        page={page - 1}
                        rowsPerPage={perPage}
                        count={data.getRateLimitTenantRelViews.length}
                        onPageChange={handlePageChange}
                        rowsPerPageOptions={[]}
                    /> */}
                </>
            }
        </Typography>
    )
}

interface TenatRateLimitConfigurationProps {
    existingLimit: number | null,
    existingAllowUnlimited: boolean | null,
    tenantId: string,    
    onCancel: () => void,
    onCompleted: (allowUnlimited: boolean, limit: number | null, rateLimitPeriodMinutes: number | null) => void
}


const TenatRateLimitConfiguration: React.FC<TenatRateLimitConfigurationProps> = ({
    existingAllowUnlimited,
    existingLimit,
    tenantId,
    onCancel,
    onCompleted
}) => {

    // STATE VARIABLES    
    const [allowUnlimited, setAllowUnlimited] = React.useState<boolean>(existingAllowUnlimited ? existingAllowUnlimited : false);
    const [limit, setLimit] = React.useState<number | null>(existingLimit || null);
    const [rateLimitPeriodMinutes, setRateLimitPeriodMinutes] = React.useState<number | null>( DEFAULT_RATE_LIMIT_PERIOD_MINUTES);


    // GRAPHQL FUNCTIONS
    const { data } = useQuery(TENANT_RATE_LIMIT_REL_QUERY, {
        variables: {
            tenantId: tenantId
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache"
    });

    const { data: tenantDetailData} = useQuery(TENANT_DETAIL_QUERY, {
        variables: {
            tenantId: tenantId
        }
    });

    const getTotalUsed = (arr: Array<TenantRateLimitRel>): number => {
        let used: number = 0;
        if (arr && arr.length > 0) {
            arr.forEach(
                (rel: TenantRateLimitRel) => {
                    if (rel.rateLimit) {
                        used = used + rel.rateLimit;
                    }
                }
            )
        }
        return used;
    }

    if(data && tenantDetailData) return (
        <Typography component="div">
            <DialogContent>
                <Grid2 size={12} container spacing={1}>
                    <Grid2 marginBottom={"8px"} size={3} fontWeight={"bold"}>
                        <span style={{ textDecoration: "underline" }}>Tenant: </span>
                    </Grid2>
                    <Grid2 marginBottom={"8px"} size={9} fontWeight={"bold"}>
                        <span>{tenantDetailData.getTenantById.tenantName} </span>
                    </Grid2>
                    
                        <>
                            <Grid2 marginBottom={"0px"} sx={{ textDecoration: "underline" }} size={3} >
                                <span>Total limit:</span>
                            </Grid2>
                            <Grid2 marginBottom={"0px"} size={9} >
                                {tenantDetailData.getTenantById.allowUnlimitedRate &&
                                    <span>Unlimited</span>    
                                }
                                {!tenantDetailData.getTenantById.allowUnlimitedRate &&
                                    <span>{tenantDetailData.getTenantById.defaultRateLimit}</span>
                                }                                
                            </Grid2>
                            {data && data.getRateLimitTenantRels &&
                                <>
                                    <Grid2 marginBottom={"16px"} sx={{ textDecoration: "underline" }} size={3} >
                                        <span>Used:</span>
                                    </Grid2>
                                    <Grid2 marginBottom={"16px"} size={9} >
                                        <span>{getTotalUsed(data.getRateLimitTenantRels)}</span>
                                    </Grid2>
                                </>

                            }
                        </>
                    

                    <Grid2 size={11}>Allow unlimited</Grid2>
                    <Grid2 size={1}>
                        <Checkbox
                            checked={allowUnlimited}
                            onChange={(_, checked: boolean) => {
                                setAllowUnlimited(checked);
                                if (checked) {
                                    setLimit(null);
                                    setRateLimitPeriodMinutes(null);
                                }
                                else {
                                    setRateLimitPeriodMinutes(DEFAULT_RATE_LIMIT_PERIOD_MINUTES);

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
                            onChange={(evt) => {
                                if (!tenantDetailData.getTenantById.allowUnlimitedRate && tenantDetailData.getTenantById.defaultRateLimit) {
                                    const used: number = data && data.getRateLimitTenantRels ? getTotalUsed(data.getRateLimitTenantRels) : 0;
                                    let limit: number = 0;
                                    try {
                                        limit = parseInt(evt.target.value)
                                    }
                                    catch (err) { limit = 0 }
                                    if ((limit + used) > tenantDetailData.getTenantById.defaultRateLimit) {
                                        setLimit(tenantDetailData.getTenantById.defaultRateLimit - used);
                                    }
                                    else {
                                        setLimit(limit);
                                    }
                                }
                                else {
                                    setLimit(parseInt(evt.target.value));
                                }
                            }}
                            value={limit || ""}
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
                            value={rateLimitPeriodMinutes || ""}
                            onChange={(evt) => setRateLimitPeriodMinutes(parseInt(evt.target.value))}
                            disabled={true}
                        />
                    </Grid2>
                </Grid2>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    onCancel()
                }}
                >
                    Cancel
                </Button>
                <Button onClick={() => {
                    if (typeof limit === "string") {
                        if (limit !== "") {
                            // TODO
                            // convert from string to number
                        }
                    }
                    onCompleted(allowUnlimited, limit, rateLimitPeriodMinutes);
                }}
                >
                    Submit
                </Button>

            </DialogActions>
        </Typography>
    )
}


export default RateLimitTenantRelConfiguration;