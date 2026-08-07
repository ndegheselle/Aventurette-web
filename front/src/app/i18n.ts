import { SETTINGS_STORAGE_KEYS } from '@chapelure/ui/settings/useSettings';
import { createI18n } from 'vue-i18n';

// The design system ships its own strings (actions, data, validation, settings, inputs...).
// The app imports them explicitly rather than the library globbing the app's folders, which
// is what used to make @chapelure/ui depend on this project's layout.
import uiFr from '@chapelure/ui/locales/fr.json';

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

export const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem(SETTINGS_STORAGE_KEYS.language) ?? 'fr',
    messages,
});
