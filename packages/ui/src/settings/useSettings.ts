import { ref } from "vue";
import { useI18n } from "vue-i18n";

export enum EnumTheme {
    auto,
    light,
    dark
}

/**
 * Shared with the app, which reads the stored language when it bootstraps i18n.
 * Exported so the key is declared in one place rather than duplicated as a literal.
 */
export const SETTINGS_STORAGE_KEYS = {
    theme: 'theme',
    language: 'language',
} as const;

const currentTheme = ref<EnumTheme>(EnumTheme.auto);

function applyTheme(theme: EnumTheme) {
    const html = document.documentElement;
    if (theme === EnumTheme.light) {
        html.setAttribute('data-theme', 'light');
    } else if (theme === EnumTheme.dark) {
        html.setAttribute('data-theme', 'dark');
    } else {
        // Mirror the OS preference actively so daisyUI themes resolve either way.
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

export function useSettings() {
    // Global scope on purpose: switching the language here must affect the whole app, not just
    // this component. It also replaces reaching into the app's i18n singleton, which was a
    // library-to-app import.
    const { locale } = useI18n({ useScope: 'global' });

    // Init theme
    const storedTheme = localStorage.getItem(SETTINGS_STORAGE_KEYS.theme);
    currentTheme.value = storedTheme
        ? EnumTheme[storedTheme as keyof typeof EnumTheme] ?? EnumTheme.auto
        : EnumTheme.auto;

    // Apply on load
    applyTheme(currentTheme.value);

    function changeTheme(newTheme: EnumTheme) {
        currentTheme.value = newTheme;
        localStorage.setItem(SETTINGS_STORAGE_KEYS.theme, EnumTheme[newTheme]);
        applyTheme(newTheme);
    }

    function changeLang(code: string) {
        locale.value = code;
        localStorage.setItem(SETTINGS_STORAGE_KEYS.language, code);
    }

    return {
        currentLanguage: locale,
        currentTheme,
        changeLang,
        changeTheme
    };
}
