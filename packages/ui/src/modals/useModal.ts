import { Deferred } from '@chapelure/core';
import { ref, type Ref } from 'vue';

/**
 * Drives a modal. `show` resolves with what `confirm` is given, or null on cancel.
 */
export interface IModalController<T = boolean> {
    isShown: Ref<boolean>;
    show(): Promise<T | null>;
    confirm(result: T): void;
    cancel(): void;
}

/**
 * A modal component that opens on a record.
 * Example : defineExpose<IEditModal<ActivityStepData>>({ show });
 */
export interface IEditModal<T> {
    show(record: T): Promise<T | null>;
}

/** Hooks around the modal's lifetime. */
export interface IModalOptions {
    onShow?: () => void;
}

export function useModal<T = boolean>(option: IModalOptions = {}): IModalController<T> {
    const isShown = ref<boolean>(false);
    let deferred: Deferred<T | null> | null = null;

    function show(): Promise<T | null> {
        deferred = new Deferred<T | null>();
        option.onShow?.();
        isShown.value = true;
        return deferred.promise;
    }

    function confirm(result: T) {
        isShown.value = false;
        deferred?.resolve(result);
        deferred = null;
    }

    function cancel() {
        isShown.value = false;
        deferred?.resolve(null);
        deferred = null;
    }

    return {
        isShown,
        show,
        confirm,
        cancel
    } as IModalController<T>;
}