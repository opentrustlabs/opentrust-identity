"use client";
import React, { createContext, useContext, useEffect } from "react";
import { IntlProvider } from 'react-intl';

import daMessages from "../../locales/da.json";
import deMessages from "../../locales/de.json";
import enMessages from "../../locales/en.json";
import esMessages from "../../locales/es.json";
import fiMessages from "../../locales/fi.json";
import frMessages from "../../locales/fr.json";
import hiMessages from "../../locales/hi.json";
import itMessages from "../../locales/it.json";
import jaMessages from "../../locales/ja.json";
import koMessages from "../../locales/ko.json";
import nlMessages from "../../locales/nl.json";
import noMessages from "../../locales/no.json";
import plMessages from "../../locales/pl.json";
import ptMessages from "../../locales/pt.json";
import ruMessages from "../../locales/ru.json";
import svMessages from "../../locales/sv.json";
import viMessages from "../../locales/vi.json";
import zhMessages from "../../locales/zh.json";

import { SELECTED_LANUGAGE_CODE_STORAGE_KEY } from "@/utils/consts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messages: Record<string, any> = {
    da: daMessages,
    de: deMessages,
    en: enMessages,
    es: esMessages,
    fi: fiMessages,
    fr: frMessages,
    hi: hiMessages,
    it: itMessages,
    ja: jaMessages,
    ko: koMessages,
    nl: nlMessages,
    no: noMessages,
    pl: plMessages,
    pt: ptMessages,
    ru: ruMessages,
    sv: svMessages,
    vi: viMessages,
    zh: zhMessages
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