"use client";
import React from "react"
import { useInternationalizationContext } from "../contexts/internationalization-context";
import Grid2 from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

// 
const SUPPORTED_LANGUAGES = ["zh", "de", "en", "es", "fr", "it", "pt", "no", "sv", "fi", "pl", "ru", "hi", "ko", "vi", "ja", "da", "nl"];
const TRANSLATED_LANGUAGES = new Map<string, string>([
    ["zh", "中國人"],
    ["da", "Dansk"],
    ["de", "Deutsch"],
    ["en", "English"],
    ["es", "Español"],
    ["fr", "Français"],
    ["hi", "हिंदी"],
    ["it", "Italiano"],
    ["ja", "日本語"],
    ["ko", "한국인"],
    ["pt", "Português"], 
    ["nl", "Nederlands"],
    ["no", "Norsk"],
    ["pl", "Polski"],
    ["ru", "Русский"],
    ["sv", "Svenska"],
    ["fi", "Suomi"],    
    ["vi", "Tiếng Việt"]
]);



const SelectLanguage: React.FC  = () => {

    // CONTEXT VARIABLES
    const i18nContext = useInternationalizationContext();

    // STATE VARIABLES
    const [lang, setLang] = React.useState<string>("");

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
                        {SUPPORTED_LANGUAGES.map(
                            (languageCode) => (                                
                                <MenuItem key={languageCode} value={languageCode} >{TRANSLATED_LANGUAGES.get(languageCode)}</MenuItem>                                
                            )
                        )}
                    </Select>
                </Grid2>
            </Grid2>
            <Stack direction={"row-reverse"} width={"100%"}>
                <Button 
                    disabled={!SUPPORTED_LANGUAGES.includes(lang)}
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