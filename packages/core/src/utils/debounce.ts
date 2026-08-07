export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay = 300
): (...args: Parameters<T>) => void {
    // Not window.setTimeout: core must not assume a DOM.
    let timer: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn(...args)
        }, delay)
    }
};
