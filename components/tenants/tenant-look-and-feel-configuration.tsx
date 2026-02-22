"use client";
import { FooterLink, FooterLinkInput, PortalUserProfile, TenantLookAndFeel, TenantLookAndFeelInput } from "@/graphql/generated/graphql-types";
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
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, IMAGE_PANEL_LEFT, IMAGE_PANEL_POSITIONS, LAYOUT_TYPE_SINGLE_COLUMN, LAYOUT_TYPE_TWO_COLUMN, LAYOUT_TYPES, LOGO_HEADER_POSITION_LEFT, TENANT_UPDATE_SCOPE } from "@/utils/consts";
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
        headerbackgroundcolor: DEFAULT_BACKGROUND_COLOR,
        headertextcolor: DEFAULT_TEXT_COLOR,
        logouri: "",
        headertext: "",
        buttonbackgroundcolor: DEFAULT_BACKGROUND_COLOR,
        buttontextcolor: "white",
        inputbordercolor: "",
        pagebackgroundcolor: "",
        footerbackgroundcolor: DEFAULT_BACKGROUND_COLOR,
        footertextcolor: "white",
        linkcolor: "",
        layouttype: LAYOUT_TYPE_SINGLE_COLUMN,
        imagepanelposition: IMAGE_PANEL_LEFT,
        buttonborderradius: "4px",        
        headerlogoposition: LOGO_HEADER_POSITION_LEFT,
        marketingimageuri: "",
        marketingtext: "",
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
                    headerbackgroundcolor: config.headerbackgroundcolor || DEFAULT_BACKGROUND_COLOR,
                    headertext: config.headertext,
                    headertextcolor: config.headertextcolor || "white",                    
                    logouri: config.logouri || "",
                    buttonbackgroundcolor: config.buttonbackgroundcolor || DEFAULT_BACKGROUND_COLOR,
                    buttontextcolor: config.buttontextcolor || "white",
                    inputbordercolor: config.inputbordercolor || "",
                    pagebackgroundcolor: config.pagebackgroundcolor || "",
                    footerbackgroundcolor: config.footerbackgroundcolor || DEFAULT_BACKGROUND_COLOR,
                    footertextcolor: config.footertextcolor || "white",
                    linkcolor: config.linkcolor || "",
                    layouttype: config.layouttype || LAYOUT_TYPE_SINGLE_COLUMN,
                    marketingimageuri: config.marketingimageuri || "",
                    imagepanelposition: config.imagepanelposition || IMAGE_PANEL_LEFT,
                    buttonborderradius: config.buttonborderradius || "4px",
                    headerlogoposition: config.headerlogoposition || LOGO_HEADER_POSITION_LEFT,
                    marketingtext: config.marketingtext || "",
                    footerlinks: config.footerlinks?.map(fl => ({
                        tenantid: tenantId,
                        linktext: fl?.linktext || "",
                        uri: fl?.uri || ""
                    })) || []
                }
                setHasSystemDefaultLookAndFeel(false);
                setTenantLookAndFeelInput(input);
                setRevertToInput({...input, footerlinks: input.footerlinks || []});
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

    const handleAddFooterLink = () => {
        const links = [...(tenantLookAndFeelInput.footerlinks || [])];
        const newLink: FooterLinkInput = {
            linktext: "",
            tenantid: tenantId,
            uri: ""
        };
        links.push(newLink);
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
                        backgroundColor: tenantLookAndFeelInput.headerbackgroundcolor,
                        color: tenantLookAndFeelInput.headertextcolor,
                        fontWeight: "bold",
                        fontSize: "1.0em",
                        border: "solid 1px lightgrey"
                    }}
                >
                    <Stack direction={"row"}>
                        <div style={{marginRight: "16px"}}>
                            {tenantLookAndFeelInput.logouri &&
                                <img style={{height: !breakPoints.isMedium ? "45px": "25px"}} src={tenantLookAndFeelInput.logouri} alt=" Header Logo"></img>
                            }
                        </div>
                        <div style={{alignContent: "center", alignItems: "center"}}>
                            {tenantLookAndFeelInput.headertext}
                        </div>
                    </Stack>
                </Grid2>

                {/* ===== INPUTS PREVIEW ===== */}
                <div style={{fontWeight: "bold", fontSize: "1.0em", textDecoration: "underline"}}>Inputs Preview</div>
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
                            <TextField 
                                name="example input"
                                placeholder="example@example.com"
                                fullWidth={true}
                            />
                        </div>
                        <div style={{marginRight: "16px"}}>
                            <Button
                                variant="contained"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.9em",
                                    height: "100%",
                                    padding: "8px 32px 8px 32px",
                                    backgroundColor: tenantLookAndFeelInput.buttonbackgroundcolor || tenantLookAndFeelInput.headerbackgroundcolor,
                                    color: tenantLookAndFeelInput.buttontextcolor || tenantLookAndFeelInput.headertextcolor,
                                    borderRadius: tenantLookAndFeelInput.buttonborderradius
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
                                    backgroundColor: tenantLookAndFeelInput.buttonbackgroundcolor || tenantLookAndFeelInput.headerbackgroundcolor,
                                    color: tenantLookAndFeelInput.buttontextcolor || tenantLookAndFeelInput.headertextcolor,
                                    borderRadius: tenantLookAndFeelInput.buttonborderradius
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
                        backgroundColor: tenantLookAndFeelInput.footerbackgroundcolor || tenantLookAndFeelInput.headerbackgroundcolor,
                        color: tenantLookAndFeelInput.footertextcolor || tenantLookAndFeelInput.headertextcolor,
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
                {renderColorField("headerbackgroundcolor", "Header Background Color", tenantLookAndFeelInput.headerbackgroundcolor)}
                {renderColorField("headertextcolor", "Header Text Color", tenantLookAndFeelInput.headertextcolor)}
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <TextField name="headerText" id="headerText"
                        disabled={readOnly}
                        value={tenantLookAndFeelInput.headertext || ""}
                        onChange={(evt) => { tenantLookAndFeelInput.headertext = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                        fullWidth={true}
                        label="Header Text"
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    {!readOnly &&
                        <React.Fragment>                            
                            <Grid2 marginTop={"8px"} container size={12}>
                                <Grid2 size={12}>
                                    <TextField
                                        disabled={readOnly}
                                        value={tenantLookAndFeelInput.logouri}
                                        onChange={(evt) => { tenantLookAndFeelInput.logouri = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
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
                {renderColorField("buttonbackgroundcolor", "Button Background Color", tenantLookAndFeelInput.buttonbackgroundcolor)}
                {renderColorField("buttontextcolor", "Button Text Color", tenantLookAndFeelInput.buttontextcolor)}
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                    <TextField fullWidth={true} 
                        name="buttonborderradius"
                        onChange={(evt) => {
                            tenantLookAndFeelInput.buttonborderradius = evt.target.value;
                            setTenantLookAndFeelInput({...tenantLookAndFeelInput});
                            setMarkDirty(true);
                        }}                        
                        label="Button Border Radius"
                        value={tenantLookAndFeelInput.buttonborderradius}
                    />
                </Grid2>
                {}

                {/* ===== INPUT / PAGE COLORS ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Page &amp; Inputs</Typography></Divider>
                </Grid2>
                {renderColorField("pagebackgroundcolor", "Page Background Color", tenantLookAndFeelInput.pagebackgroundcolor)}
                {renderColorField("inputbordercolor", "Input Border Color", tenantLookAndFeelInput.inputbordercolor)}
                {renderColorField("linkcolor", "Link Color", tenantLookAndFeelInput.linkcolor)}

                {/* ===== FOOTER COLORS ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Footer</Typography></Divider>
                </Grid2>
                {renderColorField("footerbackgroundcolor", "Footer Background Color", tenantLookAndFeelInput.footerbackgroundcolor)}
                {renderColorField("footertextcolor", "Footer Text Color", tenantLookAndFeelInput.footertextcolor)}

                {/* ===== LAYOUT ===== */}
                <Grid2 size={12}>
                    <Divider><Typography sx={{fontWeight: "bold", fontSize: "0.9em"}}>Layout</Typography></Divider>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Layout Type</InputLabel>
                        <Select
                            disabled={readOnly}
                            value={tenantLookAndFeelInput.layouttype || LAYOUT_TYPE_SINGLE_COLUMN}
                            label="Layout Type"
                            onChange={(evt) => {
                                setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, layouttype: evt.target.value });
                                setMarkDirty(true);
                            }}
                        >                            
                            <MenuItem key={LAYOUT_TYPE_SINGLE_COLUMN} value={LAYOUT_TYPE_SINGLE_COLUMN}>Classic</MenuItem>
                            <MenuItem key={LAYOUT_TYPE_TWO_COLUMN} value={LAYOUT_TYPE_TWO_COLUMN}>Two Column</MenuItem>                            
                        </Select>
                    </FormControl>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                    <FormControl fullWidth>
                        <InputLabel>Marketing Panel Position</InputLabel>
                        <Select
                            disabled={readOnly}
                            value={tenantLookAndFeelInput.imagepanelposition || IMAGE_PANEL_LEFT}
                            label="Image Panel Position"
                            onChange={(evt) => {
                                setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, imagepanelposition: evt.target.value });
                                setMarkDirty(true);
                            }}
                        >
                            {IMAGE_PANEL_POSITIONS.map((pos) => (
                                <MenuItem key={pos} value={pos}>{pos.toWellFormed()}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                    <TextField
                        disabled={readOnly || tenantLookAndFeelInput.layouttype === LAYOUT_TYPE_SINGLE_COLUMN}
                        value={tenantLookAndFeelInput.marketingimageuri || ""}
                        onChange={(evt) => {
                            setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, marketingimageuri: evt.target.value });
                            setMarkDirty(true);
                        }}
                        fullWidth={true}
                        label="Marketing Image URI"
                    />
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }}>
                    <TextField
                        disabled={readOnly}
                        value={tenantLookAndFeelInput.marketingtext || ""}
                        onChange={(evt) => {
                            setTenantLookAndFeelInput({ ...tenantLookAndFeelInput, marketingtext: evt.target.value });
                            setMarkDirty(true);
                        }}
                        fullWidth={true}
                        label="Marketing Text"
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
