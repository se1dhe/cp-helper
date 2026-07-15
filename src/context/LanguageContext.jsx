import React, { createContext, useContext, useState, useCallback } from 'react';
import { RU, UA } from '../i18n/translations';

const LanguageContext = createContext();

export const useLang = () => useContext(LanguageContext);

const LANG_KEY = 'cp-helper-lang';

const getInitialLang = () => {
  return localStorage.getItem(LANG_KEY) || 'ru';
};

const LANGUAGES = {
  ru: { label: 'RU', dict: RU },
  ua: { label: 'UA', dict: UA },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((l) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ru' ? 'ua' : 'ru');
  }, [lang, setLang]);

  const t = useCallback((key, params = {}) => {
    let text = LANGUAGES[lang]?.dict[key] || LANGUAGES.ru.dict[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
    return text;
  }, [lang]);

  const value = {
    lang,
    setLang,
    toggleLang,
    t,
    isRU: lang === 'ru',
    isUA: lang === 'ua',
    langLabel: LANGUAGES[lang].label,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
