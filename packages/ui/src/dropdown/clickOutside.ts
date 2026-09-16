import type { Directive } from 'vue';

export interface ClickOutsideElement extends HTMLElement {
    clickOutsideEvent?: (event: MouseEvent) => void;
}

/**
 * Exported as `vClickOutside` so a component can just import it and use `v-click-outside`.
 *
 * It used to require the consuming app to call .directive('click-outside', ...) in main.ts,
 * which meant a library component silently depended on app-level setup.
 */
export const vClickOutside: Directive<ClickOutsideElement> = {
    beforeMount(el, binding) {
        el.clickOutsideEvent = function (event: MouseEvent) {
            if (!(event.target instanceof Node)) return;

            // Check if the clicked element is neither the element
            // to which the directive is applied nor its child
            if (!(el === event.target || el.contains(event.target))) {
                // Invoke the provided method
                binding.value(event);
            }
        };
        if (el.clickOutsideEvent) {
            document.addEventListener('click', el.clickOutsideEvent);
        }
    },
    unmounted(el) {
        // Remove the event listener when the bound element is unmounted
        if (el.clickOutsideEvent) {
            document.removeEventListener('click', el.clickOutsideEvent);
        }
    },
};

export default vClickOutside;
