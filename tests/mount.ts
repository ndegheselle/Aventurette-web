/**
 * Mount helpers for the two cases plain `mount` does not cover: a subject that navigates or
 * reads a route param, and a composable that needs a component instance.
 *
 * Everything else can use `mount` directly — tests/setup.ts already gives it i18n and a
 * `<RouterLink>` stand-in.
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
    /** The feature's route records, usually the default export from its `routes.ts`. */
    routes?: RouteRecordRaw[];
    /** Where to start. A path, or a named location. */
    initialRoute?: string | { name: string; params?: Record<string, unknown> };
}

/** A router on memory history. A catch-all route keeps an unmatched push from warning. */
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
 * Mount with a real router. Assert where a navigation landed with
 * `router.currentRoute.value.name`.
 *
 * `<RouterLink>` stays stubbed, so a link to a route the test did not declare still renders —
 * assert on those with `linkTarget`, and navigate with `router.push`.
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
 * Run a composable inside a component instance — anything using `onMounted` or `inject` needs
 * one, and calling it bare warns, which fails the test.
 *
 *     const [filters] = withSetup(() => useActivityFilters(onChange));
 *
 * Pass a router for a composable that uses `useRouter` or `useRoute`; it comes back third, to
 * assert on where it navigated. Unmount the wrapper when the test is about teardown.
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

/** Where a stubbed `<RouterLink>` points. */
export function linkTarget(link: { attributes(name: string): string | undefined }): unknown {
    const raw = link.attributes('data-to');
    return raw ? JSON.parse(raw) : null;
}
