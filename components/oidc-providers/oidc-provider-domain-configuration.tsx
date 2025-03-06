"use client";
import { FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY } from "@/graphql/queries/oidc-queries";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Grid2";
import Alert from "@mui/material/Alert";
import { ASSIGN_DOMAIN_TO_FEDERATED_OIDC_PROVIDER_MUTATION, REMOVE_DOMAIN_FROM_FEDERATED_OIDC_PROVIDER_MUTATION } from "@/graphql/mutations/oidc-mutations";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, DialogActions, DialogContent, Divider, TextField } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import FederatedOIDCProviderDomainRelEntity from "@/lib/entities/federated-oidc-provider-domain-rel-entity";
import { FederatedOidcProviderDomainRel } from "@/graphql/generated/graphql-types";

export interface FederatedOIDCProviderDomainConfigurationProps {
    federatedOIDCProviderId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void
}

const FederatedOIDCProviderDomainConfiguration: React.FC<FederatedOIDCProviderDomainConfigurationProps> = ({
    federatedOIDCProviderId,
    onUpdateEnd,
    onUpdateStart
}) => {


    // STATE VARIABLES
    const [domainToAdd, setDomainToAdd] = React.useState<string | null>(null);
    const [domainToRemove, setDomainToRemove] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [addErrorMessage, setAddErrorMessage] = React.useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = React.useState<boolean>(false);
    const [showRemoveDialog, setShowRemoveDialog] = React.useState<boolean>(false);
    const [existingOIDCProviderDomainRel, setExistingOIDCProviderDomainRel] = React.useState<FederatedOIDCProviderDomainRelEntity | null>(null);



    // GRAPHQL FUNCTIONS
    const {data, loading, error} = useQuery(FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY, {
        variables: {
            federatedOIDCProviderId: federatedOIDCProviderId
        }
    });

    const [fetchRels] = useLazyQuery(FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY);

    const [assignFederatedOIDCDomainMutation] = useMutation(ASSIGN_DOMAIN_TO_FEDERATED_OIDC_PROVIDER_MUTATION,{
        variables: {
            federatedOIDCProviderId: federatedOIDCProviderId,
            domain: domainToAdd
        },
        onCompleted() {
            onUpdateEnd(true);
            setShowAddDialog(false);
            setDomainToAdd(null);
        },
        onError(error){
            onUpdateEnd(false);
            //setShowAddDialog(false);
            setAddErrorMessage(error.message);
        },
        refetchQueries: [FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY]
    });

    const [removeFederatedOIDCDomainMutation] = useMutation(REMOVE_DOMAIN_FROM_FEDERATED_OIDC_PROVIDER_MUTATION, {
        variables: {
            domain: domainToRemove,
            federatedOIDCProviderId: federatedOIDCProviderId
        },
        onCompleted() {
            onUpdateEnd(true);
            setShowRemoveDialog(false);
            setDomainToAdd(null);
        },
        onError(error){
            onUpdateEnd(false);
            setShowRemoveDialog(false);
            setErrorMessage(error.message);
        },
        refetchQueries: [FEDERATED_OIDC_PROVIDER_DOMAIN_REL_QUERY]
    });

    
    // HANDLER FUNCTIONS
    const isValidDomain = (domain: string | null) => {
        if(!domain){
            return false;
        }
        const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
        return domainRegex.test(domain);
    }

    const handleAddDomain = async () => {
        // If the domain is already in the list, then just set an error message
        if(data && data.getFederatedOIDCProviderDomainRels.length > 0){
            const arr: Array<FederatedOIDCProviderDomainRelEntity> = data.getFederatedOIDCProviderDomainRels;
            const existing = arr.find(
                (r: FederatedOIDCProviderDomainRelEntity) => r.domain === domainToAdd
            )
            if(existing){
                setAddErrorMessage("The domain is already attached to this provider");
                return;
            }
        }

        onUpdateStart();
        const {data: fData, error: fError, loading: fLoading} = await fetchRels({
            variables: {
                domain: domainToAdd
            }
        });
        console.log(fData);
        console.log(fError);
        console.log(fLoading);

        // It means that this domain is already assigned to a different OIDC provider
        // and should be removed from there first.
        if(fData && fData.getFederatedOIDCProviderDomainRels && fData.getFederatedOIDCProviderDomainRels.length > 0){
            onUpdateEnd(false);
            setAddErrorMessage("The domain is already attached to a different OIDC provider");
            setExistingOIDCProviderDomainRel(fData.getFederatedOIDCProviderDomainRels[0]);
        }
        else{
            assignFederatedOIDCDomainMutation();
        }        
    }

    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />

    return (
        <Typography component="div">
            {errorMessage &&
                <Grid2 marginBottom={"16px"} size={12} >
                    <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                </Grid2>
            }
            {showRemoveDialog &&
                <Dialog
                    open={showRemoveDialog}
                    onClose={() => setShowRemoveDialog(false)}
                >
                    <DialogContent>
                        <span>Confirm remove of domain: </span><span style={{fontWeight: "bold"}}>{domainToRemove}</span>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => {
                                setDomainToRemove(null);
                                setShowRemoveDialog(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => {
                                onUpdateStart();
                                removeFederatedOIDCDomainMutation();
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            {showAddDialog &&
                <Dialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    maxWidth={"sm"}
                    fullWidth={true}
                >
                    <DialogTitle>Add domain</DialogTitle>
                    <DialogContent>
                        <Grid2 spacing={2} container size={12}>
                        {addErrorMessage &&
                            <Grid2 size={12}>
                                <Alert onClose={() => setAddErrorMessage(null)} severity="error">{addErrorMessage}</Alert>
                            </Grid2>
                        }
                        <Grid2 size={12}>
                            <TextField
                                fullWidth={true}
                                onChange={(evt) => setDomainToAdd(evt.target.value)}                            
                            />
                        </Grid2>   
                        </Grid2>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button 
                            onClick={() => {
                                handleAddDomain();
                            }}
                            disabled={
                                !isValidDomain(domainToAdd)
                            }
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            <Grid2 marginBottom={"16px"} marginTop={"16px"} spacing={2} container size={12}>
                <Grid2 size={12} display={"inline-flex"} alignItems="center" alignContent={"center"}>
                    <AddBoxIcon
                        sx={{cursor: "pointer"}}
                        onClick={() => setShowAddDialog(true)}
                    />
                    <div style={{marginLeft: "8px", fontWeight: "bold"}}>Add Domain</div>
                </Grid2>
                
            </Grid2>
            <Divider />
            {data.getFederatedOIDCProviderDomainRels.length === 0 &&
                <Grid2 marginTop={"16px"}  spacing={2} container size={12} textAlign={"center"} >    
                    <Grid2 margin={"8px 0px 8px 0px"} textAlign={"center"} size={12} spacing={1}>
                        No domains found
                    </Grid2>
                </Grid2>
            }
            {data.getFederatedOIDCProviderDomainRels.length > 0 &&
                <Grid2 spacing={1} container size={12}>
                    {data.getFederatedOIDCProviderDomainRels.map(
                        (domainRel: FederatedOidcProviderDomainRel) => (
                            <React.Fragment key={domainRel.domain}>
                                <Grid2 size={12}><Divider /></Grid2>
                                <Grid2 size={11}>
                                    {domainRel.domain}                                    
                                </Grid2>
                                <Grid2 size={1}>
                                    <RemoveCircleOutlineIcon
                                        sx={{cursor: "pointer"}}
                                        onClick={() => {setDomainToRemove(domainRel.domain); setShowRemoveDialog(true);}}
                                    />
                                </Grid2>                                
                            </React.Fragment>
                        )
                    )}
                </Grid2>
            }   

        </Typography>
    )

}

export default FederatedOIDCProviderDomainConfiguration;