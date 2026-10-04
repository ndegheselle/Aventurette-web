import { describe, expect, it, vi } from 'vitest';
import { vClickOutside } from './clickOutside';

/** The directive applied to `.inside`; returns what stops it. */
function mountWithDirective(handler: (event: MouseEvent) => void) {
    document.body.innerHTML = `
        <div class="inside"><span class="child">child</span></div>
        <div class="outside">outside</div>`;
    const cleanup = vClickOutside(document.querySelector<HTMLElement>('.inside')!, () => handler);
    return { unmount: () => cleanup?.() };
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
