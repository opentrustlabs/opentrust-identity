"use client";
import { FooterLinkInput, PortalUserProfile, TenantLookAndFeel, TenantLookAndFeelInput } from "@/graphql/generated/graphql-types";
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, IMAGE_PANEL_LEFT, IMAGE_PANEL_POSITIONS, LAYOUT_TYPE_SINGLE_COLUMN, LAYOUT_TYPES, TENANT_UPDATE_SCOPE } from "@/utils/consts";
import { HexColorPicker } from "react-colorful";
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DetailSectionActionHandler from "../layout/detail-section-action-handler";
import { useIntl } from 'react-intl';
import { containsScope } from "@/utils/authz-utils";
import { AuthContext, AuthContextProps } from "../contexts/auth-context";
import { ResponsiveBreakpoints, ResponsiveContext } from "../contexts/responsive-context";

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
    const breakPoints: ResponsiveBreakpoints = useContext(ResponsiveContext);

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
        authenticationbuttonbackgroundcolor: DEFAULT_BACKGROUND_COLOR,
        authenticationbuttontextcolor: "white",
        authenticationinputbordercolor: "",
        authenticationpagebackgroundcolor: "",
        authenticationfooterbackgroundcolor: DEFAULT_BACKGROUND_COLOR,
        authenticationfootertextcolor: "white",
        authenticationlinkcolor: "",
        authenticationlayouttype: LAYOUT_TYPE_SINGLE_COLUMN,
        authenticationbackgroundimageuri: "",
        authenticationimagepanelposition: IMAGE_PANEL_LEFT,
        footerlinks: []
    }

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [tenantLookAndFeelInput, setTenantLookAndFeelInput] = React.useState<TenantLookAndFeelInput>(initInput);
    const [revertToInput, setRevertToInput] = React.useState<TenantLookAndFeelInput>(initInput);
    const [hasSystemDefaultLookAndFeel, setHasSystemDefaultLookAndFeel] = React.useState<boolean>(false);
    const [showConfirmRestoreLookAndFeelDefaultDialog, setShowConfirmRestoreLookAndFeelDefaultDialog] = React.useState<boolean>(false);

    // Color picker state — generic approach using a field key
    const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
    const [colorPickerField, setColorPickerField] = React.useState<string>("");
    const [colorPickerLabel, setColorPickerLabel] = React.useState<string>("");
    const [tempColor, setTempColor] = React.useState("");

    const openColorPicker = (field: string, label: string) => {
        setColorPickerField(field);
        setColorPickerLabel(label);
        setTempColor((tenantLookAndFeelInput as Record<string, unknown>)[field] as string || "");
        setColorPickerOpen(true);
    };

    const applyColorPicker = () => {
        const updated = { ...tenantLookAndFeelInput, [colorPickerField]: tempColor };
        setTenantLookAndFeelInput(updated);
        setMarkDirty(true);
        setColorPickerOpen(false);
    };

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
                    authenticationlogouri: config.authenticationlogouri || "",
                    authenticationbuttonbackgroundcolor: config.authenticationbuttonbackgroundcolor || DEFAULT_BACKGROUND_COLOR,
                    authenticationbuttontextcolor: config.authenticationbuttontextcolor || "white",
                    authenticationinputbordercolor: config.authenticationinputbordercolor || "",
                    authenticationpagebackgroundcolor: config.authenticationpagebackgroundcolor || "",
                    authenticationfooterbackgroundcolor: config.authenticationfooterbackgroundcolor || DEFAULT_BACKGROUND_COLOR,
                    authenticationfootertextcolor: config.authenticationfootertextcolor || "white",
                    authenticationlinkcolor: config.authenticationlinkcolor || "",
                    authenticationlayouttype: config.authenticationlayouttype || LAYOUT_TYPE_SINGLE_COLUMN,
                    authenticationbackgroundimageuri: config.authenticationbackgroundimageuri || "",
                    authenticationimagepanelposition: config.authenticationimagepanelposition || IMAGE_PANEL_LEFT,
                    footerlinks: config.footerlinks?.map(fl => ({
                        footerlinkid: fl?.footerlinkid || "",
                        tenantid: tenantId,
                        linktext: fl?.linktext || "",
                        uri: fl?.uri || ""
                    })) || []
                }
                setHasSystemDefaultLookAndFeel(false);
                setTenantLookAndFeelInput(input);
                setRevertToInput({...input, footerlinks: input.footerlinks?.map(fl => ({...fl}))});
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

    const handleAddFooterLink = () => {
        const links = [...(tenantLookAndFeelInput.footerlinks || [])];
        links.push({ tenantid: tenantId, linktext: "", uri: "" });
        setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, footerlinks: links });
        setMarkDirty(true);
    };

    const handleRemoveFooterLink = (index: number) => {
        const links = [...(tenantLookAndFeelInput.footerlinks || [])];
        links.splice(index, 1);
        setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, footerlinks: links });
        setMarkDirty(true);
    };

    const handleFooterLinkChange = (index: number, field: keyof FooterLinkInput, value: string) => {
        const links = [...(tenantLookAndFeelInput.footerlinks || [])];
        const link = { ...links[index] as FooterLinkInput };
        link[field] = value;
        links[index] = link;
        setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, footerlinks: links });
        setMarkDirty(true);
    };

    // Helper to render a color field with a color picker icon
    const renderColorField = (fieldKey: string, label: string, value: string | null | undefined) => (
        <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
            <Grid2 display="flex" alignItems={"center"} container spacing={2} size={12}>
                <Grid2 size={11}>
                    <TextField
                        disabled={readOnly}
                        value={value || ""}
                        onChange={(evt) => {
                            const updated = { ...tenantLookAndFeelInput, [fieldKey]: evt.target.value };
                            setTenantLookAndFeelInput(updated);
                            setMarkDirty(true);
                        }}
                        fullWidth={true}
                        label={label}
                    />
                </Grid2>
                <Grid2 size={1}>
                    {!readOnly &&
                        <ColorizeIcon onClick={() => openColorPicker(fieldKey, label)} sx={{ cursor: "pointer" }} />
                    }
                </Grid2>
            </Grid2>
        </Grid2>
    );

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
                onClose={() => setColorPickerOpen(false)}
                open={colorPickerOpen}
            >
                <DialogTitle>{colorPickerLabel}</DialogTitle>
                <DialogContent>
                    <HexColorPicker
                        color={tempColor || DEFAULT_BACKGROUND_COLOR}
                        onChange={(newColor: string) => { setTempColor(newColor); }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setColorPickerOpen(false)}>Cancel</Button>
                    <Button onClick={applyColorPicker}>Select</Button>
                </DialogActions>
            </Dialog>
            <Grid2 container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <Alert onClose={() => setErrorMessage(null)} severity="error">{errorMessage}</Alert>
                    </Grid2>
                }

                {/* ===== HEADER PREVIEW ===== */}
                <div style={{fontWeight: "bold", fontSize: "1.0em", textDecoration: "underline"}}>Header Preview</div>
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
                        <div style={{marginRight: "16px"}}>
                            {tenantLookAndFeelInput.authenticationlogo &&
                                <img style={{height: !breakPoints.isMedium ? "45px": "25px"}} src={`data:image/svg+xml;base64,${btoa(tenantLookAndFeelInput.authenticationlogo)}`}></img>
                            }
                            {tenantLookAndFeelInput.authenticationlogouri &&
                                <img style={{height: !breakPoints.isMedium ? "45px": "25px"}} src={tenantLookAndFeelInput.authenticationlogouri} loading="lazy" alt="Authentication Header Logo"></img>
                            }
                        </div>
                        <div style={{alignContent: "center", alignItems: "center"}}>
                            {tenantLookAndFeelInput.authenticationheadertext}
                        </div>
                    </Stack>
                </Grid2>

                {/* ===== BUTTON PREVIEW ===== */}
                <div style={{fontWeight: "bold", fontSize: "1.0em", textDecoration: "underline"}}>Button Preview</div>
                <Grid2
                    container
                    spacing={1}
                    margin={"8px 0px"}
                    size={12}
                    height={"45px"}
                    alignContent={"center"}
                    alignItems={"center"}
                    display={"flex"}
                    padding={"8px"}
                >
                    <Stack direction={"row"}>
                        <div style={{marginRight: "16px"}}>
                            <Button
                                variant="contained"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.9em",
                                    height: "100%",
                                    padding: "8px 32px 8px 32px",
                                    backgroundColor: tenantLookAndFeelInput.authenticationbuttonbackgroundcolor || tenantLookAndFeelInput.authenticationheaderbackgroundcolor,
                                    color: tenantLookAndFeelInput.authenticationbuttontextcolor || tenantLookAndFeelInput.authenticationheadertextcolor
                                }}
                            >Cancel</Button>
                        </div>
                        <div style={{marginRight: "16px"}}>
                            <Button
                                variant="contained"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.9em",
                                    height: "100%",
                                    padding: "8px 32px 8px 32px",
                                    backgroundColor: tenantLookAndFeelInput.authenticationbuttonbackgroundcolor || tenantLookAndFeelInput.authenticationheaderbackgroundcolor,
                                    color: tenantLookAndFeelInput.authenticationbuttontextcolor || tenantLookAndFeelInput.authenticationheadertextcolor
                                }}
                            >Submit</Button>
                        </div>
                    </Stack>
                </Grid2>

                {/* ===== FOOTER PREVIEW ===== */}
                <div style={{fontWeight: "bold", fontSize: "1.0em", textDecoration: "underline"}}>Footer Preview</div>
                <Grid2
                    container
                    spacing={2}
                    margin={"8px 0px"}
                    size={12}
                    minHeight={"40px"}
                    alignContent={"center"}
                    alignItems={"center"}
                    display={"flex"}
                    padding={"8px"}
                    sx={{
                        backgroundColor: tenantLookAndFeelInput.authenticationfooterbackgroundcolor || tenantLookAndFeelInput.authenticationheaderbackgroundcolor,
                        color: tenantLookAndFeelInput.authenticationfootertextcolor || tenantLookAndFeelInput.authenticationheadertextcolor,
                        fontSize: "0.8em",
                        border: "solid 1px lightgrey"
                    }}
                >
                    <Stack direction={"row"} spacing={2}>
                        {tenantLookAndFeelInput.footerlinks?.map((link, idx) => (
                            <span key={idx} style={{textDecoration: "underline", cursor: "pointer"}}>
                                {link?.linktext || "Link"}
                            </span>
                        ))}
                        {(!tenantLookAndFeelInput.footerlinks || tenantLookAndFeelInput.footerlinks.length === 0) &&
                            <span style={{opacity: 0.6}}>No footer links configured</span>
                        }
                    </Stack>
                </Grid2>

                {/* ===== HEADER COLORS ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Header</Typography></Divider>
                </Grid2>
                {renderColorField("authenticationheaderbackgroundcolor", "Header Background Color", tenantLookAndFeelInput.authenticationheaderbackgroundcolor)}
                {renderColorField("authenticationheadertextcolor", "Header Text Color", tenantLookAndFeelInput.authenticationheadertextcolor)}
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <TextField name="headerText" id="headerText"
                        disabled={readOnly}
                        value={tenantLookAndFeelInput.authenticationheadertext || ""}
                        onChange={(evt) => { tenantLookAndFeelInput.authenticationheadertext = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                        fullWidth={true}
                        label="Header Text"
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    {!readOnly &&
                        <React.Fragment>
                            <Grid2 container size={12}>
                                <Grid2 size={11}>Logo (svg, no more than 45 pixels in height)</Grid2>
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
                                <Grid2 size={12}>
                                    <TextField
                                        disabled={readOnly}
                                        value={tenantLookAndFeelInput.authenticationlogouri}
                                        onChange={(evt) => { tenantLookAndFeelInput.authenticationlogouri = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                                        fullWidth={true}
                                        label="Logo URI"
                                    />
                                </Grid2>
                            </Grid2>
                        </React.Fragment>
                    }
                </Grid2>

                {/* ===== BUTTON COLORS ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Buttons</Typography></Divider>
                </Grid2>
                {renderColorField("authenticationbuttonbackgroundcolor", "Button Background Color", tenantLookAndFeelInput.authenticationbuttonbackgroundcolor)}
                {renderColorField("authenticationbuttontextcolor", "Button Text Color", tenantLookAndFeelInput.authenticationbuttontextcolor)}

                {/* ===== INPUT / PAGE COLORS ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Page &amp; Inputs</Typography></Divider>
                </Grid2>
                {renderColorField("authenticationpagebackgroundcolor", "Page Background Color", tenantLookAndFeelInput.authenticationpagebackgroundcolor)}
                {renderColorField("authenticationinputbordercolor", "Input Border Color", tenantLookAndFeelInput.authenticationinputbordercolor)}
                {renderColorField("authenticationlinkcolor", "Link Color", tenantLookAndFeelInput.authenticationlinkcolor)}

                {/* ===== FOOTER COLORS ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Footer</Typography></Divider>
                </Grid2>
                {renderColorField("authenticationfooterbackgroundcolor", "Footer Background Color", tenantLookAndFeelInput.authenticationfooterbackgroundcolor)}
                {renderColorField("authenticationfootertextcolor", "Footer Text Color", tenantLookAndFeelInput.authenticationfootertextcolor)}

                {/* ===== LAYOUT ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Layout</Typography></Divider>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Layout Type</InputLabel>
                        <Select
                            disabled={readOnly}
                            value={tenantLookAndFeelInput.authenticationlayouttype || LAYOUT_TYPE_SINGLE_COLUMN}
                            label="Layout Type"
                            onChange={(evt) => {
                                setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, authenticationlayouttype: evt.target.value });
                                setMarkDirty(true);
                            }}
                        >
                            {LAYOUT_TYPES.map((lt) => (
                                <MenuItem key={lt} value={lt}>{lt}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Image Panel Position</InputLabel>
                        <Select
                            disabled={readOnly}
                            value={tenantLookAndFeelInput.authenticationimagepanelposition || IMAGE_PANEL_LEFT}
                            label="Image Panel Position"
                            onChange={(evt) => {
                                setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, authenticationimagepanelposition: evt.target.value });
                                setMarkDirty(true);
                            }}
                        >
                            {IMAGE_PANEL_POSITIONS.map((pos) => (
                                <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 12, xl: 12 }}>
                    <TextField
                        disabled={readOnly}
                        value={tenantLookAndFeelInput.authenticationbackgroundimageuri || ""}
                        onChange={(evt) => {
                            setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, authenticationbackgroundimageuri: evt.target.value });
                            setMarkDirty(true);
                        }}
                        fullWidth={true}
                        label="Background Image URI"
                    />
                </Grid2>

                {/* ===== FOOTER LINKS ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Footer Links</Typography></Divider>
                </Grid2>
                {tenantLookAndFeelInput.footerlinks?.map((link, index) => (
                    <Grid2 key={index} container size={12} spacing={2} alignItems={"center"}>
                        <Grid2 size={{ sm: 5, xs: 5, md: 5, lg: 5, xl: 5 }}>
                            <TextField
                                disabled={readOnly}
                                value={link?.linktext || ""}
                                onChange={(evt) => handleFooterLinkChange(index, "linktext", evt.target.value)}
                                fullWidth={true}
                                label="Link Text"
                                size="small"
                            />
                        </Grid2>
                        <Grid2 size={{ sm: 6, xs: 6, md: 6, lg: 6, xl: 6 }}>
                            <TextField
                                disabled={readOnly}
                                value={link?.uri || ""}
                                onChange={(evt) => handleFooterLinkChange(index, "uri", evt.target.value)}
                                fullWidth={true}
                                label="URI"
                                size="small"
                            />
                        </Grid2>
                        <Grid2 size={1}>
                            {!readOnly &&
                                <IconButton onClick={() => handleRemoveFooterLink(index)} size="small">
                                    <DeleteForeverOutlinedIcon />
                                </IconButton>
                            }
                        </Grid2>
                    </Grid2>
                ))}
                {!readOnly &&
                    <Grid2 size={12}>
                        <Button
                            variant="text"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={handleAddFooterLink}
                            sx={{ textTransform: "none" }}
                        >
                            Add Footer Link
                        </Button>
                    </Grid2>
                }
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
