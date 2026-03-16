import type { ClientResponseError } from "pocketbase";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

export class NotImplementedError extends Error { }

/**
 * Handle errors
 */
export const useValidationErrors = () => {
    const errors = ref<{
        [key: string]: any;
    } | null>(null);
    const { t } = useI18n();
    /**
     * Get the error text from the code
     */
    function getError(fieldName: string): string | undefined {
        if (!errors.value) return undefined;
        let code = errors.value[fieldName]?.code;
        return code ? t(`validation.errors.${code}`) : undefined;
    }

    function setErrors(ex: any)
    {
        errors.value = (ex as ClientResponseError)?.data.data ?? null;
    }

    return {
        setErrors,
        getError,
        errors
    };
}