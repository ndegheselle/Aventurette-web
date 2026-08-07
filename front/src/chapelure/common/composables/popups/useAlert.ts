import { ref } from 'vue';

export enum EnumAlertType {
    Debug,
    Neutral,
    Info,
    Success,
    Error,
    Warning,
}

export class Alert {
    id: number;
    message: string;
    type: EnumAlertType;

    constructor(id: number, message: string, type: EnumAlertType) {
        this.id = id;
        this.message = message;
        this.type = type;
    }
}

const alerts = ref<Alert[]>([]);

export function useAlert(delayMs: number = 10000) {

    function close(id: number) {
        alerts.value = alerts.value.filter(t => t.id !== id);
    }

    function push(type: EnumAlertType, message: string) {
        const id = Date.now();
        alerts.value.push({ id, type, message });
        setTimeout(() => {
            alerts.value = alerts.value.filter(t => t.id !== id)
        }, delayMs);
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