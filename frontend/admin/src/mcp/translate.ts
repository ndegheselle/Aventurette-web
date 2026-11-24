type Messages = { [key: string]: string | Messages };

// The same catalogue the app reads, French only: the authors are, and `fr` is the complete one.
const files = import.meta.glob<{ default: Messages }>('@/**/locales/fr.json', { eager: true });

const messages: Messages = {};
for (const file of Object.values(files)) merge(messages, file.default);

/** Recursive: two features sharing a top-level key keep both subtrees. */
function merge(target: Messages, source: Messages) {
    for (const [key, value] of Object.entries(source)) {
        const existing = target[key];
        if (typeof existing === 'object' && typeof value === 'object') merge(existing, value);
        else target[key] = value;
    }
}

/** A message by its key, `{param}`s filled in. A key the catalogue lacks reads as itself, as in the app. */
export function translate(key: string, params: Record<string, string> = {}): string {
    let found: string | Messages | undefined = messages;
    for (const part of key.split('.')) found = typeof found === 'object' ? found[part] : undefined;

    if (typeof found !== 'string') return key;
    return found.replace(/\{(\w+)\}/g, (placeholder, name: string) => params[name] ?? placeholder);
}
