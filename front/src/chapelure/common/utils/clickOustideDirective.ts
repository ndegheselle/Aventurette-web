import type { Directive } from 'vue';

export interface ClickOutsideElement extends HTMLElement {
    clickOutsideEvent?: (event: MouseEvent) => void;
}

const clickOutside: Directive<ClickOutsideElement> = {
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

export default clickOutside;