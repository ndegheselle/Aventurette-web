import { createI18n } from 'vue-i18n';
import { DEFAULT_LOCALE, messages } from '@/app/i18n';

/** The locale every test renders in. */
export const TEST_LOCALE = 'en';

/**
 * What every mounted component gets, built from the app's own catalogue — so `wrapper.text()` is
 * checked against the copy a user would read. Separate from the app's instance, which takes its
 * locale from `localStorage`, and exported so tests/setup.ts can reset the locale between tests.
 *
 * Nothing enforces completeness: a key missing from both locales renders as its own path, and one
 * missing from `en` alone renders in French.
 */
export const testI18n = createI18n({
    legacy: false,
    locale: TEST_LOCALE,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
});
