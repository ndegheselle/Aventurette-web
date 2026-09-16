import { config } from '@vue/test-utils';
import { afterEach, beforeEach, expect, vi } from 'vitest';
import { h } from 'vue';
import { TEST_LOCALE, testI18n } from './i18n';

// Every mounted component gets the app's real translations. See tests/i18n.ts.
config.global.plugins = [testI18n];

/**
 * `<RouterLink>` without a router: an anchor carrying its destination as `data-to`, which
 * `linkTarget` from @tests reads. In place under `mountWithRouter` too, so a link to a route the
 * test did not declare renders instead of warning.
 */
config.global.stubs = {
    RouterLink: {
        name: 'RouterLink',
        props: { to: { type: [String, Object], required: true } },
        setup(props: any, { slots }: any) {
            return () => h('a', { 'data-to': JSON.stringify(props.to) }, slots.default?.());
        },
    },
};

/*
 * A Vue warning means the code under test is wrong — a prop of the wrong type, a missing
 * injection, a bad template ref — so it fails the test that produced it. vue-i18n's warnings are
 * deliberately not here: an untranslated key renders as its own path, which is allowed (ADR 0011).
 *
 * Add to ALLOWED only for a warning that is the environment talking, with a comment saying which.
 */
const FATAL = [
    /\[Vue warn\]/,
];

const ALLOWED: RegExp[] = [];

let captured: string[] = [];
let spies: ReturnType<typeof vi.spyOn>[] = [];

function watchConsole(method: 'warn' | 'error') {
    const original = console[method].bind(console);
    return vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        const text = args.map(String).join(' ');
        if (FATAL.some(p => p.test(text)) && !ALLOWED.some(p => p.test(text)))
            captured.push(text);
        // Still print: a silenced console makes a failing test much harder to read.
        original(...args);
    });
}

beforeEach(() => {
    captured = [];
    spies = [watchConsole('warn'), watchConsole('error')];

    // Switching language is global, so put the locale back for the test after this one.
    testI18n.global.locale.value = TEST_LOCALE;
});

afterEach(() => {
    const failures = captured;
    spies.forEach(spy => spy.mockRestore());
    spies = [];
    captured = [];

    expect(
        failures,
        'Vue or vue-i18n warned during this test. Fix the cause, or document an exception in tests/setup.ts.',
    ).toEqual([]);
});
