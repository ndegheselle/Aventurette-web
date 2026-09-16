import { useValidationErrors } from '@chapelure/ui/forms/useValidationErrors';
import { ref } from 'vue';

/**
 * The shape every form submission in this app has: mark it busy, clear the last failure, run
 * the action, and turn a rejection into field errors rather than an unhandled promise.
 * `submit` never rejects: a failure is reported through `errors`, which is what the template
 * is bound to. It resolves to whether the action succeeded, for a caller that needs to know.
 *
 * @param action what the form does. Anything it throws is treated as a rejected submission.
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
