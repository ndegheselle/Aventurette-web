import { ValidationError } from "@chapelure/core";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

/**
 * Field errors from a rejected write. Feed a caught error to `set`, read a field's message with
 * `get`, and bind `global` for the message shown when the backend sent no per-field detail.
 *
 * @param defaultErrorKey translation key for that global message
 */
export function useValidationErrors(defaultErrorKey: string = "validation.errors.default") {

    /** Error codes by field name. */
    const properties = ref<Record<string, { code?: string }> | null>(null);

    const global = ref<string | undefined>(undefined);

    const { t } = useI18n();

    function get(fieldName: string): string | undefined {
        if (!properties.value) return undefined;
        const code = properties.value[fieldName]?.code;
        return code ? t(`validation.errors.${code}`) : undefined;
    }

    function set(ex: unknown)
    {
        // Adapters normalise a rejected write into ValidationError; anything else has no
        // field detail to show.
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
