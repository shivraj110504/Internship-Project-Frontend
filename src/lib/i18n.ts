import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files will be loaded from public/locales
// But for now, we'll define them here or use backend plugin.
// Since it's a small set, we can bundle them or use public folder.
// I'll create them in public/locales and use i18next-http-backend if needed,
// but for simplicity in this environment, I'll bundle them.

import en from '../../public/locales/en.json';
import es from '../../public/locales/es.json';
import hi from '../../public/locales/hi.json';
import pt from '../../public/locales/pt.json';
import zh from '../../public/locales/zh.json';
import fr from '../../public/locales/fr.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es },
            hi: { translation: hi },
            pt: { translation: pt },
            zh: { translation: zh },
            fr: { translation: fr },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie'],
        },
    });

export default i18n;
