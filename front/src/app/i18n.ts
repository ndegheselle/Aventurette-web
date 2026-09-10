import { SETTINGS_STORAGE_KEYS } from '@chapelure/ui/settings/useSettings';
import { createI18n } from 'vue-i18n';
import { DEFAULT_LOCALE, messages } from '@/app/messages';

/**
 * A stored value can outlive the locale it names (renamed code, removed translation). Falling
 * back here keeps an unknown one from being adopted as the active locale, which would leave
 * every key unresolved.
 */
const storedLocale = localStorage.getItem(SETTINGS_STORAGE_KEYS.language);
const initialLocale = storedLocale && storedLocale in messages ? storedLocale : DEFAULT_LOCALE;

export const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    // Set explicitly: vue-i18n otherwise defaults it to `locale`, so the fallback would follow
    // whatever was in storage and any untranslated key would render as its own path.
    fallbackLocale: DEFAULT_LOCALE,
    messages,
});
