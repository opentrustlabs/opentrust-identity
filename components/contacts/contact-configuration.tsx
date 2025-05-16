"use client";
import { CONTACTS_QUERY } from "@/graphql/queries/oidc-queries";
import { CONTACT_TYPE_FOR_CLIENT, CONTACT_TYPE_FOR_SIGNING_KEY, CONTACT_TYPE_FOR_TENANT } from "@/utils/consts";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import ErrorComponent from "../error/error-component";
import DataLoading from "../layout/data-loading";
import { ADD_CONTACT_MUTATION, REMOVE_CONTACT_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { Contact, ContactCreateInput } from "@/graphql/generated/graphql-types";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Grid2 from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddBoxIcon from '@mui/icons-material/AddBox';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import { Box } from "@mui/material";


export type ContactForType = "tenant" | "client" | "signing-key";

export interface ContactConfigurationProps {
    contactForType: ContactForType,
    contactForId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const ContactConfiguration: React.FC<ContactConfigurationProps> = ({
    contactForType,
    contactForId,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {

    

    const type = contactForType === "tenant" ?
                    CONTACT_TYPE_FOR_TENANT :
                    contactForType === "client" ?
                        CONTACT_TYPE_FOR_CLIENT :
                            CONTACT_TYPE_FOR_SIGNING_KEY;

    const contactHeader = contactForType === "tenant" ?
                            "Tenant Contacts" :
                            contactForType === "client" ?
                                 "Client Contacts":
                                    "Signing Key Contacts";
                                    
    const initContact: ContactCreateInput = {
        email: "",
        objectid: contactForId,
        objecttype: type,
        name: "",
        userid: ""
    }

    // STATE VARIABLES
    const [contactCreateInput, setContactCreateInput] = React.useState<ContactCreateInput>(initContact);
    const [contactToRemove, setContactToRemove] = React.useState<Contact | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);


    // GRAPHQL FUNCTIONS
    const {data, loading, error, refetch} = useQuery(CONTACTS_QUERY, {
        variables: {
            objectId: contactForId
        }
    });

    const [addContactMutation] = useMutation(ADD_CONTACT_MUTATION, {
        variables: {
            contactCreateInput: contactCreateInput
        },
        onCompleted() {
            setContactCreateInput(initContact);
            onUpdateEnd(true);
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message);
        }
    });

    const [removeContactMutation] = useMutation(REMOVE_CONTACT_MUTATION, {
        variables: {
            contactId: contactToRemove?.contactid
        },
        onCompleted() {
            setContactToRemove(null);
            onUpdateEnd(true);
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message);
        }
    });
    

    if (loading) return <DataLoading dataLoadingSize="xs" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='xs' />

    return (
        <Typography component={"div"}>
            {errorMessage && 
                <Alert severity="error" onClose={() => {setErrorMessage(null)}}>{errorMessage}</Alert>
            }
            {removeDialogOpen &&
                <Dialog 
                    open={removeDialogOpen}
                    onClose={() => {setRemoveDialogOpen(false); setContactToRemove(null);}}
                >
                    <DialogContent>                        
                        <Typography ><span>Confirm removal of contact: </span> <span style={{fontWeight: "bold"}}>{contactToRemove?.email}</span></Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {setRemoveDialogOpen(false); setContactToRemove(null);}}>Cancel</Button>
                        <Button onClick={() => {onUpdateStart(); setRemoveDialogOpen(false); removeContactMutation();}}>Confirm</Button>
                    </DialogActions>                    
                </Dialog>
            }
            {addDialogOpen &&
                <Dialog 
                    open={addDialogOpen}
                    onClose={() => {setAddDialogOpen(false); setContactCreateInput(initContact);}}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle>Add contact</DialogTitle>
                    <DialogContent>
                        <Typography component="div">
                        <Grid2 container spacing={0} size={12}>
                            <Grid2 size={12}>Email</Grid2>
                            <Grid2 marginBottom={"24px"} size={12}>
                                <TextField 
                                    fullWidth={true}
                                    size="small"
                                    name="email"
                                    onChange={(evt) => {
                                        if(evt.target.value.length > 3){
                                            contactCreateInput.email = evt.target.value;
                                            setContactCreateInput({...contactCreateInput});
                                        }
                                    }}
                                />
                            </Grid2>
                            <Grid2 size={12}>Name (optional)</Grid2>
                            <Grid2 size={12}>
                                <TextField 
                                    fullWidth={true}
                                    size="small"
                                    name="name"
                                    onChange={(evt) => {
                                        if(evt.target.value.length > 3){
                                            contactCreateInput.name = evt.target.value;
                                            setContactCreateInput({...contactCreateInput});
                                        }
                                    }}
                                />
                            </Grid2>
                        </Grid2>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {setAddDialogOpen(false); setContactCreateInput(initContact);}}>Cancel</Button>
                        <Button 
                            disabled={ contactCreateInput.email.length < 3 || (contactCreateInput.name !== null && contactCreateInput.name !== undefined && contactCreateInput.name?.length < 3)}
                            onClick={() => {onUpdateStart(); setAddDialogOpen(false); addContactMutation();}}>Submit</Button>
                    </DialogActions>                    
                </Dialog>                
            }
            <Grid2 size={12} className="detail-page-subheader" display={"inline-flex"}><MailOutlineOutlinedIcon /><div style={{ marginLeft: "8px" }}>{contactHeader}</div></Grid2>

            <Grid2 padding={"8px"} container size={12} spacing={0}>
                {data.getContacts && data.getContacts.length < 1 &&
                    <Grid2 size={12} textAlign={"center"}>No contacts found</Grid2>
                }
                {data.getContacts.map(
                    (contact: Contact, idx: number) => (
                        <Grid2 container key={contact.contactid} size={12}>
                            <Grid2 sx={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} size={10.8}>
                                {contact.email}
                            </Grid2>
                            <Grid2 size={1.2}>
                                {readOnly === true &&
                                    <RemoveCircleOutlineIcon sx={{cursor: "pointer"}} onClick={() => {setContactToRemove(contact); setRemoveDialogOpen(true); }} />
                                }
                            </Grid2>                            
                        </Grid2>
                    )
                )}
            </Grid2>
            <Divider />
            <Grid2 padding={"8px"} container size={12} spacing={0}>                
                <Grid2 size={1}>
                    {readOnly === true &&
                        <AddBoxIcon onClick={() => setAddDialogOpen(true)} sx={{cursor: "pointer"}}/>
                    }
                </Grid2>
                <Grid2 size={11}></Grid2>
            </Grid2>
        </Typography>
    )
}

export default ContactConfiguration;