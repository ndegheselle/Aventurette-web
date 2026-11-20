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

function applyTheme(theme: EnumTheme) {
    // The palette is scoped by a `dark` class on the root, so auto mirrors the OS preference.
    const isDark = theme === EnumTheme.dark
        || (theme === EnumTheme.auto && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
}

function readStoredTheme(): EnumTheme {
    const storedTheme = localStorage.getItem(SETTINGS_STORAGE_KEYS.theme);
    return storedTheme
        ? EnumTheme[storedTheme as keyof typeof EnumTheme] ?? EnumTheme.auto
        : EnumTheme.auto;
}

// Module state: one theme, shared by every caller.
const currentTheme = ref<EnumTheme>(readStoredTheme());

/** Apply the theme stored by `changeTheme`, or auto. Call once, as the app starts. */
export function applyStoredTheme() {
    currentTheme.value = readStoredTheme();
    applyTheme(currentTheme.value);
}

export function useSettings() {
    // Global scope: switching the language has to affect the whole app, not this component.
    const { locale } = useI18n({ useScope: 'global' });

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
