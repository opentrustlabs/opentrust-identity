"use client";
import { ClientFapiConfigurationInput } from "@/graphql/generated/graphql-types";
import { DELETE_CLIENT_FAPI_CONFIGURATION_MUTATION, SET_CLIENT_FAPI_CONFIGURATION_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { CLIENT_FAPI_CONFIGURATION_QUERY } from "@/graphql/queries/oidc-queries";
import { FAPI_ID_TYPE_SAN_URI, FAPI_ID_TYPES } from "@/utils/consts";
import { useMutation, useQuery } from "@apollo/client";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Grid2 from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";
import { useIntl } from "react-intl";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";


export interface ClientFapiConfigurationProps {
    clientId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const ClientFapiConfigurationComponent: React.FC<ClientFapiConfigurationProps> = ({
    clientId,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {


    // CONTEXT VARIABLES
    const intl = useIntl();

    // STATE VARIABLES
    const initInput: ClientFapiConfigurationInput = {
        clientId: clientId,
        identifierType: FAPI_ID_TYPE_SAN_URI,
        identifierValue: ""
    }
    const [fapiConfigurationInput, setFapiConfigurationInput] = React.useState<ClientFapiConfigurationInput>(initInput);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [revertToInput, setRevertToInput] = React.useState<ClientFapiConfigurationInput>(initInput);
    const [showConfirmRemoveClientFapiConfiguration, setShowConfirmRemoveClientFapiConfiguration] = React.useState<boolean>(false);


    // GRAPHQL FUNCTIONS
    const {  } = useQuery(
        CLIENT_FAPI_CONFIGURATION_QUERY,
        {
            variables: {
                clientId: clientId
            },
            onCompleted(data) {
                if(data && data.getClientFapiConfiguration){
                    const input: ClientFapiConfigurationInput = {
                        clientId: clientId,
                        identifierType: data.getClientFapiConfiguration.identifierType,
                        identifierValue: data.getClientFapiConfiguration.identifierValue
                    }
                    setFapiConfigurationInput(input);
                    setRevertToInput({...input});
                }
            },
            onError(error) {
                setErrorMessage(intl.formatMessage({id: error.message}));
            }
        }
    )

    const [setClientFapiConfigurationMutation] = useMutation(SET_CLIENT_FAPI_CONFIGURATION_MUTATION, {
        variables: {
            fapiConfigurationInput: fapiConfigurationInput
        },
        onCompleted(data) {
            onUpdateEnd(true);
            setMarkDirty(false);
            if (data && data.setClientFapiConfiguration) {
                const input: ClientFapiConfigurationInput = {
                    clientId: clientId,
                    identifierType: data.setClientFapiConfiguration.identifierType,
                    identifierValue: data.setClientFapiConfiguration.identifierValue
                };
                setFapiConfigurationInput(input);
                setRevertToInput({...input});
            }
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({ id: error.message }));
        }
    });

    const [deleteClientFapiConfigurationMutation] = useMutation(DELETE_CLIENT_FAPI_CONFIGURATION_MUTATION, {
        variables: {
            clientId: clientId
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
            setFapiConfigurationInput({ ...initInput });
            setRevertToInput({ ...initInput });
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(intl.formatMessage({ id: error.message }));
        }
    })


    return (
        <React.Fragment>
            
            {showConfirmRemoveClientFapiConfiguration &&
                <Dialog
                    open={showConfirmRemoveClientFapiConfiguration}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>
                            Confirm that you want to remove FAPI configuration settings for this client:
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setShowConfirmRemoveClientFapiConfiguration(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowConfirmRemoveClientFapiConfiguration(false);
                                onUpdateStart();
                                deleteClientFapiConfigurationMutation();
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            }

            <Grid2 marginTop={"16px"} marginBottom={"8px"} container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>
                    </Grid2>
                }
                <React.Fragment>
                    <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                        <TextField
                            disabled={true}                            
                            label="FAPI ID Type"
                            fullWidth
                            value={fapiConfigurationInput.identifierType}
                            name="identifierType"                            
                        />                        
                    </Grid2>
                    <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >

                        <TextField name="identifierValue" id="tokenTTidentifierValueLSeconds"
                            
                            disabled={readOnly}
                            value={fapiConfigurationInput.identifierValue}
                            onChange={(evt) => {
                                fapiConfigurationInput.identifierValue = evt.target.value;
                                setFapiConfigurationInput({ ...fapiConfigurationInput });
                                setMarkDirty(true);
                            }}
                            fullWidth={true}
                            label="FAPI ID Value"
                        />
                    </Grid2>
                </React.Fragment>

            </Grid2>
            <DetailSectionActionHandler
                onDiscardClickedHandler={() => {
                    setFapiConfigurationInput({ ...revertToInput });
                    setMarkDirty(false);
                }}
                onUpdateClickedHandler={() => {
                    onUpdateStart();
                    setClientFapiConfigurationMutation();
                }}
                markDirty={markDirty}
                enableRestoreDefault={true}
                restoreDefaultHandler={() => {
                    setShowConfirmRemoveClientFapiConfiguration(true);
                }}
                tooltipTitle="Remove FAPI binding for this client"

            />

        </React.Fragment>
    )
}

export default ClientFapiConfigurationComponent