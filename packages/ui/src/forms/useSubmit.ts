import { useValidationErrors } from '@chapelure/ui/forms/useValidationErrors';
import { ref } from 'vue';

/**
 * Wraps a form submission: busy flag, cleared errors, and a rejection turned into field errors.
 * Bind `isLoading` and `errors` in the template and call `submit` from the button.
 *
 * `submit` never rejects — it resolves to whether the action succeeded.
 *
 * @param action what the form does. Anything it throws is a rejected submission.
 * @param options.defaultErrorKey translation key for the message shown when the backend sent
 *                                no per-field detail
 */
export function useSubmit(
    action: () => Promise<void>,
    options: { defaultErrorKey?: string } = {},
) {
    const isLoading = ref(false);
    const errors = useValidationErrors(options.defaultErrorKey);

    async function submit(): Promise<boolean> {
        isLoading.value = true;
        errors.reset();
        try {
            await action();
            return true;
        } catch (error) {
            errors.set(error);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return { isLoading, errors, submit };
}
