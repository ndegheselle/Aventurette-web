import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import Modal from './Modal.vue';

/** The dialog is portalled to the body, and only there while it is open. */
const inDialog = (selector: string) => document.body.querySelector(`[role="dialog"] ${selector}`);
const allInDialog = (selector: string) => [...document.body.querySelectorAll<HTMLElement>(`[role="dialog"] ${selector}`)];

async function mountModal(slots: Record<string, string> = {}, props: Record<string, unknown> = {}) {
    const controller = useModal();
    const wrapper = mount(Modal, { props: { controller, ...props }, slots, attachTo: document.body });
    const answer = controller.show();
    await nextTick();
    return { controller, wrapper, answer };
}

function click(element: Element | null | undefined) {
    (element as HTMLElement).click();
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('Modal', () => {
    it('renders its title and body', async () => {
        await mountModal({ title: 'Filter', default: '<p>body</p>' });

        expect(inDialog('[data-slot="dialog-title"]')?.textContent?.trim()).toBe('Filter');
        expect(inDialog('[data-slot="dialog-body"]')?.innerHTML).toContain('<p>body</p>');
    });

    it('opens the dialog when the controller says to show, and only then', async () => {
        const controller = useModal();
        mount(Modal, { props: { controller }, attachTo: document.body });
        expect(document.body.querySelector('[role="dialog"]')).toBeNull();

        controller.show();
        await nextTick();

        expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
    });

    it('closes the dialog when the controller resolves', async () => {
        const { controller } = await mountModal();

        controller.confirm(true);
        await nextTick();

        expect(document.body.querySelector('[role="dialog"][data-state="open"]')).toBeNull();
    });

    it('cancels from the corner cross', async () => {
        const { answer } = await mountModal();

        click(inDialog('[data-slot="dialog-close"]'));

        await expect(answer).resolves.toBeNull();
    });

    it('cancels on Escape, so leaving does not confirm by accident', async () => {
        const { answer } = await mountModal();

        document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        await expect(answer).resolves.toBeNull();
    });

    it('offers cancel and confirm by default', async () => {
        const { answer } = await mountModal();

        const confirmButton = allInDialog('[data-slot="dialog-footer"] button').at(-1)!;
        expect(confirmButton.textContent).toContain('Confirm');
        click(confirmButton);

        await expect(answer).resolves.toBe(true);
    });

    it('lets the caller replace the actions entirely', async () => {
        await mountModal({ actions: '<button class="mine">Apply</button>' });

        expect(inDialog('[data-slot="dialog-footer"] .mine')).not.toBeNull();
        expect(inDialog('[data-slot="dialog-footer"]')?.textContent).not.toContain('Confirm');
    });

    it('drops the action bar when asked, for a modal that closes another way', async () => {
        await mountModal({}, { withActions: false });

        expect(inDialog('[data-slot="dialog-footer"]')).toBeNull();
    });
});
