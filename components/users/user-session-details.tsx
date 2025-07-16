"use client";
import { USER_SESSION_DELETE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { USER_SESSIONS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import { UserSession, PortalUserProfile } from "@/graphql/generated/graphql-types";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Dialog from "@mui/material/Dialog";
import { Button, DialogActions, DialogContent, Divider, Portal } from "@mui/material";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { USER_SESSION_DELETE_SCOPE } from "@/utils/consts";


export interface UserSessionDetailsProps {
    userId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const UserSessionDetails: React.FC<UserSessionDetailsProps> = ({
    userId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES    
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    // STATE VARIABLES
    const [sessionToDelete, setSessionToDelete] = React.useState<null | {clientId: string, tenantId: string}>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] = React.useState<boolean>(false);
    const [canRemoveSession] = React.useState<boolean>(containsScope(USER_SESSION_DELETE_SCOPE, profile?.scope || []));

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(USER_SESSIONS_QUERY, {
        variables: {
            userId: userId
        },
        fetchPolicy: "no-cache"
    });

    const [deleteUserSessionMutation] = useMutation(USER_SESSION_DELETE_MUTATION, {
        
        onCompleted() {
            setSessionToDelete(null);
            onUpdateEnd(true);

        },
        onError(error) {
            setErrorMessage(error.message);
            onUpdateEnd(false);
        },
        refetchQueries: [USER_SESSIONS_QUERY]
    });

    if (loading) return <DataLoading dataLoadingSize="xs" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    return (
        <Typography component={"div"} >
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
            }

            <Grid2 container size={12} spacing={1} fontWeight={"bold"} marginTop={"8px"} marginBottom={"8px"}>
                <Grid2 size={6}>Tenant</Grid2>
                <Grid2 size={5}>Client</Grid2>
                <Grid2 size={1}></Grid2>
            </Grid2>
            <Divider />
            {showDeleteConfirmationDialog &&
                <Dialog
                    open={showDeleteConfirmationDialog}
                    onClose={() => setShowDeleteConfirmationDialog(false)}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>
                            Confirm deletion of session
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowDeleteConfirmationDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {                                
                                onUpdateStart();
                                setShowDeleteConfirmationDialog(false);
                                deleteUserSessionMutation({
                                    variables: {
                                        userId: userId,
                                        tenantId: sessionToDelete?.tenantId,
                                        clientId: sessionToDelete?.clientId
                                    }
                                });                                
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                    
                </Dialog>
            }
            {data && data.getUserSessions && data.getUserSessions.length === 0 &&
                <Grid2 margin={"8px 0px"} justifyContent={"center"} display={"flex"} size={12}>No user sessions</Grid2>
            }
            {data && data.getUserSessions && data.getUserSessions.length > 0 &&
                <React.Fragment>
                    {data.getUserSessions.map(
                        (session: UserSession) => (
                            <React.Fragment key={`${session.tenantId}:${session.clientId}`}>
                                <Grid2 container size={12} spacing={1} margin={"8px 0px"}>
                                    <Grid2 size={6}>{session.tenantName}</Grid2>
                                    <Grid2 size={5}>{session.clientName}</Grid2>
                                    <Grid2 minHeight={"26px"} size={1}>
                                        {canRemoveSession &&
                                            <DeleteForeverOutlinedIcon
                                                sx={{cursor: "pointer"}}
                                                onClick={() => {
                                                    setSessionToDelete({
                                                        tenantId: session.tenantId,
                                                        clientId: session.clientId
                                                    });
                                                    setShowDeleteConfirmationDialog(true);
                                                }}
                                            />
                                        }
                                    </Grid2>                                
                                </Grid2>
                                <Divider />
                            </React.Fragment>
                        )
                    )}
                </React.Fragment>
            }

        </Typography>
    )

}

export default UserSessionDetails;