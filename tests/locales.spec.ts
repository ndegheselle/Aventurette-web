/**
 * Translation catalogue guard rails.
 *
 * Adding a feature means adding strings, and the failure mode is silent: the key renders as its
 * own path in whichever locale was forgotten. These tests are what makes that loud instead.
 */
import { collectLocaleFiles, mergeMessages, messages } from '@/app/messages';
import { describe, expect, it } from 'vitest';

type Tree = Record<string, unknown>;

/** Every leaf path in a message tree, as dotted keys. */
function keysOf(tree: Tree, prefix = ''): string[] {
    return Object.entries(tree).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return isTree(value) ? keysOf(value, path) : [path];
    });
}

function isTree(value: unknown): value is Tree {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

describe('the translation catalogue', () => {
    it('has the locales the app offers', () => {
        expect(Object.keys(messages).sort()).toEqual(['en', 'fr']);
    });

    it('says the same things in every locale', () => {
        const [reference, ...others] = Object.keys(messages);
        const expected = keysOf(messages[reference!]!).sort();

        for (const locale of others)
            expect(keysOf(messages[locale!]!).sort(), `${locale} is not level with ${reference}`)
                .toEqual(expected);
    });

    it('translates something, so a broken glob cannot pass silently', () => {
        // The feature files are picked up by import.meta.glob. If that ever stops matching, the
        // catalogue collapses to the design system's strings alone and nothing else would fail.
        expect(keysOf(messages.fr!)).toContain('activities.fields.age');
        expect(keysOf(messages.fr!).length).toBeGreaterThan(50);
    });

    it('leaves no key holding an empty string', () => {
        const blanks = Object.entries(messages).flatMap(([locale, tree]) =>
            keysOf(tree).filter(key => resolve(tree, key) === '').map(key => `${locale}:${key}`));

        expect(blanks).toEqual([]);
    });
});

function resolve(tree: Tree, path: string): unknown {
    return path.split('.').reduce<unknown>((node, key) => (node as Tree)?.[key], tree);
}

describe('mergeMessages', () => {
    it('keeps both subtrees when two files share a top-level key', () => {
        // features/auth owns "users", and any other feature may add to it.
        const target = { users: { login: { title: 'Log in' } } };

        mergeMessages(target, { users: { profile: { title: 'Profile' } } });

        expect(target).toEqual({
            users: { login: { title: 'Log in' }, profile: { title: 'Profile' } },
        });
    });

    it('lets a later value replace an earlier one at the same path', () => {
        const target = { actions: { save: 'Save' } };

        mergeMessages(target, { actions: { save: 'Store' } });

        expect(target.actions.save).toBe('Store');
    });

    it('replaces rather than merges when a leaf meets a subtree', () => {
        const target = { actions: 'Actions' } as Record<string, unknown>;

        mergeMessages(target, { actions: { save: 'Save' } });

        expect(target.actions).toEqual({ save: 'Save' });
    });
});

describe('collectLocaleFiles', () => {
    it('files each module under the locale its filename names', () => {
        const collected = collectLocaleFiles({
            '/src/features/activities/locales/en.json': { default: { a: '1' } },
            '/src/features/activities/locales/fr.json': { default: { a: 'un' } },
        });

        expect(collected).toEqual({ en: { a: '1' }, fr: { a: 'un' } });
    });

    it('merges two features into the same locale', () => {
        const collected = collectLocaleFiles({
            '/src/features/activities/locales/en.json': { default: { activities: { title: 'A' } } },
            '/src/features/users/locales/en.json': { default: { users: { title: 'U' } } },
        });

        expect(collected.en).toEqual({ activities: { title: 'A' }, users: { title: 'U' } });
    });

    it('merges into a catalogue it is given, so the design system\'s strings come first', () => {
        const collected = collectLocaleFiles(
            { '/src/features/users/locales/en.json': { default: { users: { title: 'U' } } } },
            { en: { actions: { save: 'Save' } } },
        );

        expect(collected.en).toEqual({ actions: { save: 'Save' }, users: { title: 'U' } });
    });

    it('ignores a json file that is not a locale', () => {
        expect(collectLocaleFiles({ '/src/features/activities/data/seed.json': { default: { a: '1' } } }))
            .toEqual({});
    });
});
