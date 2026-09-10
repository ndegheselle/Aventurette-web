/**
 * The translation catalogue, assembled from the design system's strings and every feature's.
 *
 * Split out of i18n.ts so that building the catalogue is separable from creating the vue-i18n
 * instance: tests mount components against these same messages, which is what makes a missing
 * translation fail a test rather than surface as a raw key in the browser.
 */

// The design system ships its own strings (actions, data, validation, settings, inputs...).
// The app imports them explicitly rather than the library globbing the app's folders, which
// is what used to make @chapelure/ui depend on this project's layout.
import uiEn from '@chapelure/ui/locales/en.json';
import uiFr from '@chapelure/ui/locales/fr.json';

export type Messages = Record<string, any>;

/** Every string exists here, so it is both the boot default and the fallback for any gap. */
export const DEFAULT_LOCALE = 'fr';

// Feature translations are colocated with their feature and picked up automatically.
const featureFiles = import.meta.glob('@/features/**/locales/*.json', { eager: true });

/**
 * Recursive merge. A shallow spread would let two files that share a top-level key silently
 * drop each other's subtrees (features/auth owns "users", and any feature could add one).
 */
export function mergeMessages(target: Messages, source: Messages): Messages {
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
 * Fold a set of `**\/locales/<locale>.json` modules into a catalogue keyed by locale.
 * Exported for its own sake: it is the part with a rule in it, and the part worth a test.
 */
export function collectLocaleFiles(
    files: Record<string, unknown>,
    into: Record<string, Messages> = {},
): Record<string, Messages> {
    for (const path in files) {
        const match = path.match(/\/locales\/([\w-]+)\.json$/);
        if (!match) continue;

        const locale = match[1];
        if (!locale) continue;

        const mod = files[path] as { default: Messages };

        into[locale] ??= {};
        mergeMessages(into[locale], mod.default);
    }
    return into;
}

/** The whole catalogue: design system strings first, then every feature's, merged in. */
export const messages: Record<string, Messages> = collectLocaleFiles(featureFiles, {
    fr: mergeMessages({}, uiFr),
    en: mergeMessages({}, uiEn),
});
