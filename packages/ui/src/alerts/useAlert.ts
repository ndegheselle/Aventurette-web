import { ref } from 'vue';

export enum EnumAlertType {
    Success,
    Error,
}

export interface Alert {
    id: number;
    message: string;
    type: EnumAlertType;
}

const alerts = ref<Alert[]>([]);

// A counter, not Date.now(): two alerts pushed in the same millisecond would share an id.
let nextId = 0;

/** How long an alert stays up when nobody closes it. */
const DISMISS_AFTER_MS = 10000;

export function useAlert() {

    function close(id: number) {
        alerts.value = alerts.value.filter(t => t.id !== id);
    }

    function push(type: EnumAlertType, message: string) {
        const id = ++nextId;
        alerts.value.push({ id, type, message });
        setTimeout(() => close(id), DISMISS_AFTER_MS);
    }

    return {
        alerts,
        close,
        success: (msg: string) => push(EnumAlertType.Success, msg),
        error: (msg: string) => push(EnumAlertType.Error, msg),
    }
}
