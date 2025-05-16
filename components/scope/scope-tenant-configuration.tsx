"use client";
import React, { useContext } from "react";
import { Tenant } from "@/graphql/generated/graphql-types";
import { TENANT_SCOPE_ASSIGN_MUTATION, TENANT_SCOPE_REMOVE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANTS_QUERY } from "@/graphql/queries/oidc-queries";
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
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { InputAdornment, TablePagination, TextField } from "@mui/material";
import TenantSelector from "../dialogs/tenant-selector";
import { SCOPE_USE_IAM_MANAGEMENT, TENANT_TYPE_ROOT_TENANT, TENANT_TYPES_DISPLAY } from "@/utils/consts";

import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";


export interface ScopeTenantConfigurationProps {
    scopeId: string,
    scopeUse: string,
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
};

const ScopeTenantConfiguration: React.FC<ScopeTenantConfigurationProps> = ({
    scopeId,
    scopeUse,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES    
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES
    const [page, setPage] = React.useState<number>(1);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);    
    const [tenantToRemove, setTenantToRemove] = React.useState<Tenant | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [arr, setArr] = React.useState<Array<Tenant>>([]);
    const [filteredArr, setFilteredArr] = React.useState<Array<Tenant>>([]);
    const [filterTerm, setFilterTerm] = React.useState<string>("");


    // GRAPHQL FUNCTIONS
    const { data, loading, error } = useQuery(TENANTS_QUERY, {
        variables: {
            scopeId: scopeId
        },
        onCompleted(data) {
            setArr(data.getTenants);
            setFilteredArr(data.getTenants);
        },
        fetchPolicy: "no-cache",
        nextFetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true
    });


    const [assignTenantToScopeMutation] = useMutation(TENANT_SCOPE_ASSIGN_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setErrorMessage(null);
        },
        onError(error) {
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANTS_QUERY]
    });

    const [removeTenantFromScopeMutation] = useMutation(TENANT_SCOPE_REMOVE_MUTATION, {
        variables: {
            scopeId: scopeId,
            tenantId: tenantToRemove?.tenantId
        },
        onCompleted() {
            onUpdateEnd(true);
            setErrorMessage(null);
        },
        onError(error) {
            onUpdateEnd(true);
            setErrorMessage(error.message);
        },
        refetchQueries: [TENANTS_QUERY]
    });


    // HANDLER FUNCTIONS
    const handlePageChange = (_: any, page: number) => {
        setPage(page + 1);
    }

    const filterValues = (searchTerm: string) => {
        if (searchTerm.length < 3) {
            setFilteredArr([...arr]);
        }
        else {
            const regExtTerm = searchTerm.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(regExtTerm, "i");
            const filteredVals = arr.filter(
                (item: Tenant) => {
                    if (item.tenantName.match(regex)) {
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
                            setSelectDialogOpen(false);
                            assignTenantToScopeMutation({
                                variables: {
                                    scopeId: scopeId,
                                    tenantId: tenantId
                                }
                            });
                        }}
                        existingTenantIds={
                            (data && data.getTenants.length === 0) ?
                                [] :
                                data.getTenants.map(
                                    (rel: Tenant) => rel.tenantId
                                )
                        }
                        submitButtonText="Submit"
                    />
                </Dialog>
            }
            {showRemoveDialog &&
                <Dialog
                    open={showRemoveDialog}
                    onClose={() => setShowRemoveDialog(false)}
                    maxWidth={"sm"}
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography component={"div"}>
                            <span>Confirm removal of tenant: </span><span style={{ fontWeight: "bold" }}>{tenantToRemove?.tenantName}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setTenantToRemove(null);
                                setShowRemoveDialog(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                onUpdateStart();
                                removeTenantFromScopeMutation();
                                setShowRemoveDialog(false);
                            }}
                        >
                            Confirm
                        </Button>
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
                                            onClick={() => {
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
            <Grid2 marginBottom={"8px"} marginTop={"16px"} spacing={1} container size={12} fontWeight={"bold"}>
                        <Grid2 size={6} >Tenant Name</Grid2>
                        <Grid2 size={5} >Tenant Type</Grid2>
                        <Grid2 size={1}></Grid2>
                    </Grid2>
                    <Divider />

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
                    <Grid2 marginTop={"16px"} spacing={1} container size={12}  >
                        {filteredArr.map(
                            (item: Tenant) => (
                                <React.Fragment key={`${item.tenantId}`}>
                                    <Grid2 size={6}>
                                        <span style={{ textDecoration: "underline" }}>
                                            <Link
                                                href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/tenants/${item.tenantId}`}
                                            >
                                                {item.tenantName}
                                            </Link>
                                        </span>
                                    </Grid2>
                                    <Grid2 size={5}>
                                        {TENANT_TYPES_DISPLAY.get(item.tenantType)}
                                    </Grid2>
                                    <Grid2 size={1}>
                                        { !(item.tenantType === TENANT_TYPE_ROOT_TENANT && scopeUse === SCOPE_USE_IAM_MANAGEMENT) && 
                                        <RemoveCircleOutlineIcon
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => {
                                                setTenantToRemove(item);
                                                setShowRemoveDialog(true);
                                            }}
                                        />
                                        }
                                    </Grid2>
                                    <Grid2 size={12}><Divider /></Grid2>
                                </React.Fragment>
                            )
                        )}
                    </Grid2>
                    <TablePagination
                        component={"div"}
                        page={page - 1}
                        rowsPerPage={10}
                        count={data.getTenants.length}
                        onPageChange={handlePageChange}
                        rowsPerPageOptions={[]}
                    />
                </>
            }
        </Typography>
    )
}


export default ScopeTenantConfiguration;