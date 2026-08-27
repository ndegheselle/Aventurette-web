import { SETTINGS_STORAGE_KEYS } from '@chapelure/ui/settings/useSettings';
import { createI18n } from 'vue-i18n';

// The design system ships its own strings (actions, data, validation, settings, inputs...).
// The app imports them explicitly rather than the library globbing the app's folders, which
// is what used to make @chapelure/ui depend on this project's layout.
import uiEn from '@chapelure/ui/locales/en.json';
import uiFr from '@chapelure/ui/locales/fr.json';

/** Every string exists here, so it is both the boot default and the fallback for any gap. */
const DEFAULT_LOCALE = 'fr';

type Messages = Record<string, any>;

// Feature translations are colocated with their feature and picked up automatically.
const featureFiles = import.meta.glob('@/features/**/locales/*.json', { eager: true });

/**
 * Recursive merge. A shallow spread would let two files that share a top-level key silently
 * drop each other's subtrees (features/auth owns "users", and any feature could add one).
 */
function mergeMessages(target: Messages, source: Messages): Messages {
    for (const [key, value] of Object.entries(source)) {
        const existing = target[key];
        if (isPlainObject(existing) && isPlainObject(value)) {
            mergeMessages(existing, value);
        } else {
            target[key] = value;
        }
    }
    return target;
}

function isPlainObject(value: unknown): value is Messages {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const messages: Record<string, Messages> = {
    fr: mergeMessages({}, uiFr),
    en: mergeMessages({}, uiEn),
};

for (const path in featureFiles) {
    const match = path.match(/\/locales\/([\w-]+)\.json$/);
    if (!match) continue;

    const locale = match[1];
    if (!locale) continue;

    const mod = featureFiles[path] as { default: Messages };

    messages[locale] ??= {};
    mergeMessages(messages[locale], mod.default);
}

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
