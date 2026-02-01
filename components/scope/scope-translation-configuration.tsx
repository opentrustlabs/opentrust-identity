"use client";
import { PortalUserProfile, Scope, ScopeTranslation, ScopeTranslationInput } from "@/graphql/generated/graphql-types";
import { SCOPE_TRANSLATION_CREATE_MUTATION, SCOPE_TRANSLATION_DELETE_MUTATION, SCOPE_TRANSLATION_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { SCOPE_TRANSLATIONS_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import { Alert, Button, DialogActions, DialogContent, DialogTitle, Divider, Grid2, MenuItem, Select, TextField, Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import React, { useContext } from "react";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'; 
import AddBoxIcon from '@mui/icons-material/AddBox';
import { AuthContextProps, AuthContext } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { SCOPE_UPDATE_SCOPE, SUPPORTED_LANGUAGES, TRANSLATED_LANGUAGES } from "@/utils/consts";
import { useIntl } from "react-intl";

export interface ScopeTranslationConfigurationProps {
    scope: Scope,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
}

const ScopeTranslationConfiguration: React.FC<ScopeTranslationConfigurationProps> = ({
    scope,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES    
    //const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();

    // STATE VARIABLES
    const initInput: ScopeTranslationInput = {
        scopeId: scope.scopeId,
        languageCode: "en",
        translation: ""
    }
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = React.useState<boolean>(false);
    const [showUpdateDialog, setShowUpdateDialog] = React.useState<boolean>(false);
    const [showDeletionConfirmDialog, setShowDeletionConfirmDialog] = React.useState<boolean>(false);
    const [languageCodeToDelete, setLanguageCodeToDelete] = React.useState<string | null>(null);
    const [scopeTranslationInput, setScopeTranslationInput] = React.useState<ScopeTranslationInput>(initInput);
    const [canEdit] = React.useState<boolean>(containsScope(SCOPE_UPDATE_SCOPE, profile?.scope));

    // GRAPHQL FUNCTIONS
    const {data, loading, error, refetch} = useQuery(SCOPE_TRANSLATIONS_QUERY, {
        variables: {
            scopeId: scope.scopeId
        }
    });

    const [scopeTranslationCreateMutation] = useMutation(SCOPE_TRANSLATION_CREATE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setScopeTranslationInput({...initInput});
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setScopeTranslationInput({...initInput});
            setErrorMessage(intl.formatMessage({ id: error.message }));
        }
    });

    const [scopeTranslationUpdateMutation] = useMutation(SCOPE_TRANSLATION_UPDATE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setScopeTranslationInput({...initInput});
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setScopeTranslationInput({...initInput});
            setErrorMessage(intl.formatMessage({ id: error.message }));
        }
    });

    const [scopeTranslationDeleteMutation] = useMutation(SCOPE_TRANSLATION_DELETE_MUTATION, {
        onCompleted() {
            onUpdateEnd(true);
            setScopeTranslationInput({...initInput});
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setScopeTranslationInput({...initInput});
            setErrorMessage(intl.formatMessage({ id: error.message }));
        }
    });

    // UTILITY FUNCTIONS
    const getRemainingLanguages = () => {
        const langs: Array<string> = [];
        if(!data.getScopeTranslations || data.getScopeTranslations.length === 0){
            return SUPPORTED_LANGUAGES;
        }
        const existingTrans: Array<ScopeTranslation> = data.getScopeTranslations as Array<ScopeTranslation>;
        for(let i = 0; i < SUPPORTED_LANGUAGES.length; i++){
            const translationRecord = existingTrans.find(
                (t: ScopeTranslation) => t.languageCode === SUPPORTED_LANGUAGES[i]
            );
            if(!translationRecord){
                langs.push(SUPPORTED_LANGUAGES[i]);
            }
        }
        return langs;        
    }

    // TODO 
    // Change the EDIT functionality to be within the translation itself, which should
    // be a TextField with an edit icon at the end. When changed to edit, should see
    // both an X icon to cancel and a save icon to update.
    return (
        <Typography component="div">
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
            }
            {showUpdateDialog &&
                <Dialog
                    open={showUpdateDialog}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle>Edit translation - <span style={{fontWeight: "bold"}}>{scope.scopeDescription}</span></DialogTitle>
                    <DialogContent>
                        <Grid2 marginTop={"8px"} container size={12} spacing={1}>
                            <Grid2 size={3}>
                                <TextField
                                    select
                                    disabled={true}
                                    label="Language"
                                    fullWidth={true}
                                    value={scopeTranslationInput.languageCode}
                                    name="languageCode"
                                    onChange={(evt) => {
                                        scopeTranslationInput.languageCode = evt.target.value;
                                        setScopeTranslationInput({...scopeTranslationInput});
                                    }}
                                
                                >
                                    <MenuItem
                                        value={scopeTranslationInput.languageCode}
                                    >
                                        {TRANSLATED_LANGUAGES.get(scopeTranslationInput.languageCode)}
                                    </MenuItem>
                                </TextField>
                            </Grid2>
                            <Grid2 size={9}>
                                <TextField
                                    rows={2}
                                    fullWidth={true}
                                    value={scopeTranslationInput.translation || ""}
                                    name="translatedValue"
                                    onChange={(evt) => {
                                        scopeTranslationInput.translation = evt.target.value;
                                        setScopeTranslationInput({...scopeTranslationInput});
                                    }}                                        
                                />
                            </Grid2>                                    
                        </Grid2>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setShowUpdateDialog(false);
                                setScopeTranslationInput({...initInput});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={scopeTranslationInput.translation === null || scopeTranslationInput.translation === ""}
                            onClick={() => {
                                setShowUpdateDialog(false);
                                onUpdateStart();
                                scopeTranslationUpdateMutation({
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
            {showCreateDialog &&
                <Dialog
                    open={showCreateDialog}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle>Add translation - <span style={{fontWeight: "bold"}}>{scope.scopeDescription}</span></DialogTitle>
                    <DialogContent>                        
                        <Grid2 marginTop={"8px"} container size={12} spacing={1}>
                            <Grid2 size={3}>
                                <TextField
                                    select
                                    label="Language"
                                    fullWidth={true}
                                    value={scopeTranslationInput.languageCode}
                                    name="languageCode"
                                    onChange={(evt) => {
                                        scopeTranslationInput.languageCode = evt.target.value;
                                        setScopeTranslationInput({...scopeTranslationInput});
                                    }}
                                
                                >
                                    {getRemainingLanguages().map(
                                        (languageCode: string) => (
                                            <MenuItem
                                                value={languageCode}
                                            >
                                                {TRANSLATED_LANGUAGES.get(languageCode)}
                                            </MenuItem>
                                        )
                                    )}
                                </TextField>
                            </Grid2>
                            <Grid2 size={9}>
                                <TextField
                                    rows={2}
                                    fullWidth={true}
                                    value={scopeTranslationInput.translation || ""}
                                    name="translatedValue"
                                    onChange={(evt) => {
                                        scopeTranslationInput.translation = evt.target.value;
                                        setScopeTranslationInput({...scopeTranslationInput});
                                    }}                                        
                                />
                            </Grid2>                                    
                        </Grid2>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setShowCreateDialog(false);
                                setScopeTranslationInput({...initInput});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={scopeTranslationInput.translation === null || scopeTranslationInput.translation === ""}
                            onClick={() => {
                                setShowCreateDialog(false);
                                onUpdateStart();
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
            {showDeletionConfirmDialog &&
                <Dialog
                    open={showDeletionConfirmDialog}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>
                            Confirm remove of translation
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowDeletionConfirmDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                onUpdateStart();
                                setShowDeletionConfirmDialog(false);
                                scopeTranslationDeleteMutation({
                                    variables: {
                                        scopeId: scope.scopeId,
                                        languageCode: languageCodeToDelete
                                    }
                                });
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>

                </Dialog>
            }
            <Grid2 marginBottom={"32px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <AddBoxIcon
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                            setShowCreateDialog(true);
                        }}
                    />
                    <div style={{ marginLeft: "8px", fontWeight: "bold" }}>Add Translation</div>
                </Grid2>
            </Grid2>
            <Grid2 marginBottom={"8px"} marginTop={"16px"} spacing={1} container size={12} fontWeight={"bold"}>
                {canEdit &&
                    <Grid2 size={1}></Grid2>
                }
                <Grid2 size={2}>Language</Grid2>
                <Grid2 size={canEdit ? 8 : 10}>Translation</Grid2>
                {canEdit &&
                    <Grid2 size={1}></Grid2>
                }
                
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
                        (scopeTranslation: ScopeTranslation, idx: number) => (
                            <React.Fragment key={`${scopeTranslation.scopeId}::${scopeTranslation.languageCode}`}>
                                {canEdit &&
                                    <Grid2 size={1}>
                                        <EditOutlinedIcon 
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => {
                                                setScopeTranslationInput({
                                                    scopeId: scopeTranslation.scopeId,
                                                    languageCode: scopeTranslation.languageCode,
                                                    translation: scopeTranslation.translation
                                                });
                                                setShowUpdateDialog(true);
                                            }}                                        
                                        />
                                    </Grid2>
                                }
                                <Grid2 size={2}>{TRANSLATED_LANGUAGES.get(scopeTranslation.languageCode)}</Grid2>
                                <Grid2 size={canEdit ? 8 : 10}>{scopeTranslation.translation}</Grid2>
                                {canEdit &&
                                    <Grid2 size={1}>
                                        <RemoveCircleOutlineIcon 
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => {
                                                setLanguageCodeToDelete(scopeTranslation.languageCode);
                                                setShowDeletionConfirmDialog(true);
                                            }}
                                        />
                                    </Grid2>
                                }
                                {idx < data.getScopeTranslations.length - 1 &&
                                    <Grid2 size={12}><Divider /></Grid2>
                                }                                
                            </React.Fragment>
                            
                        )
                    )}
                </Grid2>
            }
            
        </Typography>



    )
}

export default ScopeTranslationConfiguration