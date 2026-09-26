import { ref } from 'vue';

export enum EnumAlertType {
    Debug,
    Neutral,
    Info,
    Success,
    Error,
    Warning,
}

export interface Alert {
    id: number;
    message: string;
    type: EnumAlertType;
}

const alerts = ref<Alert[]>([]);

// A counter, not Date.now(): two alerts pushed in the same millisecond would share an id.
let nextId = 0;

export function useAlert(delayMs: number = 10000) {

    function close(id: number) {
        alerts.value = alerts.value.filter(t => t.id !== id);
    }

    function push(type: EnumAlertType, message: string) {
        const id = ++nextId;
        alerts.value.push({ id, type, message });
        setTimeout(() => close(id), delayMs);
    }

    return {
        alerts,
        close,
        debug: (msg: string) => push(EnumAlertType.Debug, msg),
        info: (msg: string) => push(EnumAlertType.Info, msg),
        success: (msg: string) => push(EnumAlertType.Success, msg),
        error: (msg: string) => push(EnumAlertType.Error, msg),
        warning: (msg: string) => push(EnumAlertType.Warning, msg)
    }
}
