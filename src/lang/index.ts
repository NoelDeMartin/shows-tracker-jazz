import en from './en.yaml';
import i18n from 'i18next';

export async function initLang() {
    await i18n.init({
        lng: 'en',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        resources: { en: { translation: en } },
    });
}
