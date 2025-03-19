"use client";
import { SigningKeyCreateInput } from "@/graphql/generated/graphql-types";
import { SIGNING_KEY_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { CERTIFICATE_HEADER, KEY_TYPE_EC, KEY_TYPE_RSA, KEY_USE_JWT_SIGNING, MIN_PRIVATE_KEY_PASSWORD_LENGTH, PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER, PKCS8_PRIVATE_KEY_HEADER, PKCS8_PUBLIC_KEY_HEADER } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { Alert, Button, DialogActions, DialogContent, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';


export interface NewSigningKeyDialogProps {
    tenantId: string,
    onCancel: () => void,
    onClose: () => void,
    onCreateStart: () => void,
    onCreateEnd: (success: boolean) => void
}

const NewSigningKeyDialog: React.FC<NewSigningKeyDialogProps> = ({
    tenantId,
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {

    const initInput: SigningKeyCreateInput = {
        tenantId: tenantId,
        keyType: "",
        keyTypeId: "",
        keyName: "",
        keyUse: KEY_USE_JWT_SIGNING,
        privateKeyPkcs8: "",
        password: "",
        certificate: "",
        publicKey: "",
        expiresAtMs: 0
    }

    // HOOKS
    const router = useRouter();

    // CONTEXT
    const tenantBean: TenantMetaDataBean = useContext(TenantContext);

    // STATE VARIABLES    
    const [signingKeyInput, setSigningKeyInput] = React.useState<SigningKeyCreateInput>(initInput);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    


    // GRAPHQL FUNCTIONS
    const [createSigningKeyMutation] = useMutation(
        SIGNING_KEY_CREATE_MUTATION,
        {
            variables: {
                keyInput: signingKeyInput
            },
            onCompleted(data) {
                onCreateEnd(true);                
                router.push(`/${tenantBean.getTenantMetaData().tenant.tenantId}/signing-keys/${data.createSigningKey.keyId}`);
                onClose();
            },
            onError(error) {
                onCreateEnd(false);
                setErrorMessage(error.message);
            },
        }
    );

    // HANDLER FUNCTIONS
    const handlePrivateKeyFileUpload = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {     
        changeEvent.preventDefault();   
        const inputElement = changeEvent.target;
        if(inputElement.files && inputElement.files?.length > 0){
            const reader: FileReader = new FileReader();
            reader.onloadend = (
                ( ev: ProgressEvent<FileReader>) => {
                    const result = ev.target?.result;
                    if(result){
                        console.log(result);  
                        // private pkcs8 files need to start with -----BEGIN PRIVATE KEY-----, or -----BEGIN ENCRYPTED PRIVATE KEY-----
                        const privateKey: string = result.toString();
                        if(
                            privateKey.startsWith(PKCS8_PRIVATE_KEY_HEADER) || privateKey.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER)
                        ){
                            signingKeyInput.privateKeyPkcs8 = privateKey;
                            setSigningKeyInput({...signingKeyInput});
                        }
                        else{
                            changeEvent.target.value = "";
                            setErrorMessage("Incorrect format. The private key file should use the PKCS#8 format.");
                        }
                    }
                    else{
                        changeEvent.target.value = "";
                        setErrorMessage("Failed to read file");
                    }
                }
            )
            reader.readAsText(inputElement.files[0]);
        }
    }

    const handlePublicKeyOrCertificateFileUpload = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
        changeEvent.preventDefault();
        const inputElement = changeEvent.target;        
        if(inputElement.files && inputElement.files?.length > 0){
            const reader: FileReader = new FileReader();
            reader.onloadend = (
                ( ev: ProgressEvent<FileReader>) => {
                    const result = ev.target?.result;
                    if(result){
                        console.log(result);  
                        // file needs to start with -----BEGIN PUBLIC KEY-----, or -----BEGIN CERTIFICATE-----
                        const publicKeyOrCert: string = result.toString();
                        if(publicKeyOrCert.startsWith(PKCS8_PUBLIC_KEY_HEADER)) {
                            signingKeyInput.publicKey = publicKeyOrCert;
                            setSigningKeyInput({...signingKeyInput});

                        } 
                        else if(publicKeyOrCert.startsWith(CERTIFICATE_HEADER)) {
                            signingKeyInput.certificate = publicKeyOrCert;
                            setSigningKeyInput({...signingKeyInput});
                        }
                        else{
                            changeEvent.target.value = "";
                            setErrorMessage("Incorrect file type. The file should contain a PKCS#8 public key or a certificate")
                        }
                    }
                    else{
                        changeEvent.target.value = "";
                        setErrorMessage("Failed to read file");
                    }
                }
            )
            reader.readAsText(inputElement.files[0]);
        }
    }

    const isValidInput = (signingKey: SigningKeyCreateInput): boolean => {
        if(signingKey.keyName === ""){
            return false;
        }
        if(signingKey.privateKeyPkcs8 === ""){
            return false;
        }
        if(signingKey.certificate === "" && signingKey.publicKey === ""){
            return false;
        }
        if(signingKey.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER) && 
            (signingKey.password === "" || signingKey.password?.length || 0 < MIN_PRIVATE_KEY_PASSWORD_LENGTH)){
            return false;
        }        
        // TODO
        // Only allow 365 days maximum for a signing key
        if(signingKey.publicKey !== "" && signingKey.expiresAtMs === 0){
            return false;
        }
        if(signingKey.keyType === ""){
            return false;
        }
        return true;
    }


    return (
        <>
            <DialogContent>
                <Typography component={"div"}>                    
                    <Grid2 container size={12} spacing={3} marginBottom={"16px"} >
                        <Grid2 size={12}>
                            {errorMessage &&
                                <Grid2 size={{ xs: 12 }} textAlign={"center"}>
                                    <Stack
                                        direction={"row"}
                                        justifyItems={"center"}
                                        alignItems={"center"}
                                        sx={{ width: "100%" }}
                                    >
                                        <Alert onClose={() => setErrorMessage(null)} sx={{ width: "100%" }} severity="error">{errorMessage}</Alert>
                                    </Stack>
                                </Grid2>
                            }
                            <Grid2 marginBottom={"16px"}>
                                <div>Key Name / Alias</div>
                                <TextField
                                    required name="providerName" id="providerName"
                                    onChange={(evt) => { signingKeyInput.keyName = evt?.target.value; setSigningKeyInput({ ...signingKeyInput }); }}
                                    value={signingKeyInput.keyName}
                                    fullWidth={true}
                                    size="small" />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Key Type</div>
                                <Select
                                    size="small"
                                    fullWidth={true}
                                    value={signingKeyInput.keyType}
                                    name="keyType"
                                    onChange={(evt) => {
                                        signingKeyInput.keyType = evt.target.value;                                        
                                        setSigningKeyInput({ ...signingKeyInput });
                                    }}
                                >
                                    <MenuItem value={""}>Select Key Type</MenuItem>
                                    <MenuItem value={KEY_TYPE_RSA} >{KEY_TYPE_RSA}</MenuItem>
                                    <MenuItem value={KEY_TYPE_EC} >{KEY_TYPE_EC}</MenuItem>
                                </Select>
                                
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Private Key (in PKCS#8 format)</div>
                                <input type="file" accept=".pem" id="privateKey" onChange={(evt) => handlePrivateKeyFileUpload(evt)} />                                
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Passphrase (if the private key is encrypted)</div>
                                <TextField
                                    required={signingKeyInput.privateKeyPkcs8 !== "" && signingKeyInput.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER) }
                                    name="keyPassphrase" 
                                    id="keyPassphrase"
                                    onChange={(evt) => { signingKeyInput.password = evt?.target.value; setSigningKeyInput({ ...signingKeyInput }); }}
                                    value={signingKeyInput.password}
                                    fullWidth={true}                                    
                                    size="small" 
                                    type="password"
                                />
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Public Key or Certificate</div>
                                <input type="file" accept=".pem, .crt" id="publicKeyOrCertificate" onChange={(evt) => handlePublicKeyOrCertificateFileUpload(evt)} />
                                
                            </Grid2>
                            <Grid2 marginBottom={"16px"}>
                                <div>Expires</div>
                                <TextField
                                    required={signingKeyInput.publicKey !== ""}
                                    name="keyExpiration" 
                                    id="keyExpiration"
                                    onChange={(evt) => { signingKeyInput.expiresAtMs = parseInt(evt?.target.value); setSigningKeyInput({ ...signingKeyInput }); }}
                                    value={signingKeyInput.expiresAtMs}
                                    fullWidth={true}                                    
                                    size="small" 
                                    disabled={signingKeyInput.certificate !== ""}
                                />
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { onCancel(); }}>Cancel</Button>
                <Button
                    onClick={() => {
                        onCreateStart();
                        createSigningKeyMutation();
                    }}
                    disabled={
                        !isValidInput(signingKeyInput)
                    }
                >
                    Create
                </Button>
            </DialogActions>

        </>
    )
}

export default NewSigningKeyDialog;