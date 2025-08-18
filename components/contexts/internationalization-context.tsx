"use client";
import React, { createContext, useContext, useEffect } from "react";
import { IntlProvider } from 'react-intl';

import enMessages from "../../locales/en.json";
import itMessages from "../../locales/it.json";
import { SELECTED_LANUGAGE_CODE_STORAGE_KEY } from "@/utils/consts";

// @typescript-eslint/no-explicit-any
const messages: Record<string, any> = {
    en: enMessages,
    it: itMessages,
};

const DEFAULT_LANGUAGE="en";

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
        return DEFAULT_LANGUAGE;
    },
    setLanguage() {
        // NO OP
    },
})

const InternationalizationContextProvider: React.FC<{ children: React.ReactNode}> = ({
    children
}) => {

    const [lang, setLang] = React.useState<string>("");

    const getSelectedLanguageCodeFromLocalStorage = (): string | null => {
        const v = localStorage.getItem(SELECTED_LANUGAGE_CODE_STORAGE_KEY);
        return v;
    }

    const setSelectedLanguageCodeOnLocalStorage = (lang: string): void => {
        localStorage.setItem(SELECTED_LANUGAGE_CODE_STORAGE_KEY, lang);
    }

    useEffect(() => {
        if(typeof window !== "undefined"){
            setLang(getSelectedLanguageCodeFromLocalStorage() || "");
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
                        if(lang === ""){
                            return DEFAULT_LANGUAGE;
                        }
                        return lang;
                    },
                    setLanguage(lang) {
                        setSelectedLanguageCodeOnLocalStorage(lang);
                        setLang(lang);
                    },
                }
            }
        >
            <IntlProvider locale={lang !== "" ? lang : DEFAULT_LANGUAGE} messages={messages[lang] || messages[DEFAULT_LANGUAGE]}>
                {children}
            </IntlProvider>
            
        </InternationalizationContext.Provider>
    )
}

const useInternationalizationContext = () => {
    return useContext(InternationalizationContext);
}

export {useInternationalizationContext, InternationalizationContextProvider };