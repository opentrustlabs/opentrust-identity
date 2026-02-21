"use client";
import { CLIENT_TOKEN_ENRICHMENT_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { TokenEnrichmentConfiguration, TokenEnrichmentConfigurationInput, TokenEnrichmentFailureMode } from "@/graphql/generated/graphql-types";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import { MAX_TOKEN_ENRICHMENT_REQUEST_TIMEOUT_MS } from "@/utils/consts";
import { CLIENT_TOKEN_ENRICHMENT_DELETE_MUTATION, CLIENT_TOKEN_ENRICHMENT_SET_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { useIntl } from "react-intl";

export interface ClientTokenEnrichmentConfigurationProps {
    clientId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const ClientTokenEnrichmentConfiguration: React.FC<ClientTokenEnrichmentConfigurationProps> = ({
    clientId,
    onUpdateEnd,
    onUpdateStart
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const [enrichmentUri, setEnrichmentUri] = React.useState<string>("");
    const [timeoutMs, setTimeoutMs] = React.useState<string>("");
    const [failureMode, setFailureMode] = React.useState<string>("");
    const [revertToInput, setRevertToInput] = React.useState<TokenEnrichmentConfiguration>();
    const [showConfirmDeleteConfiguration, setShowConfirmDeleteConfiguration] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    const {data, error, loading} = useQuery(CLIENT_TOKEN_ENRICHMENT_QUERY, {
        variables: {
            clientId: clientId
        },
        onCompleted(data) {
            // TODO
            // UPDATE THE INPUT VALUES
            if(data && data.getTokenEnrichmentConfiguration){
                const config = data.getTokenEnrichmentConfiguration as TokenEnrichmentConfiguration;
                setEnrichmentUri(config.uri);
                setFailureMode(config.failureMode);
                setTimeoutMs(config.timeoutMs.toString());
                setRevertToInput({
                    clientId: clientId,
                    uri: config.uri,
                    failureMode: config.failureMode,
                    timeoutMs: config.timeoutMs
                });
            }
        },
    });

    const [tokenEnrichmentSetMutation] = useMutation(CLIENT_TOKEN_ENRICHMENT_SET_MUTATION, {

        onCompleted(data) {
            onUpdateEnd(true);
            const config = data.setClientTokenEnrichmentConfiguration as TokenEnrichmentConfiguration;
            setEnrichmentUri(config.uri);
            setFailureMode(config.failureMode);
            setTimeoutMs(config.timeoutMs.toString());
            setRevertToInput({
                clientId: clientId,
                uri: config.uri,
                failureMode: config.failureMode,
                timeoutMs: config.timeoutMs
            });
            setMarkDirty(false);

        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({ id: error.message }));
        },
        
    });

    const [tokenEnrichmentDeleteMutation] = useMutation(CLIENT_TOKEN_ENRICHMENT_DELETE_MUTATION, {
        variables: {
            clientId: clientId
        },
        onCompleted() {
            onUpdateEnd(true);
            setEnrichmentUri("");
            setFailureMode("");
            setTimeoutMs("");
            setMarkDirty(false);
            setRevertToInput({
                clientId: clientId,
                uri: "",
                failureMode: TokenEnrichmentFailureMode.FailClosed,
                timeoutMs: 0
            });
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({ id: error.message }));
        },
        
    })

    if(loading) return <DataLoading dataLoadingSize="md" color={null}/>

    if(error) return <ErrorComponent componentSize="md" message={error.message} />

    if(data) return (
        <React.Fragment>
            {showConfirmDeleteConfiguration &&
                <Dialog
                    open={showConfirmDeleteConfiguration}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>
                            Confirm that you want to remove the token enrichment configuration
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button  
                            onClick={() => setShowConfirmDeleteConfiguration(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => {
                                setShowConfirmDeleteConfiguration(false);
                                onUpdateStart();
                                tokenEnrichmentDeleteMutation()
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            }
             <Grid2 container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                    </Grid2>
                }
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <TextField name="callbackUri" id="callbackUri"
                        disabled={false}
                        value={enrichmentUri}
                        onChange={(evt) => { 
                            setEnrichmentUri(evt.target.value)
                            setMarkDirty(true); 
                        }}
                        fullWidth={true} 
                        label="Enrichment URI"
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <TextField 
                        name="failureMode"
                        select
                        fullWidth={true}
                        value={failureMode}
                        label="Failure Mode"
                        onChange={(evt) => {
                            setFailureMode(evt.target.value);
                            setMarkDirty(true);
                        }}
                    >
                        <MenuItem value="">Select...</MenuItem>
                        <MenuItem value={TokenEnrichmentFailureMode.FailOpen}>Issue a token if the service fails</MenuItem>
                        <MenuItem value={TokenEnrichmentFailureMode.FailClosed}>Do not issue a token if the service fails</MenuItem>
                    </TextField>                            
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <TextField
                        name="timeoutMs"
                        fullWidth={true}
                        label={"Callback timeout in milliseconds - maximum of 3000"}
                        type="number"
                        value={timeoutMs}
                        onChange={(evt) => {
                            let v = 0;
                            try{
                                v = parseInt(evt.target.value);
                                if(v < 0 || v > MAX_TOKEN_ENRICHMENT_REQUEST_TIMEOUT_MS){
                                    v = MAX_TOKEN_ENRICHMENT_REQUEST_TIMEOUT_MS;                                    
                                }
                                setTimeoutMs(v.toString());
                            }
                            catch{
                                setTimeoutMs(v.toString());
                            }
                        }}
                    />
                </Grid2>
            </Grid2>
            <DetailSectionActionHandler
                onDiscardClickedHandler={() => {
                    setEnrichmentUri(revertToInput?.uri || "");
                    setFailureMode(revertToInput?.failureMode || TokenEnrichmentFailureMode.FailClosed);
                    setTimeoutMs(revertToInput?.timeoutMs.toString() || "");
                    setMarkDirty(false);
                }}
                onUpdateClickedHandler={() => {
                    onUpdateStart(); 
                    tokenEnrichmentSetMutation({
                        variables: {
                            enrichmentInput: {
                                clientId: clientId,
                                failureMode: failureMode,
                                timeoutMs: parseInt(timeoutMs),
                                uri: enrichmentUri
                            }
                        }
                    });
                }}
                markDirty={markDirty}
                disableSubmit={false}
                enableRestoreDefault={true}
                tooltipTitle="Delete token enrichment configuration"
                restoreDefaultHandler={() => {
                    setShowConfirmDeleteConfiguration(true);
                }}
            />
        </React.Fragment>
    )
}

export default ClientTokenEnrichmentConfiguration;