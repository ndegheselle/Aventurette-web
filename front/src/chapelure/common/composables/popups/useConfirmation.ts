import type { IModalController } from '@chapelure/common/composables/popups/useModal';
import { ref, shallowRef, type Component } from 'vue';

const title = ref('');
const message = ref('');
const icon = shallowRef<Component | null>(null);

let modalController: IModalController | null = null;

export function useConfirmation() {

    function registerModal(modal: IModalController) {
        modalController = modal;
    }

    function show(t: string, m: string, i?: Component): Promise<boolean | null> {
        title.value = t;
        message.value = m;
        icon.value = i ?? null;
        return modalController!.show();
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
