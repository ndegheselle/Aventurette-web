import type { ClientResponseError } from "pocketbase";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

export class NotImplementedError extends Error { }
export class NotAuthentifiedError extends Error { }

/**
 * Handle errors
 */
export const useValidationErrors = (defaultErrorKey: string = "validation.errors.default") => {

    /**
     * List of errors grouped by properties
     */
    const properties = ref<{
        [key: string]: any;
    } | null>(null);

    /**
     * Global error with the default message
     */
    const global = ref<string | undefined>(undefined);

    const { t } = useI18n();
    /**
     * Get the error text from the code
     */
    function get(fieldName: string): string | undefined {
        if (!properties.value) return undefined;
        let code = properties.value[fieldName]?.code;
        return code ? t(`validation.errors.${code}`) : undefined;
    }

    function set(ex: any)
    {
        properties.value = (ex as ClientResponseError)?.data.data ?? null;
        global.value = t(defaultErrorKey);
    }

    function reset()
    {
        properties.value = null;
        global.value = undefined;
    }

    return {
        reset,
        set,
        get,
        properties,
        global
    };
}