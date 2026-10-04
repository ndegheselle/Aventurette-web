/**
 * Mount helpers: `mount` for a Vapor component, `mountWithRouter` for a subject that navigates or
 * reads a route param, and `withSetup` for a composable that needs a component instance.
 *
 * tests/setup.ts already gives every mount i18n and a `<RouterLink>` stand-in.
 */
import { mount as vtuMount, VueWrapper, type MountingOptions } from '@vue/test-utils';
import { defineComponent, h, type Component, type VNode } from 'vue';
import {
    createMemoryHistory,
    createRouter,
    type RouteRecordRaw,
    type Router,
} from 'vue-router';

/**
 * Test-utils' `mount`, for a Vapor component. Test-utils cannot take one as its root, so it renders
 * inside a VDOM host; `emitted` and `props` are redirected from the host to the component.
 */
// `component` is untyped: vue-tsc types a generic Vapor SFC as a function, not a `Component`.
export function mount(component: unknown, options: MountingOptions<any> = {}): VueWrapper<any> {
    const host = defineComponent({
        inheritAttrs: false,
        setup(_, { attrs, slots }) {
            // In a custom element: test-utils finds root nodes through the VNode tree, which stops
            // at a Vapor component, and an element no spec selects keeps `find('div')` meaning theirs.
            return () => h('test-host', [h(component as Component, attrs, slots)]);
        },
    });

    const wrapper: VueWrapper<any> = vtuMount(host, options as any);
    // Test-utils records every component's emits by instance; read the subject's.
    const subject = { vm: { $: (wrapper.vm.$.subTree.children as VNode[])[0]!.component } };
    wrapper.emitted = (name => VueWrapper.prototype.emitted.call(subject, name!)) as typeof wrapper.emitted;
    wrapper.props = ((key?: string) => key ? wrapper.vm.$attrs[key] : wrapper.vm.$attrs) as typeof wrapper.props;
    return wrapper;
}

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
 * navigate with `router.push`.
 */
export async function mountWithRouter<Props>(
    component: unknown,
    options: RouterMountOptions<Props> = {},
): Promise<{ wrapper: VueWrapper<any>; router: Router }> {
    const { routes, initialRoute, ...mountOptions } = options;
    const router = await createTestRouter({ routes, initialRoute });

    const wrapper = mount(component, {
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
 *     const [subject] = withSetup(() => useActivityEdit(), router);
 *
 * Pass a router for a composable that uses `useRouter` or `useRoute`; it comes back third, to
 * assert on where it navigated. Unmount the wrapper when the test is about teardown.
 */
export function withSetup<T>(composable: () => T): [T, ReturnType<typeof vtuMount>];
export function withSetup<T>(composable: () => T, router: Router): [T, ReturnType<typeof vtuMount>, Router];
export function withSetup<T>(composable: () => T, router?: Router) {
    let result!: T;

    const wrapper = vtuMount(
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
