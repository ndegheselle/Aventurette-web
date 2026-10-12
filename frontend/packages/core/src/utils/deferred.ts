/**
 * A promise with its resolve/reject exposed.
 *
 * XXX : replaceable by Promise.withResolvers() once the browser baseline allows it.
 */
export class Deferred<T = void> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;

    constructor() {
        let resolve!: (value: T) => void;
        let reject!: (reason?: any) => void;

        this.promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        this.resolve = resolve;
        this.reject = reject;
    }
};
