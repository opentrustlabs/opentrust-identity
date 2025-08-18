"use client";
import React from "react"
import { useInternationalizationContext } from "../contexts/internationalization-context";
import Grid2 from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { LANGUAGE_CODES, LanguageCodeDef } from "@/utils/i18n";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

const DEFAULT_LANGUAGE="en";
const SUPPORTED_LANGUAGES = ["en", "es", "de", "it", "fr"];

// LANGUAGE_CODES.filter()

const SelectLanguage: React.FC  = () => {

    // CONTEXT VARIABLES
    const i18nContext = useInternationalizationContext();

    // STATE VARIABLES
    const [lang, setLang] = React.useState<string>(DEFAULT_LANGUAGE);

    return (
        <React.Fragment>
            <Grid2  container spacing={1} size={12}>
                <Grid2 fontWeight={"bold"} marginBottom={"16px"} size={12}>
                    Select a Language:
                </Grid2>
                <Grid2 marginBottom={"16px"} size={12}>
                    <Select                        
                        size="small"
                        fullWidth={true}
                        value={lang}
                        name="lang"
                        onChange={(evt) => { 
                            setLang(evt.target.value); 
                            
                        }}
                    >
                        {LANGUAGE_CODES.filter(
                            (val: LanguageCodeDef) => SUPPORTED_LANGUAGES.includes(val.languageCode)
                        ).map(
                            (val: LanguageCodeDef) => (
                                <MenuItem value={val.languageCode} >{val.language}</MenuItem>
                            )
                        )}
                    </Select>
                </Grid2>
            </Grid2>
            <Stack direction={"row-reverse"} width={"100%"}>
                <Button 
                    onClick={() => {
                        i18nContext.setLanguage(lang);
                    }}
                >
                    Submit
                </Button>
            </Stack>
        </React.Fragment>
    )

}

export default SelectLanguage