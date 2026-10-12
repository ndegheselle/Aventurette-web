import type { Directive } from 'vue';

export interface ClickOutsideElement extends HTMLElement {
    clickOutsideEvent?: (event: MouseEvent) => void;
}

/** Import it and use `v-click-outside`; no app-level registration needed. */
export const vClickOutside: Directive<ClickOutsideElement> = {
    beforeMount(el, binding) {
        el.clickOutsideEvent = function (event: MouseEvent) {
            if (!(event.target instanceof Node)) return;

            if (!(el === event.target || el.contains(event.target)))
                binding.value(event);
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        if (el.clickOutsideEvent) {
            document.removeEventListener('click', el.clickOutsideEvent);
        }
    },
};
