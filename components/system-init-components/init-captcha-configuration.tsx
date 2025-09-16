"use client";
import React from "react";
import { SystemInitializationConfigProps } from "./system-init";
import { CaptchaConfigInput } from "@/graphql/generated/graphql-types";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const InitCaptchaConfiguration: React.FC<SystemInitializationConfigProps> = ({
    onBack,
    onNext,
    systemInitInput

}) => {

    // STATE VARIABLES
    const initCaptchaInput: CaptchaConfigInput = {
        alias: "",
        apiKey: "",
        siteKey: "",
        useCaptchaV3: false,
        useEnterpriseCaptcha: false,
        minScoreThreshold: 0,
        projectId: ""
    }
    const [captchaConfigInput, setCaptchaConfigInput] = React.useState<CaptchaConfigInput>(initCaptchaInput);
    const [viewCaptchaApiKey, setViewCaptchaApiKey] = React.useState<boolean>(false);
    
    return (
        <Typography component="div">
            <Paper
                elevation={1}
                sx={{ padding: "8px", border: "solid 1px lightgrey" }}
            >
                <Grid2 container size={12} spacing={1}>
                    <Grid2 size={12} marginBottom={"8px"} fontWeight={"bold"}>
                        ReCaptcha Configuration
                    </Grid2>
                    <Grid2 marginBottom={"8px"} size={12}>
                        <div>Alias</div>
                        <TextField
                            id="captchaAlias" name="captchaAlias"
                            onChange={(evt) => {
                                captchaConfigInput.alias = evt.target.value;
                                setCaptchaConfigInput({...captchaConfigInput});
                            }}
                            value={captchaConfigInput.alias}
                            size="small"
                            fullWidth={true}
                        />
                    </Grid2>
                    <Grid2 marginBottom={"8px"} size={12}>
                        <div>Project ID (Optional)</div>
                        <TextField
                            id="projectId" name="projectId"
                            onChange={(evt) => {
                                captchaConfigInput.projectId = evt.target.value;
                                setCaptchaConfigInput({...captchaConfigInput});
                            }}
                            value={captchaConfigInput.projectId}
                            size="small"
                            fullWidth={true}
                        />
                    </Grid2>

                    <Grid2 marginBottom={"8px"} size={12}>
                        <div>Site Key</div>
                        <TextField
                            id="siteKey" name="siteKey"
                            onChange={(evt) => {
                                captchaConfigInput.siteKey = evt.target.value;
                                setCaptchaConfigInput({...captchaConfigInput});
                            }}
                            value={captchaConfigInput.siteKey}
                            size="small"
                            fullWidth={true}
                        />
                    </Grid2>

                    <Grid2 marginBottom={"8px"} size={12}>
                        <div>Api (Secret) Key</div>                        
                        <TextField type="password" name="apiKey" id="apiKey"
                            value={captchaConfigInput.apiKey}
                            onChange={(evt) => {
                                captchaConfigInput.apiKey = evt.target.value;
                                setCaptchaConfigInput({ ...captchaConfigInput });
                            }}
                            fullWidth={true} size="small"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {viewCaptchaApiKey === true &&
                                                <VisibilityOffOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => { 
                                                        setViewCaptchaApiKey(false);
                                                    }}
                                                />
                                            }
                                            {viewCaptchaApiKey === false &&
                                                <VisibilityOutlinedIcon
                                                    sx={{ cursor: "pointer" }}
                                                    onClick={() => { 
                                                        setViewCaptchaApiKey(true);
                                                    }}
                                                />
                                            }
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Grid2>
                    <Grid2 size={11} marginBottom={"8px"}>
                        Use ReCaptcha V3
                    </Grid2>
                    <Grid2 size={1}>
                        <Checkbox
                            checked={captchaConfigInput.useCaptchaV3 === true}
                            onChange={(_, checked: boolean) => {
                                captchaConfigInput.useCaptchaV3 = checked;
                                setCaptchaConfigInput({...captchaConfigInput});
                            }}
                        />
                    </Grid2>

                    <Grid2 marginBottom={"8px"} size={12}>
                        <div>Min. Score Threshold (for V3 ReCaptcha) 0.0 to 1.0</div>
                        <TextField
                            disabled={captchaConfigInput.useCaptchaV3 === false}
                            type="number"
                            id="minScore" name="minScore"
                            onChange={(evt) => {
                                if(evt.target.value === ""){                                                        
                                    captchaConfigInput.minScoreThreshold = undefined;
                                    setCaptchaConfigInput({...captchaConfigInput});
                                }
                                else{
                                    const v: number = parseFloat(evt.target.value);
                                    if(!isNaN(v)){
                                        captchaConfigInput.minScoreThreshold = v;
                                        setCaptchaConfigInput({...captchaConfigInput});
                                    }
                                    else{
                                        captchaConfigInput.minScoreThreshold = undefined;
                                        setCaptchaConfigInput({...captchaConfigInput});
                                    }
                                }                                                 
                            }}
                            value={captchaConfigInput.useCaptchaV3 ? captchaConfigInput.minScoreThreshold : ""}
                            size="small"
                            fullWidth={true}
                        />
                    </Grid2>
                    <Grid2 size={11} marginBottom={"8px"}>
                        Use Enterprise ReCaptcha
                    </Grid2>
                    <Grid2 size={1}>
                        <Checkbox
                            checked={captchaConfigInput.useEnterpriseCaptcha === true}
                            onChange={(_, checked: boolean) => {
                                captchaConfigInput.useEnterpriseCaptcha = checked;
                                setCaptchaConfigInput({...captchaConfigInput});
                            }}
                        />
                    </Grid2>

                </Grid2>
                <Stack sx={{ width: "100%" }} direction={"row-reverse"}>
                    <Button
                        onClick={() => {
                            systemInitInput.captchaConfigInput = captchaConfigInput;
                            onNext(systemInitInput);
                        }}
                        disabled={false}
                    >
                        Next
                    </Button>                    
                    <Button
                        onClick={() => {
                            onNext(systemInitInput);
                        }}
                    >
                        Skip
                    </Button>                    
                    <Button
                        onClick={() => {
                            onBack();
                        }}
                    >
                        Back
                    </Button>
                </Stack>
            </Paper>
        </Typography>
    )
}

export default InitCaptchaConfiguration;