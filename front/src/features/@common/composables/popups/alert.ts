import { ref } from 'vue';

export enum EnumAlertType {
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

const ALERT_DEFAULT_DELAY = 3000;
export function useAlert() {

    function close(id: number) {
        alerts.value = alerts.value.filter(t => t.id !== id);
    }

    function push(type: EnumAlertType, message: string) {
        const id = Date.now();
        alerts.value.push({ id, type, message });
        setTimeout(() => {
            alerts.value = alerts.value.filter(t => t.id !== id)
        }, ALERT_DEFAULT_DELAY);
    }

    return {
        alerts,
        close,
        info: (msg: string) => push(EnumAlertType.Info, msg),
        success: (msg: string) => push(EnumAlertType.Success, msg),
        error: (msg: string) => push(EnumAlertType.Error, msg),
        warning: (msg: string) => push(EnumAlertType.Warning, msg)
    }
}