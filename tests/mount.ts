/**
 * Mount helpers.
 *
 * `mount` from @vue/test-utils already carries i18n and the `<RouterLink>` stand-in via
 * tests/setup.ts, so most component tests need nothing from here. What lives here is the
 * router — components and composables that navigate or read route params need a real one —
 * and `withSetup`, for running a composable inside a component instance.
 */
import { mount, type MountingOptions } from '@vue/test-utils';
import { defineComponent, type Component } from 'vue';
import {
    createMemoryHistory,
    createRouter,
    type RouteRecordRaw,
    type Router,
} from 'vue-router';

const BLANK = defineComponent({ template: '<div data-test="route-target" />' });

export interface RouterOptions {
    /** The feature's own route records, usually the default export from its `routes.ts`. */
    routes?: RouteRecordRaw[];
    /** Where to start. A path, or a named location. */
    initialRoute?: string | { name: string; params?: Record<string, unknown> };
}

/**
 * A router on memory history, ready to use.
 *
 * The catch-all keeps an unmatched push from warning, so a test only fails on what it is
 * actually asserting.
 */
export async function createTestRouter({ routes = [], initialRoute = '/' }: RouterOptions = {}): Promise<Router> {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [...routes, { path: '/:pathMatch(.*)*', component: BLANK }],
    });

    router.push(initialRoute as any);
    await router.isReady();
    return router;
}

export type RouterMountOptions<Props> = MountingOptions<Props> & RouterOptions;

/**
 * Mount with a real router.
 *
 * Returns the router alongside the wrapper so a test can assert where a navigation landed
 * (`router.currentRoute.value.name`) rather than that some function was called.
 *
 * `<RouterLink>` stays stubbed — see tests/setup.ts — so a link to a route the test did not
 * declare still renders. Assert on those with `linkTarget`, and navigate with `router.push`.
 */
export async function mountWithRouter<Props>(
    component: Component,
    options: RouterMountOptions<Props> = {},
): Promise<{ wrapper: ReturnType<typeof mount>; router: Router }> {
    const { routes, initialRoute, ...mountOptions } = options;
    const router = await createTestRouter({ routes, initialRoute });

    const wrapper = mount(component as any, {
        ...mountOptions,
        global: {
            ...mountOptions.global,
            plugins: [...(mountOptions.global?.plugins ?? []), router],
        },
    });

    return { wrapper, router };
}

/**
 * Run a composable inside a real component instance.
 *
 * Composables that use lifecycle hooks (`onMounted`) or `inject` need one, and calling them
 * bare logs a Vue warning that tests/setup.ts turns into a failure. Unmount the wrapper when a
 * test is about teardown.
 *
 *     const [filters] = withSetup(() => useActivityFilters(onChange));
 *
 * Pass `routes`/`initialRoute` for a composable that uses `useRouter` or `useRoute`; the router
 * comes back as the third element so the test can assert on where it navigated.
 */
export function withSetup<T>(composable: () => T): [T, ReturnType<typeof mount>];
export function withSetup<T>(composable: () => T, router: Router): [T, ReturnType<typeof mount>, Router];
export function withSetup<T>(composable: () => T, router?: Router) {
    let result!: T;

    const wrapper = mount(
        defineComponent({
            setup() {
                result = composable();
                return () => null;
            },
        }),
        router ? { global: { plugins: [router] } } : {},
    );

    return router ? [result, wrapper, router] : [result, wrapper];
}

/** Where a stubbed `<RouterLink>` points. See the stand-in in tests/setup.ts. */
export function linkTarget(link: { attributes(name: string): string | undefined }): unknown {
    const raw = link.attributes('data-to');
    return raw ? JSON.parse(raw) : null;
}
