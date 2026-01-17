"use client";
import { ScopeTranslation, ScopeTranslationInput } from "@/graphql/generated/graphql-types";
import { SCOPE_TRANSLATION_CREATE_MUTATION, SCOPE_TRANSLATION_DELETE_MUTATION, SCOPE_TRANSLATION_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { SCOPE_TRANSLATIONS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid2 } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import React from "react";

export interface ScopeTranslationConfigurationProps {
    scopeId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
}

const ScopeTranslationConfiguration: React.FC<ScopeTranslationConfigurationProps> = ({
    scopeId,
    onUpdateEnd,
    onUpdateStart
}) => {


    // STATE VARIABLES
    const initInput: ScopeTranslationInput = {
        scopeId: scopeId,
        languageCode: "en",
        translation: ""
    }
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = React.useState<boolean>(false);
    const [showUpdateDialog, setShowUpdateDialog] = React.useState<boolean>(false);
    const [showDeletionConfirmDialog, setShowDeletionConfirmDialog] = React.useState<boolean>(false);
    const [scopeTranslationInput, setScopeTranslationInput] = React.useState<ScopeTranslationInput>(initInput);

    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(SCOPE_TRANSLATIONS_QUERY, {
        variables: {
            scopeId: scopeId
        }
    });

    const [scopeTranslationCreateMutation] = useMutation(SCOPE_TRANSLATION_CREATE_MUTATION, {
        onCompleted(data) {
            
        },
        onError(error) {
            
        }
    });

    const [scopeTranslationUpdateMutation] = useMutation(SCOPE_TRANSLATION_UPDATE_MUTATION, {
        onCompleted(data) {
            
        },
        onError(error) {
            
        }
    });

    const [scopeTranslationDeleteMutation] = useMutation(SCOPE_TRANSLATION_DELETE_MUTATION, {
        onCompleted(data) {
            
        },
        onError(error) {
            
        }
    });

    

    return (
        <React.Fragment>
            {showCreateDialog &&
                <Dialog
                    open={showCreateDialog}
                >
                    <DialogTitle>Add translation</DialogTitle>
                    <DialogContent>

                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowCreateDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                scopeTranslationCreateMutation({
                                    variables: {
                                        scopeTranslationInput: scopeTranslationInput
                                    }
                                })
                            }}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            <Grid2 container size={12} spacing={2}>
                <Grid2 size={1}></Grid2>
                <Grid2 size={2}>Language Code</Grid2>
                <Grid2 size={8}>Translation</Grid2>
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
            {data && (!data.getScopeTranslations || data.getScopeTranslations.length === 0) &&
                <Grid2 marginTop={"16px"} spacing={2} container size={12} textAlign={"center"} >
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No translations found
                    </Grid2>
                </Grid2>
            }
            {data && data.getScopeTranslations && data.getScopeTranslations.length > 0 &&
                <Grid2 marginTop={"16px"} spacing={1} container size={12}  >
                    {data.getScopeTranslations.map(
                        (scopeTranslation: ScopeTranslation) => (
                            <React.Fragment key={`${scopeTranslation.scopeId}::${scopeTranslation.languageCode}`}>
                                <Grid2 size={1}>edit</Grid2>
                                <Grid2 size={2}>{scopeTranslation.languageCode}</Grid2>
                                <Grid2 size={8}>{scopeTranslation.translation}</Grid2>
                                <Grid2 size={1}>del</Grid2>
                            </React.Fragment>
                        )
                    )}
                </Grid2>
            }
            
        </React.Fragment>



    )
}

export default ScopeTranslationConfiguration