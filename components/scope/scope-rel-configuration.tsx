"use client";
import { GET_AUTHORIZATION_GROUP_SCOPE_QUERY, GET_CLIENT_SCOPE_QUERY, GET_USER_SCOPE_QUERY, SCOPE_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React, { useContext } from "react";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import GeneralSelector from "../dialogs/general-selector";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Alert from "@mui/material/Alert";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { Scope, ScopeFilterCriteria } from "@/graphql/generated/graphql-types";
import Link from "next/link";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import { SCOPE_USE_DISPLAY, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";


export enum ScopeRelType {
    USER,
    CLIENT,
    AUTHORIZATION_GROUP
}

export interface ScopeRelConfigurationProps {
    tenantId: string,
    scopeRelType: ScopeRelType,
    id: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const ScopeRelConfiguration: React.FC<ScopeRelConfigurationProps> = ({
    tenantId,
    id,
    onUpdateEnd,
    onUpdateStart,
    scopeRelType
}) => {

    // CONTEXT VARIABLES
    const responseBreakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES
    const [page, setPage] = React.useState<number>(1);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);    
    const [scopeIdToRemove, setScopeIdToRemove] = React.useState<null | string>(null);
    const [arrScope, setArrScope] = React.useState<Array<Scope>>([]);

    // GRAAPHQL FUNCTIONS
    const query = scopeRelType === ScopeRelType.USER ? GET_USER_SCOPE_QUERY : 
                    scopeRelType === ScopeRelType.CLIENT ? GET_CLIENT_SCOPE_QUERY :
                    GET_AUTHORIZATION_GROUP_SCOPE_QUERY;

    const variables = scopeRelType === ScopeRelType.USER ? {userId: id} :
                        scopeRelType === ScopeRelType.CLIENT ? {clientId: id} :
                        {groupId: id};

    const {data, loading, error} = useQuery(query, {
        variables: variables,
        onCompleted(data) {
            if(scopeRelType === ScopeRelType.CLIENT){
                setArrScope(data.getClientScopes);
            }
            else if(scopeRelType === ScopeRelType.USER){
                setArrScope(data.getUserScopes);
            }
            else{
                setArrScope(data.getAuthorizationGroupScopes);
            }
        },
    });


    // HANDLER FUNCTIONS
    const handlePageChange = (_: any, page: number) => {
        setPage(page + 1);
    }

    
        if (loading) return <DataLoading dataLoadingSize="sm" color={null} />
        if (error) return <ErrorComponent message={error.message} componentSize='sm' />
    
        if(data) return (
            <Typography component="div">
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                    </Grid2>
                }
                {/* {showRemoveConfirmationDialog &&
                    <Dialog 
                        open={showRemoveConfirmationDialog}
                        onClose={() => setShowRemoveConfirmationDialog(false)}
                        fullWidth={true}
                        maxWidth={"sm"}
                    >
                        <DialogContent>
                            <Typography component="div">
                                <span>Confirm removal of scope: </span><span style={{fontWeight: "bold"}}>{selectedScopeToRemove?.name || ""}</span>
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setShowRemoveConfirmationDialog(false)}>Cancel</Button>
                            <Button onClick={() => {
                                setShowRemoveConfirmationDialog(false);
                                onUpdateStart();
                                removeTenantFromScopeMutation();
                            }}>Confirm</Button>
                        </DialogActions>
    
                    </Dialog>
                } */}
                {selectDialogOpen &&
                    <Dialog
                        open={selectDialogOpen}
                        onClose={() => setSelectDialogOpen(false)}
                        maxWidth={"sm"}
                        fullWidth={true}
                    >
                        <GeneralSelector 
                            query={SCOPE_QUERY}
                            queryVars={{tenantId: tenantId, filterBy: ScopeFilterCriteria.Available}}
                            dataMapper={(d) => {
                                const preExistingIds = arrScope.map( (scope: Scope) => scope.scopeId);                            
                                if(d && d.getScope){
                                    return d.getScope
                                    .filter(
                                        (scope: Scope) => {
                                            return !preExistingIds.includes(scope.scopeId)
                                        }
                                    )                                
                                    .map(
                                        (scope: Scope) => {
                                            return {
                                                id: scope.scopeId,
                                                label: scope.scopeName
                                            }
                                        }
                                    )
                                }
                                else{
                                    return [];
                                }
                            }}
                            helpText="Select a Scope"
                            onCancel={() => setSelectDialogOpen(false)}
                            onSelected={(scopeId: string) => {
                                setSelectDialogOpen(false); 
                                onUpdateStart();
                                // assignTenantToScopeMutation({
                                //     variables: {
                                //         scopeId: scopeId,
                                //         tenantId: tenantId
                                //     }
                                // });                            
                            }}
                            selectorLabel="Select a scope"
                        />
                    </Dialog>
                } 
                <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                    <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                        <AddBoxIcon
                            sx={{cursor: "pointer"}}
                            onClick={() => setSelectDialogOpen(true)}
                        />
                        <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Scope</div>
                    </Grid2>                
                </Grid2>
                <Divider />
                <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={1} container size={12} fontWeight={"bold"}>
                    <Grid2 size={responseBreakPoints.isMedium ? 11 : 3}>Name</Grid2>
                    {!responseBreakPoints.isMedium &&
                        <Grid2 size={4.5}>
                            Description
                        </Grid2>
                    }
                    {!responseBreakPoints.isMedium &&
                        <Grid2 size={3.5}>
                            Use
                        </Grid2>
                    }
                    <Grid2 size={1}></Grid2>
                </Grid2>
                <Divider />
                {arrScope.length === 0 &&
                    <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                        <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                            No scope assigned to {scopeRelType === ScopeRelType.USER ? "user" : scopeRelType === ScopeRelType.CLIENT ? "client" : "authorization group"}
                        </Grid2>
                    </Grid2>
                }
                {arrScope.length > 0 &&
                    <Grid2 marginTop={"16px"} spacing={1} container size={12}>
                        {arrScope.slice((page - 1) * 10, page * 10).map(
                            (scope: Scope) => (
                                <React.Fragment key={scope.scopeId}>                                
                                    <Grid2 size={responseBreakPoints.isMedium ? 11 : 3}>
                                        <span style={{textDecoration: "underline"}}>
                                            {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                                <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/scope-access-control/${scope.scopeId}`}>{scope.scopeName}</Link>
                                            }
                                            {tenantBean.getTenantMetaData().tenant.tenantType !== TENANT_TYPE_ROOT_TENANT &&
                                                <>{scope.scopeName}</>
                                            }
                                        </span>
                                    </Grid2>
                                    {!responseBreakPoints.isMedium &&
                                        <Grid2 size={4.5}>
                                            {scope.scopeDescription}
                                        </Grid2>
                                    }
                                    {!responseBreakPoints.isMedium &&
                                        <Grid2 size={3.5}>
                                            {SCOPE_USE_DISPLAY.get(scope.scopeUse)}
                                        </Grid2>
                                    }
                                    
                                    <Grid2 size={1}>
                                            <RemoveCircleOutlineIcon
                                                sx={{cursor: "pointer"}}
                                                onClick={() => {
                                                    // setSelectedScopeToRemove({id: scope.scopeId, name: scope.scopeName}); 
                                                    // setShowRemoveConfirmationDialog(true);
                                                }}
                                            />
                                                                 
                                    </Grid2>
                                    <Grid2 size={12}><Divider /></Grid2>
                                </React.Fragment>
                            )
                        )}
                    </Grid2>
                }
                <TablePagination
                    component={"div"}
                    page={page - 1}
                    rowsPerPage={10}
                    count={arrScope.length}
                    onPageChange={handlePageChange}
                    rowsPerPageOptions={[]}
                />
    
            </Typography>
        )
    


}

export default ScopeRelConfiguration