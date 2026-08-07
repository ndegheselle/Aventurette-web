import { createI18n } from "vue-i18n";

// Every locale file under src/, not just features/: the library keeps its translations next to
// its own code, and it no longer lives under features/ since it stopped being a submodule.
// XXX : Phase 3 moves this into the app and has @chapelure/ui contribute its messages explicitly,
//       which is what removes the library's knowledge of the app's folder layout.
const files = import.meta.glob("@/**/locales/*.json", { eager: true });

const messages: Record<string, any> = {};

for (const path in files) {
    const match = path.match(/\/locales\/([\w-]+)\.json$/);
    if (!match) continue;

    const locale = match[1];
    if (!locale) continue;

    const mod = files[path] as { default: any };

    messages[locale] ??= {};
    messages[locale] = {
        ...messages[locale],
        ...mod.default
    };
}

export const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('language') ?? "fr",
    messages
});
