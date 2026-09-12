import { createI18n } from 'vue-i18n';
import { DEFAULT_LOCALE, messages } from '@/app/i18n';

/** The locale every test renders in. */
export const TEST_LOCALE = 'en';

/**
 * The one instance every test in a file mounts against, built from the app's own catalogue
 * rather than a stub of it — so `wrapper.text()` is checked against the copy a user would read.
 *
 * A separate instance from the app's, because that one takes its locale from `localStorage`.
 * Held here so tests/setup.ts can put the locale back between tests: switching language is
 * global by design, so a test that exercises it would otherwise leave the next one in French.
 *
 * Completeness is not enforced anywhere. A key missing from both locales renders as its own
 * path; one missing from `en` alone falls back to `fr` and renders in French.
 */
export const testI18n = createI18n({
    legacy: false,
    locale: TEST_LOCALE,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
});
