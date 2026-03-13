import { createI18n } from "vue-i18n";

// Automatically load all features locales files
const files = import.meta.glob("@/features/**/locales/*.json", { eager: true });

const messages: Record<string, any> = {};

for (const path in files) {
  const match = path.match(/features\/(.+)\/locales\/(\w+)\.json$/);
  if (!match) continue;

  const feature = match[1];
  const locale = match[2];

  if (!feature || !locale) continue;

  const mod = files[path] as { default: unknown };

  messages[locale] ??= {};
  messages[locale] = mod.default;
}

export const i18n = createI18n({
  locale: "fr",
  messages
});