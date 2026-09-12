import { config } from '@vue/test-utils';
import { afterEach, beforeEach, expect, vi } from 'vitest';
import { h } from 'vue';
import { TEST_LOCALE, testI18n } from './i18n';

/*
 * Every mounted component gets the app's real translations. See tests/i18n.ts.
 */
config.global.plugins = [testI18n];

/**
 * `<RouterLink>` without a router.
 *
 * Renders an anchor carrying its destination as `data-to`, so a test can assert where a link
 * points — with `linkTarget` from @tests — without standing up route records for a component
 * whose subject is not routing.
 *
 * It stays in place under `mountWithRouter` too: that helper exists to give `useRouter` and
 * `useRoute` something real, and a test that navigates does so by calling `router.push`, not by
 * clicking an anchor. Keeping the stub means a link to a route the test did not declare renders
 * instead of warning.
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
 * Warnings that mean the code under test is wrong — a prop of the wrong type, a missing
 * injection, a bad template ref — are silent in a normal run and easy to accumulate. Here they
 * fail the test that produced them.
 *
 * vue-i18n's warnings are deliberately not in this list: an untranslated key is allowed to
 * render as its own path, so it is not a defect. See ADR 0013.
 *
 * Add to ALLOWED only for a warning that is genuinely the environment talking, with a comment
 * saying which. Anything else belongs fixed, not silenced.
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

    // Switching language is global by design, so a test that exercises it would otherwise
    // leave every test after it in the other locale.
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
