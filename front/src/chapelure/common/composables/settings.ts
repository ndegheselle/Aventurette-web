import { i18n } from '@chapelure/common/i18n';
import { ref } from "vue";

export enum EnumTheme {
    auto,
    light,
    dark
}

const currentTheme = ref<EnumTheme>(EnumTheme.auto);

function applyTheme(theme: EnumTheme) {
    const html = document.documentElement;
    if (theme === EnumTheme.light) {
        html.setAttribute('data-theme', 'light');
    } else if (theme === EnumTheme.dark) {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.removeAttribute('data-theme');
        // Optionally mirror OS preference actively
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

export function useSettings() {
    const locale = i18n.global.locale;

    // Init theme
    const storedTheme = localStorage.getItem('theme');
    currentTheme.value = storedTheme
        ? EnumTheme[storedTheme as keyof typeof EnumTheme] ?? EnumTheme.auto
        : EnumTheme.auto;

    // Apply on load
    applyTheme(currentTheme.value);

    function changeTheme(newTheme: EnumTheme) {
        currentTheme.value = newTheme;
        localStorage.setItem('theme', EnumTheme[newTheme]);
        applyTheme(newTheme);
    }

    function changeLang(code: string) {
        locale.value = code;
        localStorage.setItem('language', code);
    }

    return {
        currentLanguage: locale,
        currentTheme,
        changeLang,
        changeTheme
    };
}