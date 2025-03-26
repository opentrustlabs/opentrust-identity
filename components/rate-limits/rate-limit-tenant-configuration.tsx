"use client";
import React from "react";
import { RelSearchInput, RelSearchResultItem, SearchResultType } from "@/graphql/generated/graphql-types";
import { TENANT_RATE_LIMIT_ASSIGN_MUTATION, TENANT_RATE_LIMIT_REMOVE_MUTATION, TENANT_RATE_LIMIT_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_RATE_LIMIT_REL_SEARCH_QUERY } from "@/graphql/queries/oidc-queries";
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


    // STATE VARIABLES
    const perPage = 10;
    const [page, setPage] = React.useState<number>(1);
    const [filterTerm, setFilterTerm] = React.useState<string>("");
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);
    const [tenantToRemove, setTenantToRemove] = React.useState<{id: string, name: string} | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);

    const relSearchInput: RelSearchInput = {
        page: page,
        perPage: perPage,
        childtype: SearchResultType.RateLimit,
        childid: rateLimitServiceGroupId,
        term: filterTerm
    }




    // GRAPHQL FUNCTIONS

    // need the query, assign, and remove graph ql function
    const {data, loading, error} = useQuery(TENANT_RATE_LIMIT_REL_SEARCH_QUERY, {
        variables: {
            relSearchInput: relSearchInput
        }
    });

    const [assignTenantToRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_ASSIGN_MUTATION, {
        variables: {

        },
        onCompleted() {
            
        },
        onError(error) {
            setErrorMessage(error.message);
        },
    });

    const [updateTenantRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_UPDATE_MUTATION, {
        variables: {

        },
        onCompleted() {
            
        },
        onError(error) {
            setErrorMessage(error.message);
        },
    });

    const [removeTenantFromRateLimitGroupMutation] = useMutation(TENANT_RATE_LIMIT_REMOVE_MUTATION, {
        variables: {

        },
        onCompleted() {
            
        },
        onError(error) {
            setErrorMessage(error.message);
        },
    });

    return (
        <Typography component="div">
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
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
                            <span>Confirm removal of tenant: </span><span style={{fontWeight: "bold"}}>{tenantToRemove?.name || ""}</span>
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
            <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <AddBoxIcon
                        sx={{cursor: "pointer"}}
                        onClick={() => setSelectDialogOpen(true)}
                    />
                    <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Tenant</div>
                </Grid2>                
            </Grid2>
            <Divider />
            {loading &&
                <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        ...
                    </Grid2>
                </Grid2>
            }
            {error &&
                <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        {error.message}
                    </Grid2>
                </Grid2>
            }
            {data && data.relSearch.total === 0 &&
                <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No tenants to display
                    </Grid2>
                </Grid2>
            }
            {/**
             * relSearch(relSearchInput: $relSearchInput) {
            starttime
            endtime
            took
            page
            perpage
            total
            resultlist {
                owningtenantid
                parentid
                parenttype
                childid
                childtype
                childname
                childdescription
            }            
        }
    }
             */}
            {data && data.relSearch.total > 0 &&
                <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                    {data.relSearch.resultlist.map(
                        (item: RelSearchResultItem) => (
                            <React.Fragment key={`${item.parentid}::${item.childid}`}>                                
                                <Grid2 size={8}>
                                    <span style={{textDecoration: "underline"}}>
                                        {item.owningtenantname}
                                    </span>
                                </Grid2>
                                <Grid2 size={3}>
                                    
                                </Grid2>
                                <Grid2 size={1}>
                                    <RemoveCircleOutlineIcon
                                        sx={{cursor: "pointer"}}
                                        onClick={() => {setShowRemoveConfirmationDialog(true);}}
                                    />
                                </Grid2>
                                <Grid2 size={12}><Divider /></Grid2>
                            </React.Fragment>
                        )
                    )}
                </Grid2>
            } 
        </Typography>
    )
}

export default RateLimitTenantRelConfiguration;