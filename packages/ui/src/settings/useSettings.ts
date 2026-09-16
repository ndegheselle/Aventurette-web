import { ref } from "vue";
import { useI18n } from "vue-i18n";

export enum EnumTheme {
    auto,
    light,
    dark
}

/** Read these from the app too — it needs the stored language when it bootstraps i18n. */
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
        // daisyUI resolves `data-theme`, not the media query, so mirror the OS preference.
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

export function useSettings() {
    // Global scope: switching the language has to affect the whole app, not this component.
    const { locale } = useI18n({ useScope: 'global' });

    const storedTheme = localStorage.getItem(SETTINGS_STORAGE_KEYS.theme);
    currentTheme.value = storedTheme
        ? EnumTheme[storedTheme as keyof typeof EnumTheme] ?? EnumTheme.auto
        : EnumTheme.auto;

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
