import { Deferred } from '@chapelure/core';
import { ref, type Ref } from 'vue';

/**
 * Controller that handle a modal popup. The show method returns a promise that will be resolved when the user confirm or cancel the modal.
 * Confirm resolve the promise with the given result, while cancel resolve it with null.
 */
export interface IModalController<T = boolean> {
    isShown: Ref<boolean>;
    show(): Promise<T | null>;
    confirm(result: T | null): void;
    cancel(): void;
}

/**
 * Modal element that expose a show method.
 * Example : defineExpose<IEditModal<ChildrenData>>({ show });
 */
export interface IEditModal<T>
{
    show(child: T): Promise<T | null>;
}

/**
 * Options for the useModal composable. 
 * onShow is called when the modal is shown,
 * onCancel is called when the user cancel the modal,
 * onConfirm is called when the user confirm the modal, can return false to prevent the modal from being closed and the promise from being resolved.
 */
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