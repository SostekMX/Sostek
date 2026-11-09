import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import es from './es';
import en from './en';
import apiErrorsEn from './apiErrors';

export type Lang = 'es' | 'en';
export type TKey = keyof typeof es;
type Vars = Record<string, string | number>;

interface ArticleEn {
  title?: string;
  subtitle?: string;
  body?: string;
  category?: string;
  tags?: string[];
  bibliography?: string;
}

/* ponytail: el ingles del contenido vive en el frontend, no en Mongo. Un articulo nuevo se
   ve en espanol hasta agregarlo a content.en.json; si algun dia hay panel de administracion,
   esto se muda a la base. `text` va por el texto original, asi resiste un reseed. */
interface ContentEn {
  articles: Record<string, ArticleEn>;
  text: Record<string, string>;
}

const STORAGE_KEY = 'lang';
const DICTIONARIES = { es, en };

let contentEn: ContentEn | null = null;

function loadContentEn(): Promise<void> {
  if (contentEn) return Promise.resolve();
  return import('./content.en.json').then(mod => {
    contentEn = (mod.default ?? mod) as ContentEn;
  });
}

/* Sincrono: muchos enlaces de la app recargan la pagina y el idioma tiene que estar antes
   del primer render. */
function readLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

export function translate(lang: Lang, key: TKey, vars?: Vars): string {
  const text = DICTIONARIES[lang][key];
  return vars ? text.replace(/\{(\w+)\}/g, (m, name) => String(vars[name] ?? m)) : text;
}

/* Trae el ingles antes del primer render si esa es la preferencia guardada, para que no
   se asome el contenido en espanol. */
export function prepareLanguage(): Promise<void> {
  return readLang() === 'en' ? loadContentEn().catch(() => undefined) : Promise.resolve();
}

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKey, vars?: Vars) => string;
  /* Traduce un texto del contenido (ejes, nombres de evaluaciones, preguntas, cartas...). */
  tx: <T extends string | undefined>(text: T) => T | string;
  /* Solo para pintar: la logica sigue leyendo los campos originales en espanol. */
  localizeArticle: <A extends { _id: string }>(article: A) => A;
  apiError: (message: string) => string;
}

function buildI18n(lang: Lang, setLang: (lang: Lang) => void): I18n {
  const content = lang === 'en' ? contentEn : null;
  return {
    lang,
    setLang,
    t: (key, vars) => translate(lang, key, vars),
    tx: text => (content && text ? content.text[text] ?? text : text),
    localizeArticle: article => {
      const overlay = content?.articles[article._id];
      return overlay ? { ...article, ...overlay } : article;
    },
    apiError: message => (lang === 'en' ? apiErrorsEn[message] ?? message : message),
  };
}

/* El valor por defecto permite renderizar sin provider (tests, ErrorBoundary de emergencia). */
export const LanguageContext = createContext<I18n>(buildI18n('es', () => undefined));

export const useI18n = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(readLang);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Sin storage el idioma dura lo que la sesion. */
    }
    if (next === 'en') {
      loadContentEn().catch(() => undefined).finally(() => setLangState(next));
    } else {
      setLangState(next);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => buildI18n(lang, setLang), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
