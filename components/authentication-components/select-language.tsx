"use client";
import React from "react"
import { useInternationalizationContext } from "../contexts/internationalization-context";
import Grid2 from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LanguageIcon from '@mui/icons-material/Language';
import { useIntl } from 'react-intl';


const SUPPORTED_LANGUAGES = ["zh", "cs", "da", "de", "en", "es", "fr", "hi", "it", "ja", "ko", "nl", "no", "pl", "pt", "ru", "sv", "fi", "vi"];
const TRANSLATED_LANGUAGES = new Map<string, string>([
    ["zh", "中國人"],
    ["cs", "český"],
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

export interface SelectLanguageProps {
    allowCancel?: boolean,
    cancelCallback?: () => void,
    onLanguageChanged?: (lang: string) => void
}

const SelectLanguage: React.FC<SelectLanguageProps>  = ({
    allowCancel,
    cancelCallback,
    onLanguageChanged
}) => {

    // CONTEXT VARIABLES
    const i18nContext = useInternationalizationContext();
    const intl = useIntl();

    // STATE VARIABLES
    const [lang, setLang] = React.useState<string>("");

    return (
        <React.Fragment>
            <Grid2 marginBottom={"16px"} display={"flex"} alignContent={"center"} container spacing={1} size={12}>
                <div><LanguageIcon /></div>
                <div style={{fontWeight: "bold"}}>
                    {i18nContext.hasSelectedLanguage() === true ?
                        intl.formatMessage({id: "SELECT_A_LANGUAGE"})
                        :
                        "Select a Language"
                    }                    
                </div>
            </Grid2>
            <Grid2  container spacing={1} size={12}>                
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
                        if(onLanguageChanged){
                            onLanguageChanged(lang);
                        }
                    }}
                >
                    {i18nContext.hasSelectedLanguage() === true ?
                        intl.formatMessage({id: "SUBMIT"})
                        :
                        "Submit"
                    }
                </Button>
                {allowCancel &&
                    <Button 
                        sx={{ marginRight: "8px" }}
                        onClick={() => {
                            if(cancelCallback){
                                cancelCallback();
                            }
                        }}
                    >
                        {i18nContext.hasSelectedLanguage() === true ?
                            intl.formatMessage({id: "CANCEL"})
                            :
                            "Cancel"
                        }                        
                    </Button>
                }
                
            </Stack>
        </React.Fragment>
    )

}

export default SelectLanguage