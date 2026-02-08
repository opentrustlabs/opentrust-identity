"use client";
import { CLIENT_TOKEN_ENRICHMENT_QUERY } from "@/graphql/queries/oidc-queries";
import { useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import { TokenEnrichmentConfigurationInput, TokenEnrichmentFailureMode } from "@/graphql/generated/graphql-types";
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

    // STATE VARIABLES
    const initInput: TokenEnrichmentConfigurationInput = {
        clientId: clientId,
        failureMode: TokenEnrichmentFailureMode.FailClosed,
        timeoutMs: 0,
        uri: ""
    };


    const [enrichmentUri, setEnrichmentUri] = React.useState<string>("");
    const [timeoutMs, setTimeoutMs] = React.useState<string>("");
    const [failureMode, setFailureMode] = React.useState<string>("");

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
        },
    });

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
                                //removeTenantLookAndFeelMutation();
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
                            //tenantLookAndFeelInput.authenticationheaderbackgroundcolor = evt.target.value; 
                            //setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); 
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
                        label={"Callback timeout in milliseconds - between 50 and 5000"}
                        type="number"
                        value={timeoutMs}
                    />
                </Grid2>
            </Grid2>
            <DetailSectionActionHandler
                onDiscardClickedHandler={() => {
                    //setTenantLookAndFeelInput({...revertToInput as TenantLookAndFeelInput});
                    setMarkDirty(false);
                }}
                onUpdateClickedHandler={() => {
                    // onUpdateStart(); 
                    //mutateTenantLookAndFeel();
                }}
                markDirty={markDirty}
                disableSubmit={false}
                enableRestoreDefault={true}
                restoreDefaultHandler={() => {
                    // setShowConfirmRestoreLookAndFeelDefaultDialog(true);                    
                }}
            />
        </React.Fragment>
    )
}

export default ClientTokenEnrichmentConfiguration;