import { Deferred } from '@common/utils/deferred.ts';
import { ref, type Ref } from 'vue';

export function useDeferredModal<T = boolean>(dialogRef?: Ref<HTMLDialogElement | null>) {
    const internalDialogRef = dialogRef || ref<HTMLDialogElement | null>(null);
    let deferred: Deferred<T> | null = null;

    function show(): Promise<T> {
        deferred = new Deferred<T>();
        internalDialogRef.value?.showModal();
        return deferred.promise;
    }

    function confirm(result: T | null = null) {
        internalDialogRef.value?.close();
        deferred?.resolve(result ?? true as any);
        deferred = null;
    }

    function cancel() {
        internalDialogRef.value?.close();
        deferred?.resolve(false as any);
        deferred = null;
    }

    return {
        dialogRef: internalDialogRef,
        show,
        confirm,
        cancel
    }
}