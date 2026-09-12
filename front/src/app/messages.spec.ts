/**
 * The merge is the part with a rule in it: two files sharing a top-level key must not clobber
 * each other's subtrees.
 *
 * Nothing here checks that the catalogue is *complete*. Locales are allowed to be uneven, and
 * an untranslated key renders as its own path — see ADR 0013.
 */
import { describe, expect, it } from 'vitest';
import { collectLocaleFiles, mergeMessages, messages } from './messages';

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

describe('the assembled catalogue', () => {
    it('picks up the feature translations, so a broken glob cannot pass silently', () => {
        // The design system's own strings are imported explicitly and would still be here if
        // import.meta.glob stopped matching. A feature's would not, and nothing else would fail.
        expect(Object.keys(messages.fr ?? {})).toEqual(expect.arrayContaining(['activities', 'users']));
    });

    it('keeps the design system\'s strings alongside them', () => {
        expect(keysOf(messages.fr ?? {})).toContain('actions.search');
    });
});

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

    it('accepts a locale present in one feature and not another', () => {
        // Locales need not be even. A feature may ship `fr` only.
        const collected = collectLocaleFiles({
            '/src/features/activities/locales/en.json': { default: { activities: { title: 'A' } } },
            '/src/features/users/locales/fr.json': { default: { users: { title: 'U' } } },
        });

        expect(collected).toEqual({ en: { activities: { title: 'A' } }, fr: { users: { title: 'U' } } });
    });

    it('ignores a json file that is not a locale', () => {
        expect(collectLocaleFiles({ '/src/features/activities/data/seed.json': { default: { a: '1' } } }))
            .toEqual({});
    });
});
