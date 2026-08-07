import { ValidationError } from "@chapelure/core";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

/**
 * Handle errors from the API
 * @param defaultErrorKey The global error key to use by default
 * @returns
 */
export function useValidationErrors(defaultErrorKey: string = "validation.errors.default") {

    /**
     * List of errors grouped by properties
     */
    const properties = ref<Record<string, { code?: string }> | null>(null);

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

    function set(ex: unknown)
    {
        // Backend adapters normalise their transport errors into ValidationError, so nothing
        // here needs to know which backend produced it. Anything else has no field detail.
        properties.value = ex instanceof ValidationError ? ex.fields : null;
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
