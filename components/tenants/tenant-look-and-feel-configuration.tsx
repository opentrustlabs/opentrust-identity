"use client";
import { TenantLookAndFeel, TenantLookAndFeelInput } from "@/graphql/generated/graphql-types";
import { TENANT_LOOK_AND_FEEL_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_LOOK_AND_FEEL_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext } from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ColorizeIcon from '@mui/icons-material/Colorize';
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from "@/utils/consts";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";
import { HexColorPicker } from "react-colorful";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

export interface TenantLookAndFeelProps {
    tenantId: string,
    onUpdateStart: () => void;
    onUpdateEnd: (success: boolean) => void;
}

const TenantLookAndFeelConfiguration: React.FC<TenantLookAndFeelProps> = ({
    tenantId,
    onUpdateEnd,
    onUpdateStart
}) => {

    let initInput: TenantLookAndFeelInput = {
        tenantid: tenantId,
        adminheaderbackgroundcolor: "",
        adminheadertextcolor: "",
        adminlogo: "",
        adminheadertext: "",
        authenticationheaderbackgroundcolor: DEFAULT_BACKGROUND_COLOR,
        authenticationheadertextcolor: DEFAULT_TEXT_COLOR,
        authenticationlogo: "",
        authenticationlogomimetype: "",
        authenticationheadertext: "",
        footerlinks: []
    }

    // CONTEXT VARIABLES
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    // const [showReset, setShowReset] = React.useState<boolean>(false);
    const [tenantLookAndFeelInput, setTenantLookAndFeelInput] = React.useState<TenantLookAndFeelInput | null>(null);
    const [revertToInput, setRevertToInput] = React.useState<TenantLookAndFeelInput | null>(null);
    const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] = React.useState(false);
    const [tempBackgroundColor, setTempBackgroundColor] = React.useState("");
    const [textColorPickerOpen, setTextColorPickerOpen] = React.useState(false);
    const [tempTextColor, setTempTextColor] = React.useState("");

    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error } = useQuery(TENANT_LOOK_AND_FEEL_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getTenantLookAndFeel) {
                const config: TenantLookAndFeel = data.getTenantLookAndFeel as TenantLookAndFeel;
                initInput.authenticationheaderbackgroundcolor = config.authenticationheaderbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
                initInput.authenticationheadertext = config.authenticationheadertext;
                initInput.authenticationheadertextcolor = config.authenticationheadertextcolor || "white";
                initInput.authenticationlogo = config.authenticationlogo;
                initInput.authenticationlogomimetype = config.authenticationlogomimetype || "";
            }
            setTenantLookAndFeelInput({...initInput});
            setRevertToInput({...initInput});
        },
    });

    const [mutateTenantLookAndFeel] = useMutation(TENANT_LOOK_AND_FEEL_MUTATION, {
        variables: {
            tenantLookAndFeelInput: tenantLookAndFeelInput
        },
        onCompleted() {
            onUpdateEnd(true);
            setMarkDirty(false);
        },
        onError(error) {
            onUpdateEnd(false);
            setErrorMessage(error.message);
            //setShowReset(true);
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
    
    if(tenantLookAndFeelInput) return (
        <>
            <Dialog 
                onClose={() => setBackgroundColorPickerOpen(false)}
                open={backgroundColorPickerOpen}
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
                    marginBottom={"16px"} 
                    size={12}
                    height={"72px"}
                    alignContent={"center"}
                    padding={"8px"}
                    sx={{
                        backgroundColor: tenantLookAndFeelInput.authenticationheaderbackgroundcolor,
                        color: tenantLookAndFeelInput.authenticationheadertextcolor,                        
                        fontWeight: "bold",
                        fontSize: "1.0em",
                        border: "solid 1px lightgrey"
                    }}
                >
                    {tenantLookAndFeelInput.authenticationlogo && 
                        <Grid2 size={breakPoints.isMedium ? 2 : 1} >
                            <div style={{maxHeight: "48px", maxWidth: "48px"}} dangerouslySetInnerHTML={{__html: tenantLookAndFeelInput.authenticationlogo}}></div>
                        </Grid2>
                    }
                    <Grid2
                        size={
                            tenantLookAndFeelInput.authenticationlogo && !breakPoints.isMedium ? 
                                11 :
                                tenantLookAndFeelInput.authenticationlogo && breakPoints.isMedium ?
                                10 :
                                12
                        }
                        alignContent={"center"}
                    >
                        {tenantLookAndFeelInput.authenticationheadertext}
                    </Grid2>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Background Color</div>
                    <Grid2  container spacing={2} size={12}>
                        <Grid2  size={11}>
                            <TextField name="backgroundColor" id="backgroundColor"                        
                                value={tenantLookAndFeelInput.authenticationheaderbackgroundcolor || ""}
                                onChange={(evt) => { tenantLookAndFeelInput.authenticationheaderbackgroundcolor = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                                fullWidth={true} size="small"
                            />
                        </Grid2>
                        <Grid2 size={1}>
                            <ColorizeIcon onClick={() => setBackgroundColorPickerOpen(true)} sx={{cursor: "pointer"}} />
                        </Grid2>
                    </Grid2>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Text Color</div>
                    <Grid2 container spacing={2} size={12}>
                        <Grid2 size={11}>
                            <TextField name="textColor" id="textColor"                        
                                value={tenantLookAndFeelInput.authenticationheadertextcolor || ""}
                                onChange={(evt) => { tenantLookAndFeelInput.authenticationheadertextcolor = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                                fullWidth={true} size="small"
                            />
                        </Grid2>
                        <Grid2 size={1}>
                            <ColorizeIcon 
                                sx={{cursor: "pointer"}} 
                                onClick={() => {setTextColorPickerOpen(true)}}
                            
                            />
                        </Grid2>
                    </Grid2>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Header Text</div>                    
                    <TextField name="headerText" id="headerText"                        
                        value={tenantLookAndFeelInput.authenticationheadertext || ""}
                        onChange={(evt) => { tenantLookAndFeelInput.authenticationheadertext = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                        fullWidth={true} size="small"
                    />                        
                </Grid2>
                
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >    
                    <Grid2 container size={12}>
                        <Grid2 size={11}>Logo (svg)</Grid2>
                        <Grid2 size={1}>
                            <DeleteForeverOutlinedIcon 
                                sx={{cursor: "pointer"}}
                                onClick={() => {tenantLookAndFeelInput.authenticationlogo = ""; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                            />
                        </Grid2>
                    </Grid2>
                    <Grid2 size={12} paddingTop={"8px"}>
                        <input type="file" accept="image/svg+xml, .svg" id="logoFile" onChange={(evt) => handleTemporaryFileUpload(evt)} />                            
                    </Grid2>
                </Grid2>
            </Grid2>
            <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >                
                <Button
                    disabled={!markDirty}
                    onClick={() => { onUpdateStart(); mutateTenantLookAndFeel() }}
                    sx={{ border: "solid 1px lightgrey", borderRadius: "4px" }} >Update
                </Button>
                
                    <Button 
                        sx={{marginRight: "8px"}}
                        onClick={() => {
                            setTenantLookAndFeelInput({...revertToInput as TenantLookAndFeelInput});
                            setRevertToInput({...revertToInput as TenantLookAndFeelInput});
                            setMarkDirty(false);
                        }}
                        disabled={!markDirty}
                    >Revert Changes</Button>
                
            </Stack>        
        </>
    )

}

export default TenantLookAndFeelConfiguration;