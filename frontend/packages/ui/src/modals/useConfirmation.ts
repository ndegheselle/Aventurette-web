import type { IModalController } from '@chapelure/ui/modals/useModal';
import { ref, shallowRef, type Component } from 'vue';

const title = ref('');
const message = ref('');
const icon = shallowRef<Component | null>(null);

let modalController: IModalController | null = null;

/**
 * The app-wide confirmation dialog. Needs one <ConfirmationModal /> in the layout, which
 * registers itself here; without it every prompt resolves to null, which reads as cancelled.
 */
export function useConfirmation() {

    function registerModal(modal: IModalController) {
        modalController = modal;
    }

    function show(titleText: string, messageText: string, iconComponent?: Component): Promise<boolean | null> {
        if (!modalController) {
            console.error('[chapelure/ui] useConfirmation().show() was called but no <ConfirmationModal /> is mounted — add one to your layout.');
            return Promise.resolve(null);
        }

        title.value = titleText;
        message.value = messageText;
        icon.value = iconComponent ?? null;
        return modalController.show();
    }

    return {
        registerModal,
        title,
        message,
        icon,
        show,
    };
}
