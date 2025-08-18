"use client";
import { AUTHENTICATION_GROUPS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT_MUTATION, REMOVE_AUTHENTICATION_GROUP_FROM_CLIENT_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { AuthenticationGroup, PortalUserProfile } from "@/graphql/generated/graphql-types";
import GeneralSelector from "../dialogs/general-selector";
import { TenantContext, TenantMetaDataBean } from "../contexts/tenant-context";
import Link from "next/link";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE } from "@/utils/consts";


export interface ClientAuthenticationGroupConfigurationProps {
    tenantId: string,
    clientId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const ClientAuthenticationGroupConfiguration: React.FC<ClientAuthenticationGroupConfigurationProps> = ({
    tenantId,
    clientId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    
    // STATE VARIABLES
    const [groupToRemove, setGroupToRemove] = React.useState<AuthenticationGroup | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
    const [showRemoveConfirmationDialog, setShowRemoveConfirmationDialog] = React.useState(false);
    const [canAddRel] = React.useState<boolean>(containsScope(AUTHENTICATION_GROUP_CLIENT_ASSIGN_SCOPE, profile?.scope || []));
    const [canRemoveRel] = React.useState<boolean>(containsScope(AUTHENTICATION_GROUP_CLIENT_REMOVE_SCOPE, profile?.scope || []));


    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(AUTHENTICATION_GROUPS_QUERY, {
        variables: {
            clientId: clientId
        }
    });

    const [addAuthenticationGroupMutation] = useMutation(ASSIGN_AUTHENTICATION_GROUP_TO_CLIENT_MUTATION, {        
        onCompleted() {
            onUpdateEnd(true);
            setSelectDialogOpen(false);
        },
        onError(error) {
            onUpdateEnd(false);            
            setErrorMessage(error.message);
        },
        refetchQueries: [AUTHENTICATION_GROUPS_QUERY]
    });

    const [removeAuthenticationGroupMutation] = useMutation(REMOVE_AUTHENTICATION_GROUP_FROM_CLIENT_MUTATION, {
        variables: {
            clientId: clientId,
            authenticationGroupId: groupToRemove?.authenticationGroupId
        },
        onCompleted() {
            onUpdateEnd(true);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [AUTHENTICATION_GROUPS_QUERY]
    });

    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

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
                            <span>Confirm removal of group: </span><span style={{fontWeight: "bold"}}>{groupToRemove?.authenticationGroupName}</span>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRemoveConfirmationDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setShowRemoveConfirmationDialog(false);
                            onUpdateStart();
                            removeAuthenticationGroupMutation();
                        }}>Confirm</Button>
                    </DialogActions>

                </Dialog>
            }
            {selectDialogOpen &&
                <Dialog
                    open={selectDialogOpen}
                    onClose={() => setSelectDialogOpen(false)}
                    maxWidth={"sm"}
                    fullWidth={true}
                >
                    <GeneralSelector 
                        query={AUTHENTICATION_GROUPS_QUERY}
                        queryVars={{tenantId: tenantId}}
                        dataMapper={(d) => {
                            const preExistingIds = data.getAuthenticationGroups.map( (g: AuthenticationGroup) => g.authenticationGroupId);                            
                            if(d && d.getAuthenticationGroups){
                                return d.getAuthenticationGroups
                                .filter(
                                    (g: AuthenticationGroup) => {
                                        return !preExistingIds.includes(g.authenticationGroupId)
                                    }
                                )                                
                                .map(
                                    (g: AuthenticationGroup) => {
                                        return {
                                            id: g.authenticationGroupId,
                                            label: g.authenticationGroupName
                                        }
                                    }
                                )
                            }
                            else{
                                return [];
                            }
                        }}
                        multiSelect={false}
                        helpText="Select a valid group"
                        onCancel={() => setSelectDialogOpen(false)}
                        onSelected={(id: string | Array<string>) => {                            
                            onUpdateStart();
                            addAuthenticationGroupMutation({
                                variables: {
                                    clientId: clientId,
                                    authenticationGroupId: id
                                },
                            });
                        }}
                        selectorLabel="Select a group"
                    />
                </Dialog>
            }
            {canAddRel &&
                <React.Fragment>
                    <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                        <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                            <AddBoxIcon
                                sx={{cursor: "pointer"}}
                                onClick={() => setSelectDialogOpen(true)}
                            />
                            <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Authentication Group</div>
                        </Grid2>                
                    </Grid2>            
                    <Divider />
                </React.Fragment>
            }

            <Grid2 marginTop={"16px"} marginBottom={"8px"} spacing={1} container size={12} fontWeight={"bold"}>
                <Grid2 size={11}>Group name</Grid2>
                <Grid2 size={1}></Grid2>
            </Grid2>
            {data.getAuthenticationGroups.length === 0 &&
                <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No Authentication Groups Assigned
                    </Grid2>
                </Grid2>
            }
            {data.getAuthenticationGroups.length > 0 &&
                <Grid2 spacing={1} container size={12}>
                    {data.getAuthenticationGroups.map(
                        (group: AuthenticationGroup) => (
                            <React.Fragment key={group.authenticationGroupId}>
                                <Grid2 size={12}><Divider /></Grid2>
                                <Grid2 size={11}>
                                    <Link href={`/${tenantBean.getTenantMetaData().tenant.tenantId}/authentication-groups/${group.authenticationGroupId}`} target="_blank">
                                        {group.authenticationGroupName} 
                                    </Link>                                   
                                </Grid2>
                                <Grid2 minHeight={"26px"} size={1}>
                                    {canRemoveRel &&
                                        <RemoveCircleOutlineIcon
                                            sx={{cursor: "pointer"}}
                                            onClick={() => {setGroupToRemove(group); setShowRemoveConfirmationDialog(true);}}
                                        />
                                    }
                                </Grid2>                                
                            </React.Fragment>
                        )
                    )}
                </Grid2>
            }            
        </Typography>        
    )

}

export default ClientAuthenticationGroupConfiguration;