import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";

type LanguageCode = "en" | "hi" | "ta" | "te";

const translations: Record<LanguageCode, Record<string, string>> = {
    en,
    hi,
    ta,
    te,
};

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<LanguageCode>("en");

    // Load language from localStorage if available
    useEffect(() => {
        const saved = localStorage.getItem("app_language") as LanguageCode;
        if (saved && translations[saved]) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem("app_language", lang);
    };

    const t = (key: string): string => {
        const langDict = translations[language];
        if (langDict && langDict[key]) {
            return langDict[key];
        }
        // Fallback to English if key missing
        if (translations.en[key]) {
            return translations.en[key];
        }
        // Fallback to key itself
        return key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
