"use client";
import { SigningKeyCreateInput } from "@/graphql/generated/graphql-types";
import { SIGNING_KEY_CREATE_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { CERTIFICATE_HEADER, KEY_TYPE_EC, KEY_TYPE_RSA, KEY_USE_CERTIFICATE_SIGNING, KEY_USE_DIGITAL_SIGNING, KEY_USE_DISPLAY, KEY_USE_ENCRYPTION, KEY_USE_JWT_SIGNING, KEY_USE_KEY_AGREEMENT, MIN_PRIVATE_KEY_PASSWORD_LENGTH, PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER, PKCS8_PRIVATE_KEY_HEADER, PKCS8_PUBLIC_KEY_HEADER, TENANT_TYPE_ROOT_TENANT } from "@/utils/consts";
import { useMutation } from "@apollo/client";
import { Alert, Button, DialogActions, DialogContent, Grid2, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useContext } from "react";
import { TenantMetaDataBean, TenantContext } from "../contexts/tenant-context";
import { useRouter } from 'next/navigation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickerValue } from "@mui/x-date-pickers/internals";
import { NewSigningKeyDialogProps } from "./new-signing-key-dialog";
import { useIntl } from 'react-intl';



const NewBroughtMyOwnSigningKeyDialog: React.FC<NewSigningKeyDialogProps> = ({
    tenantId,
    onCancel,
    onClose,
    onCreateEnd,
    onCreateStart
}) => {

    // CONTEXT VARIABLES
    const intl = useIntl();
    
    const initInput: SigningKeyCreateInput = {
        tenantId: tenantId,
        keyType: "",
        keyTypeId: "",
        keyName: "",
        keyUse: "",
        privateKeyPkcs8: "",
        keyPassword: "",
        keyCertificate: "",
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
    const [publicExpDateValid, setPublicKeyExpDateValid] = React.useState<boolean>(false);
    


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
                setErrorMessage(intl.formatMessage({id: error.message}));
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
                        // private pkcs8 files need to start with -----BEGIN PRIVATE KEY-----, or -----BEGIN ENCRYPTED PRIVATE KEY-----
                        const privateKey: string = result.toString();
                        if(
                            privateKey.startsWith(PKCS8_PRIVATE_KEY_HEADER) || privateKey.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER)
                        ){
                            signingKeyInput.privateKeyPkcs8 = privateKey;
                            if(privateKey.startsWith(PKCS8_PRIVATE_KEY_HEADER)){
                                signingKeyInput.keyPassword = "";
                            }
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
                        // file needs to start with -----BEGIN PUBLIC KEY-----, or -----BEGIN CERTIFICATE-----
                        const publicKeyOrCert: string = result.toString();
                        if(publicKeyOrCert.startsWith(PKCS8_PUBLIC_KEY_HEADER)) {
                            signingKeyInput.publicKey = publicKeyOrCert;
                            signingKeyInput.keyCertificate = "";
                            setSigningKeyInput({...signingKeyInput});

                        } 
                        else if(publicKeyOrCert.startsWith(CERTIFICATE_HEADER)) {
                            signingKeyInput.keyCertificate = publicKeyOrCert;
                            signingKeyInput.publicKey = "";
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
        if(signingKey.keyCertificate === "" && signingKey.publicKey === ""){
            return false;
        }
        if(signingKey.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER)){
            if(!signingKey.keyPassword){
                return false;
            }
            else{
                if(signingKey.keyPassword.length < MIN_PRIVATE_KEY_PASSWORD_LENGTH){
                    return false;
                }
            }         
        }

        // Only allow 365 days maximum for a signing key
        if(signingKey.publicKey !== "" && publicExpDateValid === false){
            return false;
        }
        if(signingKey.keyType === ""){
            return false;
        }
        if(signingKey.keyUse === ""){
            return false;
        }
        return true;
    }


    return (
        <>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                                        required name="keyNameAlias" id="keyNameAlias"
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
                                    <div>Key Use</div>
                                    <Select
                                        size="small"
                                        fullWidth={true}
                                        value={signingKeyInput.keyUse}
                                        name="keyUse"
                                        onChange={(evt) => {
                                            signingKeyInput.keyUse = evt.target.value;                                        
                                            setSigningKeyInput({ ...signingKeyInput });
                                        }}
                                    >
                                        <MenuItem value={""}>Select Key Use</MenuItem>
                                        {tenantId === tenantBean.getTenantMetaData().tenant.tenantId && tenantBean.getTenantMetaData().tenant.tenantType === TENANT_TYPE_ROOT_TENANT &&
                                            <MenuItem value={KEY_USE_JWT_SIGNING} >{KEY_USE_DISPLAY.get(KEY_USE_JWT_SIGNING)}</MenuItem>
                                        }                                        
                                        <MenuItem value={KEY_USE_DIGITAL_SIGNING} >{KEY_USE_DISPLAY.get(KEY_USE_DIGITAL_SIGNING)}</MenuItem>
                                        <MenuItem value={KEY_USE_ENCRYPTION} >{KEY_USE_DISPLAY.get(KEY_USE_ENCRYPTION)}</MenuItem>
                                        <MenuItem value={KEY_USE_KEY_AGREEMENT} >{KEY_USE_DISPLAY.get(KEY_USE_KEY_AGREEMENT)}</MenuItem>
                                        <MenuItem value={KEY_USE_CERTIFICATE_SIGNING} >{KEY_USE_DISPLAY.get(KEY_USE_CERTIFICATE_SIGNING)}</MenuItem>
                                    </Select>                                
                                </Grid2>
                                <Grid2 marginBottom={"16px"}>
                                    <div>Private Key (in PKCS#8 format)</div>
                                    <input type="file" accept=".pem" id="privateKey" onChange={(evt) => handlePrivateKeyFileUpload(evt)} />                                
                                </Grid2>
                                <Grid2 marginBottom={"16px"}>
                                    <div>Passphrase (if the private key is encrypted, minimum length 16 characters)</div>
                                    <TextField
                                        required={signingKeyInput.privateKeyPkcs8 !== "" && signingKeyInput.privateKeyPkcs8.startsWith(PKCS8_ENCRYPTED_PRIVATE_KEY_HEADER) }
                                        name="keyPassphrase" 
                                        id="keyPassphrase"
                                        onChange={(evt) => { 
                                            signingKeyInput.keyPassword = evt?.target.value; 
                                            setSigningKeyInput({ ...signingKeyInput }); 
                                        }}
                                        value={signingKeyInput.keyPassword}
                                        fullWidth={true}                                    
                                        size="small" 
                                        type="password"
                                        disabled={signingKeyInput.privateKeyPkcs8 !== "" && signingKeyInput.privateKeyPkcs8.startsWith(PKCS8_PRIVATE_KEY_HEADER)}
                                    />
                                </Grid2>
                                <Grid2 marginBottom={"16px"}>
                                    <div>Public Key or Certificate</div>
                                    <input type="file" accept=".pem, .crt" id="publicKeyOrCertificate" onChange={(evt) => handlePublicKeyOrCertificateFileUpload(evt)} />                                    
                                </Grid2>
                                {signingKeyInput.publicKey !== null && signingKeyInput.publicKey !== "" && 
                                    <Grid2 marginBottom={"16px"}>
                                        <div>Expires (Maximum of 1 year)</div>
                                        <DatePicker                                             
                                            slotProps={
                                                { textField: { size: "small" }}
                                            }                                            
                                            onChange={(value: PickerValue) => {
                                                if(value){
                                                    const expTime: number = value?.toDate().getTime();
                                                    const now: number = new Date().getTime();                                                    
                                                    const diff: number = expTime - now;
                                                    // if not negative or less than a year, then
                                                    if(diff > 0 && diff < 31557600000){
                                                        signingKeyInput.expiresAtMs = expTime;
                                                        setSigningKeyInput({ ...signingKeyInput });
                                                        setPublicKeyExpDateValid(true);
                                                    }
                                                    else{
                                                        setPublicKeyExpDateValid(false);
                                                    }
                                                }
                                            }}                                            
                                        />
                                    </Grid2>
                                }                                
                            </Grid2>
                        </Grid2>
                    </Typography>
                </LocalizationProvider>
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

export default NewBroughtMyOwnSigningKeyDialog;
