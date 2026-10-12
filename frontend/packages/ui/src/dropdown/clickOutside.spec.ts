import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { vClickOutside } from './clickOutside';

/** A component with the directive actually applied, which is what is under test. */
function mountWithDirective(handler: (event: MouseEvent) => void) {
    return mount(defineComponent({
        props: { onOutside: { type: Function, required: true } },
        directives: { clickOutside: vClickOutside },
        template: `
            <div>
                <div class="inside" v-click-outside="onOutside"><span class="child">child</span></div>
                <div class="outside">outside</div>
            </div>`,
    }), { props: { onOutside: handler }, attachTo: document.body });
}

function clickOn(selector: string) {
    document.querySelector(selector)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('vClickOutside', () => {
    it('calls the handler for a click elsewhere on the page', () => {
        const handler = vi.fn();
        const wrapper = mountWithDirective(handler);

        clickOn('.outside');

        expect(handler).toHaveBeenCalledOnce();
        wrapper.unmount();
    });

    it('stays quiet for a click on the element itself', () => {
        const handler = vi.fn();
        const wrapper = mountWithDirective(handler);

        clickOn('.inside');

        expect(handler).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    it('stays quiet for a click on a descendant, which is still inside', () => {
        const handler = vi.fn();
        const wrapper = mountWithDirective(handler);

        clickOn('.child');

        expect(handler).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    it('stops listening once the element is gone', () => {
        const handler = vi.fn();
        const wrapper = mountWithDirective(handler);

        wrapper.unmount();
        clickOn('body');

        expect(handler).not.toHaveBeenCalled();
    });
});
