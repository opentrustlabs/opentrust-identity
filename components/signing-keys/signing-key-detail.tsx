"use client";
import { MarkForDeleteObjectType, SecretObjectType, SigningKey, SigningKeyUpdateInput, PortalUserProfile } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import React, { useContext } from "react";
import { DetailPageContainer, DetailPageMainContentContainer, DetailPageRightNavContainer } from "../layout/detail-page-container";
import { KEY_DELETE_SCOPE, KEY_SECRET_VIEW_SCOPE, KEY_UPDATE_SCOPE, KEY_USE_DISPLAY, PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER, SIGNING_KEY_STATUS_ACTIVE, SIGNING_KEY_STATUS_REVOKED, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { Alert, Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, Grid2, MenuItem, Paper, Select, Snackbar, TextField } from "@mui/material";
import BreadcrumbComponent from "../breadcrumbs/breadcrumbs";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ContactConfiguration from "../contacts/contact-configuration";
import TenantHighlight from "../tenants/tenant-highlight";
import { useMutation } from "@apollo/client";
import { SIGNING_KEY_UPDATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { formatISODateFromMs } from "@/utils/date-utils";
import { useClipboardCopyContext } from "../contexts/clipboard-copy-context";
import SecretViewerDialog from "../dialogs/secret-viewer-dialog";
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import SubmitMarkForDelete from "../deletion/submit-mark-for-delete";
import MarkForDeleteAlert from "../deletion/mark-for-delete-alert";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { containsScope } from "@/utils/authz-utils";
import { ERROR_CODES } from "@/lib/models/error";
import { useIntl } from 'react-intl';


export interface SigningKeyDetailProps {
    signingKey: SigningKey
}
const SigningKeyDetail: React.FC<SigningKeyDetailProps> = ({ signingKey }) => {

    // CONTEXT VARIABLES
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);
    const { copyContentToClipboard } = useClipboardCopyContext();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;
    const intl = useIntl();


    // STATE VARIABLES
    const [showMutationBackdrop, setShowMutationBackdrop] = React.useState<boolean>(false);
    const [showMutationSnackbar, setShowMutationSnackbar] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const initInput: SigningKeyUpdateInput = {
        keyId: signingKey.keyId,
        status: signingKey.keyStatus,
        keyName: signingKey.keyName,
        keyUse: signingKey.keyUse
    };
    const [keyUpdateInput, setKeyUpdateInput] = React.useState<SigningKeyUpdateInput>(initInput);
    const [showRevokeConfirmationDialog, setShowRevokeConfirmationDialog] = React.useState<boolean>(false);
    const [secretDialogOpen, setSecretDialogOpen] = React.useState<boolean>(false);
    const [isMarkedForDelete, setIsMarkedForDelete] = React.useState<boolean>(signingKey.markForDelete);
    const [disableInputs] = React.useState<boolean>(signingKey.markForDelete || !containsScope(KEY_UPDATE_SCOPE, profile?.scope || []));
    const [canViewSecret] = React.useState<boolean>(containsScope(KEY_SECRET_VIEW_SCOPE, profile?.scope || []));
    const [canDeleteKey] = React.useState<boolean>(containsScope(KEY_DELETE_SCOPE, profile?.scope || []));


    // GRAPHQL FUNCTIONS

    const [keyUpdateMutation] = useMutation(SIGNING_KEY_UPDATE_MUTATION, {
        variables: {
            keyInput: keyUpdateInput
        },
        onCompleted(data) {
            setShowMutationBackdrop(false);
            setShowMutationSnackbar(true);
            setMarkDirty(false);
            if(data && data.updateSigningKey){
                keyUpdateInput.keyName = data.updateSigningKey.keyName;
                keyUpdateInput.status = data.updateSigningKey.keyStatus;
                setKeyUpdateInput({...keyUpdateInput});
            }
        },
        onError(error) {
            setShowMutationBackdrop(false);
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });

    // HANDLER FUNCTIONS
    const handleUpdate = () => {
        if(initInput.status === SIGNING_KEY_STATUS_ACTIVE && keyUpdateInput.status === SIGNING_KEY_STATUS_REVOKED){
            setShowRevokeConfirmationDialog(true);
        }
        else{
            keyUpdateMutation();
        }
    }

    return (
        <Typography component={"div"} >
            <BreadcrumbComponent breadCrumbs={[
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}`,
                    linkText: tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT ? `Tenant List` : `${tenantBean.getTenantMetaData().tenant.tenantName}`
                },
                {
                    href: `/${tenantBean.getTenantMetaData().tenant.tenantId}?section=signing-keys`,
                    linkText: "Signing Keys"
                },
                {
                    href: null,
                    linkText: signingKey.keyName
                }
            ]} />
            {/**  If we are in the root tenant, then show the owning tenant for this client */}
            {tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                <div style={{marginBottom: "16px"}}>
                    <TenantHighlight tenantId={signingKey.tenantId} />
                </div>
            }
            {showRevokeConfirmationDialog &&
                <Dialog 
                    open={showRevokeConfirmationDialog}
                    onClose={() => setShowRevokeConfirmationDialog(false)}                    
                >
                    
                    <DialogContent>
                        <Typography>
                            Confirm that you want to revoke the certificate. This operation cannot be un-done.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowRevokeConfirmationDialog(false)}>Cancel</Button>
                        <Button 
                            onClick={() => {
                                setShowRevokeConfirmationDialog(false);
                                setShowMutationBackdrop(true);
                                keyUpdateMutation();
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                    
                </Dialog>
            }

            <DetailPageContainer>
                <DetailPageMainContentContainer>
                    <Grid2 container size={12} spacing={2}>
                        <Grid2 className="detail-page-subheader" alignItems={"center"} sx={{ backgroundColor: "#1976d2", color: "white", padding: "8px", borderRadius: "2px" }} container size={12}>
                            <Grid2 size={11}>Overview</Grid2>
                            <Grid2 size={1} display={"flex"} >
                                {isMarkedForDelete !== true && canDeleteKey &&
                                    <SubmitMarkForDelete 
                                        objectId={signingKey.keyId}
                                        objectType={MarkForDeleteObjectType.SigningKey}
                                        confirmationMessage={`Confirm deletion of key: ${signingKey.keyName}. Once submitted the operation cannot be undone.`}
                                        onDeleteEnd={(successful: boolean, errorMessage?: string) => {
                                            setShowMutationBackdrop(false);
                                            if(successful){
                                                setShowMutationSnackbar(true);
                                                setIsMarkedForDelete(true);
                                            }
                                            else{
                                                if(errorMessage){
                                                    setErrorMessage(intl.formatMessage({id: errorMessage}));    
                                                }
                                                else{
                                                    setErrorMessage(intl.formatMessage({id: ERROR_CODES.DEFAULT.errorKey}));
                                                } 
                                            }
                                        }}
                                        onDeleteStart={() => setShowMutationBackdrop(true)}
                                    />
                                }
                            </Grid2>
                        </Grid2>
                        <Grid2 size={12}>
                            {errorMessage &&
                                <Grid2 size={12} marginBottom={"8px"}>
                                    <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                </Grid2>
                            }
                            {isMarkedForDelete === true &&
                                <MarkForDeleteAlert 
                                    message={"This key has been marked for deletion. No changes to the key are permitted."}
                                />
                            }
                            <Paper sx={{ padding: "8px" }} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Key Name / Alias</div>
                                            <TextField                                                 
                                                name="keyName" id="keyName" 
                                                value={keyUpdateInput.keyName} 
                                                onChange={(evt) => {keyUpdateInput.keyName = evt.target.value; setKeyUpdateInput({...keyUpdateInput}); setMarkDirty(true)}}
                                                disabled={keyUpdateInput.status === SIGNING_KEY_STATUS_REVOKED || disableInputs === true}
                                                fullWidth={true} size="small" 
                                            />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Status</div>
                                            {keyUpdateInput.status === SIGNING_KEY_STATUS_REVOKED &&
                                                <TextField                                                     
                                                    name="keyStatus" 
                                                    id="keyStatus" 
                                                    value={keyUpdateInput.status} 
                                                    disabled={true} fullWidth={true} size="small" />
                                            }
                                            {keyUpdateInput.status !== SIGNING_KEY_STATUS_REVOKED &&
                                                <Select
                                                    disabled={disableInputs}
                                                    size="small"
                                                    fullWidth={true}
                                                    value={keyUpdateInput.status}
                                                    name="keyStatus"
                                                    onChange={(evt) => {
                                                        keyUpdateInput.status = evt.target.value;
                                                        setMarkDirty(true);
                                                        setKeyUpdateInput({ ...keyUpdateInput });
                                                    }}
                                                >                                                    
                                                    <MenuItem value={SIGNING_KEY_STATUS_ACTIVE} >{SIGNING_KEY_STATUS_ACTIVE}</MenuItem>
                                                    <MenuItem value={SIGNING_KEY_STATUS_REVOKED} >{SIGNING_KEY_STATUS_REVOKED}</MenuItem>
                                                </Select>
                                            }                                            
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div style={{textDecoration: "underline"}}>Object ID</div>
                                            <Grid2 marginTop={"8px"} container display={"inline-flex"} size={12}>
                                                <Grid2  size={11}>
                                                    {signingKey.keyId}
                                                </Grid2>
                                                <Grid2 size={1}>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            copyContentToClipboard(signingKey.keyId, "Key ID copied to clipboard");
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                        
                                    </Grid2>
                                    <Grid2 size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                                    <Grid2 marginBottom={"16px"}>
                                            <div>Key Type</div>
                                            <TextField name="keyType" id="keyType" value={signingKey.keyType} disabled={true} fullWidth={true} size="small" />
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Key Use</div>
                                            <TextField name="keyUse" id="keyUse" value={KEY_USE_DISPLAY.get(signingKey.keyUse || "")} disabled={true} fullWidth={true} size="small" /> 
                                        </Grid2>
                                        <Grid2 marginBottom={"16px"}>
                                            <div>Expires</div>
                                            <TextField name="keyExpiration" id="keyExpiration" value={formatISODateFromMs(signingKey.expiresAtMs, "")} disabled={true} fullWidth={true} size="small" />
                                        </Grid2>                                       
                                    </Grid2>
                                </Grid2>
                                <DetailSectionActionHandler
                                    onDiscardClickedHandler={() => {
                                        setKeyUpdateInput(initInput);
                                        setMarkDirty(false);
                                    }}
                                    onUpdateClickedHandler={() => {
                                        handleUpdate();
                                    }}
                                    markDirty={markDirty}
                                />                                
                            </Paper>
                        </Grid2>
                        <Grid2 size={12}>
                            {signingKey.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER) &&
                                <Paper sx={{ padding: "8px", marginBottom: "16px"}}  elevation={1}>
                                    <Grid2 container size={12} spacing={2}>                                    
                                        <Grid2 size={{xs: 12, sm: 2, md: 2, lg: 2, xl: 2}} sx={{textDecoration: breakPoints.isSmall ? "underline": "none"}}>
                                            <Grid2 container>                                            
                                                <Grid2 size={9}>Private Key</Grid2>
                                                <Grid2 size={3}>
                                                    <ContentCopyIcon 
                                                        sx={{cursor: "pointer"}}
                                                        onClick={() => {
                                                            const textToCopy: string = signingKey.privateKeyPkcs8;
                                                            const message = "Encrypted key copied to clipboard";
                                                            copyContentToClipboard(textToCopy, message);
                                                        }}
                                                    />
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>
                                        <Grid2 size={{xs: 12, sm: 10, md: 10, lg: 10, xl: 10}}>
                                            <pre style={{fontSize: breakPoints.isSmall ? "0.8em" : "1.0em"}}>{signingKey.privateKeyPkcs8}</pre>
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            }
                            {signingKey.privateKeyPkcs8 === "" &&
                                <Paper sx={{ padding: "8px", marginBottom: "16px"}}  elevation={1}>
                                    <Grid2 container size={12} spacing={2}> 
                                        <Grid2 size={{xs: 3, sm: 3, md: 2, lg: 2, xl: 2}}>
                                            Private Key
                                        </Grid2>
                                        <Grid2 size={{xs: 9, sm: 9, md: 10, lg: 10, xl: 10}}>
                                            {canViewSecret &&
                                                <VisibilityOutlinedIcon 
                                                    sx={{cursor: "pointer"}}
                                                    onClick={() => {
                                                        setSecretDialogOpen(true);
                                                    }}
                                                />
                                            }
                                        </Grid2>
                                    </Grid2>                                    
                                </Paper>
                            }
                            {signingKey.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER) &&
                                <Paper sx={{ padding: "8px", marginBottom: "16px"}}  elevation={1}>
                                    <Grid2 container size={12} spacing={2}> 
                                        <Grid2 size={{xs: 3, sm: 3, md: 2, lg: 2, xl: 2}}>
                                            Password
                                        </Grid2>
                                        <Grid2 size={{xs: 9, sm: 9, md: 10, lg: 10, xl: 10}}>
                                            {canViewSecret &&
                                                <VisibilityOutlinedIcon 
                                                    sx={{cursor: "pointer"}}
                                                    onClick={() => {
                                                        setSecretDialogOpen(true);
                                                    }}
                                                />
                                            }
                                        </Grid2>
                                    </Grid2>
                                </Paper>
                            }                            

                            <Paper sx={{ padding: "8px", marginBottom: "16px"}} elevation={1}>
                                <Grid2 container size={12} spacing={2}>
                                    <Grid2 size={{xs: 12, sm: 2, md: 2, lg: 2, xl: 2}} sx={{textDecoration: breakPoints.isSmall ? "underline": "none"}}>
                                        <Grid2 container>
                                            <Grid2 size={9}>
                                                {signingKey.keyCertificate &&
                                                    <>Certificate</>
                                                }
                                                {signingKey.publicKey &&
                                                    <>Public Key</>
                                                }  
                                            </Grid2>
                                            <Grid2 size={3}>
                                                <ContentCopyIcon 
                                                    sx={{cursor: "pointer"}}
                                                    onClick={() => {
                                                        const textToCopy: string = signingKey.keyCertificate ? signingKey.keyCertificate : signingKey.publicKey ? signingKey.publicKey : "";
                                                        const message = signingKey.keyCertificate ? "Certificate copied to clipboard" : signingKey.publicKey ? "Public key copied to clipboard" : "No data to copy";
                                                        copyContentToClipboard(textToCopy, message);
                                                    }}
                                                />
                                            </Grid2>
                                        </Grid2>                                                                              
                                    </Grid2>
                                    <Grid2 size={{xs: 12, sm: 10, md: 10, lg: 10, xl: 10}}>
                                        <pre style={{fontSize: breakPoints.isSmall ? "0.8em" : "1.0em"}}>{signingKey.keyCertificate ? signingKey.keyCertificate : signingKey.publicKey}</pre>
                                    </Grid2>                                    
                                </Grid2>
                            </Paper>                            
                        </Grid2>
                    </Grid2>
                </DetailPageMainContentContainer>
                <DetailPageRightNavContainer>
                    <Paper elevation={3} >
                        <ContactConfiguration 
                            contactForType={"signing-key"} 
                            contactForId={signingKey.keyId} 
                            onUpdateEnd={(success: boolean) =>{
                                setShowMutationBackdrop(false);
                                if(success){
                                    setShowMutationSnackbar(true);
                                }
                            }}
                            onUpdateStart={() =>{
                                setShowMutationBackdrop(true);
                            }}
                            readOnly={isMarkedForDelete}
                        />                        
                    </Paper>
                </DetailPageRightNavContainer>

            </DetailPageContainer>
            <Backdrop
                sx={{ color: '#fff'}}
                open={showMutationBackdrop}
                onClick={() => setShowMutationBackdrop(false)}
            >
                <CircularProgress color="info" />
            </Backdrop>
            <Snackbar
                open={showMutationSnackbar}
                autoHideDuration={4000}
                onClose={() => setShowMutationSnackbar(false)}                
                anchorOrigin={{horizontal: "center", vertical: "top"}}
            >
                <Alert sx={{fontSize: "1em"}}
                    onClose={() => setShowMutationSnackbar(false)}
                >
                    Signing Key Updated
                </Alert>
            </Snackbar>
            {secretDialogOpen &&                    
                <SecretViewerDialog 
                    open={secretDialogOpen}
                    onClose={() => setSecretDialogOpen(false)}
                    objectId={signingKey.keyId}
                    secretObjectType={signingKey.privateKeyPkcs8.length > 0 ? SecretObjectType.PrivateKeyPassword : SecretObjectType.PrivateKey}                
                />
            }            
        </Typography>
    )

}

export default SigningKeyDetail;