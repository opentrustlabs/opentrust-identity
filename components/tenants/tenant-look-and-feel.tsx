"use client";
import { TenantLookAndFeel, TenantLookAndFeelInput } from "@/graphql/generated/graphql-types";
import { TENANT_LOOK_AND_FEEL_MUTATION } from "@/graphql/mutations/oidc-mutations";
import { TENANT_LOOK_AND_FEEL_QUERY } from "@/graphql/queries/oidc-queries";
import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import DataLoading from "../layout/data-loading";
import ErrorComponent from "../error/error-component";
import Grid2 from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ColorizeIcon from '@mui/icons-material/Colorize';
import { MenuItem, Select } from "@mui/material";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, IMAGE_EXTENSION_TYPES, IMAGE_MINE_TYPES_DISPLAY } from "@/utils/consts";

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

    // STATE VARIABLES
    const [markDirty, setMarkDirty] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    // const [showReset, setShowReset] = React.useState<boolean>(false);
    const [tenantLookAndFeelInput, setTenantLookAndFeelInput] = React.useState<TenantLookAndFeelInput | null>(null);
    //const [revertToInput, setRevertToInput] = React.useState<TenantLegacyUserMigrationConfigInput | null>(null);

    // GRAPHQL FUNCTIONS
    // data may be null, so present some sensible defaults
    const { loading, error } = useQuery(TENANT_LOOK_AND_FEEL_QUERY, {
        variables: {
            tenantId: tenantId
        },
        onCompleted(data) {
            if (data && data.getLegacyUserMigrationConfiguration) {
                const config: TenantLookAndFeel = data.getTenantLookAndFeel as TenantLookAndFeel;
                initInput.authenticationheaderbackgroundcolor = config.authenticationheaderbackgroundcolor || DEFAULT_BACKGROUND_COLOR;
                initInput.authenticationheadertext = config.authenticationheadertext;
                initInput.authenticationheadertextcolor = config.authenticationheadertextcolor;
                initInput.authenticationlogo = config.authenticationlogo;
                initInput.authenticationlogomimetype = config.authenticationlogomimetype || "";
            }
            setTenantLookAndFeelInput({...initInput});
            // setRevertToInput({...initInput});
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


    if (loading) return <DataLoading dataLoadingSize="md" color={null} />
    if (error) return <ErrorComponent message={error.message} componentSize='md' />
    
    if(tenantLookAndFeelInput) return (
        <>
            <Grid2 container size={12} spacing={2}>
                {errorMessage &&
                    <Grid2 marginBottom={"16px"} size={12} >
                        <div>{errorMessage}</div>
                    </Grid2>
                }
                <div style={{fontWeight: "bold", fontSize: "1.0em"}}>Preview</div>
                <Grid2
                    marginBottom={"16px"} 
                    size={12}
                    minHeight={"60px"}
                    alignContent={"center"}
                    padding={"8px"}
                    sx={{
                        backgroundColor: tenantLookAndFeelInput.authenticationheaderbackgroundcolor,
                        color: tenantLookAndFeelInput.authenticationheadertextcolor,
                        border: "solid 1px lightgrey",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        fontSize: "1.0em"
                    }}
                >
                    <div>{tenantLookAndFeelInput.authenticationheadertext}
                    </div>
                </Grid2>
                <Grid2 marginBottom={"16px"} size={{ sm: 12, xs: 12, md: 12, lg: 6, xl: 6 }} >
                    <div>Background Color</div>
                    <Grid2 container spacing={2} size={12}>
                        <Grid2 size={11}>
                            <TextField name="backgroundColor" id="backgroundColor"                        
                                value={tenantLookAndFeelInput.authenticationheaderbackgroundcolor || ""}
                                onChange={(evt) => { tenantLookAndFeelInput.authenticationheaderbackgroundcolor = evt.target.value; setTenantLookAndFeelInput({ ...tenantLookAndFeelInput }); setMarkDirty(true); }}
                                fullWidth={true} size="small"
                            />
                        </Grid2>
                        <Grid2 size={1}>
                            <ColorizeIcon />
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
                            <ColorizeIcon />
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
                    <div>Logo Image Type</div>
                    <Select
                        fullWidth={true}
                        size="small"
                        value={tenantLookAndFeelInput.authenticationlogomimetype}
                    >
                        {["", ...IMAGE_EXTENSION_TYPES].map(
                            (t: string) => (
                                <MenuItem key={t} value={t}>{IMAGE_MINE_TYPES_DISPLAY.get(t)}</MenuItem>
                            )
                        )}
                    </Select>                    
                </Grid2>
            </Grid2>
            <Stack sx={{ marginTop: "8px" }} direction={"row"} flexDirection={"row-reverse"} >                
                <Button
                    disabled={!markDirty}
                    onClick={() => { onUpdateStart(); mutateTenantLookAndFeel() }}
                    sx={{ border: "solid 1px lightgrey", borderRadius: "4px" }} >Update
                </Button>
                {/* {showReset &&
                    <Button 
                        sx={{marginRight: "8px"}}
                        onClick={() => {
                            setTenantLegacyUserMigrationConfigInput({...revertToInput as TenantLegacyUserMigrationConfigInput});
                            setRevertToInput({...revertToInput as TenantLegacyUserMigrationConfigInput});
                            setShowReset(false);
                        }}
                    >Revert Changes</Button>
                } */}
            </Stack>        
        </>
    )

}

export default TenantLookAndFeelConfiguration;