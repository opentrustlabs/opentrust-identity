"use client";
import { PortalUserProfile, TenantLookAndFeel, TenantLookAndFeelInput } from "@/graphql/generated/graphql-types";
import { REMOVE_TENANT_LOOK_AND_FEEL_MUTATION, TENANT_LOOK_AND_FEEL_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_LOOK_AND_FEEL_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Grid2 from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ColorizeIcon from '@mui/icons-material/Colorize';
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from "@mui/material";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, TENANT_UPDATE_SCOPE } from "@/utils/consts";
import { HexColorPicker } from "react-colorful";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import { useIntl } from 'react-intl';
import { containsScope } from "@/utils/authz-utils";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";

export interface TenantLookAndFeelProps {
    tenantId: string,
    onUpdateStart: () => void,
    onUpdateEnd: (success: boolean) => void,
    readOnly: boolean
}

const TenantLookAndFeelConfiguration: React.FC<TenantLookAndFeelProps> = ({
    tenantId,
    onUpdateEnd,
    onUpdateStart,
    readOnly
}) => {


    // CONTEXT VARIABLES
    const intl = useIntl();
    const authContextProps: AuthContextProps = useContext(AuthContext);
    const profile: PortalUserProfile | null = authContextProps.portalUserProfile;

    const initInput: TenantLookAndFeelInput = {
        tenantid: tenantId,
        adminheaderbackgroundcolor: "",
        adminheadertextcolor: "",
        adminheadertext: "",
        authenticationheaderbackgroundcolor: DEFAULT_BACKGROUND_COLOR,
        authenticationheadertextcolor: DEFAULT_TEXT_COLOR,
        authenticationlogo: "",
        authenticationlogouri: "",
        authenticationlogomimetype: "",
        authenticationheadertext: "",
        footerlinks: []
    }

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    // const [showReset, setShowReset] = React.useState<boolean>(false);
    const [tenantLookAndFeelInput, setTenantLookAndFeelInput] = React.useState<TenantLookAndFeelInput>(initInput);
    const [revertToInput, setRevertToInput] = React.useState<TenantLookAndFeelInput>(initInput);
    const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] = React.useState(false);
    const [tempBackgroundColor, setTempBackgroundColor] = React.useState("");
    const [textColorPickerOpen, setTextColorPickerOpen] = React.useState(false);
    const [tempTextColor, setTempTextColor] = React.useState("");
    const [hasSystemDefaultLookAndFeel, setHasSystemDefaultLookAndFeel] = React.useState<boolean>(false);
    const [showConfirmRestoreLookAndFeelDefaultDialog, setShowConfirmRestoreLookAndFeelDefaultDialog] = React.useState<boolean>(false);

    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error, refetch } = useQuery(TENANT_LOOK_AND_FEEL_QUERY, {
        variables: {
            tenantId: tenantId
        },
        notifyOnNetworkStatusChange: true,
        onCompleted(data) {
            if (data && data.getTenantLookAndFeel) {
                const config: TenantLookAndFeel = data.getTenantLookAndFeel as TenantLookAndFeel;
                const input: TenantLookAndFeelInput = {
                    tenantid: tenantId,
                    authenticationheaderbackgroundcolor: config.authenticationheaderbackgroundcolor || DEFAULT_BACKGROUND_COLOR,
                    authenticationheadertext: config.authenticationheadertext,
                    authenticationheadertextcolor: config.authenticationheadertextcolor || "white",
                    authenticationlogo: config.authenticationlogo,
                    authenticationlogomimetype: config.authenticationlogomimetype || "",
                    authenticationlogouri: config.authenticationlogouri || ""
                }
                setHasSystemDefaultLookAndFeel(false);
                setTenantLookAndFeelInput(input);
                setRevertToInput({...input});
            }
            else{
                setHasSystemDefaultLookAndFeel(true);
                setTenantLookAndFeelInput({...initInput});
                setRevertToInput({...initInput});
            }            
        }
    });

    const [mutateTenantLookAndFeel] = useMutation(TENANT_LOOK_AND_FEEL_MUTATION, {
        variables: {
            tenantLookAndFeelInput: tenantLookAndFeelInput
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setTenantLookAndFeelInput({...revertToInput});
            setErrorMessage(intl.formatMessage({id: error.message}));
        }
    });  
    
    const [removeTenantLookAndFeelMutation] = useMutation(REMOVE_TENANT_LOOK_AND_FEEL_MUTATION, {
        variables: {
            tenantId: tenantId
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
            refetch();
        },
        onError(error) {
            onUpdateEnd(false);
            setTenantLookAndFeelInput({...revertToInput});
            setErrorMessage(intl.formatMessage({id: error.message}));            
        }
    });
    
    const handleTemporaryFileUpload = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {        
        const inputElement = changeEvent.target;
        if(inputElement.files && inputElement.files?.length > 0){
            const reader: FileReader = new FileReader();
            reader.onloadend = (
                ( ev: ProgressEvent<FileReader>) => {
                    const result = ev.target?.result;
                    if(result){                        
                        if(tenantLookAndFeelInput){
                            tenantLookAndFeelInput.authenticationlogo = result as string;
                            setTenantLookAndFeelInput({...tenantLookAndFeelInput});
                            setMarkDirty(true);
                        }
                    }
                    else{
                        setErrorMessage("Failed to read file");
                    }
                }
            )
            reader.readAsText(inputElement.files[0]);
        }
    }

    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    
    return (
        <>
            {showConfirmRestoreLookAndFeelDefaultDialog &&
                <Dialog
                    open={showConfirmRestoreLookAndFeelDefaultDialog}
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogContent>
                        <Typography>
                            Confirm that you want to restore system defaults for look and feel
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button  
                            onClick={() => setShowConfirmRestoreLookAndFeelDefaultDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => {
                                setShowConfirmRestoreLookAndFeelDefaultDialog(false);
                                onUpdateStart();
                                removeTenantLookAndFeelMutation();
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

            }
            <Dialog 
                onClose={() => setBackgroundColorPickerOpen(false)}
                open={backgroundColorPickerOpen}
                maxWidth="sm"
                fullWidth={true}
            >
                <DialogTitle>Select background color</DialogTitle>
                <DialogContent>
                    <HexColorPicker
                        color={tenantLookAndFeelInput.authenticationheaderbackgroundcolor ? tenantLookAndFeelInput.authenticationheaderbackgroundcolor : DEFAULT_BACKGROUND_COLOR}
                        onChange={(newColor: string) => {setTempBackgroundColor(newColor); }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBackgroundColorPickerOpen(false)}>Cancel</Button>
                    <Button onClick={() => {tenantLookAndFeelInput.authenticationheaderbackgroundcolor = tempBackgroundColor; setTenantLookAndFeelInput({...tenantLookAndFeelInput}); setMarkDirty(true); setBackgroundColorPickerOpen(false);  }}>Select</Button>
                </DialogActions>
            </Dialog>
            <Dialog 
                onClose={() => setTextColorPickerOpen(false)}
                open={textColorPickerOpen}
            >
                <DialogTitle>Select text color</DialogTitle>
                <DialogContent>
                    <HexColorPicker
                        color={tenantLookAndFeelInput.authenticationheadertextcolor ? tenantLookAndFeelInput.authenticationheadertextcolor : DEFAULT_TEXT_COLOR}
                        onChange={(newColor: string) => {setTempTextColor(newColor); }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTextColorPickerOpen(false)}>Cancel</Button>
                    <Button onClick={() => {tenantLookAndFeelInput.authenticationheadertextcolor = tempTextColor; setTenantLookAndFeelInput({...tenantLookAndFeelInput}); setMarkDirty(true); setTextColorPickerOpen(false);  }}>Select</Button>
                </DialogActions>
            </Dialog>
            <Grid2 container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                    </Grid2>
                }
                <div style={{fontWeight: "bold", fontSize: "1.0em"}}>Preview</div>
                <Grid2
                    container
                    spacing={2}
                    margin={"8px 0px"} 
                    size={12}
                    height={"72px"}
                    alignContent={"center"}
                    alignItems={"center"}
                    display={"flex"}
                    padding={"8px"}
                    sx={{
                        backgroundColor: tenantLookAndFeelInput.authenticationheaderbackgroundcolor,
                        color: tenantLookAndFeelInput.authenticationheadertextcolor,                        
                        fontWeight: "bold",
                        fontSize: "1.0em",
                        border: "solid 1px lightgrey"
                    }}
                >
                    <Stack direction={"row"}>
                        {tenantLookAndFeelInput.authenticationlogo &&
                            <div>
                            {/* <div style={{height: "45px", marginRight: "16px"}} dangerouslySetInnerHTML={{__html: tenantLookAndFeelInput.authenticationlogo}}></div> */}
                            <img style={{height: "45px"}} src={`data:image/svg+xml;base64,${btoa(tenantLookAndFeelInput.authenticationlogo)}`}></img>
                            </div>
                        }
                        {tenantLookAndFeelInput.authenticationlogouri &&                        
                            <div style={{marginRight: "16px"}}>
                                <img style={{height: "45px"}} src={tenantLookAndFeelInput.authenticationlogouri} loading="lazy" alt="Authentication Header Logo"></img>
                            </div>                        
                        }                    
                        <div style={{alignContent: "center", alignItems: "center"}}>
                            {tenantLookAndFeelInput.authenticationheadertext}
                        </div>
                    </Stack>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Background Color</div>
                    <Grid2  container spacing={2} size={12}>
                        <Grid2  size={11}>
                            <TextField name="backgroundColor" id="backgroundColor"
                                disabled={readOnly}
                                value={tenantLookAndFeelInput.authenticationheaderbackgroundcolor || ""}
                                onChange={(evt) => { tenantLookAndFeelInput.authenticationheaderbackgroundcolor = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                                fullWidth={true} size="small"
                            />
                        </Grid2>
                        <Grid2 size={1}>
                            {!readOnly &&
                                <ColorizeIcon onClick={() => setBackgroundColorPickerOpen(true)} sx={{cursor: "pointer"}} />
                            }
                        </Grid2>
                    </Grid2>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Text Color</div>
                    <Grid2 container spacing={2} size={12}>
                        <Grid2 size={11}>
                            <TextField name="textColor" id="textColor"
                                disabled={readOnly}
                                value={tenantLookAndFeelInput.authenticationheadertextcolor || ""}
                                onChange={(evt) => { tenantLookAndFeelInput.authenticationheadertextcolor = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                                fullWidth={true} size="small"
                            />
                        </Grid2>
                        <Grid2 size={1}>
                            {!readOnly &&
                                <ColorizeIcon 
                                    sx={{cursor: "pointer"}} 
                                    onClick={() => {setTextColorPickerOpen(true)}}                                
                                />
                            }
                        </Grid2>
                    </Grid2>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Header Text</div>                    
                    <TextField name="headerText" id="headerText"
                        disabled={readOnly}
                        value={tenantLookAndFeelInput.authenticationheadertext || ""}
                        onChange={(evt) => { tenantLookAndFeelInput.authenticationheadertext = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                        fullWidth={true} size="small"
                    />                        
                </Grid2>
                
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >    
                    {!readOnly &&
                        <React.Fragment>
                            <Grid2 container size={12}>
                                <Grid2 size={11}>Logo (svg, no more than 45 pixes in height)</Grid2>
                                <Grid2 size={1}>
                                    <DeleteForeverOutlinedIcon 
                                        sx={{cursor: "pointer"}}
                                        onClick={() => {tenantLookAndFeelInput.authenticationlogo = ""; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                                    />
                                </Grid2>
                            </Grid2>
                            <Grid2 marginBottom={"8px"} size={12} paddingTop={"8px"}>
                                <input type="file" accept="image/svg+xml, .svg" id="logoFile" onChange={(evt) => handleTemporaryFileUpload(evt)} />                            
                            </Grid2>
                            <Divider>OR</Divider>
                            <Grid2 marginTop={"8px"} container size={12}>
                                <Grid2 size={12}>Logo URI</Grid2>
                                <Grid2 size={12}>
                                    <TextField
                                        disabled={readOnly}
                                        value={tenantLookAndFeelInput.authenticationlogouri}
                                        onChange={(evt) => { tenantLookAndFeelInput.authenticationlogouri = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                                        fullWidth={true} size="small"
                                    />
                                </Grid2>
                            </Grid2>
                        </React.Fragment>
                        
                    }
                </Grid2>
            </Grid2>
            <DetailSectionActionHandler
                onDiscardClickedHandler={() => {
                    setTenantLookAndFeelInput({...revertToInput as TenantLookAndFeelInput});
                    setMarkDirty(false);
                }}
                onUpdateClickedHandler={() => {
                    onUpdateStart(); 
                    mutateTenantLookAndFeel();
                }}
                markDirty={markDirty}
                disableSubmit={!containsScope(TENANT_UPDATE_SCOPE, profile?.scope || [])}
                enableRestoreDefault={hasSystemDefaultLookAndFeel === false}
                restoreDefaultHandler={() => {
                    setShowConfirmRestoreLookAndFeelDefaultDialog(true);                    
                }}
            />       
        </>
    )

}

export default TenantLookAndFeelConfiguration;