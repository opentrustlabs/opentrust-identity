"use client";
import React, { createContext, useContext, useEffect } from "react";
import { IntlProvider } from 'react-intl';

import enMessages from "../../locales/en.json";
import itMessages from "../../locales/it.json";
import { SELECTED_LANUGAGE_CODE } from "@/utils/consts";

const messages: Record<string, any> = {
    en: enMessages,
    it: itMessages,
};


interface I18NProps {
    hasSelectedLanguage: () => boolean,
    getLanguage: () => string,
    setLanguage: (lang: string) => void
}

const InternationalizationContext = createContext<I18NProps>({
    hasSelectedLanguage() {
        return false;
    },
    getLanguage() {
        return "en"
    },
    setLanguage() {
        // NO OP
    },
})

const InternationalizationContextProvider: React.FC<{ children: React.ReactNode}> = ({
    children
}) => {

    const [lang, setLang] = React.useState<string>("en");

    const getSelectedLanguageCodeFromLocalStorage = (): string | null => {
        const v = localStorage.getItem(SELECTED_LANUGAGE_CODE);
        return v;
    }

    const setSelectedLanguageCodeOnLocalStorage = (lang: string): void => {
        localStorage.setItem(SELECTED_LANUGAGE_CODE, lang);
    }

    useEffect(() => {
        if(typeof window !== "undefined"){
            setLang(getSelectedLanguageCodeFromLocalStorage() || "en");
        }
    }, []);

    return (
        <InternationalizationContext.Provider
            value={
                {
                    hasSelectedLanguage() {
                        return getSelectedLanguageCodeFromLocalStorage() !== null
                    },
                    getLanguage() {
                        return lang;
                    },
                    setLanguage(lang) {
                        setSelectedLanguageCodeOnLocalStorage(lang);
                        setLang(lang);
                    },
                }
            }
        >
            <IntlProvider locale={lang} messages={messages[lang] || messages["en"]}>
                {children}
            </IntlProvider>
            
        </InternationalizationContext.Provider>
    )
}

const useInternationalizationContext = () => {
    return useContext(InternationalizationContext);
}

export {useInternationalizationContext, InternationalizationContextProvider };