import type { IModalController } from '@chapelure/ui/composables/useModal';
import { ref, shallowRef, type Component } from 'vue';

const title = ref('');
const message = ref('');
const icon = shallowRef<Component | null>(null);

let modalController: IModalController | null = null;

/**
 * Global confirmation dialog. Requires a single <ConfirmationModal /> mounted in the app layout,
 * which registers itself here.
 */
export function useConfirmation() {

    function registerModal(modal: IModalController) {
        modalController = modal;
    }

    function show(t: string, m: string, i?: Component): Promise<boolean | null> {
        if (!modalController) {
            // Resolving to null reads as "cancelled" to every caller, so a missing dialog
            // declines the action instead of throwing on a non-null assertion.
            console.error('[chapelure/ui] useConfirmation().show() was called but no <ConfirmationModal /> is mounted — add one to your layout.');
            return Promise.resolve(null);
        }

        title.value = t;
        message.value = m;
        icon.value = i ?? null;
        return modalController.show();
    }

    function confirm() {
        modalController?.confirm(true);
    }

    function cancel() {
        modalController?.cancel();
    }

    return {
        registerModal,
        title,
        message,
        icon,
        show,
        confirm,
        cancel,
    };
}
