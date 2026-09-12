import { createI18n } from 'vue-i18n';
import { DEFAULT_LOCALE, messages } from '@/app/messages';

/**
 * The app's own catalogue, not a stub of it.
 *
 * Mounting against the real strings means a test asserts on what a user would actually read,
 * so `wrapper.text()` is checked against English copy rather than against key paths.
 *
 * Completeness is not enforced — an untranslated key renders as its own path and no test fails
 * for it (ADR 0013). `en` is missing a string only a French-first catalogue has: vue-i18n falls
 * back to `fr`, so such a key renders in French here.
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
