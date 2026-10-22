import { ref } from 'vue';

export enum EnumAlertType {
    Success,
    Error,
}

/** A button in the alert, such as an undo. Clicking it closes the alert. */
export interface AlertAction {
    label: string;
    run: () => void;
}

export interface Alert {
    id: number;
    message: string;
    type: EnumAlertType;
    action?: AlertAction;
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

    function push(type: EnumAlertType, message: string, action?: AlertAction) {
        const id = ++nextId;
        alerts.value.push({ id, type, message, action });
        setTimeout(() => close(id), DISMISS_AFTER_MS);
    }

    /** Run the alert's action, once: the alert closes with it. */
    function act(alert: Alert) {
        close(alert.id);
        alert.action?.run();
    }

    return {
        alerts,
        close,
        act,
        success: (msg: string, action?: AlertAction) => push(EnumAlertType.Success, msg, action),
        error: (msg: string) => push(EnumAlertType.Error, msg),
    }
}
