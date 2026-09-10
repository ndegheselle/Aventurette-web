import { withSetup } from '@tests';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnumTheme, SETTINGS_STORAGE_KEYS, useSettings } from './useSettings';

/** What the OS says it prefers. useSettings mirrors it actively for the `auto` theme. */
function prefersDark(dark: boolean) {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: dark, addEventListener() { }, removeEventListener() { } })));
}

const themeAttribute = () => document.documentElement.getAttribute('data-theme');

beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    prefersDark(false);
});

describe('useSettings', () => {
    describe('on load', () => {
        it('starts on auto when nothing was stored', () => {
            const [settings] = withSetup(() => useSettings());

            expect(settings.currentTheme.value).toBe(EnumTheme.auto);
        });

        it('adopts the stored theme', () => {
            localStorage.setItem(SETTINGS_STORAGE_KEYS.theme, 'dark');

            const [settings] = withSetup(() => useSettings());

            expect(settings.currentTheme.value).toBe(EnumTheme.dark);
            expect(themeAttribute()).toBe('dark');
        });

        it('falls back to auto for a stored value that no longer names a theme', () => {
            localStorage.setItem(SETTINGS_STORAGE_KEYS.theme, 'solarized');

            const [settings] = withSetup(() => useSettings());

            expect(settings.currentTheme.value).toBe(EnumTheme.auto);
        });

        it('resolves auto against what the OS prefers, rather than leaving it unset', () => {
            prefersDark(true);

            withSetup(() => useSettings());

            expect(themeAttribute()).toBe('dark');
        });
    });

    describe('changing the theme', () => {
        it('applies it and remembers it', () => {
            const [settings] = withSetup(() => useSettings());

            settings.changeTheme(EnumTheme.dark);

            expect(themeAttribute()).toBe('dark');
            expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.theme)).toBe('dark');
        });

        it('goes back to following the OS on auto', () => {
            prefersDark(true);
            const [settings] = withSetup(() => useSettings());
            settings.changeTheme(EnumTheme.light);

            settings.changeTheme(EnumTheme.auto);

            expect(themeAttribute()).toBe('dark');
        });
    });

    describe('changing the language', () => {
        it('switches the app over and remembers it', () => {
            const [settings] = withSetup(() => useSettings());

            settings.changeLang('fr');

            expect(settings.currentLanguage.value).toBe('fr');
            expect(localStorage.getItem(SETTINGS_STORAGE_KEYS.language)).toBe('fr');
        });

        it('changes it globally, not just for the component that asked', () => {
            // The whole app has to follow, which is why this uses the global i18n scope.
            const [first] = withSetup(() => useSettings());
            const [second] = withSetup(() => useSettings());

            first.changeLang('fr');

            expect(second.currentLanguage.value).toBe('fr');
        });
    });
});
