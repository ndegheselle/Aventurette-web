import type { VaporDirective } from 'vue';

/** Import it and use `v-click-outside`; no app-level registration needed. */
export const vClickOutside: VaporDirective<HTMLElement, (event: MouseEvent) => void> = (el, value) => {
    function onClick(event: MouseEvent) {
        if (!(event.target instanceof Node)) return;

        if (!(el === event.target || el.contains(event.target)))
            value?.()(event);
    }
    document.addEventListener('click', onClick);
    // Vapor runs the returned function when the element's scope is disposed.
    return () => document.removeEventListener('click', onClick);
};
