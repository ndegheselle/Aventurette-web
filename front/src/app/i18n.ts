import { SETTINGS_STORAGE_KEYS } from '@chapelure/ui/settings/useSettings';
import { createI18n } from 'vue-i18n';

// The design system's own strings: actions, data, validation, settings, inputs.
import uiEn from '@chapelure/ui/locales/en.json';
import uiFr from '@chapelure/ui/locales/fr.json';

/** The boot default, and the fallback for a key missing from another locale. */
export const DEFAULT_LOCALE = 'fr';

export type Messages = Record<string, any>;

// Each feature's locales/ is picked up automatically; nothing to register.
const featureFiles = import.meta.glob('@/features/**/locales/*.json', { eager: true });

/**
 * The words for a locale, falling back to French and then to nothing.
 *
 * Empty rather than undefined for a row with no wording at all: a badge with no text is a
 * smaller lie than the string "undefined", and a seeded row always has one.
 */
export function getMessage(wording: Messages | null | undefined, locale: string): string {
    return wording?.[locale] ?? wording?.[DEFAULT_LOCALE] ?? '';
}

/** Recursive: two features sharing a top-level key must keep both subtrees. */
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

/**
 * The whole catalogue: design system strings first, then every feature's. Exported so tests
 * mount against the same messages and assert on the copy a user would read.
 */
export const messages: Record<string, Messages> = {
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

// A stored locale can outlive the translation it names, so check it before adopting it.
const storedLocale = localStorage.getItem(SETTINGS_STORAGE_KEYS.language);
const initialLocale = storedLocale && storedLocale in messages ? storedLocale : DEFAULT_LOCALE;

export const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    // Explicit: vue-i18n otherwise defaults it to `locale`, leaving nothing to fall back to.
    fallbackLocale: DEFAULT_LOCALE,
    messages,
});
