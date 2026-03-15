import { ref } from "vue";
import { useI18n } from "vue-i18n";

export class NotImplementedError extends Error { }

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

    return {
        getError,
        errors
    };
}