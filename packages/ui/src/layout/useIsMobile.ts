import { onScopeDispose, ref } from 'vue';

/** Below daisyUI's `md` breakpoint, where the desktop drawer stops fitting. */
const MOBILE_QUERY = '(max-width: 767.98px)';

/** Whether the viewport is phone-sized, kept current as it is resized or rotated. */
export function useIsMobile() {
    const query = window.matchMedia(MOBILE_QUERY);
    const isMobile = ref(query.matches);

    const onChange = (event: MediaQueryListEvent) => isMobile.value = event.matches;
    query.addEventListener('change', onChange);
    onScopeDispose(() => query.removeEventListener('change', onChange));

    return { isMobile };
}
