import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import Modal from './Modal.vue';

function mountModal(slots: Record<string, string> = {}, props: Record<string, unknown> = {}) {
    const controller = useModal();
    const wrapper = mount(Modal, { props: { controller, ...props }, slots });
    return { controller, wrapper };
}

describe('Modal', () => {
    it('renders its title and body', () => {
        const { wrapper } = mountModal({ title: 'Filter', default: '<p>body</p>' });

        expect(wrapper.find('h3').text()).toBe('Filter');
        expect(wrapper.find('.overflow-y-auto').html()).toContain('<p>body</p>');
    });

    it('opens the dialog when the controller says to show', async () => {
        const { controller, wrapper } = mountModal();
        const dialog = wrapper.find('dialog').element as HTMLDialogElement;
        const show = vi.spyOn(dialog, 'show');

        controller.show();
        await nextTick();

        expect(show).toHaveBeenCalledOnce();
    });

    it('closes the dialog when the controller resolves', async () => {
        const { controller, wrapper } = mountModal();
        const dialog = wrapper.find('dialog').element as HTMLDialogElement;
        const close = vi.spyOn(dialog, 'close');

        controller.show();
        await nextTick();
        controller.confirm(true);
        await nextTick();

        expect(close).toHaveBeenCalledOnce();
    });

    it('cancels from the corner cross', async () => {
        const { controller, wrapper } = mountModal();
        const answer = controller.show();

        await wrapper.find('.btn-circle').trigger('click');

        await expect(answer).resolves.toBeNull();
    });

    it('cancels from the backdrop, so clicking away does not confirm by accident', async () => {
        const { controller, wrapper } = mountModal();
        const answer = controller.show();

        await wrapper.find('.modal-backdrop button').trigger('click');

        await expect(answer).resolves.toBeNull();
    });

    it('offers cancel and confirm by default', async () => {
        const { controller, wrapper } = mountModal();
        const answer = controller.show();

        const confirmButton = wrapper.findAll('.modal-action button').at(-1)!;
        expect(confirmButton.text()).toContain('Confirm');
        await confirmButton.trigger('click');

        await expect(answer).resolves.toBe(true);
    });

    it('lets the caller replace the actions entirely', () => {
        const { wrapper } = mountModal({ actions: '<button class="mine">Apply</button>' });

        expect(wrapper.find('.modal-action .mine').exists()).toBe(true);
        expect(wrapper.find('.modal-action').text()).not.toContain('Confirm');
    });

    it('drops the action bar when asked, for a modal that closes another way', () => {
        const { wrapper } = mountModal({}, { withActions: false });

        expect(wrapper.find('.modal-action').exists()).toBe(false);
    });
});
