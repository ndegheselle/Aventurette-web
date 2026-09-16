import { Deferred } from '@chapelure/core';
import { ref, type Ref } from 'vue';

/**
 * Drives a modal. `show` resolves with the result on confirm, or null on cancel.
 */
export interface IModalController<T = boolean> {
    isShown: Ref<boolean>;
    show(): Promise<T | null>;
    confirm(result: T | null): void;
    cancel(): void;
}

/**
 * A modal component that opens on a record.
 * Example : defineExpose<IEditModal<ChildrenData>>({ show });
 */
export interface IEditModal<T>
{
    show(child: T): Promise<T | null>;
}

/** Hooks around the modal's lifetime. Return false from `onConfirm` to leave the promise pending. */
export interface IModalOptions<T = boolean> {
    onShow?: () => void;
    onConfirm?: (result: T | null) => boolean | void;
    onCancel?: () => void;
}

export function useModal<T = boolean>(option: IModalOptions<T> = {}): IModalController<T> {
    const isShown = ref<boolean>(false);
    let deferred: Deferred<T | null> | null = null;

    function show(): Promise<T | null> {
        // XXX : could replace by
        // let { promise, resolve, reject } = Promise.withResolvers<T | null>();
        deferred = new Deferred<T | null>();
        option?.onShow?.();
        isShown.value = true;
        return deferred.promise;
    }

    function confirm(result: T | null = true as any) {
        isShown.value = false;
        if (option?.onConfirm?.(result) === false)
            return;
        deferred?.resolve(result ?? true as any);
        deferred = null;
    }

    function cancel() {
        isShown.value = false;
        option?.onCancel?.();
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