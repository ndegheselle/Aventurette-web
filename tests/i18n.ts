import { createI18n } from 'vue-i18n';
import { DEFAULT_LOCALE, messages } from '@/app/messages';

/**
 * The app's own catalogue, not a stub of it.
 *
 * Mounting against the real strings is what turns a forgotten translation into a failing
 * test: vue-i18n warns on a missing key, and tests/setup.ts fails the test on that warning.
 * Tests therefore assert on English copy, and the locales parity spec keeps `fr` level with it.
 */
export const TEST_LOCALE = 'en';

export function createTestI18n() {
    return createI18n({
        legacy: false,
        locale: TEST_LOCALE,
        fallbackLocale: DEFAULT_LOCALE,
        messages,
    });
}

/**
 * The one instance every test in a file mounts against.
 *
 * Held here so tests/setup.ts can put its locale back between tests: switching language is
 * global by design, so a test that exercises it would otherwise leave the next one in French.
 */
export const testI18n = createTestI18n();
